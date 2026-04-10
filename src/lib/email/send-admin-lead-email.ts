import "server-only";

import { Resend } from "resend";

import { LEAD_PROJECT_CONFIG } from "@/src/lib/backend/project-config";
import type { LeadRow } from "@/src/lib/supabase/leads-repository";
import { getResendFromAddress, getResendToAddress, getServerEnv } from "@/src/lib/utils/env";
import { compactJoin, formatCurrency } from "@/src/lib/utils/format";
import type { SyncStatus } from "@/src/types/lead";

interface LeadEmailResult {
  status: SyncStatus;
  message: string;
  configured: boolean;
}

const EMAIL_THEME = {
  bg: "#faf8f5",
  bgGlow: "#fff8f0",
  card: "#fffdf9",
  cardWarm: "#fff4ea",
  text: "#3d2b20",
  muted: "#806758",
  coffee: "#4d3728",
  coffeeDeep: "#2b221b",
  gold: "#fb874f",
  goldDeep: "#eb6d32",
  peach: "#ffd6bc",
  line: "#eadbcb",
  success: "#2f8f5b"
} as const;

function normalizeList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [];
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function displayValue(value: string | number | boolean | undefined | null) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return String(value);
}

function buildMetricCard(label: string, value: string, accent: string = EMAIL_THEME.coffeeDeep) {
  return `
    <td width="33.33%" style="padding:0 6px; vertical-align:top;">
      <div style="min-height:112px; padding:16px 16px 14px; border:1px solid ${EMAIL_THEME.line}; border-radius:20px; background:${EMAIL_THEME.card}; box-shadow:0 10px 24px rgba(112, 71, 37, 0.08);">
        <div style="margin:0 0 8px; color:${EMAIL_THEME.goldDeep}; font-size:11px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">
          ${escapeHtml(label)}
        </div>
        <div style="color:${accent}; font-family:Georgia, 'Times New Roman', serif; font-size:22px; line-height:1.2; font-weight:700;">
          ${escapeHtml(value)}
        </div>
      </div>
    </td>
  `;
}

function buildRows(lines: Array<[string, string | number | boolean | undefined | null]>) {
  return lines
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:9px 0; width:38%; vertical-align:top; color:${EMAIL_THEME.muted}; font-size:13px; font-weight:700;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:9px 0; color:${EMAIL_THEME.text}; font-size:14px; line-height:1.55;">
            ${escapeHtml(displayValue(value))}
          </td>
        </tr>
      `
    )
    .join("");
}

function buildSection(title: string, lines: Array<[string, string | number | boolean | undefined | null]>) {
  return `
    <section style="margin:0 0 18px;">
      <div style="padding:14px 18px; border:1px solid ${EMAIL_THEME.line}; border-bottom:none; border-radius:20px 20px 0 0; background:${EMAIL_THEME.cardWarm};">
        <div style="color:${EMAIL_THEME.goldDeep}; font-size:11px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">
          ${escapeHtml(title)}
        </div>
      </div>
      <div style="padding:4px 18px 10px; border:1px solid ${EMAIL_THEME.line}; border-radius:0 0 20px 20px; background:${EMAIL_THEME.card};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${buildRows(lines)}
        </table>
      </div>
    </section>
  `;
}

function buildStatusPill(label: string, tone: "success" | "pending") {
  const background = tone === "success" ? "rgba(47, 143, 91, 0.12)" : "rgba(251, 135, 79, 0.16)";
  const color = tone === "success" ? EMAIL_THEME.success : EMAIL_THEME.goldDeep;

  return `
    <span style="display:inline-block; margin-right:8px; margin-bottom:8px; padding:8px 12px; border-radius:999px; background:${background}; color:${color}; font-size:12px; font-weight:700; letter-spacing:0.04em;">
      ${escapeHtml(label)}
    </span>
  `;
}

function buildPageHistory(pageHistory: LeadRow["page_history"]) {
  if (!Array.isArray(pageHistory) || pageHistory.length === 0) {
    return `<p style="margin:0; color:${EMAIL_THEME.muted}; font-size:14px;">No page history captured.</p>`;
  }

  return `
    <ol style="margin:0; padding-left:18px; color:${EMAIL_THEME.text};">
      ${pageHistory
        .map((entry) => {
          const typedEntry = entry as { pageUrl?: string; pagePath?: string; timestamp?: string };

          return `
            <li style="margin:0 0 10px;">
              <div style="font-size:14px; font-weight:700; color:${EMAIL_THEME.text};">
                ${escapeHtml(typedEntry.pagePath || typedEntry.pageUrl || "Visited page")}
              </div>
              <div style="font-size:12px; color:${EMAIL_THEME.muted};">
                ${escapeHtml(typedEntry.pageUrl || "")}
                ${typedEntry.timestamp ? ` | ${escapeHtml(typedEntry.timestamp)}` : ""}
              </div>
            </li>
          `;
        })
        .join("")}
    </ol>
  `;
}

function buildHtml(lead: LeadRow) {
  const selectedProductIds = normalizeList(lead.selected_product_ids);
  const selectedProductNames = normalizeList(lead.selected_product_names);
  const pageHistory = Array.isArray(lead.page_history) ? lead.page_history : [];
  const pageHistoryMarkup = buildPageHistory(pageHistory);

  const deliveryLabel =
    lead.delivery_method === "pickup"
      ? compactJoin([lead.pickup_store_name, lead.delivery_state], " | ")
      : compactJoin(
          [
            lead.delivery_address,
            lead.delivery_city,
            lead.delivery_postal_code,
            lead.delivery_state
          ],
          ", "
        );
  const leadSummary = lead.form_name === "contact" ? "New contact enquiry received" : "New order lead received";
  const selectedItemsLabel = selectedProductNames.join(", ") || selectedProductIds.join(", ") || "None";
  const statusPills = [
    buildStatusPill(lead.sheet_synced ? "Sheet Synced" : "Sheet Pending", lead.sheet_synced ? "success" : "pending"),
    buildStatusPill(lead.email_sent ? "Email Sent" : "Email Pending", lead.email_sent ? "success" : "pending"),
    buildStatusPill(
      lead.whatsapp_redirected ? "WhatsApp Ready" : "WhatsApp Not Ready",
      lead.whatsapp_redirected ? "success" : "pending"
    )
  ].join("");

  return `
    <div style="margin:0; padding:28px 0; background:
      radial-gradient(circle at top left, rgba(255, 214, 188, 0.45), transparent 34%),
      linear-gradient(180deg, ${EMAIL_THEME.bgGlow} 0%, ${EMAIL_THEME.bg} 42%, #f9f1e7 100%);
      font-family:Inter, Arial, sans-serif; color:${EMAIL_THEME.text};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:0 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px; border-collapse:collapse;">
              <tr>
                <td style="padding:0;">
                  <div style="overflow:hidden; border:1px solid ${EMAIL_THEME.line}; border-radius:28px; background:${EMAIL_THEME.card}; box-shadow:0 28px 80px rgba(112, 71, 37, 0.12);">
                    <div style="padding:28px 28px 24px; background:linear-gradient(135deg, ${EMAIL_THEME.coffeeDeep} 0%, ${EMAIL_THEME.coffee} 52%, ${EMAIL_THEME.gold} 100%); color:#fff;">
                      <div style="margin:0 0 12px; color:rgba(255,245,235,0.86); font-size:12px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase;">
                        ${escapeHtml(LEAD_PROJECT_CONFIG.projectName)} Lead Desk
                      </div>
                      <h1 style="margin:0 0 10px; font-family:Georgia, 'Times New Roman', serif; font-size:34px; line-height:1.08; font-weight:700;">
                        ${escapeHtml(leadSummary)}
                      </h1>
                      <p style="margin:0; max-width:560px; color:rgba(255,245,235,0.92); font-size:15px; line-height:1.7;">
                        A warm, peach-toned summary styled to match the site experience, with the essentials surfaced first for quick scanning.
                      </p>
                    </div>

                    <div style="padding:22px 22px 8px; background:${EMAIL_THEME.cardWarm}; border-bottom:1px solid ${EMAIL_THEME.line};">
                      ${statusPills}
                    </div>

                    <div style="padding:24px 22px 10px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 -6px 18px; border-collapse:collapse;">
                        <tr>
                          ${buildMetricCard("Lead ID", lead.lead_id)}
                          ${buildMetricCard("Customer", lead.name || "Unknown")}
                          ${buildMetricCard("Total", formatCurrency(lead.total, lead.currency), EMAIL_THEME.goldDeep)}
                        </tr>
                      </table>

                      ${buildSection("Quick Summary", [
                        ["Created At", lead.created_at],
                        ["Form Name", lead.form_name],
                        ["Enquiry Category", lead.enquiry_category],
                        ["Selected Service", lead.selected_service],
                        ["Selected Items", selectedItemsLabel]
                      ])}

                      ${buildSection("Contact Details", [
                        ["Name", lead.name],
                        ["Phone", lead.phone],
                        ["Email", lead.email]
                      ])}

                      ${buildSection("Order & Fulfilment", [
                        ["Delivery / Location", deliveryLabel || "Not provided"],
                        ["Payment", lead.payment_label],
                        ["Candles", lead.include_candles ? `${lead.candle_quantity} included` : "No candles"],
                        ["Special Instructions", lead.special_instructions || "None"],
                        ["Message", lead.message || "None"]
                      ])}

                      ${buildSection("Tracking Snapshot", [
                        ["UTM Source", lead.utm_source],
                        ["UTM Medium", lead.utm_medium],
                        ["UTM Campaign", lead.utm_campaign],
                        ["UTM Content", lead.utm_content],
                        ["UTM Term", lead.utm_term],
                        ["GCLID", lead.gclid],
                        ["FBCLID", lead.fbclid],
                        ["MSCLKID", lead.msclkid],
                        ["TTCLID", lead.ttclid],
                        ["Click ID", lead.click_id],
                        ["Tracking Session ID", lead.tracking_session_id],
                        ["Landing Page URL", lead.landing_page_url],
                        ["Landing Page Path", lead.landing_page_path],
                        ["Page URL", lead.page_url],
                        ["Page Path", lead.page_path],
                        ["Referrer", lead.referrer],
                        ["User Agent", lead.user_agent]
                      ])}

                      <section style="margin:0 0 18px;">
                        <div style="padding:14px 18px; border:1px solid ${EMAIL_THEME.line}; border-bottom:none; border-radius:20px 20px 0 0; background:${EMAIL_THEME.cardWarm};">
                          <div style="color:${EMAIL_THEME.goldDeep}; font-size:11px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">
                            Page History
                          </div>
                        </div>
                        <div style="padding:18px; border:1px solid ${EMAIL_THEME.line}; border-radius:0 0 20px 20px; background:${EMAIL_THEME.card};">
                          ${pageHistoryMarkup}
                        </div>
                      </section>

                      ${buildSection("Sync State", [
                        ["Sheet Sync Status", lead.sheet_sync_status],
                        ["Admin Email Status", lead.admin_email_status],
                        ["Sheet Synced", lead.sheet_synced ? "Yes" : "No"],
                        ["Email Sent", lead.email_sent ? "Yes" : "No"],
                        ["WhatsApp Redirected", lead.whatsapp_redirected ? "Yes" : "No"],
                        ["Selected Product Count", selectedProductIds.length]
                      ])}
                    </div>

                    <div style="padding:18px 22px 24px; border-top:1px solid ${EMAIL_THEME.line}; background:${EMAIL_THEME.cardWarm}; color:${EMAIL_THEME.muted}; font-size:12px; line-height:1.6;">
                      Styled to reflect the live site palette: cream surfaces, coffee typography, peach highlights, and rounded cards for a softer Kenny Hills Bakers feel.
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildText(lead: LeadRow) {
  const selectedProductIds = normalizeList(lead.selected_product_ids);
  const selectedProductNames = normalizeList(lead.selected_product_names);
  const pageHistory = Array.isArray(lead.page_history) ? lead.page_history : [];

  return [
    `${LEAD_PROJECT_CONFIG.senderBranding}: New ${LEAD_PROJECT_CONFIG.projectSlug} lead`,
    "",
    "Lead Summary",
    `Lead ID: ${lead.lead_id}`,
    `Created At: ${lead.created_at}`,
    `Sheet Synced: ${lead.sheet_synced ? "Yes" : "No"}`,
    `Email Sent: ${lead.email_sent ? "Yes" : "No"}`,
    `WhatsApp Redirected: ${lead.whatsapp_redirected ? "Yes" : "No"}`,
    "",
    "Contact Details",
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    "",
    "Form Details",
    `Form Name: ${lead.form_name}`,
    `Enquiry Category: ${lead.enquiry_category}`,
    `Selected Service: ${lead.selected_service}`,
    `Message: ${lead.message || "None"}`,
    "",
    "Products",
    `Selected Product IDs: ${selectedProductIds.join(", ") || "None"}`,
    `Selected Product Names: ${selectedProductNames.join(", ") || "None"}`,
    "",
    "Tracking",
    `UTM Source: ${lead.utm_source}`,
    `UTM Medium: ${lead.utm_medium}`,
    `UTM Campaign: ${lead.utm_campaign}`,
    `UTM Content: ${lead.utm_content}`,
    `UTM Term: ${lead.utm_term}`,
    `GCLID: ${lead.gclid}`,
    `FBCLID: ${lead.fbclid}`,
    `MSCLKID: ${lead.msclkid}`,
    `TTCLID: ${lead.ttclid}`,
    `Click ID: ${lead.click_id}`,
    `Tracking Session ID: ${lead.tracking_session_id}`,
    `Landing Page URL: ${lead.landing_page_url}`,
    `Landing Page Path: ${lead.landing_page_path}`,
    `Page URL: ${lead.page_url}`,
    `Page Path: ${lead.page_path}`,
    `Referrer: ${lead.referrer}`,
    `User Agent: ${lead.user_agent}`,
    "",
    "Page History",
    ...(pageHistory.length
      ? pageHistory.map((entry) => {
          const typedEntry = entry as { pageUrl?: string; pagePath?: string; timestamp?: string };
          return `- ${typedEntry.pagePath || typedEntry.pageUrl || ""} ${typedEntry.timestamp || ""}`;
        })
      : ["- None"]),
    "",
    "Status",
    `Sheet Sync Status: ${lead.sheet_sync_status}`,
    `Admin Email Status: ${lead.admin_email_status}`,
    "",
    "Additional",
    `Selected Product Count: ${selectedProductIds.length}`,
    `Payment: ${lead.payment_label}`,
    `Total: ${formatCurrency(lead.total, lead.currency)}`,
    `Candles: ${lead.include_candles ? `${lead.candle_quantity} included` : "No candles"}`,
    `Instructions: ${lead.special_instructions || "None"}`
  ].join("\n");
}

export function getAdminEmailConfiguration() {
  const env = getServerEnv();
  const from = getResendFromAddress();
  const to = getResendToAddress() || LEAD_PROJECT_CONFIG.adminNotificationEmail;

  return {
    configured: Boolean(env.RESEND_API_KEY && from && to),
    from,
    to
  };
}

export async function sendAdminLeadEmail(lead: LeadRow): Promise<LeadEmailResult> {
  const env = getServerEnv();
  const { configured, from, to } = getAdminEmailConfiguration();

  if (!configured || !env.RESEND_API_KEY || !from || !to) {
    return {
      status: "skipped",
      message: "Admin email is not configured.",
      configured: false
    };
  }

  const resend = new Resend(env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from,
      to: [to],
      replyTo: lead.email,
      subject: `[${LEAD_PROJECT_CONFIG.senderBranding}] New ${LEAD_PROJECT_CONFIG.projectSlug} lead ${lead.lead_id}`,
      html: buildHtml(lead),
      text: buildText(lead)
    });

    return {
      status: "success",
      message: "Admin email sent.",
      configured: true
    };
  } catch (error) {
    return {
      status: "failed",
      message: error instanceof Error ? error.message : String(error),
      configured: true
    };
  }
}

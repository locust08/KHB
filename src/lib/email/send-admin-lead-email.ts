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

function buildSection(title: string, lines: Array<[string, string | number | boolean | undefined | null]>) {
  const content = lines
    .map(([label, value]) => `<p style="margin:0 0 6px;"><strong>${label}:</strong> ${String(value ?? "")}</p>`)
    .join("");

  return `
    <section style="margin: 0 0 20px;">
      <h3 style="margin: 0 0 10px; font-size: 16px;">${title}</h3>
      ${content}
    </section>
  `;
}

function buildHtml(lead: LeadRow) {
  const selectedProductIds = normalizeList(lead.selected_product_ids);
  const selectedProductNames = normalizeList(lead.selected_product_names);
  const pageHistory = Array.isArray(lead.page_history) ? lead.page_history : [];
  const pageHistoryMarkup = pageHistory.length
    ? `<ol style="margin: 8px 0 0 20px; padding: 0;">${pageHistory
        .map((entry) => {
          const typedEntry = entry as { pageUrl?: string; pagePath?: string; timestamp?: string };
          return `<li style="margin: 0 0 6px;">${typedEntry.pagePath || typedEntry.pageUrl || ""} <span style="color:#6b7280;">${typedEntry.timestamp || ""}</span></li>`;
        })
        .join("")}</ol>`
    : "<p style=\"margin:0;\">None</p>";

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

  return `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">${LEAD_PROJECT_CONFIG.senderBranding}: New ${LEAD_PROJECT_CONFIG.projectSlug} lead</h2>
      ${buildSection("Lead Summary", [
        ["Lead ID", lead.lead_id],
        ["Created At", lead.created_at],
        ["Status", `${lead.sheet_synced ? "Sheet synced" : "Sheet pending"} / ${lead.email_sent ? "Email sent" : "Email pending"}`]
      ])}
      ${buildSection("Contact Details", [
        ["Name", lead.name],
        ["Phone", lead.phone],
        ["Email", lead.email]
      ])}
      ${buildSection("Form Details", [
        ["Form Name", lead.form_name],
        ["Enquiry Category", lead.enquiry_category],
        ["Selected Service", lead.selected_service],
        ["Message", lead.message || "None"]
      ])}
      ${buildSection("Products", [
        ["Selected Product IDs", selectedProductIds.join(", ") || "None"],
        ["Selected Product Names", selectedProductNames.join(", ") || "None"]
      ])}
      ${buildSection("Tracking", [
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
      <section style="margin: 0 0 20px;">
        <h3 style="margin: 0 0 10px; font-size: 16px;">Page History</h3>
        ${pageHistoryMarkup}
      </section>
      ${buildSection("Status", [
        ["Sheet Synced", lead.sheet_synced ? "Yes" : "No"],
        ["Email Sent", lead.email_sent ? "Yes" : "No"],
        ["WhatsApp Redirected", lead.whatsapp_redirected ? "Yes" : "No"]
      ])}
      ${buildSection("Additional Fields", [
        ["Selected Product Count", selectedProductIds.length],
        ["Sheet Sync Status", lead.sheet_sync_status],
        ["Admin Email Status", lead.admin_email_status]
      ])}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="margin: 0;"><strong>Delivery/Location:</strong> ${deliveryLabel || "Not provided"}</p>
      <p style="margin: 6px 0 0;"><strong>Total:</strong> ${formatCurrency(lead.total, lead.currency)}</p>
      <p style="margin: 6px 0 0;"><strong>Payment:</strong> ${lead.payment_label}</p>
      <p style="margin: 6px 0 0;"><strong>Candles:</strong> ${lead.include_candles ? `${lead.candle_quantity} included` : "No candles"}</p>
      <p style="margin: 6px 0 0;"><strong>Instructions:</strong> ${lead.special_instructions || "None"}</p>
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

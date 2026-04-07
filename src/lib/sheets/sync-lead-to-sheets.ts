import "server-only";

import { LEAD_PROJECT_CONFIG } from "@/src/lib/backend/project-config";
import { getGoogleSheetsUrl, getServerEnv } from "@/src/lib/utils/env";
import type { LeadRow } from "@/src/lib/supabase/leads-repository";
import type { SyncStatus } from "@/src/types/lead";

interface SheetsWebhookResponse {
  ok?: boolean;
  success: boolean;
  sheetSynced: boolean;
  sheetName?: string;
  leadId?: string;
  emailSent?: boolean;
  emailProvider?: string;
  emailError?: string;
  message?: string;
  error?: string;
}

function inferWebhookEmailState(parsed: SheetsWebhookResponse | null, responseOk: boolean) {
  const hasExplicitEmailState = typeof parsed?.emailSent === "boolean" || Boolean(parsed?.emailError);

  if (parsed?.emailSent === true) {
    return {
      emailSent: true,
      emailStatus: "success" as const,
      emailMessage: parsed.message || "Admin email sent."
    };
  }

  if (parsed?.emailSent === false) {
    return {
      emailSent: false,
      emailStatus: "failed" as const,
      emailMessage: (parsed.emailError || parsed.message || "Admin email was not sent.").slice(0, 300)
    };
  }

  if (responseOk && !hasExplicitEmailState) {
    return {
      emailSent: true,
      emailStatus: "success" as const,
      emailMessage: parsed?.message || "Admin email sent."
    };
  }

  return {
    emailSent: false,
    emailStatus: "failed" as const,
    emailMessage: (parsed?.emailError || parsed?.message || "Admin email was not sent.").slice(0, 300)
  };
}

export async function syncLeadToSheets(lead: LeadRow): Promise<{
  status: SyncStatus;
  message: string;
  configured: boolean;
  emailStatus: SyncStatus;
  emailMessage: string;
  emailSent: boolean;
  emailProvider: string;
}> {
  const env = getServerEnv();
  const sheetsUrl = getGoogleSheetsUrl();

  if (!sheetsUrl) {
    return {
      status: "skipped",
      message: "GOOGLE_SHEETS_APPS_SCRIPT_URL is not configured.",
      configured: false,
      emailStatus: "skipped",
      emailMessage: "Google Sheets webhook is not configured.",
      emailSent: false,
      emailProvider: ""
    };
  }

  const response = await fetch(sheetsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      secret: env.GOOGLE_SHEETS_WEBHOOK_SECRET ?? "",
      project: LEAD_PROJECT_CONFIG.projectSlug,
      sheetName: LEAD_PROJECT_CONFIG.googleSheetTabName,
      spreadsheetUrl: LEAD_PROJECT_CONFIG.googleSheetUrl,
      lead: {
        received_at: lead.created_at,
        project: LEAD_PROJECT_CONFIG.projectSlug,
        leadId: lead.lead_id,
        lead_id: lead.lead_id,
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        message: lead.message,
        company: "",
        profession: "",
        source: lead.selected_service,
        skin_type: "",
        enquiry_category: lead.enquiry_category,
        concerns: [],
        form_name: lead.form_name,
        selected_service: lead.selected_service,
        selected_product_ids: lead.selected_product_ids,
        selected_product_names: lead.selected_product_names,
        utm_source: lead.utm_source,
        utm_medium: lead.utm_medium,
        utm_campaign: lead.utm_campaign,
        utm_content: lead.utm_content,
        utm_term: lead.utm_term,
        gclid: lead.gclid,
        fbclid: lead.fbclid,
        msclkid: lead.msclkid,
        ttclid: lead.ttclid,
        click_id: lead.click_id,
        tracking_session_id: lead.tracking_session_id,
        landing_page_url: lead.landing_page_url,
        landing_page_path: lead.landing_page_path,
        page_url: lead.page_url,
        page_path: lead.page_path,
        page_history: lead.page_history,
        referrer: lead.referrer,
        user_agent: lead.user_agent,
        sheet_synced: lead.sheet_synced,
        email_sent: lead.email_sent,
        whatsapp_redirected: lead.whatsapp_redirected
      }
    })
  });

  const responseText = await response.text();
  let parsed: SheetsWebhookResponse | null = null;

  try {
    parsed = responseText ? (JSON.parse(responseText) as SheetsWebhookResponse) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      parsed?.error ||
      responseText ||
      `Sheets sync failed with ${response.status}.`;
    const emailState = inferWebhookEmailState(parsed, false);

    return {
      status: "failed",
      message: message.slice(0, 300),
      configured: true,
      emailStatus: emailState.emailStatus,
      emailMessage: emailState.emailMessage,
      emailSent: emailState.emailSent,
      emailProvider: parsed?.emailProvider || ""
    };
  }

  if (!parsed?.ok && !parsed?.success) {
    const emailState = inferWebhookEmailState(parsed, true);

    return {
      status: "failed",
      message: (parsed?.error || parsed?.message || "Google Sheets webhook returned an unsuccessful result.").slice(0, 300),
      configured: true,
      emailStatus: emailState.emailStatus,
      emailMessage: emailState.emailMessage,
      emailSent: emailState.emailSent,
      emailProvider: parsed?.emailProvider || ""
    };
  }

  if (parsed.sheetSynced === false) {
    const emailState = inferWebhookEmailState(parsed, true);

    return {
      status: "failed",
      message: (parsed?.error || parsed?.message || "Google Sheets webhook returned an unsuccessful result.").slice(0, 300),
      configured: true,
      emailStatus: emailState.emailStatus,
      emailMessage: emailState.emailMessage,
      emailSent: emailState.emailSent,
      emailProvider: parsed?.emailProvider || ""
    };
  }

  const emailState = inferWebhookEmailState(parsed, true);

  return {
    status: "success",
    message: parsed.message || "Synced to Google Sheets.",
    configured: true,
    emailStatus: emailState.emailStatus,
    emailMessage: emailState.emailMessage,
    emailSent: emailState.emailSent,
    emailProvider: parsed?.emailProvider || ""
  };
}

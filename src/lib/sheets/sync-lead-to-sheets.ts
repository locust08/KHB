import "server-only";

import { LEAD_PROJECT_CONFIG } from "@/src/lib/backend/project-config";
import { getServerEnv } from "@/src/lib/utils/env";
import type { LeadRow } from "@/src/lib/supabase/leads-repository";
import type { SyncStatus } from "@/src/types/lead";

export async function syncLeadToSheets(lead: LeadRow): Promise<{
  status: SyncStatus;
  message: string;
}> {
  const env = getServerEnv();

  if (!env.GOOGLE_SHEETS_WEBHOOK_URL) {
    return {
      status: "skipped",
      message: "GOOGLE_SHEETS_WEBHOOK_URL is not configured."
    };
  }

  const response = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.GOOGLE_SHEETS_WEBHOOK_SECRET
        ? { "x-webhook-secret": env.GOOGLE_SHEETS_WEBHOOK_SECRET }
        : {})
    },
    body: JSON.stringify({
      project: LEAD_PROJECT_CONFIG.projectSlug,
      tabName: LEAD_PROJECT_CONFIG.googleSheetTabName,
      targetTabName: LEAD_PROJECT_CONFIG.appsScriptTargetTabName,
      sheetUrl: LEAD_PROJECT_CONFIG.googleSheetUrl,
      lead: {
        leadId: lead.lead_id,
        orderNumber: lead.order_number,
        createdAt: lead.created_at,
        customerName: lead.customer_name,
        email: lead.customer_email,
        phone: lead.customer_phone,
        deliveryMethod: lead.delivery_method,
        deliveryDate: lead.delivery_date,
        deliveryTime: lead.delivery_time,
        pickupStoreName: lead.pickup_store_name,
        total: lead.total,
        currency: lead.currency,
        paymentMethod: lead.payment_method,
        paymentLabel: lead.payment_label,
        items: lead.items,
        attribution: lead.attribution
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sheets sync failed with ${response.status}: ${errorText.slice(0, 300)}`);
  }

  return {
    status: "success",
    message: "Synced to Google Sheets."
  };
}

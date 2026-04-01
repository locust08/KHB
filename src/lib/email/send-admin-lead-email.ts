import "server-only";

import { Resend } from "resend";

import { LEAD_PROJECT_CONFIG } from "@/src/lib/backend/project-config";
import type { LeadRow } from "@/src/lib/supabase/leads-repository";
import { getResendFromAddress, getServerEnv } from "@/src/lib/utils/env";
import { compactJoin, formatCurrency, formatDeliveryDateLabel } from "@/src/lib/utils/format";
import type { SyncStatus } from "@/src/types/lead";

function buildHtml(lead: LeadRow) {
  const deliveryLabel =
    lead.delivery_method === "pickup"
      ? lead.pickup_store_name
      : compactJoin(
          [
            lead.delivery_address,
            lead.delivery_city,
            lead.delivery_postal_code,
            lead.delivery_state
          ],
          ", "
        );

  const itemsMarkup = lead.items
    .map((item) => {
      const typedItem = item as { sizeLabel?: string; quantity?: number; lineTotal?: number };
      return `<li>${typedItem.sizeLabel ?? "Item"} x${typedItem.quantity ?? 1} - ${formatCurrency(typedItem.lineTotal ?? 0, lead.currency)}</li>`;
    })
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2>${LEAD_PROJECT_CONFIG.senderBranding}: New ${LEAD_PROJECT_CONFIG.projectSlug} lead</h2>
      <p><strong>Order:</strong> ${lead.order_number}</p>
      <p><strong>Name:</strong> ${lead.customer_name}</p>
      <p><strong>Email:</strong> ${lead.customer_email}</p>
      <p><strong>Phone:</strong> ${lead.customer_phone}</p>
      <p><strong>Delivery:</strong> ${lead.delivery_method}</p>
      <p><strong>Schedule:</strong> ${formatDeliveryDateLabel(lead.delivery_date)} ${lead.delivery_time ? `at ${lead.delivery_time}` : ""}</p>
      <p><strong>Location:</strong> ${deliveryLabel || "Not provided"}</p>
      <p><strong>Total:</strong> ${formatCurrency(lead.total, lead.currency)}</p>
      <p><strong>Payment:</strong> ${lead.payment_label}</p>
      <p><strong>Candles:</strong> ${lead.include_candles ? `${lead.candle_quantity} included` : "No candles"}</p>
      <p><strong>Instructions:</strong> ${lead.special_instructions || "None"}</p>
      <h3>Items</h3>
      <ul>${itemsMarkup}</ul>
    </div>
  `;
}

export async function sendAdminLeadEmail(lead: LeadRow): Promise<{
  status: SyncStatus;
  message: string;
}> {
  const env = getServerEnv();
  const from = getResendFromAddress();

  if (!env.RESEND_API_KEY || !from) {
    return {
      status: "skipped",
      message: "Resend is not configured."
    };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from,
    to: [LEAD_PROJECT_CONFIG.adminNotificationEmail],
    replyTo: lead.customer_email,
    subject: `[${LEAD_PROJECT_CONFIG.senderBranding}] New ${LEAD_PROJECT_CONFIG.projectSlug} lead ${lead.order_number}`,
    html: buildHtml(lead)
  });

  return {
    status: "success",
    message: "Admin email sent."
  };
}

import "server-only";

import { getServerEnv } from "@/src/lib/utils/env";
import { formatCurrency, formatDeliveryDateLabel } from "@/src/lib/utils/format";
import type { LeadRow } from "@/src/lib/supabase/leads-repository";

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function buildWhatsAppUrl(lead: LeadRow) {
  const env = getServerEnv();
  const phoneNumber = normalizePhoneNumber(
    env.WHATSAPP_PHONE_NUMBER ?? env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ?? ""
  );

  if (!phoneNumber) {
    return "";
  }

  const itemsSummary = lead.items
    .map((item) => {
      const typedItem = item as { sizeLabel?: string; quantity?: number };
      return `- ${typedItem.sizeLabel ?? "Item"} x${typedItem.quantity ?? 1}`;
    })
    .join("\n");

  const message = [
    "Hi Kenny Hills Bakers, I just placed an order.",
    "",
    `Order: ${lead.order_number}`,
    `Name: ${lead.customer_name}`,
    `Phone: ${lead.customer_phone}`,
    `Method: ${lead.delivery_method}`,
    `Date: ${formatDeliveryDateLabel(lead.delivery_date)}${lead.delivery_time ? ` at ${lead.delivery_time}` : ""}`,
    `Total: ${formatCurrency(lead.total, lead.currency)}`,
    "Items:",
    itemsSummary,
    lead.special_instructions ? `Instructions: ${lead.special_instructions}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

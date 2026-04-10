import "server-only";

import { LEAD_PROJECT_CONFIG } from "@/src/lib/backend/project-config";
import { getServerEnv } from "@/src/lib/utils/env";
import { formatCurrency, formatDeliveryDateLabel } from "@/src/lib/utils/format";
import type { LeadRow } from "@/src/lib/supabase/leads-repository";

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function normalizeText(value: unknown, maxLength = 180) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeParagraph(value: unknown, maxLength = 280) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]+/g, " ")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, maxLength);
}

function listValues(values: unknown[], maxItems = 4) {
  return values
    .map((value) => normalizeText(value, 120))
    .filter(Boolean)
    .slice(0, maxItems)
    .join(", ");
}

function buildSourceSummary(lead: LeadRow) {
  const sourceBits = [
    normalizeText(lead.utm_source, 80),
    normalizeText(lead.utm_medium, 80),
    normalizeText(lead.utm_campaign, 80)
  ].filter(Boolean);
  const lines = [];

  if (sourceBits.length) {
    lines.push(`Source: ${sourceBits.join(" / ")}`);
  }

  if (normalizeText(lead.click_id, 120)) {
    lines.push(`Click ID: ${normalizeText(lead.click_id, 120)}`);
  }

  if (normalizeText(lead.tracking_session_id, 120)) {
    lines.push(`Tracking Session: ${normalizeText(lead.tracking_session_id, 120)}`);
  }

  if (normalizeText(lead.landing_page_url, 220)) {
    lines.push(`Landing Page: ${normalizeText(lead.landing_page_url, 220)}`);
  }

  if (normalizeText(lead.landing_page_path, 120)) {
    lines.push(`Landing Path: ${normalizeText(lead.landing_page_path, 120)}`);
  }

  if (normalizeText(lead.page_path, 120)) {
    lines.push(`Page Path: ${normalizeText(lead.page_path, 120)}`);
  }

  if (normalizeText(lead.referrer, 220)) {
    lines.push(`Referrer: ${normalizeText(lead.referrer, 220)}`);
  }

  return lines.join("\n");
}

export function buildWhatsAppMessage(lead: LeadRow) {
  const brandName = LEAD_PROJECT_CONFIG.senderBranding;
  const isContactLead = String(lead.form_name ?? "").toLowerCase() === "contact";
  const lineItems = lead.items
    .map((item) => {
      const typedItem = item as { sizeLabel?: string; quantity?: number; id?: string };
      const label = normalizeText(typedItem.sizeLabel ?? typedItem.id ?? "Item", 100);
      const quantity = Number.isFinite(typedItem.quantity) ? typedItem.quantity : 1;
      return `- ${label} x${quantity}`;
    })
    .filter(Boolean)
    .join("\n");

  const messageLines = [
    `Hi ${brandName}, I have a new enquiry.`,
    "",
    normalizeText(lead.name, 120) ? `Name: ${normalizeText(lead.name, 120)}` : "",
    normalizeText(lead.phone, 40) ? `Phone: ${normalizeText(lead.phone, 40)}` : "",
    normalizeText(lead.enquiry_category, 120)
      ? `Enquiry Category: ${normalizeText(lead.enquiry_category, 120)}`
      : "",
    normalizeText(lead.selected_service, 160)
      ? `Selected Service: ${normalizeText(lead.selected_service, 160)}`
      : "",
    lead.selected_product_names.length
      ? `Selected Products: ${listValues(lead.selected_product_names)}`
      : "",
    lead.selected_product_ids.length
      ? `Product IDs: ${listValues(lead.selected_product_ids)}`
      : "",
    !lead.selected_product_names.length && lineItems ? `Items:\n${lineItems}` : "",
    normalizeParagraph(lead.message, 280) ? `Message: ${normalizeParagraph(lead.message, 280)}` : "",
    lead.form_name ? `Form: ${normalizeText(lead.form_name, 120)}` : "",
    buildSourceSummary(lead),
    lead.order_number ? `Reference: ${normalizeText(lead.order_number, 80)}` : "",
    isContactLead ? "" : lead.delivery_method ? `Delivery Method: ${normalizeText(lead.delivery_method, 40)}` : "",
    isContactLead ? "" : lead.delivery_date ? `Delivery Date: ${formatDeliveryDateLabel(lead.delivery_date)}` : "",
    isContactLead ? "" : lead.delivery_time ? `Delivery Time: ${normalizeText(lead.delivery_time, 40)}` : "",
    isContactLead ? "" : lead.total || lead.total === 0 ? `Total: ${formatCurrency(lead.total, lead.currency)}` : "",
    isContactLead
      ? lead.special_instructions
        ? `Special Instructions: ${normalizeParagraph(lead.special_instructions, 280)}`
        : ""
      : lead.special_instructions
        ? `Special Instructions: ${normalizeParagraph(lead.special_instructions, 280)}`
        : ""
  ]
    .filter(Boolean)
    .join("\n");

  return messageLines.trim();
}

export function buildWhatsAppUrl(lead: LeadRow, message = buildWhatsAppMessage(lead)) {
  const env = getServerEnv();
  const phoneNumber = normalizePhoneNumber(
    env.WHATSAPP_PHONE_NUMBER ?? env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ?? ""
  );

  if (!phoneNumber || !message) {
    return "";
  }

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

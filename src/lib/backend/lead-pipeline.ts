import "server-only";

import { parseLeadSubmission } from "@/src/lib/backend/lead-schema";
import { LEAD_PROJECT_CONFIG } from "@/src/lib/backend/project-config";
import { sendAdminLeadEmail } from "@/src/lib/email/send-admin-lead-email";
import { syncLeadToSheets } from "@/src/lib/sheets/sync-lead-to-sheets";
import {
  getLeadConfirmationByToken,
  insertLead,
  updateLeadSyncState,
  type LeadRow
} from "@/src/lib/supabase/leads-repository";
import { sanitizeErrorMessage } from "@/src/lib/utils/format";
import { buildWhatsAppUrl } from "@/src/lib/whatsapp/build-whatsapp-url";
import type { LeadConfirmation, LeadPipelineResponse, LeadSubmissionInput } from "@/src/types/lead";

function createLeadIdentifiers() {
  const randomPart = crypto.randomUUID().slice(0, 8).toUpperCase();
  const timestampPart = Date.now().toString().slice(-6);

  return {
    leadId: `${LEAD_PROJECT_CONFIG.projectSlug}-${randomPart}`,
    confirmationToken: crypto.randomUUID(),
    orderNumber: `${LEAD_PROJECT_CONFIG.projectSlug}${timestampPart}`
  };
}

function buildLeadRow(input: LeadSubmissionInput) {
  const identifiers = createLeadIdentifiers();
  const customerName = `${input.customer.firstName} ${input.customer.lastName}`.trim();

  return {
    lead_id: identifiers.leadId,
    confirmation_token: identifiers.confirmationToken,
    order_number: identifiers.orderNumber,
    customer_name: customerName,
    customer_first_name: input.customer.firstName,
    customer_last_name: input.customer.lastName,
    customer_email: input.customer.email.toLowerCase(),
    customer_phone: input.customer.phone,
    delivery_method: input.fulfillment.method,
    delivery_date: input.schedule.deliveryDate,
    delivery_time: input.schedule.deliveryTime ?? "",
    delivery_address: input.fulfillment.address ?? "",
    delivery_city: input.fulfillment.city ?? "",
    delivery_postal_code: input.fulfillment.postalCode ?? "",
    delivery_state: input.fulfillment.state ?? "",
    pickup_store_id: input.fulfillment.pickupStoreId ?? "",
    pickup_store_name: input.fulfillment.pickupStoreName ?? "",
    payment_method: input.payment.method,
    payment_label: input.payment.label,
    include_candles: input.addOns.includeCandles,
    candle_quantity: input.addOns.candleQuantity,
    special_instructions: input.schedule.instructions ?? "",
    subtotal: input.order.subtotal,
    delivery_fee: input.order.deliveryFee,
    tax: input.order.tax,
    total: input.order.total,
    currency: input.order.currency,
    items: input.order.items,
    attribution: input.attribution ?? null,
    tracking_context: input.context ?? null,
    whatsapp_url: "",
    sheet_sync_status: "pending" as const,
    sheet_sync_message: "",
    admin_email_status: "pending" as const,
    admin_email_message: "",
    raw_payload: input as unknown as Record<string, unknown>
  };
}

async function runSecondarySyncs(lead: LeadRow) {
  const sheetsResult = await syncLeadToSheets(lead).catch((error: unknown) => ({
    status: "failed" as const,
    message: sanitizeErrorMessage(error)
  }));

  const emailResult = await sendAdminLeadEmail(lead).catch((error: unknown) => ({
    status: "failed" as const,
    message: sanitizeErrorMessage(error)
  }));

  const whatsappUrl = buildWhatsAppUrl(lead);

  await updateLeadSyncState(lead.lead_id, {
    sheet_sync_status: sheetsResult.status,
    sheet_sync_message: sheetsResult.message,
    admin_email_status: emailResult.status,
    admin_email_message: emailResult.message,
    whatsapp_url: whatsappUrl
  });

  return { sheetsResult, emailResult, whatsappUrl };
}

export async function submitLead(rawInput: unknown): Promise<LeadPipelineResponse> {
  const parsed = parseLeadSubmission(rawInput);
  const insertedLead = await insertLead(buildLeadRow(parsed));
  const { sheetsResult, emailResult, whatsappUrl } = await runSecondarySyncs(insertedLead);

  return {
    success: true,
    leadId: insertedLead.lead_id,
    confirmationToken: insertedLead.confirmation_token,
    confirmationUrl: `/thank-you?lead=${insertedLead.confirmation_token}`,
    whatsappUrl,
    syncStatus: {
      sheets: sheetsResult.status,
      email: emailResult.status
    }
  };
}

export async function getLeadConfirmation(token: string): Promise<LeadConfirmation> {
  const lead = await getLeadConfirmationByToken(token);

  return {
    leadId: String(lead.lead_id),
    orderNumber: String(lead.order_number),
    customerName: String(lead.customer_name),
    email: String(lead.customer_email),
    phone: String(lead.customer_phone),
    total: Number(lead.total),
    currency: String(lead.currency),
    deliveryMethod: lead.delivery_method as LeadConfirmation["deliveryMethod"],
    deliveryDate: String(lead.delivery_date),
    deliveryTime: String(lead.delivery_time ?? ""),
    pickupStoreName: String(lead.pickup_store_name ?? ""),
    addressLine: [lead.delivery_address, lead.delivery_city, lead.delivery_postal_code, lead.delivery_state]
      .filter(Boolean)
      .join(", "),
    paymentMethod: lead.payment_method as LeadConfirmation["paymentMethod"],
    paymentLabel: String(lead.payment_label),
    includeCandles: Boolean(lead.include_candles),
    candleQuantity: Number(lead.candle_quantity ?? 0),
    specialInstructions: String(lead.special_instructions ?? ""),
    items: (lead.items ?? []) as LeadConfirmation["items"],
    whatsappUrl: String(lead.whatsapp_url ?? ""),
    createdAt: String(lead.created_at)
  };
}

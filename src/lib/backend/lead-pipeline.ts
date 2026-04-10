import "server-only";

import { parseLeadSubmission } from "@/src/lib/backend/lead-schema";
import { LEAD_PROJECT_CONFIG } from "@/src/lib/backend/project-config";
import { syncLeadToSheets } from "@/src/lib/sheets/sync-lead-to-sheets";
import {
  getLeadConfirmationByToken,
  insertLead,
  updateLeadSyncState,
  type LeadRow
} from "@/src/lib/supabase/leads-repository";
import { sanitizeErrorMessage } from "@/src/lib/utils/format";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/src/lib/whatsapp/build-whatsapp-url";
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

function buildLegacyPayload(input: LeadSubmissionInput) {
  const legacy = input.legacy;

  if (legacy) {
    return legacy;
  }

  const fallbackItems = input.selectedProductIds.map((id, index) => ({
    id,
    sizeKey: id,
    sizeLabel: input.selectedProductNames[index] ?? input.selectedProductNames[0] ?? id,
    dimensions: "",
    image: "",
    unitPrice: 0,
    quantity: 1,
    lineTotal: 0
  }));

  return {
    customer: {
      firstName: input.name.split(" ")[0] ?? input.name,
      lastName: input.name.split(" ").slice(1).join(" ") || "",
      email: input.email,
      phone: input.phone
    },
    fulfillment: {
      method: input.enquiryCategory === "pickup" ? "pickup" : "delivery",
      address: "",
      city: "",
      postalCode: "",
      state: "",
      pickupStoreId: "",
      pickupStoreName: ""
    },
    schedule: {
      deliveryDate: "",
      deliveryTime: "",
      instructions: input.message
    },
    payment: {
      method: "card",
      label: input.selectedService
    },
    addOns: {
      includeCandles: false,
      candleQuantity: 0
    },
    order: {
      items: fallbackItems,
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      total: 0,
      currency: "MYR"
    }
  };
}

function buildLeadRow(input: LeadSubmissionInput) {
  const identifiers = createLeadIdentifiers();
  const legacy = buildLegacyPayload(input);
  const customerName = input.name.trim();
  const customerNameParts = customerName.split(" ");
  const trackingSessionId = input.trackingSessionId ?? input.attribution?.sessionId ?? "";
  const pageHistory = input.pageHistory ?? input.attribution?.pageHistory ?? [];
  const whatsappReadyLead = {
    lead_id: identifiers.leadId,
    confirmation_token: identifiers.confirmationToken,
    order_number: identifiers.orderNumber,
    name: customerName,
    phone: input.phone,
    email: input.email.toLowerCase(),
    message: input.message,
    form_name: input.formName,
    enquiry_category: input.enquiryCategory,
    selected_service: input.selectedService,
    selected_product_ids: input.selectedProductIds,
    selected_product_names: input.selectedProductNames,
    utm_source: input.utmSource ?? input.attribution?.utmSource ?? "",
    utm_medium: input.utmMedium ?? input.attribution?.utmMedium ?? "",
    utm_campaign: input.utmCampaign ?? input.attribution?.utmCampaign ?? "",
    utm_content: input.utmContent ?? input.attribution?.utmContent ?? "",
    utm_term: input.utmTerm ?? input.attribution?.utmTerm ?? "",
    gclid: input.gclid ?? input.attribution?.gclid ?? "",
    fbclid: input.fbclid ?? input.attribution?.fbclid ?? "",
    msclkid: input.msclkid ?? input.attribution?.msclkid ?? "",
    ttclid: input.ttclid ?? input.attribution?.ttclid ?? "",
    click_id: input.clickId ?? input.attribution?.clickId ?? "",
    tracking_session_id: trackingSessionId,
    landing_page_url:
      input.landingPageUrl ?? input.attribution?.landingPageUrl ?? input.context?.pageUrl ?? "",
    landing_page_path: input.landingPagePath ?? input.attribution?.landingPagePath ?? "",
    page_url: input.pageUrl ?? input.context?.pageUrl ?? "",
    page_path: input.pagePath ?? input.attribution?.lastPage ?? "",
    page_history: pageHistory,
    referrer: input.referrer ?? input.attribution?.referrer ?? input.context?.referrer ?? "",
    user_agent: input.userAgent ?? input.context?.userAgent ?? "",
    sheet_synced: false,
    email_sent: false,
    whatsapp_redirected: false,
    customer_name: customerName,
    customer_first_name: customerNameParts[0] ?? customerName,
    customer_last_name: customerNameParts.slice(1).join(" "),
    customer_email: input.email.toLowerCase(),
    customer_phone: input.phone,
    delivery_method: legacy.fulfillment.method,
    delivery_date: legacy.schedule.deliveryDate,
    delivery_time: legacy.schedule.deliveryTime ?? "",
    delivery_address: legacy.fulfillment.address ?? "",
    delivery_city: legacy.fulfillment.city ?? "",
    delivery_postal_code: legacy.fulfillment.postalCode ?? "",
    delivery_state: legacy.fulfillment.state ?? "",
    pickup_store_id: legacy.fulfillment.pickupStoreId ?? "",
    pickup_store_name: legacy.fulfillment.pickupStoreName ?? "",
    payment_method: legacy.payment.method,
    payment_label: legacy.payment.label,
    include_candles: legacy.addOns.includeCandles,
    candle_quantity: legacy.addOns.candleQuantity,
    special_instructions: legacy.schedule.instructions ?? input.message,
    subtotal: legacy.order.subtotal,
    delivery_fee: legacy.order.deliveryFee,
    tax: legacy.order.tax,
    total: legacy.order.total,
    currency: legacy.order.currency,
    items: legacy.order.items,
    attribution: input.attribution ?? null,
    tracking_context: {
      ...input.context,
      trackingSessionId,
      landingPageUrl:
        input.landingPageUrl ?? input.attribution?.landingPageUrl ?? input.context?.pageUrl ?? "",
      landingPagePath: input.landingPagePath ?? input.attribution?.landingPagePath ?? "",
      pageUrl: input.pageUrl ?? input.context?.pageUrl ?? "",
      pagePath: input.pagePath ?? input.attribution?.lastPage ?? "",
      pageHistory
    },
    whatsapp_url: "",
    sheet_sync_status: "pending" as const,
    sheet_sync_message: "",
    admin_email_status: "pending" as const,
    admin_email_message: "",
    raw_payload: {
      ...input,
      legacy
    } as Record<string, unknown>
  };

  return whatsappReadyLead;
}

function toLeadResponse(
  lead: LeadRow,
  warnings: string[],
  sheetStatus: string,
  emailStatus: string,
  syncState: {
    emailConfigured: boolean;
    sheetSynced: boolean;
    emailSent: boolean;
    whatsappMessage: string;
    whatsappUrl: string;
  }
): LeadPipelineResponse {
  const trackingReady = Boolean(
    lead.tracking_session_id ||
      lead.landing_page_url ||
      lead.page_url ||
      lead.page_history?.length ||
      lead.utm_source ||
      lead.gclid ||
      lead.fbclid ||
      lead.msclkid ||
      lead.ttclid ||
      lead.click_id
  );

  return {
    success: true,
    leadSaved: true,
    leadId: lead.lead_id,
    orderNumber: lead.order_number,
    emailConfigured: syncState.emailConfigured,
    sheetSynced: syncState.sheetSynced,
    emailSent: syncState.emailSent,
    whatsappRedirectReady: Boolean(syncState.whatsappUrl),
    trackingReady,
    processingComplete: true,
    warnings,
    errors: [],
    confirmationToken: lead.confirmation_token,
    confirmationUrl: `/thank-you?lead=${lead.confirmation_token}`,
    whatsappMessage: syncState.whatsappMessage,
    whatsappUrl: syncState.whatsappUrl,
    syncStatus: {
      sheets: sheetStatus as LeadPipelineResponse["syncStatus"]["sheets"],
      email: emailStatus as LeadPipelineResponse["syncStatus"]["email"]
    }
  };
}

async function runSecondarySyncs(lead: LeadRow) {
  const warnings: string[] = [];
  const whatsappMessage = buildWhatsAppMessage(lead);
  const whatsappUrl = buildWhatsAppUrl(lead, whatsappMessage);

  const sheetsResult = await syncLeadToSheets(lead).catch((error: unknown) => {
    const message = sanitizeErrorMessage(error);
    return {
      status: "failed" as const,
      message,
      configured: false,
      emailStatus: "failed" as const,
      emailMessage: message,
      emailSent: false,
      emailProvider: ""
    };
  });

  if (sheetsResult.status !== "success") {
    warnings.push(`Sheets sync ${sheetsResult.status}: ${sheetsResult.message}`);
  }

  if (sheetsResult.emailStatus === "failed") {
    warnings.push(`Admin email ${sheetsResult.emailStatus}: ${sheetsResult.emailMessage}`);
  } else if (sheetsResult.emailStatus === "skipped") {
    warnings.push(`Admin email skipped: ${sheetsResult.emailMessage}`);
  }

  const nextSheetSynced = sheetsResult.status === "success";
  const nextEmailSent = sheetsResult.emailSent;
  const nextWhatsappRedirected = Boolean(whatsappUrl);

  try {
    await updateLeadSyncState(lead.lead_id, {
      sheet_synced: nextSheetSynced,
      email_sent: nextEmailSent,
      whatsapp_redirected: nextWhatsappRedirected,
      sheet_sync_status: sheetsResult.status,
      sheet_sync_message: sheetsResult.message,
      admin_email_status: sheetsResult.emailStatus,
      admin_email_message: sheetsResult.emailMessage,
      whatsapp_url: whatsappUrl
    });
  } catch (error) {
    warnings.push(`Lead status update failed: ${sanitizeErrorMessage(error)}`);
  }

  return {
    sheetsResult,
    whatsappMessage,
    whatsappUrl,
    warnings,
    emailConfigured: sheetsResult.configured,
    sheetSynced: nextSheetSynced,
    emailSent: nextEmailSent,
    whatsappRedirectReady: nextWhatsappRedirected,
    emailStatus: sheetsResult.emailStatus
  };
}

export async function submitLead(rawInput: unknown): Promise<LeadPipelineResponse> {
  const parsed = parseLeadSubmission(rawInput);
  const insertedLead = await insertLead(buildLeadRow(parsed));
  const {
    sheetsResult,
    whatsappMessage,
    whatsappUrl,
    warnings,
    emailConfigured,
    sheetSynced,
    emailSent,
    whatsappRedirectReady,
    emailStatus
  } = await runSecondarySyncs(insertedLead);

  return {
    ...toLeadResponse(insertedLead, warnings, sheetsResult.status, emailStatus, {
      emailConfigured,
      sheetSynced,
      emailSent,
      whatsappMessage,
      whatsappUrl
    }),
    whatsappMessage,
    whatsappUrl,
    whatsappRedirectReady
  };
}

export async function getLeadConfirmation(token: string): Promise<LeadConfirmation> {
  const lead = await getLeadConfirmationByToken(token);

  return {
    leadId: String(lead.lead_id),
    orderNumber: String(lead.order_number),
    formName: String(lead.form_name ?? ""),
    enquiryCategory: String(lead.enquiry_category ?? ""),
    selectedService: String(lead.selected_service ?? ""),
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
    trackingSessionId: String(lead.tracking_session_id ?? ""),
    landingPagePath: String(lead.landing_page_path ?? ""),
    pagePath: String(lead.page_path ?? ""),
    utmSource: String(lead.utm_source ?? ""),
    utmMedium: String(lead.utm_medium ?? ""),
    utmCampaign: String(lead.utm_campaign ?? ""),
    utmContent: String(lead.utm_content ?? ""),
    utmTerm: String(lead.utm_term ?? ""),
    clickId: String(lead.click_id ?? ""),
    whatsappUrl: String(lead.whatsapp_url ?? ""),
    createdAt: String(lead.created_at)
  };
}

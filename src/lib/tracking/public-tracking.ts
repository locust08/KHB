type SuccessTrackingPayload = {
  leadId: string;
  orderNumber: string;
  value: number;
  currency: string;
  deliveryMethod: string;
  itemCount: number;
  formName?: string;
  trackingSessionId?: string;
  landingPagePath?: string;
  pagePath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  clickId?: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackLeadSuccess(payload: SuccessTrackingPayload) {
  if (typeof window === "undefined") {
    return false;
  }

  const dedupeKey = `khb-success:${payload.leadId}:${payload.orderNumber}`;
  if (window.sessionStorage.getItem(dedupeKey) === "1") {
    return false;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: "lead_form_submit_success",
    ga4_event_name: "generate_lead",
    event_id: dedupeKey,
    lead_id: payload.leadId,
    order_number: payload.orderNumber,
    form_name: payload.formName ?? "",
    value: payload.value,
    currency: payload.currency,
    delivery_method: payload.deliveryMethod,
    item_count: payload.itemCount,
    tracking_session_id: payload.trackingSessionId ?? "",
    landing_page_path: payload.landingPagePath ?? "",
    page_path: payload.pagePath ?? "",
    utm_source: payload.utmSource ?? "",
    utm_medium: payload.utmMedium ?? "",
    utm_campaign: payload.utmCampaign ?? "",
    utm_content: payload.utmContent ?? "",
    utm_term: payload.utmTerm ?? "",
    click_id: payload.clickId ?? ""
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      currency: payload.currency,
      value: payload.value,
      transaction_id: payload.orderNumber,
      event_id: dedupeKey,
      lead_id: payload.leadId,
      form_name: payload.formName ?? "",
      delivery_method: payload.deliveryMethod,
      item_count: payload.itemCount,
      tracking_session_id: payload.trackingSessionId ?? "",
      landing_page_path: payload.landingPagePath ?? "",
      page_path: payload.pagePath ?? "",
      utm_source: payload.utmSource ?? "",
      utm_medium: payload.utmMedium ?? "",
      utm_campaign: payload.utmCampaign ?? "",
      utm_content: payload.utmContent ?? "",
      utm_term: payload.utmTerm ?? "",
      click_id: payload.clickId ?? ""
    });
  }

  window.sessionStorage.setItem(dedupeKey, "1");
  return true;
}

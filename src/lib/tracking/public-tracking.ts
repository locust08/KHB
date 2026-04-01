type SuccessTrackingPayload = {
  leadId: string;
  orderNumber: string;
  value: number;
  currency: string;
  deliveryMethod: string;
  itemCount: number;
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
    event: "lead_submit_success",
    event_id: dedupeKey,
    lead_id: payload.leadId,
    order_number: payload.orderNumber,
    value: payload.value,
    currency: payload.currency,
    delivery_method: payload.deliveryMethod,
    item_count: payload.itemCount
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      currency: payload.currency,
      value: payload.value,
      transaction_id: payload.orderNumber,
      event_id: dedupeKey,
      lead_id: payload.leadId,
      delivery_method: payload.deliveryMethod,
      item_count: payload.itemCount
    });
  }

  window.sessionStorage.setItem(dedupeKey, "1");
  return true;
}

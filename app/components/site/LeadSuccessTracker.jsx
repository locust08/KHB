"use client";

import { useEffect } from "react";

import { trackLeadSuccess } from "@/src/lib/tracking/public-tracking";

export default function LeadSuccessTracker({ lead }) {
  useEffect(() => {
    if (!lead?.leadId) {
      return;
    }

    const storageKey = `khb-lead-success:${lead.leadId}`;
    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    trackLeadSuccess({
      leadId: lead.leadId,
      orderNumber: lead.orderNumber,
      value: lead.total,
      currency: lead.currency,
      deliveryMethod: lead.deliveryMethod,
      itemCount: lead.items.length
    });

    window.sessionStorage.setItem(storageKey, "1");
  }, [lead]);

  return null;
}

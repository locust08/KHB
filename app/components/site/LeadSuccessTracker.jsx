"use client";

import { useEffect } from "react";

import { trackLeadSuccess } from "@/src/lib/tracking/public-tracking";

export default function LeadSuccessTracker({ lead }) {
  useEffect(() => {
    if (!lead?.leadId) {
      return;
    }

    trackLeadSuccess({
      leadId: lead.leadId,
      orderNumber: lead.orderNumber,
      value: lead.total,
      currency: lead.currency,
      deliveryMethod: lead.deliveryMethod,
      itemCount: lead.items.length,
      formName: lead.formName ?? "",
      trackingSessionId: lead.trackingSessionId ?? "",
      landingPagePath: lead.landingPagePath ?? "",
      pagePath: lead.pagePath ?? "",
      utmSource: lead.utmSource ?? "",
      utmMedium: lead.utmMedium ?? "",
      utmCampaign: lead.utmCampaign ?? "",
      utmContent: lead.utmContent ?? "",
      utmTerm: lead.utmTerm ?? "",
      clickId: lead.clickId ?? ""
    });
  }, [lead]);

  return null;
}

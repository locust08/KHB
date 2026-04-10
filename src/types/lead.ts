export type DeliveryMethod = "delivery" | "pickup";
export type PaymentMethod = "card" | "online" | "ewallet";
export type SyncStatus = "pending" | "success" | "failed" | "skipped";

export interface CheckoutLineItem {
  id: string;
  sizeKey: string;
  sizeLabel: string;
  dimensions: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface LeadAttributionSnapshot {
  sessionId: string;
  landingPage: string;
  lastPage: string;
  referrer: string;
  trackingSessionId?: string;
  landingPageUrl?: string;
  landingPagePath?: string;
  pageUrl?: string;
  pagePath?: string;
  pageHistory?: Array<{
    pageUrl: string;
    pagePath: string;
    timestamp: string;
  }>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
  clickId?: string;
  gbraid?: string;
  wbraid?: string;
  firstCapturedAt: string;
  lastCapturedAt: string;
}

export interface LeadSubmissionInput {
  name: string;
  phone: string;
  email: string;
  message: string;
  formName: string;
  enquiryCategory: string;
  selectedService: string;
  selectedProductIds: string[];
  selectedProductNames: string[];
  sheetSynced?: boolean;
  emailSent?: boolean;
  whatsappRedirected?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  clickId?: string;
  trackingSessionId?: string;
  landingPageUrl?: string;
  landingPagePath?: string;
  pageUrl?: string;
  pagePath?: string;
  pageHistory?: Array<{
    pageUrl: string;
    pagePath: string;
    timestamp: string;
  }>;
  referrer?: string;
  userAgent?: string;
  attribution?: LeadAttributionSnapshot | null;
  context?: {
    pageUrl?: string;
    userAgent?: string;
    referrer?: string;
  };
  legacy?: {
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    fulfillment: {
      method: DeliveryMethod;
      address?: string;
      city?: string;
      postalCode?: string;
      state?: string;
      pickupStoreId?: string;
      pickupStoreName?: string;
    };
    schedule: {
      deliveryDate: string;
      deliveryTime?: string;
      instructions?: string;
    };
    payment: {
      method: PaymentMethod;
      label: string;
    };
    addOns: {
      includeCandles: boolean;
      candleQuantity: number;
    };
    order: {
      items: CheckoutLineItem[];
      subtotal: number;
      deliveryFee: number;
      tax: number;
      total: number;
      currency: string;
    };
  };
}

export interface LeadConfirmation {
  leadId: string;
  orderNumber: string;
  formName?: string;
  enquiryCategory?: string;
  selectedService?: string;
  customerName: string;
  email: string;
  phone: string;
  total: number;
  currency: string;
  deliveryMethod: DeliveryMethod;
  deliveryDate: string;
  deliveryTime: string;
  pickupStoreName: string;
  addressLine: string;
  paymentMethod: PaymentMethod;
  paymentLabel: string;
  includeCandles: boolean;
  candleQuantity: number;
  specialInstructions: string;
  items: CheckoutLineItem[];
  trackingSessionId?: string;
  landingPagePath?: string;
  pagePath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  clickId?: string;
  whatsappUrl: string;
  createdAt: string;
}

export interface LeadPipelineResponse {
  success: true;
  leadSaved: boolean;
  leadId: string;
  orderNumber: string;
  emailConfigured: boolean;
  emailSent: boolean;
  sheetSynced: boolean;
  whatsappRedirectReady: boolean;
  trackingReady: boolean;
  processingComplete: boolean;
  warnings: string[];
  errors: string[];
  confirmationToken: string;
  confirmationUrl: string;
  whatsappMessage: string;
  whatsappUrl: string;
  syncStatus: {
    sheets: SyncStatus;
    email: SyncStatus;
  };
}

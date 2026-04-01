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
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
  gbraid?: string;
  wbraid?: string;
  firstCapturedAt: string;
  lastCapturedAt: string;
}

export interface LeadSubmissionInput {
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
  attribution?: LeadAttributionSnapshot | null;
  context?: {
    pageUrl?: string;
    userAgent?: string;
  };
}

export interface LeadConfirmation {
  leadId: string;
  orderNumber: string;
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
  whatsappUrl: string;
  createdAt: string;
}

export interface LeadPipelineResponse {
  success: true;
  leadId: string;
  confirmationToken: string;
  confirmationUrl: string;
  whatsappUrl: string;
  syncStatus: {
    sheets: SyncStatus;
    email: SyncStatus;
  };
}

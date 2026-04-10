import { z } from "zod";

import type { LeadSubmissionInput } from "@/src/types/lead";

const pageHistoryEntrySchema = z.object({
  pageUrl: z.string().trim().min(1).max(500),
  pagePath: z.string().trim().min(1).max(500),
  timestamp: z.string().trim().min(1)
});

const attributionSchema = z
  .object({
    sessionId: z.string().trim().min(1),
    landingPage: z.string().trim().min(1),
    lastPage: z.string().trim().min(1),
    referrer: z.string().default(""),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmTerm: z.string().optional(),
    utmContent: z.string().optional(),
    gclid: z.string().optional(),
    fbclid: z.string().optional(),
    ttclid: z.string().optional(),
    msclkid: z.string().optional(),
    clickId: z.string().optional(),
    gbraid: z.string().optional(),
    wbraid: z.string().optional(),
    firstCapturedAt: z.string().trim().min(1),
    lastCapturedAt: z.string().trim().min(1)
  })
  .nullable()
  .optional();

const genericLeadSubmissionSchema = z
  .object({
    name: z.string().trim().min(1).max(240),
    phone: z.string().trim().min(8).max(40),
    email: z.string().trim().email().max(200),
    message: z.string().trim().max(4000).default(""),
    formName: z.string().trim().min(1).max(120),
    enquiryCategory: z.string().trim().min(1).max(120),
    selectedService: z.string().trim().min(1).max(200),
    selectedProductIds: z.array(z.string().trim().min(1)).default([]),
    selectedProductNames: z.array(z.string().trim().min(1)).default([]),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmContent: z.string().optional(),
    utmTerm: z.string().optional(),
    gclid: z.string().optional(),
    fbclid: z.string().optional(),
    msclkid: z.string().optional(),
    ttclid: z.string().optional(),
    clickId: z.string().optional(),
    trackingSessionId: z.string().optional(),
    landingPageUrl: z.string().optional(),
    landingPagePath: z.string().optional(),
    pageUrl: z.string().optional(),
    pagePath: z.string().optional(),
    pageHistory: z.array(pageHistoryEntrySchema).default([]),
    referrer: z.string().optional(),
    userAgent: z.string().optional(),
    sheetSynced: z.boolean().optional(),
    emailSent: z.boolean().optional(),
    whatsappRedirected: z.boolean().optional(),
    attribution: attributionSchema,
    context: z
      .object({
        pageUrl: z.string().trim().max(500).optional(),
        userAgent: z.string().trim().max(500).optional(),
        referrer: z.string().trim().max(500).optional()
      })
      .optional()
      .default({})
  })
  .superRefine((value, context) => {
    if (value.selectedProductIds.length !== value.selectedProductNames.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedProductNames"],
        message: "selectedProductIds and selectedProductNames must contain the same number of items."
      });
    }
  });

const checkoutLineItemSchema = z.object({
  id: z.string().min(1),
  sizeKey: z.string().min(1),
  sizeLabel: z.string().min(1),
  dimensions: z.string().min(1),
  image: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  lineTotal: z.number().nonnegative()
});

const legacyCheckoutSubmissionSchema = z.object({
  customer: z.object({
    firstName: z.string().trim().min(1).max(120),
    lastName: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(8).max(40)
  }),
  fulfillment: z
    .object({
      method: z.enum(["delivery", "pickup"]),
      address: z.string().trim().max(300).optional().default(""),
      city: z.string().trim().max(120).optional().default(""),
      postalCode: z.string().trim().max(20).optional().default(""),
      state: z.string().trim().max(120).optional().default(""),
      pickupStoreId: z.string().trim().max(120).optional().default(""),
      pickupStoreName: z.string().trim().max(200).optional().default("")
    })
    .superRefine((value, context) => {
      if (value.method === "delivery") {
        if (!value.address) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["address"],
            message: "Delivery address is required."
          });
        }

        if (!value.city) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["city"],
            message: "Delivery city is required."
          });
        }

        if (!value.postalCode) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["postalCode"],
            message: "Delivery postal code is required."
          });
        }
      }

      if (value.method === "pickup" && !value.pickupStoreName) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pickupStoreName"],
          message: "Pickup store is required."
        });
      }
    }),
  schedule: z.object({
    deliveryDate: z.string().trim().min(1),
    deliveryTime: z.string().trim().optional().default(""),
    instructions: z.string().trim().max(500).optional().default("")
  }),
  payment: z.object({
    method: z.enum(["card", "online", "ewallet"]),
    label: z.string().trim().min(1).max(120)
  }),
  addOns: z.object({
    includeCandles: z.boolean(),
    candleQuantity: z.number().int().min(0).max(20)
  }),
  order: z.object({
    items: z.array(checkoutLineItemSchema).min(1),
    subtotal: z.number().nonnegative(),
    deliveryFee: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    total: z.number().positive(),
    currency: z.string().trim().min(3).max(10).default("MYR")
  }),
  trackingSessionId: z.string().optional(),
  landingPageUrl: z.string().optional(),
  landingPagePath: z.string().optional(),
  pageUrl: z.string().optional(),
  pagePath: z.string().optional(),
  pageHistory: z.array(pageHistoryEntrySchema).default([]),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
  msclkid: z.string().optional(),
  ttclid: z.string().optional(),
  clickId: z.string().optional(),
  attribution: attributionSchema,
  context: z
    .object({
      pageUrl: z.string().trim().max(500).optional().default(""),
      userAgent: z.string().trim().max(500).optional().default(""),
      referrer: z.string().trim().max(500).optional().default("")
    })
    .optional()
    .default({ pageUrl: "", userAgent: "", referrer: "" })
});

function normalizeTrackingFields(input: {
  attribution?: LeadSubmissionInput["attribution"];
  context?: LeadSubmissionInput["context"];
  trackingSessionId?: string;
  landingPageUrl?: string;
  landingPagePath?: string;
  pageUrl?: string;
  pagePath?: string;
  pageHistory?: LeadSubmissionInput["pageHistory"];
  referrer?: string;
  userAgent?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  clickId?: string;
}) {
  const attribution = input.attribution ?? null;

  return {
    utmSource: input.utmSource ?? attribution?.utmSource ?? undefined,
    utmMedium: input.utmMedium ?? attribution?.utmMedium ?? undefined,
    utmCampaign: input.utmCampaign ?? attribution?.utmCampaign ?? undefined,
    utmContent: input.utmContent ?? attribution?.utmContent ?? undefined,
    utmTerm: input.utmTerm ?? attribution?.utmTerm ?? undefined,
    gclid: input.gclid ?? attribution?.gclid ?? undefined,
    fbclid: input.fbclid ?? attribution?.fbclid ?? undefined,
    msclkid: input.msclkid ?? attribution?.msclkid ?? undefined,
    ttclid: input.ttclid ?? attribution?.ttclid ?? undefined,
    clickId: input.clickId ?? attribution?.clickId ?? undefined,
    trackingSessionId: input.trackingSessionId ?? attribution?.sessionId ?? undefined,
    landingPageUrl: input.landingPageUrl ?? undefined,
    landingPagePath: input.landingPagePath ?? undefined,
    pageUrl: input.pageUrl ?? input.context?.pageUrl ?? undefined,
    pagePath: input.pagePath ?? undefined,
    pageHistory: input.pageHistory ?? [],
    referrer: input.referrer ?? attribution?.referrer ?? input.context?.referrer ?? "",
    userAgent: input.userAgent ?? input.context?.userAgent ?? ""
  };
}

function normalizeLegacySubmission(input: z.infer<typeof legacyCheckoutSubmissionSchema>): LeadSubmissionInput {
  const customerName = `${input.customer.firstName} ${input.customer.lastName}`.trim();
  const selectedProductIds = input.order.items.map((item) => item.id);
  const selectedProductNames = input.order.items.map((item) => `Peach Strudel ${item.sizeLabel}`);
  const tracking = normalizeTrackingFields({
    attribution: input.attribution,
    context: input.context,
    trackingSessionId: input.trackingSessionId,
    landingPageUrl: input.landingPageUrl,
    landingPagePath: input.landingPagePath,
    pageUrl: input.pageUrl ?? input.context.pageUrl ?? input.attribution?.landingPage ?? "",
    pagePath: input.pagePath ?? input.attribution?.lastPage ?? "",
    pageHistory: input.pageHistory,
    referrer: input.referrer ?? input.context.referrer ?? "",
    userAgent: input.userAgent ?? input.context.userAgent ?? "",
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    utmContent: input.utmContent,
    utmTerm: input.utmTerm,
    gclid: input.gclid,
    fbclid: input.fbclid,
    msclkid: input.msclkid,
    ttclid: input.ttclid,
    clickId: input.clickId
  });

  return {
    name: customerName,
    phone: input.customer.phone,
    email: input.customer.email.toLowerCase(),
    message:
      input.schedule.instructions?.trim() ||
      [
        `Delivery method: ${input.fulfillment.method}`,
        input.fulfillment.method === "delivery"
          ? `Delivery address: ${[
              input.fulfillment.address,
              input.fulfillment.city,
              input.fulfillment.postalCode,
              input.fulfillment.state
            ]
              .filter(Boolean)
              .join(", ")}`
          : `Pickup store: ${input.fulfillment.pickupStoreName || "Not specified"}`,
        `Delivery date: ${input.schedule.deliveryDate}`,
        input.schedule.deliveryTime ? `Preferred time: ${input.schedule.deliveryTime}` : "",
        `Payment: ${input.payment.label}`
      ]
        .filter(Boolean)
        .join("\n"),
    formName: "checkout",
    enquiryCategory: input.fulfillment.method,
    selectedService:
      input.fulfillment.method === "pickup"
        ? input.fulfillment.pickupStoreName || "Pickup"
        : "Delivery",
    selectedProductIds,
    selectedProductNames,
    sheetSynced: false,
    emailSent: false,
    whatsappRedirected: false,
    ...tracking,
    attribution: input.attribution ?? null,
    context: {
      pageUrl: input.context.pageUrl || tracking.pageUrl || "",
      userAgent: input.context.userAgent || input.userAgent || "",
      referrer: input.context.referrer || input.referrer || ""
    },
    legacy: input
  };
}

function normalizeGenericSubmission(input: z.infer<typeof genericLeadSubmissionSchema>): LeadSubmissionInput {
  const tracking = normalizeTrackingFields({
    attribution: input.attribution,
    context: input.context,
    trackingSessionId: input.trackingSessionId,
    landingPageUrl: input.landingPageUrl,
    landingPagePath: input.landingPagePath,
    pageUrl: input.pageUrl,
    pagePath: input.pagePath,
    pageHistory: input.pageHistory,
    referrer: input.referrer,
    userAgent: input.userAgent,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    utmContent: input.utmContent,
    utmTerm: input.utmTerm,
    gclid: input.gclid,
    fbclid: input.fbclid,
    msclkid: input.msclkid,
    ttclid: input.ttclid,
    clickId: input.clickId
  });

  return {
    name: input.name,
    phone: input.phone,
    email: input.email.toLowerCase(),
    message: input.message,
    formName: input.formName,
    enquiryCategory: input.enquiryCategory,
    selectedService: input.selectedService,
    selectedProductIds: input.selectedProductIds,
    selectedProductNames: input.selectedProductNames,
    sheetSynced: input.sheetSynced ?? false,
    emailSent: input.emailSent ?? false,
    whatsappRedirected: input.whatsappRedirected ?? false,
    ...tracking,
    attribution: input.attribution ?? null,
    context: input.context,
    legacy: undefined
  };
}

export function parseLeadSubmission(input: unknown): LeadSubmissionInput {
  const legacyResult = legacyCheckoutSubmissionSchema.safeParse(input);
  if (legacyResult.success) {
    return normalizeLegacySubmission(legacyResult.data);
  }

  return normalizeGenericSubmission(genericLeadSubmissionSchema.parse(input));
}

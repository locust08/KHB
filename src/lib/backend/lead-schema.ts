import { z } from "zod";

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

const attributionSchema = z
  .object({
    sessionId: z.string().min(1),
    landingPage: z.string().min(1),
    lastPage: z.string().min(1),
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
    gbraid: z.string().optional(),
    wbraid: z.string().optional(),
    firstCapturedAt: z.string().min(1),
    lastCapturedAt: z.string().min(1)
  })
  .nullable()
  .optional();

export const leadSubmissionSchema = z.object({
  customer: z.object({
    firstName: z.string().trim().min(1).max(120),
    lastName: z.string().trim().min(1).max(120),
    email: z.string().email().trim().max(200),
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
  attribution: attributionSchema,
  context: z
    .object({
      pageUrl: z.string().trim().max(500).optional().default(""),
      userAgent: z.string().trim().max(500).optional().default("")
    })
    .optional()
    .default({ pageUrl: "", userAgent: "" })
});

export function parseLeadSubmission(input: unknown) {
  return leadSubmissionSchema.parse(input);
}

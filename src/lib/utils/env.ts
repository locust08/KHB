import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_SHEETS_WEBHOOK_URL: z.string().url().optional(),
  GOOGLE_SHEETS_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL_DEV: z.string().email().optional(),
  RESEND_FROM_EMAIL_PROD: z.string().email().optional(),
  WHATSAPP_PHONE_NUMBER: z.string().min(1).optional(),
  NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER: z.string().min(1).optional(),
  PUBLIC_GTM_CONTAINER_ID: z.string().min(1).optional(),
  GTM_CONTAINER_ID: z.string().min(1).optional(),
  PUBLIC_GA4_MEASUREMENT_ID: z.string().min(1).optional(),
  GA4_STREAM_ID: z.string().min(1).optional()
});

let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  if (!cachedServerEnv) {
    cachedServerEnv = serverEnvSchema.parse(process.env);
  }

  return cachedServerEnv;
}

export function getPublicRuntimeConfig() {
  return {
    gtmContainerId:
      process.env.PUBLIC_GTM_CONTAINER_ID ?? process.env.GTM_CONTAINER_ID ?? "",
    ga4MeasurementId:
      process.env.PUBLIC_GA4_MEASUREMENT_ID ?? process.env.GA4_STREAM_ID ?? "",
    whatsappPhoneNumber:
      process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ??
      process.env.WHATSAPP_PHONE_NUMBER ??
      ""
  };
}

export function getResendFromAddress() {
  const env = getServerEnv();

  return env.RESEND_FROM_EMAIL_PROD ?? env.RESEND_FROM_EMAIL_DEV ?? "";
}

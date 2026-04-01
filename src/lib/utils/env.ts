import "server-only";

import { z } from "zod";

import { LEAD_PROJECT_CONFIG } from "@/src/lib/backend/project-config";

const serverEnvSchema = z.object({
  SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  GOOGLE_SHEETS_APPS_SCRIPT_URL: z.string().url().optional(),
  GOOGLE_SHEETS_WEBHOOK_URL: z.string().url().optional(),
  GOOGLE_SHEETS_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL_DEV: z.string().email().optional(),
  RESEND_FROM_EMAIL_PROD: z.string().email().optional(),
  RESEND_TO_EMAIL_DEV: z.string().email().optional(),
  RESEND_TO_EMAIL_PROD: z.string().email().optional(),
  WHATSAPP_PHONE_NUMBER: z.string().min(1).optional(),
  NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER: z.string().min(1).optional(),
  NEXT_PUBLIC_GTM_ID: z.string().min(1).optional(),
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
    siteUrl: getPublicSiteUrl(),
    gtmContainerId:
      process.env.NEXT_PUBLIC_GTM_ID ??
      process.env.PUBLIC_GTM_CONTAINER_ID ??
      process.env.GTM_CONTAINER_ID ??
      LEAD_PROJECT_CONFIG.gtmContainerId,
    ga4MeasurementId:
      process.env.PUBLIC_GA4_MEASUREMENT_ID ??
      process.env.GA4_STREAM_ID ??
      LEAD_PROJECT_CONFIG.ga4MeasurementId,
    whatsappPhoneNumber:
      process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ??
      process.env.WHATSAPP_PHONE_NUMBER ??
      ""
  };
}

export function getPublicSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "";
}

export function getPublicSupabaseConfig() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    supabasePublishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      ""
  };
}

export function getGoogleSheetsUrl() {
  return process.env.GOOGLE_SHEETS_APPS_SCRIPT_URL ?? process.env.GOOGLE_SHEETS_WEBHOOK_URL ?? "";
}

export function getResendFromAddress() {
  const env = getServerEnv();

  return env.RESEND_FROM_EMAIL_PROD ?? env.RESEND_FROM_EMAIL_DEV ?? "";
}

export function getResendToAddress() {
  const env = getServerEnv();

  return env.RESEND_TO_EMAIL_PROD ?? env.RESEND_TO_EMAIL_DEV ?? "";
}

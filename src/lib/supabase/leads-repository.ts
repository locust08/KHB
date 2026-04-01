import "server-only";

import { LEAD_PROJECT_CONFIG } from "@/src/lib/backend/project-config";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server-client";
import type { DeliveryMethod, PaymentMethod, SyncStatus } from "@/src/types/lead";

export interface LeadRow {
  lead_id: string;
  confirmation_token: string;
  order_number: string;
  customer_name: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: DeliveryMethod;
  delivery_date: string;
  delivery_time: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_state: string;
  pickup_store_id: string;
  pickup_store_name: string;
  payment_method: PaymentMethod;
  payment_label: string;
  include_candles: boolean;
  candle_quantity: number;
  special_instructions: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  currency: string;
  items: unknown[];
  attribution: unknown | null;
  tracking_context: unknown | null;
  whatsapp_url: string;
  sheet_sync_status: SyncStatus;
  sheet_sync_message: string;
  admin_email_status: SyncStatus;
  admin_email_message: string;
  raw_payload: Record<string, unknown>;
  created_at: string;
}

type LeadRowInsert = Omit<LeadRow, "created_at">;

export async function insertLead(row: LeadRowInsert) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from(LEAD_PROJECT_CONFIG.supabaseTableName)
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  return data as LeadRow;
}

export async function updateLeadSyncState(
  leadId: string,
  patch: Partial<
    Pick<
      LeadRow,
      | "sheet_sync_status"
      | "sheet_sync_message"
      | "admin_email_status"
      | "admin_email_message"
      | "whatsapp_url"
    >
  >
) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from(LEAD_PROJECT_CONFIG.supabaseTableName)
    .update(patch)
    .eq("lead_id", leadId);

  if (error) {
    throw new Error(`Supabase update failed: ${error.message}`);
  }
}

export async function getLeadConfirmationByToken(token: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from(LEAD_PROJECT_CONFIG.supabaseTableName)
    .select(
      [
        "lead_id",
        "order_number",
        "customer_name",
        "customer_email",
        "customer_phone",
        "delivery_method",
        "delivery_date",
        "delivery_time",
        "pickup_store_name",
        "delivery_address",
        "delivery_city",
        "delivery_postal_code",
        "delivery_state",
        "payment_method",
        "payment_label",
        "include_candles",
        "candle_quantity",
        "special_instructions",
        "total",
        "currency",
        "items",
        "whatsapp_url",
        "created_at"
      ].join(", ")
    )
    .eq("confirmation_token", token)
    .single();

  if (error) {
    throw new Error(`Lead confirmation lookup failed: ${error.message}`);
  }

  return data as unknown as Record<string, unknown>;
}

create extension if not exists pgcrypto;

create table if not exists public."leads_KHB" (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null default '',
  phone text not null default '',
  email text not null default '',
  message text not null default '',
  form_name text not null default '',
  enquiry_category text not null default '',
  selected_service text not null default '',
  selected_product_ids jsonb not null default '[]'::jsonb,
  selected_product_names jsonb not null default '[]'::jsonb,
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  utm_content text not null default '',
  utm_term text not null default '',
  gclid text not null default '',
  fbclid text not null default '',
  msclkid text not null default '',
  ttclid text not null default '',
  click_id text not null default '',
  tracking_session_id text not null default '',
  landing_page_url text not null default '',
  landing_page_path text not null default '',
  page_url text not null default '',
  page_path text not null default '',
  page_history jsonb not null default '[]'::jsonb,
  referrer text not null default '',
  user_agent text not null default '',
  sheet_synced boolean not null default false,
  email_sent boolean not null default false,
  whatsapp_redirected boolean not null default false,

  lead_id text not null unique,
  confirmation_token text not null unique,
  order_number text not null unique,
  customer_name text not null default '',
  customer_first_name text not null default '',
  customer_last_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  delivery_method text not null default '',
  delivery_date text not null default '',
  delivery_time text not null default '',
  delivery_address text not null default '',
  delivery_city text not null default '',
  delivery_postal_code text not null default '',
  delivery_state text not null default '',
  pickup_store_id text not null default '',
  pickup_store_name text not null default '',
  payment_method text not null default '',
  payment_label text not null default '',
  include_candles boolean not null default false,
  candle_quantity integer not null default 0,
  special_instructions text not null default '',
  subtotal numeric(12, 2) not null default 0,
  delivery_fee numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  currency text not null default 'MYR',
  items jsonb not null default '[]'::jsonb,
  attribution jsonb,
  tracking_context jsonb,
  whatsapp_url text not null default '',
  sheet_sync_status text not null default 'pending',
  sheet_sync_message text not null default '',
  admin_email_status text not null default 'pending',
  admin_email_message text not null default '',
  raw_payload jsonb not null default '{}'::jsonb
);

alter table public."leads_KHB"
  add column if not exists name text not null default '';

alter table public."leads_KHB"
  add column if not exists phone text not null default '';

alter table public."leads_KHB"
  add column if not exists email text not null default '';

alter table public."leads_KHB"
  add column if not exists message text not null default '';

alter table public."leads_KHB"
  add column if not exists form_name text not null default '';

alter table public."leads_KHB"
  add column if not exists enquiry_category text not null default '';

alter table public."leads_KHB"
  add column if not exists selected_service text not null default '';

alter table public."leads_KHB"
  add column if not exists selected_product_ids jsonb not null default '[]'::jsonb;

alter table public."leads_KHB"
  add column if not exists selected_product_names jsonb not null default '[]'::jsonb;

alter table public."leads_KHB"
  add column if not exists utm_source text not null default '';

alter table public."leads_KHB"
  add column if not exists utm_medium text not null default '';

alter table public."leads_KHB"
  add column if not exists utm_campaign text not null default '';

alter table public."leads_KHB"
  add column if not exists utm_content text not null default '';

alter table public."leads_KHB"
  add column if not exists utm_term text not null default '';

alter table public."leads_KHB"
  add column if not exists gclid text not null default '';

alter table public."leads_KHB"
  add column if not exists fbclid text not null default '';

alter table public."leads_KHB"
  add column if not exists msclkid text not null default '';

alter table public."leads_KHB"
  add column if not exists ttclid text not null default '';

alter table public."leads_KHB"
  add column if not exists click_id text not null default '';

alter table public."leads_KHB"
  add column if not exists tracking_session_id text not null default '';

alter table public."leads_KHB"
  add column if not exists landing_page_url text not null default '';

alter table public."leads_KHB"
  add column if not exists landing_page_path text not null default '';

alter table public."leads_KHB"
  add column if not exists page_url text not null default '';

alter table public."leads_KHB"
  add column if not exists page_path text not null default '';

alter table public."leads_KHB"
  add column if not exists page_history jsonb not null default '[]'::jsonb;

alter table public."leads_KHB"
  add column if not exists referrer text not null default '';

alter table public."leads_KHB"
  add column if not exists user_agent text not null default '';

alter table public."leads_KHB"
  add column if not exists sheet_synced boolean not null default false;

alter table public."leads_KHB"
  add column if not exists email_sent boolean not null default false;

alter table public."leads_KHB"
  add column if not exists whatsapp_redirected boolean not null default false;

alter table public."leads_KHB"
  add column if not exists lead_id text not null default '';

alter table public."leads_KHB"
  add column if not exists confirmation_token text not null default '';

alter table public."leads_KHB"
  add column if not exists order_number text not null default '';

alter table public."leads_KHB"
  add column if not exists customer_name text not null default '';

alter table public."leads_KHB"
  add column if not exists customer_first_name text not null default '';

alter table public."leads_KHB"
  add column if not exists customer_last_name text not null default '';

alter table public."leads_KHB"
  add column if not exists customer_email text not null default '';

alter table public."leads_KHB"
  add column if not exists customer_phone text not null default '';

alter table public."leads_KHB"
  add column if not exists delivery_method text not null default '';

alter table public."leads_KHB"
  add column if not exists delivery_date text not null default '';

alter table public."leads_KHB"
  add column if not exists delivery_time text not null default '';

alter table public."leads_KHB"
  add column if not exists delivery_address text not null default '';

alter table public."leads_KHB"
  add column if not exists delivery_city text not null default '';

alter table public."leads_KHB"
  add column if not exists delivery_postal_code text not null default '';

alter table public."leads_KHB"
  add column if not exists delivery_state text not null default '';

alter table public."leads_KHB"
  add column if not exists pickup_store_id text not null default '';

alter table public."leads_KHB"
  add column if not exists pickup_store_name text not null default '';

alter table public."leads_KHB"
  add column if not exists payment_method text not null default '';

alter table public."leads_KHB"
  add column if not exists payment_label text not null default '';

alter table public."leads_KHB"
  add column if not exists include_candles boolean not null default false;

alter table public."leads_KHB"
  add column if not exists candle_quantity integer not null default 0;

alter table public."leads_KHB"
  add column if not exists special_instructions text not null default '';

alter table public."leads_KHB"
  add column if not exists subtotal numeric(12, 2) not null default 0;

alter table public."leads_KHB"
  add column if not exists delivery_fee numeric(12, 2) not null default 0;

alter table public."leads_KHB"
  add column if not exists tax numeric(12, 2) not null default 0;

alter table public."leads_KHB"
  add column if not exists total numeric(12, 2) not null default 0;

alter table public."leads_KHB"
  add column if not exists currency text not null default 'MYR';

alter table public."leads_KHB"
  add column if not exists items jsonb not null default '[]'::jsonb;

alter table public."leads_KHB"
  add column if not exists attribution jsonb;

alter table public."leads_KHB"
  add column if not exists tracking_context jsonb;

alter table public."leads_KHB"
  add column if not exists whatsapp_url text not null default '';

alter table public."leads_KHB"
  add column if not exists sheet_sync_status text not null default 'pending';

alter table public."leads_KHB"
  add column if not exists sheet_sync_message text not null default '';

alter table public."leads_KHB"
  add column if not exists admin_email_status text not null default 'pending';

alter table public."leads_KHB"
  add column if not exists admin_email_message text not null default '';

alter table public."leads_KHB"
  add column if not exists raw_payload jsonb not null default '{}'::jsonb;

create index if not exists leads_khb_created_at_idx on public."leads_KHB" (created_at desc);
create index if not exists leads_khb_email_idx on public."leads_KHB" (email);
create index if not exists leads_khb_phone_idx on public."leads_KHB" (phone);
create index if not exists leads_khb_tracking_session_id_idx on public."leads_KHB" (tracking_session_id);

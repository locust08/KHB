# Google Sheets Sync

Supabase is the source of truth. Google Sheets is a secondary sync target only.

## Spreadsheet

- Spreadsheet: `https://docs.google.com/spreadsheets/d/13ihBhitA3yUc5I_IC9Bi58AxLaY88LRLOjnxH6AAQJQ/edit?gid=0#gid=0`
- Target tab: `leads_KHB`

## Server-Side Sync Function

The backend posts to the Apps Script webhook from:

- [`src/lib/sheets/sync-lead-to-sheets.ts`](../src/lib/sheets/sync-lead-to-sheets.ts)

Behavior:

- Sends the lead only after Supabase insert succeeds.
- Includes `secret` in the payload body.
- Returns `success`, `failed`, or `skipped` instead of throwing on normal Sheets failures.
- Does not block lead creation if Sheets is unavailable.
- Sends the admin email from the Apps Script account to `ava@locus-t.com.my`.
- Returns `emailSent`, `emailProvider`, and `emailError` so the backend can persist the real status.

## Webhook Payload

The server sends a payload shaped like this:

```json
{
  "secret": "your-shared-secret",
  "project": "KHB",
  "sheetName": "leads_KHB",
  "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/13ihBhitA3yUc5I_IC9Bi58AxLaY88LRLOjnxH6AAQJQ/edit?gid=0#gid=0",
  "lead": {
    "id": "uuid",
    "received_at": "2026-04-01T00:00:00.000Z",
    "name": "Jane Doe",
    "phone": "0123456789",
    "email": "jane@example.com",
    "message": "Hello",
    "enquiry_category": "delivery",
    "company": "",
    "profession": "",
    "source": "Delivery",
    "skin_type": "",
    "concerns": [],
    "selected_product_ids": ["p1"],
    "selected_product_names": ["Peach Strudel"],
    "utm_source": "",
    "utm_medium": "",
    "utm_campaign": "",
    "utm_content": "",
    "utm_term": "",
    "gclid": "",
    "fbclid": "",
    "msclkid": "",
    "ttclid": "",
    "click_id": "",
    "tracking_session_id": "",
    "landing_page_url": "",
    "landing_page_path": "",
    "page_url": "",
    "page_path": "",
    "page_history": [],
    "referrer": "",
    "user_agent": "",
    "sheet_synced": false,
    "email_sent": false,
    "whatsapp_redirected": false
  }
}
```

## Apps Script Source

- [`scripts/google-sheets-webhook.gs`](../scripts/google-sheets-webhook.gs)

What it does:

- Validates the shared secret from Script Properties.
- Opens the spreadsheet by ID.
- Creates `leads_KHB` if it does not exist.
- Creates the header row if it is missing.
- Upserts by `id`.
- Returns an honest JSON sync result.

## Manual Deployment

1. Open the spreadsheet: `https://docs.google.com/spreadsheets/d/13ihBhitA3yUc5I_IC9Bi58AxLaY88LRLOjnxH6AAQJQ/edit?gid=0#gid=0`
2. Go to `Extensions > Apps Script`.
3. Paste the contents of [`scripts/google-sheets-webhook.gs`](../scripts/google-sheets-webhook.gs) into the script editor.
4. In `Project Settings`, add Script Properties named `WEBHOOK_SECRET` and optionally `ADMIN_EMAIL_TO`.
5. Set `WEBHOOK_SECRET` to the same secret used in Doppler for `GOOGLE_SHEETS_WEBHOOK_SECRET`.
6. Save the project.
7. Deploy the script as a Web App:
   - Execute as: `Me`
   - Who has access: `Anyone` or `Anyone with the link`
8. Copy the Web App URL and store it in Doppler as `GOOGLE_SHEETS_APPS_SCRIPT_URL`.
9. Confirm `GOOGLE_SHEETS_WEBHOOK_SECRET` is set in Doppler for the app.
10. For a new project, add its tab name to `PROJECT_SHEETS` and redeploy a new version.
11. Send one test lead from the app and verify a row appears or updates in `leads_KHB`.

## Expected Sync Status

- Success: `sheetSynced: true`
- Failure: `sheetSynced: false` with a warning in the API response
- Skipped: `sheetSynced: false` when the webhook URL is not configured

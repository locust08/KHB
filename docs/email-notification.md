# Admin Email Notification

Admin email is sent by the Google Sheets Apps Script after the lead is synced from Supabase and appended to the sheet.

## Recipient

- To: `ava@locus-t.com.my`
- Sender branding: `Alphaonlineclass`

## Sender

- To: `ava@locus-t.com.my`
- From: the authorized Google account that owns the Apps Script project
- Sender branding in the app: `Alphaonlineclass`

The backend does not send the admin email itself. That keeps the message consistent with the class email account and avoids duplicate notifications.

## Template Contents

The admin email includes a branded HTML layout that follows the site palette:

- coffee brown headers
- gold accent gradients
- cream cards and soft peach highlights

The admin email includes:

- lead summary
- contact details
- form details
- enquiry category and service/product data
- UTM fields
- click IDs
- tracking session ID
- landing page URL
- page path
- page history
- referrer
- user agent

## Failure Handling

- Email is attempted only after the Supabase insert succeeds and the Sheets row is written.
- A send failure does not block lead creation.
- The webhook reports `emailSent` and `emailError` back to the backend.
- The API stores those statuses in Supabase and returns them to the client.

## Implementation

- Email helper: [`src/lib/email/send-admin-lead-email.ts`](../src/lib/email/send-admin-lead-email.ts)
- Lead pipeline integration: [`src/lib/backend/lead-pipeline.ts`](../src/lib/backend/lead-pipeline.ts)

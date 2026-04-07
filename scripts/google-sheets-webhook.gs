var DEFAULT_SHEET_NAME = 'leads_KHB';
var DEFAULT_SPREADSHEET_ID = '13ihBhitA3yUc5I_IC9Bi58AxLaY88LRLOjnxH6AAQJQ';
var FALLBACK_WEBHOOK_SECRET = '74d165ab6b128d5acf3be557b8e82bb1a5d0ca6495a4ceb2';
var DEFAULT_ADMIN_EMAIL_TO = 'ava@locus-t.com.my';
var BRAND_THEME = {
  background: '#faf8f5',
  cardBackground: '#fffdf9',
  coffee: '#4d3728',
  coffeeDeep: '#2b221b',
  text: '#3d2b20',
  muted: '#806758',
  line: '#eadbcb',
  gold: '#fb874f',
  goldDeep: '#eb6d32',
  peach: '#ffd6bc',
  cream: '#fff4ea',
  success: '#2f8f5b'
};
var PROJECT_SHEETS = {
  theoriginote: 'Leads_theoriginote',
  puma: 'leads_puma',
  ptti: 'leads_ptti',
  twotails: 'leads_twotails',
  khb: 'leads_KHB'
};

var HEADERS = [
  'received_at',
  'project',
  'lead_id',
  'name',
  'phone',
  'email',
  'message',
  'company',
  'profession',
  'source',
  'skin_type',
  'enquiry_category',
  'concerns',
  'selected_product_ids',
  'selected_product_names',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
  'msclkid',
  'ttclid',
  'click_id',
  'tracking_session_id',
  'landing_page_url',
  'landing_page_path',
  'page_url',
  'page_path',
  'page_history',
  'referrer',
  'user_agent',
  'sheet_synced',
  'email_sent',
  'whatsapp_redirected'
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ ok: false, error: 'Missing request body.' });
    }

    var body = JSON.parse(e.postData.contents);
    var expectedSecret = getExpectedSecret_();
    var requestSecret = stringValue_(body.secret || getQuerySecret_(e));

    if (!expectedSecret || requestSecret !== expectedSecret) {
      return jsonResponse_({ ok: false, error: 'Unauthorized' });
    }

    var lead = resolveLeadPayload_(body);
    var spreadsheet = openSpreadsheet_(body);
    var sheetName = resolveSheetName_(body);
    var sheet = getOrCreateSheet_(spreadsheet, sheetName);

    ensureHeaders_(sheet);

    var row = buildRow_(lead);
    var existingRowIndex = findLeadRowIndex_(sheet, lead.lead_id);
    var rowIndex = existingRowIndex;

    if (existingRowIndex > 0) {
      sheet.getRange(existingRowIndex, 1, 1, HEADERS.length).setValues([row]);
    } else {
      sheet.appendRow(row);
      rowIndex = sheet.getLastRow();
    }

    var emailResult = sendAdminEmail_(lead, sheet, rowIndex);
    var emailSent = emailResult.ok === true;

    if (emailSent && rowIndex > 0) {
      sheet.getRange(rowIndex, HEADERS.indexOf('email_sent') + 1).setValue('TRUE');
    }

    return jsonResponse_({
      ok: true,
      sheetName: sheetName,
      leadId: lead.lead_id,
      emailSent: emailSent,
      emailProvider: emailResult.provider || '',
      emailError: emailResult.error || ''
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error && error.message ? error.message : String(error)
    });
  }
}

function resolveLeadPayload_(body) {
  var nestedLead = body && typeof body.lead === 'object' && body.lead ? body.lead : null;
  var source = nestedLead || body || {};

  return {
    received_at: new Date(),
    project: stringValue_(body.project),
    lead_id: stringValue_(source.leadId || source.lead_id || source.id),
    name: stringValue_(source.name),
    phone: stringValue_(source.phone),
    email: stringValue_(source.email),
    message: stringValue_(source.message),
    company: stringValue_(source.company),
    profession: stringValue_(source.profession),
    source: stringValue_(source.source),
    skin_type: stringValue_(source.skin_type),
    enquiry_category: stringValue_(source.enquiry_category || source.preferred_category),
    concerns: joinArray_(source.concerns),
    selected_product_ids: joinArray_(source.selected_product_ids),
    selected_product_names: joinArray_(source.selected_product_names),
    utm_source: stringValue_(source.utm_source),
    utm_medium: stringValue_(source.utm_medium),
    utm_campaign: stringValue_(source.utm_campaign),
    utm_content: stringValue_(source.utm_content),
    utm_term: stringValue_(source.utm_term),
    gclid: stringValue_(source.gclid),
    fbclid: stringValue_(source.fbclid),
    msclkid: stringValue_(source.msclkid),
    ttclid: stringValue_(source.ttclid),
    click_id: stringValue_(source.click_id),
    tracking_session_id: stringValue_(source.tracking_session_id),
    landing_page_url: stringValue_(source.landing_page_url),
    landing_page_path: stringValue_(source.landing_page_path),
    page_url: stringValue_(source.page_url),
    page_path: stringValue_(source.page_path),
    page_history: serializePageHistory_(source.page_history),
    referrer: stringValue_(source.referrer),
    user_agent: stringValue_(source.user_agent),
    sheet_synced: booleanString_(source.sheet_synced),
    email_sent: booleanString_(source.email_sent),
    whatsapp_redirected: booleanString_(source.whatsapp_redirected)
  };
}

function buildRow_(lead) {
  return HEADERS.map(function (header) {
    return normalizeCell_(lead[header]);
  });
}

function resolveSheetName_(body) {
  var explicitSheet = stringValue_(body.sheetName);
  if (explicitSheet) {
    return explicitSheet;
  }

  var projectKey = stringValue_(body.project).toLowerCase();
  if (projectKey && PROJECT_SHEETS[projectKey]) {
    return PROJECT_SHEETS[projectKey];
  }

  return DEFAULT_SHEET_NAME;
}

function getExpectedSecret_() {
  var propertySecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  return propertySecret || FALLBACK_WEBHOOK_SECRET;
}

function getQuerySecret_(e) {
  if (!e || !e.parameter) {
    return '';
  }

  return e.parameter.secret || e.parameter.webhook_secret || '';
}

function findLeadRowIndex_(sheet, leadId) {
  var normalizedLeadId = normalizeCell_(leadId);

  if (!normalizedLeadId || sheet.getLastRow() <= 1) {
    return -1;
  }

  var idColumnValues = sheet
    .getRange(2, 3, sheet.getLastRow() - 1, 1)
    .getValues()
    .map(function (row) {
      return normalizeCell_(row[0]);
    });

  var index = idColumnValues.indexOf(normalizedLeadId);
  return index === -1 ? -1 : index + 2;
}

function openSpreadsheet_(body) {
  var spreadsheetId = stringValue_(body.spreadsheetId);
  var spreadsheetUrl = stringValue_(body.spreadsheetUrl);

  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  if (spreadsheetUrl) {
    return SpreadsheetApp.openByUrl(spreadsheetUrl);
  }

  return SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID);
}

function getOrCreateSheet_(spreadsheet, sheetName) {
  var normalizedTarget = normalizeSheetName_(sheetName);
  var sheets = spreadsheet.getSheets();
  var i;

  for (i = 0; i < sheets.length; i += 1) {
    if (normalizeSheetName_(sheets[i].getName()) === normalizedTarget) {
      return sheets[i];
    }
  }

  // If the tab does not exist yet, create it instead of failing the webhook.
  return spreadsheet.insertSheet(sheetName);
}

function normalizeSheetName_(value) {
  return String(value || '').trim().toLowerCase();
}

function getAdminEmailTo_() {
  var propertyEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL_TO');
  return propertyEmail || DEFAULT_ADMIN_EMAIL_TO;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }

  var currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var headersMatch = true;
  var i;

  for (i = 0; i < HEADERS.length; i += 1) {
    if (normalizeCell_(currentHeaders[i]) !== HEADERS[i]) {
      headersMatch = false;
      break;
    }
  }

  if (!headersMatch) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function joinArray_(value) {
  if (!Array.isArray(value)) {
    return '';
  }

  return value
    .map(function (item) {
      return stringValue_(item);
    })
    .filter(function (item) {
      return Boolean(item);
    })
    .join(', ');
}

function booleanString_(value) {
  return value === true ? 'TRUE' : 'FALSE';
}

function sendAdminEmail_(lead, sheet, rowIndex) {
  var recipient = getAdminEmailTo_();
  if (!recipient) {
    return { ok: false, error: 'Missing ADMIN_EMAIL_TO recipient.' };
  }

  var projectLabel = getProjectLabel_(lead);

  var emailOptions = {
    to: recipient,
    subject: '[' + projectLabel + '] New lead: ' + (lead.name || 'Unknown lead'),
    body: buildEmailText_(lead, sheet, rowIndex),
    htmlBody: buildEmailHtml_(lead, sheet, rowIndex),
    name: projectLabel + ' Lead Desk',
    replyTo: stringValue_(lead.email) || undefined
  };

  try {
    MailApp.sendEmail(emailOptions.to, emailOptions.subject, emailOptions.body, {
      htmlBody: emailOptions.htmlBody,
      name: emailOptions.name,
      replyTo: emailOptions.replyTo
    });
    return { ok: true, provider: 'MailApp' };
  } catch (error) {
    Logger.log('MailApp failed: ' + error);
  }

  try {
    GmailApp.sendEmail(emailOptions.to, emailOptions.subject, emailOptions.body, {
      htmlBody: emailOptions.htmlBody,
      name: emailOptions.name,
      replyTo: emailOptions.replyTo
    });
    return { ok: true, provider: 'GmailApp' };
  } catch (error) {
    Logger.log('GmailApp failed: ' + error);
    return {
      ok: false,
      error: error && error.message ? error.message : String(error)
    };
  }
}

function authorizeEmail_() {
  // Run this once from the Apps Script editor to grant MailApp/GmailApp scopes.
  MailApp.getRemainingDailyQuota();
  GmailApp.getAliases();
  return true;
}

function buildEmailHtml_(lead, sheet, rowIndex) {
  var projectLabel = getProjectLabel_(lead);
  var rowLink = '';
  try {
    rowLink = sheet.getParent().getUrl() + '#gid=' + sheet.getSheetId() + '&range=A' + rowIndex;
  } catch (error) {
    rowLink = '';
  }

  var selectedProductIds = normalizeList_(lead.selected_product_ids);
  var selectedProductNames = normalizeList_(lead.selected_product_names);
  var pageHistory = normalizePageHistory_(lead.page_history);
  var deliveryLabel = lead.enquiry_category === 'pickup'
    ? compactJoin_([lead.pickup_store_name, lead.delivery_state], ' | ')
    : compactJoin_([
        lead.delivery_address,
        lead.delivery_city,
        lead.delivery_postal_code,
        lead.delivery_state
      ], ', ');
  var totalLabel = formatCurrency_(lead.total, lead.currency);
  var pageHistoryMarkup = pageHistory.length
    ? '<ol style="margin:12px 0 0 18px; padding:0;">' + pageHistory.map(function (entry) {
        return '<li style="margin:0 0 8px; color:' + BRAND_THEME.text + ';">'
          + '<strong>' + escapeHtml_(entry.title) + '</strong>'
          + '<span style="display:block; color:' + BRAND_THEME.muted + '; font-size:12px;">'
          + escapeHtml_(entry.path) + ' ' + escapeHtml_(entry.timestamp) + '</span>'
          + '</li>';
      }).join('') + '</ol>'
    : '<p style="margin:0; color:' + BRAND_THEME.muted + ';">No page history captured.</p>';

  return ''
    + '<!doctype html>'
    + '<html>'
    + '<body style="margin:0; padding:0; background:' + BRAND_THEME.background + ';">'
    + '<div style="padding:24px 12px;">'
    + '<div style="max-width:720px; margin:0 auto; background:' + BRAND_THEME.cardBackground + '; border:1px solid ' + BRAND_THEME.line + '; border-radius:24px; overflow:hidden; box-shadow:0 18px 40px rgba(77,55,40,.12);">'
    + '<div style="padding:28px 28px 26px; background:linear-gradient(135deg, ' + BRAND_THEME.coffee + ' 0%, ' + BRAND_THEME.coffeeDeep + ' 48%, ' + BRAND_THEME.gold + ' 100%); color:#fff;">'
    + '<div style="font-size:12px; letter-spacing:.18em; text-transform:uppercase; opacity:.85;">' + escapeHtml_(projectLabel) + ' Lead Notification</div>'
    + '<h1 style="margin:10px 0 10px; font-size:28px; line-height:1.15;">New lead received successfully</h1>'
    + '<p style="margin:0; max-width:560px; font-size:14px; line-height:1.7; color:rgba(255,255,255,.9);">'
    + 'The submission has been stored and the admin alert is being sent to Ava automatically.'
    + '</p>'
    + '</div>'
    + '<div style="padding:28px;">'
    + '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate; border-spacing:0 12px; margin:0 0 8px;">'
    + '<tr>'
    + cardCell_('Lead ID', lead.lead_id)
    + cardCell_('Customer', lead.name)
    + '</tr>'
    + '<tr>'
    + cardCell_('Phone', lead.phone)
    + cardCell_('Email', lead.email)
    + '</tr>'
    + '<tr>'
    + cardCell_('Status', (lead.sheet_synced ? 'Sheet synced' : 'Sheet pending') + ' / ' + (lead.email_sent ? 'Email sent' : 'Email pending'))
    + cardCell_('Total', totalLabel)
    + '</tr>'
    + '<tr>'
    + cardCell_('Delivery', escapeHtml_(deliveryLabel || 'Not provided'))
    + cardCell_('Payment', escapeHtml_(lead.payment_label || 'Not provided'))
    + '</tr>'
    + '</table>'
    + sectionBlock_('Lead Summary', [
      ['Created At', formatTimestamp_(lead.created_at)],
      ['Form Name', lead.form_name],
      ['Enquiry Category', lead.enquiry_category],
      ['Selected Service', lead.selected_service]
    ])
    + sectionBlock_('Contact Details', [
      ['Name', lead.name],
      ['Phone', lead.phone],
      ['Email', lead.email]
    ])
    + sectionBlock_('Products', [
      ['Selected Product IDs', selectedProductIds.join(', ') || 'None'],
      ['Selected Product Names', selectedProductNames.join(', ') || 'None'],
      ['Selected Product Count', String(selectedProductIds.length)]
    ])
    + sectionBlock_('Tracking', [
      ['UTM Source', lead.utm_source],
      ['UTM Medium', lead.utm_medium],
      ['UTM Campaign', lead.utm_campaign],
      ['UTM Content', lead.utm_content],
      ['UTM Term', lead.utm_term],
      ['GCLID', lead.gclid],
      ['FBCLID', lead.fbclid],
      ['MSCLKID', lead.msclkid],
      ['TTCLID', lead.ttclid],
      ['Click ID', lead.click_id],
      ['Tracking Session ID', lead.tracking_session_id],
      ['Landing Page URL', lead.landing_page_url],
      ['Landing Page Path', lead.landing_page_path],
      ['Page URL', lead.page_url],
      ['Page Path', lead.page_path],
      ['Referrer', lead.referrer],
      ['User Agent', lead.user_agent]
    ])
    + '<div style="margin:22px 0 18px; padding:18px; border:1px solid ' + BRAND_THEME.line + '; border-radius:18px; background:' + BRAND_THEME.cream + ';">'
    + '<div style="font-size:14px; font-weight:700; color:' + BRAND_THEME.coffeeDeep + '; margin:0 0 6px;">Page History</div>'
    + pageHistoryMarkup
    + '</div>'
    + '<div style="margin:22px 0 0; padding:18px; border-top:1px solid ' + BRAND_THEME.line + '; color:' + BRAND_THEME.text + ';">'
    + '<p style="margin:0 0 8px;"><strong>Instructions:</strong> ' + escapeHtml_(lead.special_instructions || 'None') + '</p>'
    + '<p style="margin:0 0 8px;"><strong>WhatsApp Redirected:</strong> ' + (lead.whatsapp_redirected ? 'Yes' : 'No') + '</p>'
    + '<p style="margin:0;"><strong>Sheet Sync Status:</strong> ' + escapeHtml_(lead.sheet_sync_status || 'pending') + '</p>'
    + '</div>'
    + (rowLink ? '<div style="margin:20px 0 0; padding:14px 16px; border-radius:14px; background:#fff; border:1px solid ' + BRAND_THEME.line + ';">'
      + '<p style="margin:0; font-size:12px; color:' + BRAND_THEME.muted + ';">Open the exact spreadsheet row:</p>'
      + '<a href="' + escapeHtml_(rowLink) + '" style="color:' + BRAND_THEME.goldDeep + '; font-weight:700; text-decoration:none;">View row in Google Sheets</a>'
      + '</div>' : '')
    + '</div>'
    + '</div>'
    + '</div>'
    + '</body>'
    + '</html>';
}

function buildEmailText_(lead, sheet, rowIndex) {
  var projectLabel = getProjectLabel_(lead);
  var rowLink = '';
  try {
    rowLink = sheet.getParent().getUrl() + '#gid=' + sheet.getSheetId() + '&range=A' + rowIndex;
  } catch (error) {
    rowLink = '';
  }

  return [
    projectLabel + ': New lead received successfully.',
    '',
    'Lead ID: ' + lead.lead_id,
    'Name: ' + lead.name,
    'Phone: ' + lead.phone,
    'Email: ' + lead.email,
    'Message: ' + (lead.message || 'None'),
    'Source: ' + lead.source,
    'Selected Service: ' + lead.selected_service,
    'Payment: ' + (lead.payment_label || 'Not provided'),
    'Total: ' + formatCurrency_(lead.total, lead.currency),
    'Delivery: ' + (lead.enquiry_category === 'pickup'
      ? compactJoin_([lead.pickup_store_name, lead.delivery_state], ' | ')
      : compactJoin_([
          lead.delivery_address,
          lead.delivery_city,
          lead.delivery_postal_code,
          lead.delivery_state
        ], ', ')),
    'Sheet Sync Status: ' + (lead.sheet_sync_status || 'pending'),
    'Admin Email Status: ' + (lead.admin_email_status || 'pending'),
    'Instructions: ' + (lead.special_instructions || 'None'),
    rowLink ? 'Spreadsheet Row: ' + rowLink : ''
  ].filter(function (line) {
    return Boolean(line);
  }).join('\n');
}

function getProjectLabel_(lead) {
  var project = stringValue_(lead.project);

  if (project) {
    return project.toUpperCase();
  }

  return 'KHB';
}

function stringValue_(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function formatTimestamp_(value) {
  if (!value) {
    return 'Not provided';
  }

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  }

  return String(value);
}

function formatCurrency_(value, currency) {
  var amount = Number(value || 0);
  var code = stringValue_(currency) || 'MYR';
  var formatter = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  try {
    return formatter.format(amount);
  } catch (error) {
    return code + ' ' + amount.toFixed(2);
  }
}

function compactJoin_(items, separator) {
  return items
    .map(function (item) {
      return stringValue_(item);
    })
    .filter(function (item) {
      return Boolean(item);
    })
    .join(separator);
}

function normalizeList_(value) {
  if (Array.isArray(value)) {
    return value
      .map(function (item) {
        return stringValue_(item);
      })
      .filter(function (item) {
        return Boolean(item);
      });
  }

  var text = stringValue_(value);
  if (!text) {
    return [];
  }

  return text.split(',').map(function (part) {
    return part.trim();
  }).filter(function (item) {
    return Boolean(item);
  });
}

function normalizePageHistory_(value) {
  if (!value) {
    return [];
  }

  var entries = value;

  if (typeof value === 'string') {
    try {
      entries = JSON.parse(value);
    } catch (error) {
      entries = String(value).split('|');
    }
  }

  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.map(function (entry) {
    if (typeof entry === 'string') {
      return {
        title: entry.trim() || 'Page',
        path: '',
        timestamp: ''
      };
    }

    return {
      title: stringValue_(entry.pagePath || entry.pageUrl || 'Page'),
      path: compactJoin_([entry.pagePath, entry.pageUrl], ' '),
      timestamp: stringValue_(entry.timestamp)
    };
  }).filter(function (entry) {
    return Boolean(entry.title || entry.path || entry.timestamp);
  });
}

function serializePageHistory_(value) {
  if (!Array.isArray(value)) {
    return '';
  }

  return JSON.stringify(value.map(function (entry) {
    if (typeof entry === 'string') {
      return {
        pagePath: entry.trim(),
        pageUrl: '',
        timestamp: ''
      };
    }

    return {
      pagePath: stringValue_(entry.pagePath),
      pageUrl: stringValue_(entry.pageUrl),
      timestamp: stringValue_(entry.timestamp)
    };
  }));
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cardCell_(label, value) {
  return '<td width="50%" style="padding:0 6px 0 0; vertical-align:top;">'
    + '<div style="border:1px solid ' + BRAND_THEME.line + '; border-radius:16px; padding:14px 16px; background:#fff;">'
    + '<div style="font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:' + BRAND_THEME.muted + '; margin:0 0 6px;">' + escapeHtml_(label) + '</div>'
    + '<div style="font-size:14px; line-height:1.5; color:' + BRAND_THEME.text + '; font-weight:700;">' + escapeHtml_(value || 'Not provided') + '</div>'
    + '</div>'
    + '</td>';
}

function sectionBlock_(title, lines) {
  var content = lines.map(function (line) {
    return '<tr>'
      + '<td style="padding:8px 0; width:36%; vertical-align:top; color:' + BRAND_THEME.muted + '; font-weight:700;">' + escapeHtml_(line[0]) + '</td>'
      + '<td style="padding:8px 0; color:' + BRAND_THEME.text + ';">' + escapeHtml_(line[1] || 'Not provided') + '</td>'
      + '</tr>';
  }).join('');

  return ''
    + '<div style="margin:0 0 18px; border:1px solid ' + BRAND_THEME.line + '; border-radius:18px; overflow:hidden; background:#fff;">'
    + '<div style="padding:14px 16px; background:' + BRAND_THEME.cream + '; border-bottom:1px solid ' + BRAND_THEME.line + '; font-size:14px; font-weight:700; color:' + BRAND_THEME.coffeeDeep + ';">' + escapeHtml_(title) + '</div>'
    + '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:2px 16px 10px; border-collapse:collapse;">'
    + content
    + '</table>'
    + '</div>';
}

function normalizeCell_(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return value;
  }

  return String(value);
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

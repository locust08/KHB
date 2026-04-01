import type { LeadAttributionSnapshot } from "@/src/types/lead";

export const ATTRIBUTION_COOKIE_KEY = "khb_attribution";
export const ATTRIBUTION_SESSION_KEY = "khb-attribution";
export const ATTRIBUTION_PAGE_HISTORY_KEY = "khb-attribution-page-history";
export const SUCCESS_EVENT_SESSION_KEY = "khb-success-event";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;
const COOKIE_PATH = "/";
const MAX_PAGE_HISTORY = 20;

export interface AttributionPageEntry {
  pageUrl: string;
  pagePath: string;
  timestamp: string;
}

export interface AttributionState extends LeadAttributionSnapshot {
  trackingSessionId: string;
  landingPageUrl: string;
  landingPagePath: string;
  pageUrl: string;
  pagePath: string;
  pageHistory: AttributionPageEntry[];
  clickId?: string;
  gbraid?: string;
  wbraid?: string;
}

function generateTrackingSessionId() {
  return `khb_${crypto.randomUUID()}`;
}

function safeParse<T>(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getSearchParam(url: URL, key: string) {
  return url.searchParams.get(key) ?? undefined;
}

function toSnapshot(state: AttributionState): LeadAttributionSnapshot {
  const { trackingSessionId: _trackingSessionId, landingPageUrl: _landingPageUrl, landingPagePath: _landingPagePath, pageUrl: _pageUrl, pagePath: _pagePath, pageHistory: _pageHistory, ...snapshot } = state;
  return snapshot;
}

function getCurrentPage() {
  const url = new URL(window.location.href);
  return {
    pageUrl: url.toString(),
    pagePath: `${url.pathname}${url.search}`
  };
}

function readSessionState() {
  if (typeof window === "undefined") {
    return null;
  }

  return safeParse<AttributionState>(window.sessionStorage.getItem(ATTRIBUTION_SESSION_KEY));
}

function readCookieState() {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${ATTRIBUTION_COOKIE_KEY}=`));

  if (!cookie) {
    return null;
  }

  const encodedValue = cookie.split("=").slice(1).join("=");
  return safeParse<AttributionState>(decodeURIComponent(encodedValue));
}

function readPageHistory() {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParse<AttributionPageEntry[]>(
    window.sessionStorage.getItem(ATTRIBUTION_PAGE_HISTORY_KEY)
  ) ?? [];
}

function writeCookie(state: AttributionState) {
  document.cookie = `${ATTRIBUTION_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(state))}; Max-Age=${COOKIE_MAX_AGE}; Path=${COOKIE_PATH}; SameSite=Lax`;
}

function writeState(state: AttributionState) {
  window.sessionStorage.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(state));
  window.sessionStorage.setItem(ATTRIBUTION_PAGE_HISTORY_KEY, JSON.stringify(state.pageHistory));
  writeCookie(state);
}

function createBaseState() {
  const url = new URL(window.location.href);
  const now = new Date().toISOString();
  const { pageUrl, pagePath } = getCurrentPage();
  const trackingSessionId = generateTrackingSessionId();

  return {
    trackingSessionId,
    landingPageUrl: pageUrl,
    landingPagePath: pagePath,
    pageUrl,
    pagePath,
    pageHistory: [{ pageUrl, pagePath, timestamp: now }],
    sessionId: trackingSessionId,
    landingPage: pagePath,
    lastPage: pagePath,
    referrer: document.referrer || "",
    utmSource: getSearchParam(url, "utm_source"),
    utmMedium: getSearchParam(url, "utm_medium"),
    utmCampaign: getSearchParam(url, "utm_campaign"),
    utmTerm: getSearchParam(url, "utm_term"),
    utmContent: getSearchParam(url, "utm_content"),
    gclid: getSearchParam(url, "gclid"),
    fbclid: getSearchParam(url, "fbclid"),
    msclkid: getSearchParam(url, "msclkid"),
    ttclid: getSearchParam(url, "ttclid"),
    clickId: getSearchParam(url, "click_id"),
    firstCapturedAt: now,
    lastCapturedAt: now
  } satisfies AttributionState;
}

function captureQueryParams(state: AttributionState, url: URL, now: string) {
  return {
    utmSource: state.utmSource ?? getSearchParam(url, "utm_source"),
    utmMedium: state.utmMedium ?? getSearchParam(url, "utm_medium"),
    utmCampaign: state.utmCampaign ?? getSearchParam(url, "utm_campaign"),
    utmTerm: state.utmTerm ?? getSearchParam(url, "utm_term"),
    utmContent: state.utmContent ?? getSearchParam(url, "utm_content"),
    gclid: state.gclid ?? getSearchParam(url, "gclid"),
    fbclid: state.fbclid ?? getSearchParam(url, "fbclid"),
    msclkid: state.msclkid ?? getSearchParam(url, "msclkid"),
    ttclid: state.ttclid ?? getSearchParam(url, "ttclid"),
    clickId: state.clickId ?? getSearchParam(url, "click_id"),
    gbraid: state.gbraid ?? getSearchParam(url, "gbraid"),
    wbraid: state.wbraid ?? getSearchParam(url, "wbraid"),
    firstCapturedAt: state.firstCapturedAt ?? now
  };
}

function appendHistory(history: AttributionPageEntry[], entry: AttributionPageEntry) {
  return [...history, entry].slice(-MAX_PAGE_HISTORY);
}

function createStateFromCurrentLocation(previousState: AttributionState | null) {
  const url = new URL(window.location.href);
  const now = new Date().toISOString();
  const currentPage = getCurrentPage();
  const base = previousState ?? readSessionState() ?? readCookieState() ?? createBaseState();
  const history = appendHistory(base.pageHistory ?? readPageHistory(), {
    pageUrl: currentPage.pageUrl,
    pagePath: currentPage.pagePath,
    timestamp: now
  });

  return {
    ...base,
    ...captureQueryParams(base, url, now),
    pageUrl: currentPage.pageUrl,
    pagePath: currentPage.pagePath,
    landingPageUrl: base.landingPageUrl || currentPage.pageUrl,
    landingPagePath: base.landingPagePath || currentPage.pagePath,
    landingPage: base.landingPage || currentPage.pagePath,
    lastPage: currentPage.pagePath,
    pageHistory: history,
    lastCapturedAt: now
  } satisfies AttributionState;
}

export function readAttributionState() {
  return readSessionState() ?? readCookieState();
}

export function ensureAttributionState() {
  if (typeof window === "undefined") {
    return null;
  }

  const state = createStateFromCurrentLocation(readAttributionState());
  writeState(state);
  return state;
}

export function mergeAttributionForUrl(nextUrl: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const previousState = readAttributionState();
  const url = new URL(nextUrl, window.location.origin);
  const now = new Date().toISOString();
  const base = previousState ?? createBaseState();
  const nextPage = {
    pageUrl: url.toString(),
    pagePath: `${url.pathname}${url.search}`,
    timestamp: now
  };

  const state = {
    ...base,
    ...captureQueryParams(base, url, now),
    pageUrl: nextPage.pageUrl,
    pagePath: nextPage.pagePath,
    lastPage: nextPage.pagePath,
    pageHistory: appendHistory(base.pageHistory ?? [], nextPage),
    lastCapturedAt: now
  } satisfies AttributionState;

  writeState(state);
  return state;
}

export function readStoredAttribution() {
  return readAttributionState();
}

export function getAttributionSnapshot() {
  return readAttributionState() ?? ensureAttributionState();
}

export function getTrackingSessionId() {
  return getAttributionSnapshot()?.trackingSessionId ?? null;
}

export function buildAttributionPayload(nextUrl?: string) {
  if (typeof window === "undefined") {
    return null;
  }

  if (nextUrl) {
    return mergeAttributionForUrl(nextUrl);
  }

  return ensureAttributionState();
}

export function hasFiredSuccessEvent(key: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(`${SUCCESS_EVENT_SESSION_KEY}:${key}`) === "1";
}

export function markSuccessEventFired(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(`${SUCCESS_EVENT_SESSION_KEY}:${key}`, "1");
}

import type { LeadAttributionSnapshot } from "@/src/types/lead";

export const ATTRIBUTION_COOKIE_KEY = "khb_attribution";
export const ATTRIBUTION_STORAGE_KEY = "khb-attribution";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

function generateSessionId() {
  return `khb_${crypto.randomUUID()}`;
}

function buildCurrentSnapshot(previous: LeadAttributionSnapshot | null): LeadAttributionSnapshot {
  const url = new URL(window.location.href);
  const now = new Date().toISOString();

  return {
    sessionId: previous?.sessionId ?? generateSessionId(),
    landingPage: previous?.landingPage ?? `${url.pathname}${url.search}`,
    lastPage: `${url.pathname}${url.search}`,
    referrer: previous?.referrer || document.referrer || "",
    utmSource: url.searchParams.get("utm_source") ?? previous?.utmSource,
    utmMedium: url.searchParams.get("utm_medium") ?? previous?.utmMedium,
    utmCampaign: url.searchParams.get("utm_campaign") ?? previous?.utmCampaign,
    utmTerm: url.searchParams.get("utm_term") ?? previous?.utmTerm,
    utmContent: url.searchParams.get("utm_content") ?? previous?.utmContent,
    gclid: url.searchParams.get("gclid") ?? previous?.gclid,
    fbclid: url.searchParams.get("fbclid") ?? previous?.fbclid,
    ttclid: url.searchParams.get("ttclid") ?? previous?.ttclid,
    msclkid: url.searchParams.get("msclkid") ?? previous?.msclkid,
    gbraid: url.searchParams.get("gbraid") ?? previous?.gbraid,
    wbraid: url.searchParams.get("wbraid") ?? previous?.wbraid,
    firstCapturedAt: previous?.firstCapturedAt ?? now,
    lastCapturedAt: now
  };
}

function writeCookie(snapshot: LeadAttributionSnapshot) {
  document.cookie = `${ATTRIBUTION_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(snapshot))}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
}

export function readStoredAttribution() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LeadAttributionSnapshot) : null;
  } catch {
    return null;
  }
}

export function persistAttributionSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  const snapshot = buildCurrentSnapshot(readStoredAttribution());
  window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(snapshot));
  writeCookie(snapshot);
  return snapshot;
}

export function getAttributionSnapshot() {
  return persistAttributionSnapshot();
}

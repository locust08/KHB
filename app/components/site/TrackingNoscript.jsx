import { getPublicRuntimeConfig } from "@/src/lib/utils/env";

export default function TrackingNoscript() {
  const { gtmContainerId } = getPublicRuntimeConfig();

  if (!gtmContainerId) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

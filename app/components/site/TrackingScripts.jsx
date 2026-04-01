import Script from "next/script";

import { getPublicRuntimeConfig } from "@/src/lib/utils/env";

export default function TrackingScripts() {
  const { gtmContainerId, ga4MeasurementId } = getPublicRuntimeConfig();

  return (
    <>
      {gtmContainerId ? (
        <Script id="khb-gtm" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmContainerId}');
          `}
        </Script>
      ) : null}
      {ga4MeasurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="khb-ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${ga4MeasurementId}', { send_page_view: false });
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}

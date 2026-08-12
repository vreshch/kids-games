import Script from 'next/script';

const GA_MEASUREMENT_ID = 'G-EB128QKFS7';

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            if (location.hostname === 'games.vreshch.com') {
              window.gtag('js', new Date());
              window.gtag('config', '${GA_MEASUREMENT_ID}', {
                allow_google_signals: false,
                allow_ad_personalization_signals: false
              });
            }
          `,
        }}
      />
    </>
  );
}

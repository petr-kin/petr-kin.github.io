'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface ThirdPartyScriptsProps {
  enableAnalytics?: boolean;
  enablePerformanceMonitoring?: boolean;
}

export const ThirdPartyScripts = ({
  enableAnalytics = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enablePerformanceMonitoring = process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
}: ThirdPartyScriptsProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <>
      {/* Google Analytics */}
      {enableAnalytics && process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            id="gtag-base"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
          <Script
            id="gtag-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager */}
      {enableAnalytics && process.env.NEXT_PUBLIC_GTM_ID && (
        <>
          <Script
            id="gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Performance Monitoring (Sentry, LogRocket, etc.) */}
      {enablePerformanceMonitoring && process.env.NEXT_PUBLIC_SENTRY_DSN && (
        <Script
          id="sentry"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              import * as Sentry from "@sentry/browser";
              Sentry.init({
                dsn: "${process.env.NEXT_PUBLIC_SENTRY_DSN}",
                environment: "${process.env.NODE_ENV}",
                tracesSampleRate: 0.1,
                replaysSessionSampleRate: 0.1,
                replaysOnErrorSampleRate: 1.0,
              });
            `,
          }}
        />
      )}

      {/* Hotjar */}
      {enableAnalytics && process.env.NEXT_PUBLIC_HOTJAR_ID && (
        <Script
          id="hotjar"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      )}

      {/* Web Vitals Reporting */}
      <Script
        id="web-vitals"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function sendToAnalytics(metric) {
              // Send to Google Analytics
              if (window.gtag) {
                gtag('event', metric.name, {
                  event_category: 'Web Vitals',
                  event_label: metric.id,
                  value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                  non_interaction: true,
                });
              }
              
              // Send to custom endpoint
              if (window.fetch) {
                fetch('/api/analytics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'web_vital',
                    metric: metric.name,
                    value: metric.value,
                    rating: metric.rating,
                    id: metric.id,
                    timestamp: Date.now(),
                  }),
                }).catch(console.error);
              }
            }

            // Import and use web-vitals
            import('web-vitals').then(({ getCLS, getFCP, getFID, getLCP, getTTFB }) => {
              getCLS(sendToAnalytics);
              getFCP(sendToAnalytics);
              getFID(sendToAnalytics);
              getLCP(sendToAnalytics);
              getTTFB(sendToAnalytics);
            });
          `,
        }}
      />

      {/* Resource Hints for Third-party Domains */}
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      {process.env.NEXT_PUBLIC_CDN_URL && (
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_CDN_URL} />
      )}
    </>
  );
};

export default ThirdPartyScripts;
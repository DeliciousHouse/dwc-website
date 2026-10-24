// Do not load the production GA stream on preview hosts, loopback or HTTP.
// The caller must separately verify analytics consent and the approved stream.
export function analyticsBootstrap(measurementId: string): string | null {
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return null;
  return `(() => {
    if (window.location.protocol !== 'https:' || window.location.port ||
        !['deliciouswines.org', 'www.deliciouswines.org'].includes(window.location.hostname)) return;
    // Never initialize from a token/query/hash or a personal/account/form route.
    const publicPaths = ['/', '/story', '/shop', '/wine-club', '/tastings', '/blog',
      '/cookies', '/privacy', '/terms', '/refunds', '/shipping-policy', '/accessibility',
      '/do-not-sell', '/photo-credits'];
    if (window.location.search || window.location.hash ||
        !publicPaths.includes(window.location.pathname)) return;
    if (document.getElementById('dw-ga-loader')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    window.gtag('js', new Date());
    window.gtag('config', ${JSON.stringify(measurementId)}, {
      anonymize_ip: true,
      page_location: window.location.origin + window.location.pathname,
      page_referrer: '',
      page_title: 'Delicious Wines'
    });
    const script = document.createElement('script');
    script.id = 'dw-ga-loader';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ${JSON.stringify(measurementId)};
    document.head.appendChild(script);
  })();`;
}

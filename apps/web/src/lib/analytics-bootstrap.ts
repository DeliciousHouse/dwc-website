// Do not load the production GA stream on preview hosts, loopback or HTTP.
// The caller must separately verify analytics consent and the approved stream.
export function analyticsBootstrap(measurementId: string): string | null {
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return null;
  return `(() => {
    if (window.location.protocol !== 'https:' || window.location.port ||
        !['deliciouswines.org', 'www.deliciouswines.org'].includes(window.location.hostname)) return;
    if (document.getElementById('dw-ga-loader')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    window.gtag('js', new Date());
    window.gtag('config', ${JSON.stringify(measurementId)}, { anonymize_ip: true });
    const script = document.createElement('script');
    script.id = 'dw-ga-loader';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ${JSON.stringify(measurementId)};
    document.head.appendChild(script);
  })();`;
}

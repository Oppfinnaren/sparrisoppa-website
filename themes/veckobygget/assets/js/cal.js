// Loads the Cal.com inline embed once the booking area is close to the viewport.
// Configured through data-* attributes on #cal-embed (see layouts/_partials/booking.html).
(() => {
  const el = document.getElementById('cal-embed');
  if (!el) return;
  const { link, namespace, origin, layout } = el.dataset;

  const start = () => {
    // Official Cal.com embed loader.
    (function (C, A, L) {
      const p = function (a, ar) { a.q.push(ar); };
      const d = C.document;
      C.Cal = C.Cal || function () {
        const cal = C.Cal, ar = arguments;
        if (!cal.loaded) {
          cal.ns = {}; cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function () { p(api, arguments); };
          const ns = ar[1];
          api.q = api.q || [];
          if (typeof ns === 'string') {
            cal.ns[ns] = cal.ns[ns] || api;
            p(cal.ns[ns], ar);
            p(cal, ['initNamespace', ns]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, origin + '/embed/embed.js', 'init');

    const brand = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#E76F51';
    Cal('init', namespace, { origin });
    Cal.ns[namespace]('inline', {
      elementOrSelector: '#cal-embed',
      calLink: link,
      config: { layout, theme: 'light' }
    });
    Cal.ns[namespace]('ui', {
      hideEventTypeDetails: false,
      layout,
      cssVarsPerTheme: { light: { 'cal-brand': brand }, dark: { 'cal-brand': brand } }
    });
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
    }, { rootMargin: '600px' });
    io.observe(el);
  } else start();
})();

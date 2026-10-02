// BLOQUE PERF VIDEO: evita que el video de fondo bloquee el render inicial.
// - Respeta reduced-motion, ahorro de datos y pantallas mobile.
// - Si aplica alguna guarda, mantiene solo el poster/fallback estático.
(() => {
  const getMediaMatch = (query) => (
    typeof window.matchMedia === 'function' && window.matchMedia(query).matches
  );

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const shouldDisableVideo =
    getMediaMatch('(prefers-reduced-motion: reduce)') ||
    getMediaMatch('(prefers-reduced-data: reduce)') ||
    getMediaMatch('(max-width: 767px)') ||
    Boolean(connection && connection.saveData);

  document.querySelectorAll('.js-bg-video').forEach((video) => {
    const sourceUrl = video.dataset.src;

    if (!sourceUrl || shouldDisableVideo) {
      video.classList.add('background-video--disabled');
      video.removeAttribute('autoplay');
      return;
    }

    const loadVideoSource = () => {
      if (video.dataset.loaded === 'true') return;
      const source = document.createElement('source');
      source.src = sourceUrl;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.load();
      video.dataset.loaded = 'true';
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadVideoSource, { timeout: 1200 });
    } else {
      window.setTimeout(loadVideoSource, 500);
    }
  });
})();

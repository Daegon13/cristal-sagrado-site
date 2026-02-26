// BLOQUE PERF VIDEO: evita que el video de fondo bloquee el render inicial.
// - Respeta reduced-motion y reduced-data.
// - Si aplica ahorro de datos/movimiento, mantiene solo el poster estático.
(() => {
  const mediaQueryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mediaQueryReducedData = window.matchMedia('(prefers-reduced-data: reduce)');
  const shouldDisableVideo = mediaQueryReducedMotion.matches || mediaQueryReducedData.matches;

  document.querySelectorAll('.js-bg-video').forEach((video) => {
    const sourceUrl = video.dataset.src;

    if (!sourceUrl || shouldDisableVideo) {
      video.classList.add('background-video--disabled');
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

// Video is decorative and never participates in the blocking asset loader.
// One decoder serves both themes; CSS grades the same frame during a change.
export function mountForestVideo(scene, motion) {
  const video = scene.querySelector('[data-forest-video]');
  if (!video) return () => {};
  const controller = new AbortController();
  const { signal } = controller;
  const portrait = matchMedia('(max-width: 700px)');
  const connection = navigator.connection;
  let visible = false, disposed = false, failed = false, attempt = 0;
  let pending = false;
  video.muted = true;
  const allowed = () => !disposed && !failed && motion.enabled && visible && !document.hidden && !connection?.saveData;
  const sync = () => {
    if (!allowed()) {
      attempt++; pending = false; video.pause();
      return;
    }
    const source = portrait.matches ? video.dataset.mobileSrc : video.dataset.src;
    if (video.getAttribute('src') !== source) {
      attempt++; pending = false; video.pause();
      video.classList.remove('is-playing');
      video.src = source;
    }
    if (pending || !video.paused) return;
    const id = ++attempt;
    pending = true;
    video.play().then(() => {
      if (disposed || !allowed()) video.pause();
    }).catch(() => {
      // Autoplay policies, offline requests, and unsupported codecs keep the still.
      if (!disposed && id === attempt) video.classList.remove('is-playing');
    }).finally(() => { if (id === attempt) pending = false; });
  };
  video.addEventListener('playing', () => {
    if (allowed()) video.classList.add('is-playing'); else video.pause();
  }, { signal });
  video.addEventListener('error', () => {
    failed = true; video.classList.remove('is-playing');
  }, { signal });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(scene);
  document.addEventListener('visibilitychange', sync, { signal });
  portrait.addEventListener('change', sync, { signal });
  connection?.addEventListener('change', sync, { signal });
  return () => {
    disposed = true; attempt++; controller.abort(); observer.disconnect(); video.pause();
  };
}

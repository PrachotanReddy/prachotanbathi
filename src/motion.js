export function createMotion(gsap) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('#motion-toggle');
  const listeners = new Set();
  const frames = new Set();
  let preference = 'on';
  try { preference = localStorage.getItem('cowdy-motion') || 'on'; } catch {}
  let enabled = preference !== 'off' && !media.matches;
  let attached = false;
  let slowFrames = 0;
  let quality = 'full';

  const tick = (time, delta) => {
    if (!enabled || document.hidden) return;
    const active = [...frames].filter(frame => frame.active());
    if (!active.length) return;
    slowFrames = delta > 25 && delta < 200 ? slowFrames + 1 : Math.max(0, slowFrames - .25);
    if (slowFrames > 100 && quality !== 'gentle') {
      quality = 'gentle';
      document.documentElement.dataset.motionQuality = quality;
    }
    active.forEach(frame => frame.update(Math.min(delta, 40) / 1000, quality));
  };
  const syncTicker = () => {
    const wanted = gsap && enabled && !document.hidden && frames.size > 0;
    if (wanted && !attached) { gsap.ticker.add(tick); attached = true; }
    else if (!wanted && attached) { gsap.ticker.remove(tick); attached = false; }
  };
  const render = () => {
    document.documentElement.classList.toggle('reduced-motion', !enabled);
    button.hidden = false;
    button.setAttribute('aria-pressed', String(enabled));
    button.querySelector('span:last-child').textContent = enabled ? 'Motion on' : 'Motion off';
    button.disabled = media.matches;
    button.title = media.matches ? 'Reduced motion follows your system settings' : 'Toggle decorative motion';
    syncTicker();
  };
  const change = () => {
    const previous = enabled;
    enabled = preference !== 'off' && !media.matches;
    render();
    if (!enabled) document.documentElement.classList.remove('booting');
    if (previous !== enabled) listeners.forEach(listener => listener(enabled));
  };
  button.addEventListener('click', () => {
    preference = enabled ? 'off' : 'on';
    try { localStorage.setItem('cowdy-motion', preference); } catch {}
    change();
  });
  media.addEventListener('change', change);
  document.addEventListener('visibilitychange', syncTicker);
  render();
  return {
    get enabled() { return enabled; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    addFrame(update, active = () => true) {
      const frame = { update, active };
      frames.add(frame); syncTicker();
      return () => { frames.delete(frame); syncTicker(); };
    },
  };
}

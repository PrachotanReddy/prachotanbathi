export function createTheme() {
  const root = document.documentElement;
  let preference = null;
  let hintButton, hintTimer;
  const dismissHint = () => {
    clearTimeout(hintTimer);
    hintButton?.classList.remove('is-hint-visible');
    hintButton = null;
  };
  try { const saved = localStorage.getItem('prb-theme'); if (['light', 'dark'].includes(saved)) preference = saved; } catch {}
  const render = () => {
    dismissHint();
    const theme = preference || 'dark';
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#102921' : '#f6f5ed');
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'daylight' : 'night'}`);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      const label = button.querySelector('[data-theme-label]');
      if (label) label.textContent = theme === 'dark' ? 'Night' : 'Day';
    });
    document.dispatchEvent(new CustomEvent('theme:change', { detail: { theme } }));
  };
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-theme-toggle]')) return;
    preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('prb-theme', preference); } catch {}
    render();
  });
  window.addEventListener('storage', event => {
    if (event.key !== 'prb-theme') return;
    preference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
    render();
  });
  // Routes replace the hero controls; initialize their labels before revealing.
  document.addEventListener('route:mounted', render);
  window.addEventListener('scroll', dismissHint, { passive: true });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') dismissHint(); });
  render();
  return {
    showIntroHint() {
      if (root.dataset.theme !== 'dark' || document.hidden) return;
      const button = document.querySelector('.celestial-toggle[data-theme-toggle]');
      if (!button || button.hidden) return;
      const bounds = button.getBoundingClientRect();
      if (bounds.top < 0 || bounds.bottom > innerHeight) return;
      dismissHint();
      hintButton = button;
      button.classList.add('is-hint-visible');
      hintTimer = setTimeout(dismissHint, 4500);
    },
  };
}

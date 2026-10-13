import { site, projects } from './content.js';
import { home, detail } from './templates.js';
import { assetNames, prepareAssets, applyFallbacks } from './assets.js';
import { mountAnimations } from './animations.js';
import { createTransitions } from './transitions.js';

export function parseRoute(hash) {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (['', 'home', 'about', 'work', 'contact'].includes(path)) return { kind: 'home', section: path === 'home' ? '' : path, hash: path === 'home' ? '#/' : `#/${path}` };
  const project = projects.find(project => path === `work/${project.slug}` || project.aliases?.some(alias => path === `work/${alias}`));
  if (project) return { kind: 'detail', project, hash: `#/work/${project.slug}` };
  return { kind: 'home', section: '', hash: '#/', invalid: true };
}

export function createRouter(runtime, motion) {
  const app = document.querySelector('#app');
  const transitions = createTransitions(runtime?.gsap, motion);
  const snapshots = new Map();
  let current = null, key = null, homeSnapshot = null;
  let cleanup = () => {}, pending = null, busy = false, reanimate = false, scrollTimer;
  let sequence = 0;
  const newKey = () => `${Date.now()}-${sequence++}`;
  const snapshot = () => ({ scroll: scrollY, focus: document.activeElement?.dataset?.focusId || document.activeElement?.id || null, deckIndex: Number(app.querySelector('.work-deck')?.dataset.activeIndex || 0), forestTopic: app.querySelector('[data-forest]')?.dataset.selected || null });
  const save = () => {
    if (!current || !key) return;
    const value = snapshot(); snapshots.set(key, value);
    if (current.kind === 'home') homeSnapshot = value;
    if (history.state?.cowdy?.key === key) history.replaceState({ cowdy: { key, hash: current.hash, ...value } }, '', location.href);
  };
  const refresh = () => { runtime?.ScrollTrigger.refresh(); runtime?.ScrollTrigger.update(); };
  const titleFor = route => route.kind === 'detail' ? `${route.project.title} — ${site.name}` : `${site.name} — System Architecture & Security`;
  const enhanceLinks = () => document.querySelectorAll('a[data-route]').forEach(link => { link.href = link.dataset.route; });
  const focus = (route, saved) => {
    let target;
    if (saved?.focus) target = document.querySelector(`[data-focus-id="${CSS.escape(saved.focus)}"]`) || document.getElementById(saved.focus);
    target ||= route.kind === 'detail' ? document.querySelector('#detail-title') : document.getElementById(route.section || 'hero-name');
    if (target) { if (!target.matches('a, button')) target.tabIndex = -1; target.focus({ preventScroll: true }); }
  };
  const position = (route, saved) => {
    if (saved) app.querySelector('[data-forest]')?.dispatchEvent(new CustomEvent('forest:restore', { detail: { slug: saved.forestTopic } }));
    if (saved && Number.isFinite(saved.deckIndex)) app.querySelector('.work-deck')?.dispatchEvent(new CustomEvent('deck:restore', { detail: { index: saved.deckIndex } }));
    if (saved && Number.isFinite(saved.scroll)) scrollTo(0, saved.scroll);
    else if (route.kind === 'home' && route.section) document.getElementById(route.section)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    else scrollTo(0, 0);
    runtime?.ScrollTrigger.update();
  };
  async function commit(request, initial = false) {
    const route = parseRoute(request.hash);
    const isSameHome = current?.kind === 'home' && route.kind === 'home';
    const returningHome = current?.kind === 'detail' && route.hash === '#/work' && request.mode === 'push';
    const saved = request.mode === 'pop' || initial ? snapshots.get(request.state?.key) || request.state : returningHome ? homeSnapshot : null;
    if (!isSameHome || reanimate) {
      cleanup();
      if (!isSameHome) app.innerHTML = route.kind === 'detail' ? detail(route.project) : home(true);
      applyFallbacks(app);
      enhanceLinks();
      cleanup = mountAnimations(app, runtime, motion);
      reanimate = false;
    }
    document.dispatchEvent(new Event('route:mounted'));
    current = route;
    if (request.mode === 'pop' && request.state?.key) key = request.state.key;
    else if (initial && request.state?.key) key = request.state.key;
    else key = newKey();
    if (request.mode === 'push') history.pushState({ cowdy: { key, hash: route.hash } }, '', route.hash);
    else history.replaceState({ cowdy: { key, hash: route.hash, ...saved } }, '', route.hash);
    document.title = titleFor(route);
    document.querySelectorAll('.site-header nav a').forEach(link => {
      const selected = link.dataset.route === (route.kind === 'detail' ? '#/work' : route.hash);
      if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    refresh();
    position(route, saved);
    // A second paint accounts for pin spacing before restoring focus and scroll.
    await new Promise(resolve => requestAnimationFrame(resolve));
    position(route, saved);
    if (!initial || route.kind === 'detail' || route.section) focus(route, saved);
    document.querySelector('#route-announcer').textContent = route.invalid ? 'That page could not be found. Showing the home page.' : route.kind === 'detail' ? route.project.title : route.section ? `${route.section[0].toUpperCase() + route.section.slice(1)} section` : 'Home';
    save();
  }
  async function drain() {
    if (busy) return;
    busy = true;
    document.documentElement.dataset.navigating = 'true';
    try {
      while (pending) {
        save();
        await transitions.cover();
        let request;
        do {
          request = pending; pending = null;
          const route = parseRoute(request.hash);
          await prepareAssets(route.kind === 'detail' ? [route.project.animal, 'bear'] : assetNames, 8000);
        } while (pending);
        await commit(request);
        await transitions.reveal();
      }
    } catch (error) {
      console.warn('Navigation recovered to the home page.', error);
      cleanup(); current = null;
      app.innerHTML = home(true);
      enhanceLinks(); applyFallbacks(app);
      cleanup = mountAnimations(app, null, motion);
      document.dispatchEvent(new Event('route:mounted'));
      history.replaceState({}, '', '#/');
      document.title = titleFor(parseRoute('#/'));
      scrollTo(0, 0);
      document.querySelector('#route-announcer').textContent = 'The page could not be prepared. The home page is available.';
    } finally {
      transitions.reset();
      busy = false;
      document.documentElement.dataset.navigating = 'false';
      if (pending) void drain();
      else if (reanimate) rebuildMotion();
    }
  }
  const navigate = (hash, mode = 'push', state = null) => {
    if (mode === 'pop' && state?.key === key && !busy) return;
    pending = { hash, mode, state };
    void drain();
  };
  const rebuildMotion = () => {
    const y = scrollY;
    cleanup(); cleanup = mountAnimations(app, runtime, motion); refresh(); scrollTo(0, y); reanimate = false;
  };
  motion.subscribe(() => { if (busy) reanimate = true; else rebuildMotion(); });
  document.addEventListener('click', event => {
    if (event.target.closest('.skip-link')) {
      event.preventDefault();
      document.querySelector('#main').focus({ preventScroll: true });
      document.querySelector('#main').scrollIntoView({ behavior: 'instant' });
      return;
    }
    const link = event.target.closest('a[data-route]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(link.dataset.route);
  });
  const onHistory = () => {
    if (location.hash === current?.hash && history.state?.cowdy?.key === key && !busy) return;
    if (pending?.hash === location.hash && pending.mode === 'pop') return;
    navigate(location.hash, 'pop', history.state?.cowdy);
  };
  window.addEventListener('popstate', onHistory);
  window.addEventListener('hashchange', onHistory);
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    if (!busy) scrollTimer = setTimeout(save, 160);
  }, { passive: true });
  window.addEventListener('pagehide', save);
  app.addEventListener('forest:select', () => { if (!busy) save(); });
  history.scrollRestoration = 'manual';
  return {
    async start() {
      await commit({ hash: location.hash, mode: 'replace', state: history.state?.cowdy }, true);
      document.documentElement.dataset.navigating = 'false';
    },
  };
}

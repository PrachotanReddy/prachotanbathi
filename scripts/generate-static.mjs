import { writeFile } from 'node:fs/promises';
import { header, home, loader, escape } from '../src/templates.js';
import { site } from '../src/content.js';
import { forestDock, woodlandCursor } from '../src/chrome.js';

await writeFile('index.html', `<!doctype html>
<html lang="en" data-theme="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#102921"><meta name="description" content="${escape(site.description)}"><title>${escape(site.name)} — System Architecture & Security</title><link rel="icon" type="image/svg+xml" href="./favicon.svg"><link rel="stylesheet" href="/src/style.css"><link rel="stylesheet" href="/src/forest.css">
<script>
  (() => {
    // Apply before the app loads and retain the behavior across route changes.
    document.addEventListener('contextmenu', event => event.preventDefault(), { capture: true });
    let theme = 'dark';
    try { const saved = localStorage.getItem('prb-theme'); if (['light', 'dark'].includes(saved)) theme = saved; } catch {}
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#102921' : '#f6f5ed';
    let seen = false, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { seen = sessionStorage.getItem('cowdy-intro') === 'seen'; reduced ||= localStorage.getItem('cowdy-motion') === 'off'; } catch {}
    if (!seen && !reduced) document.documentElement.classList.add('booting');
    window.__cowdyDeadline = Date.now() + 8000;
    window.__cowdyWatchdog = setTimeout(() => { document.documentElement.classList.remove('booting'); document.querySelector('#app')?.removeAttribute('inert'); window.__cowdyExpired = true; }, 8000);
  })();
</script></head><body><a class="skip-link" href="#main">Skip to content</a>${header()}<main id="main" tabindex="-1"><div id="app">${home()}</div></main>${forestDock()}${woodlandCursor()}<div id="route-announcer" class="sr-only" role="status" aria-live="polite"></div><div id="transition-grid" aria-hidden="true"></div>${loader()}<script type="module" src="/src/main.js"></script></body></html>`);

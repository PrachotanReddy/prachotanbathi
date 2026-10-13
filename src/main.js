import { assetNames, bounded, installImageFallback, loadAsset, resolvePendingToFallback } from './assets.js';
import { createMotion } from './motion.js';
import { createRouter } from './router.js';
import { revealIntro } from './transitions.js';
import { createPointerExperience } from './pointer.js';
import { mountForestDock } from './dock.js';
import { createTheme } from './theme.js';
import { createLoadingCounter } from './loading-counter.js';
import { site } from './content.js';

const theme = createTheme();

installImageFallback();
let completed = 0;
let runtime = null;
const counter = createLoadingCounter(site.introCountMs);
const taskCount = assetNames.length + 6;
let loadingFinished = false;
function progress() {
  if (loadingFinished) return;
  const value = Math.min(100, Math.round(++completed / taskCount * 100));
  counter.advance(value, runtime?.gsap);
}
const runtimeTask = import('./runtime.js').then(module => { runtime = module; }).catch(() => { runtime = null; });
const tasks = [
  ...assetNames.map(loadAsset),
  document.fonts.load('500 16px "DM Sans Variable"').catch(() => {}),
  document.fonts.load('450 16px "Fraunces Variable"').catch(() => {}),
  document.fonts.load('italic 450 16px "Fraunces Variable"').catch(() => {}),
  document.fonts.load('400 16px "Marcellus"').catch(() => {}),
  runtimeTask,
];
async function start() {
  // The watchdog begins in HTML, covering slow module requests as well as assets.
  const result = await bounded(Promise.allSettled(tasks.map(task => task.finally(progress))), (window.__cowdyDeadline || Date.now() + 8000) - Date.now(), 'timeout');
  if (result === 'timeout') { resolvePendingToFallback(); completed = taskCount - 1; }
  if (window.__cowdyExpired) runtime = null;
  const motion = createMotion(runtime?.gsap);
  createPointerExperience(motion, Boolean(runtime));
  const router = createRouter(runtime, motion);
  await router.start();
  mountForestDock();
  progress();
  loadingFinished = true;
  document.documentElement.dataset.ready = 'true';
  try { sessionStorage.setItem('cowdy-intro', 'seen'); } catch {}
  await counter.finish(runtime?.gsap, motion);
  await revealIntro(runtime?.gsap, motion);
  clearTimeout(window.__cowdyWatchdog);
  theme.showIntroHint();
}
start().catch(error => {
  counter.dispose();
  document.documentElement.classList.remove('booting');
  document.documentElement.dataset.ready = 'fallback';
  document.querySelector('#app')?.removeAttribute('inert');
  console.warn('The static portfolio is available; enhancement could not start.', error);
});

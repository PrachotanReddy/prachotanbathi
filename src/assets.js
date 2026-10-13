import { artUrl } from './scene.js';
import { generatedArt } from './artwork.js';
import { projects } from './content.js';

const loaded = new Map();
const failed = new Set();
const resolved = new Set();
const theme = document.documentElement.dataset.theme === 'dark' ? 'night' : 'day';
const portrait = matchMedia('(max-width: 700px)').matches ? '-portrait' : '';
export const assetNames = [...new Set(projects.map(project => project.animal)), 'bear', 'cow', 'fallback', ...['robot', 'fern', 'log', 'branch', 'stump', 'rock', `forest-${theme}${portrait}`].filter(name => generatedArt.has(name))];
export const assetUrl = artUrl;

export function bounded(promise, milliseconds, fallback) {
  let timer;
  return Promise.race([promise, new Promise(resolve => { timer = setTimeout(() => resolve(fallback), Math.max(0, milliseconds)); })]).finally(() => clearTimeout(timer));
}

export function loadAsset(name) {
  if (!loaded.has(name)) {
    loaded.set(name, new Promise(resolve => {
      const image = new Image();
      image.onload = () => { resolved.add(name); resolve(true); };
      image.onerror = () => { resolved.add(name); failed.add(name); resolve(false); };
      image.src = assetUrl(name);
    }));
  }
  return loaded.get(name);
}

export function resolvePendingToFallback() {
  for (const name of assetNames) {
    if (!resolved.has(name)) { failed.add(name); loaded.set(name, Promise.resolve(false)); }
  }
}

export async function prepareAssets(names, timeout = 8000) {
  await bounded(Promise.allSettled(names.map(loadAsset)), timeout);
}

export function applyFallbacks(root) {
  root.querySelectorAll('[data-illustration]').forEach(image => {
    if (failed.has(image.dataset.asset)) fallback(image);
  });
}

function fallback(image) {
  image.removeAttribute('srcset');
  if (image.hasAttribute('data-scenery')) {
    image.closest('picture')?.querySelectorAll('source').forEach(source => source.remove());
    image.style.visibility = 'hidden'; image.dataset.fallback = 'unavailable';
  } else if (image.src.endsWith('/fallback.svg')) {
    image.style.visibility = 'hidden'; image.dataset.fallback = 'unavailable';
  } else if (image.dataset.fallback && !image.src.endsWith(image.dataset.fallback.slice(1))) {
    image.src = image.dataset.fallback;
  } else image.src = assetUrl('fallback');
}

export function installImageFallback() {
  document.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    fallback(image);
  }, true);
}

import { generatedArt } from './artwork.js';

// Coordinates are percentages of the shared cast stage; size is relative to its width.
// Animal identity and topic copy remain in content.js.
export const forestScene = {
  'arm-system-architecture': { desktop: [31, 45, 32], mobile: [25, 48, 50], depth: 5, layer: 1, cover: 'fern' },
  'platform-security': { desktop: [70, 69, 23], mobile: [76, 73, 30], depth: 9, layer: 4, cover: 'fern' },
  'system-manageability': { desktop: [28, 76, 19], mobile: [23, 83, 27], depth: 10, layer: 4, cover: 'log' },
  'teaching-advocacy': { desktop: [72, 24, 16], mobile: [78, 22, 22], depth: 4, layer: 2, cover: 'branch' },
  'ai-safety-security': { desktop: [61, 82, 14], mobile: [61, 85, 22], depth: 12, layer: 5, cover: 'fern' },
  'hardware-enforced-ai-safety': { desktop: [44, 88, 17], mobile: [41, 95, 23], depth: 12, layer: 5, cover: 'rock' },
};

// Preserve the original bear and its SVG fallback while trying the footer variant.
const artworkVariants = { bear: 'bear-beer' };
export const artUrl = (name, small = false) => {
  const artwork = generatedArt.has(artworkVariants[name]) ? artworkVariants[name] : name;
  return generatedArt.has(artwork) ? `./forest/${artwork}${small ? '-small' : ''}.webp` : `./illustrations/${name}.svg`;
};
export const animalArt = (name, cls = '', eager = false, depth = 0) => `<img class="${cls}" src="${artUrl(name)}" ${generatedArt.has(name) ? `srcset="${artUrl(name, true)} 320w, ${artUrl(name)} 640w" sizes="(max-width: 900px) 320px, 520px"` : ''} alt="" width="640" height="${name === 'bear' ? 440 : 640}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-illustration data-asset="${name}" data-fallback="./illustrations/${name}.svg"${depth ? ` data-pointer-layer="${depth}"` : ''}>`;

export const celestialIcon = `<svg viewBox="0 0 80 80" aria-hidden="true"><g class="celestial-sun"><circle cx="40" cy="40" r="19" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M40 5v7m0 56v7M5 40h7m56 0h7M15 15l5 5m40 40 5 5m0-50-5 5M20 60l-5 5"/></g></g><g class="celestial-moon"><path d="M54 14a28 28 0 1 0 13 41A28 28 0 0 1 54 14Z" fill="currentColor"/><path d="m62 14 1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5Z" fill="currentColor"/></g></svg>`;

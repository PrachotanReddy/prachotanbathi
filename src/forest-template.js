import { projects, site } from './content.js';
import { forestScene, animalArt, celestialIcon } from './scene.js';
import { generatedArt } from './artwork.js';
import { escape, arrow } from './templates.js';

const scenery = (name, cls, depth, extra = '') => generatedArt.has(name) ? `<img class="${cls}" src="./forest/${name}.webp" alt="" width="1536" height="1024" ${depth == null ? '' : `data-forest-depth="${depth}"`} data-scenery ${extra}>` : '';
const backdrop = (theme, enhanced) => {
  if (!generatedArt.has(`forest-${theme}`)) return '';
  const active = !enhanced || theme === (document.documentElement.dataset.theme === 'dark' ? 'night' : 'day');
  const portrait = generatedArt.has(`forest-${theme}-portrait`) ? `<source media="(max-width: 700px)" ${active ? 'srcset' : 'data-srcset'}="./forest/forest-${theme}-portrait.webp">` : '';
  return `<picture class="forest-backdrop forest-backdrop-${theme}" data-forest-depth="4">${portrait}<img ${active ? 'src' : 'data-src'}="./forest/forest-${theme}.webp" alt="" width="1536" height="1024" decoding="async" data-scenery></picture>`;
};

export function forestHero(enhanced) {
  return `<section class="hero forest-hero" id="home" aria-labelledby="hero-name">
    <div class="forest-scene" data-forest data-artwork="${generatedArt.has('forest-day') ? 'painted' : 'fallback'}">
      <div class="forest-landscape" aria-hidden="true">${backdrop('day', enhanced)}${backdrop('night', enhanced)}<div class="forest-film"><div class="forest-footage"><picture><source media="(max-width: 700px)" srcset="./forest/forest-motion-mobile.webp"><img class="forest-video-poster" src="./forest/forest-motion.webp" alt="" width="1600" height="900" fetchpriority="high" data-scenery></picture><video class="forest-video" data-forest-video data-src="./forest/forest-motion.mp4" data-mobile-src="./forest/forest-motion-mobile.mp4" muted loop playsinline preload="none" tabindex="-1" aria-hidden="true"></video></div><div class="forest-daylight"></div><div class="forest-moonlight"></div></div><div class="forest-mist"></div></div>
      <div class="forest-clearing"><h1 id="hero-name">${escape(site.name)}<span aria-hidden="true">.</span></h1><p>${escape(site.role)}<br><span>${escape(site.introduction)}</span></p><a class="explore-link" href="${enhanced ? '#/work' : '#work'}" data-route="#/work">Explore my work ${arrow('diagonal')}</a><p class="forest-hint"><span class="forest-hint-story"><span aria-hidden="true">✧</span> Each animal introduces a topic.</span><span class="forest-hint-action">Select one to learn more.</span></p></div>
      <div class="celestial-orbit"><button class="celestial-toggle" data-theme-toggle type="button" aria-label="Switch to night" aria-pressed="false" hidden>${celestialIcon}<span class="celestial-hint" aria-hidden="true">Switch to Light Mode</span></button><noscript><span class="celestial-toggle" aria-hidden="true">${celestialIcon}</span></noscript></div>
      <div class="forest-cast"><div class="forest-ground" aria-hidden="true"></div><div class="forest-animals" aria-label="Explore six areas of work and interest">${projects.map(p => {
        const s = forestScene[p.slug], [x,y,size] = s.desktop, [mx,my,ms] = s.mobile;
        const perched = s.cover === 'branch';
        const cover = scenery(s.cover, 'animal-cover cover-' + s.cover, perched ? null : s.depth + 4);
        const support = perched ? scenery('stump', 'owl-stump', null) : '';
        return `<a class="forest-animal animal-${p.animal}" data-forest-animal="${p.slug}" data-animal-title="${escape(p.title)}" href="${enhanced ? '#/work/' + p.slug : '#topic-' + p.slug}" data-route="#/work/${p.slug}" data-focus-id="forest-${p.slug}" aria-label="Discover ${escape(p.title)}" style="--x:${x}%;--y:${y}%;--size:${size}%;--mx:${mx}%;--my:${my}%;--ms:${ms}%;--layer:${s.layer}"><span class="forest-animal-motion" data-forest-depth="${s.depth}"><span class="forest-animal-art">${support}${perched ? cover : ''}${animalArt(p.animal, '', true)}</span></span>${perched ? '' : cover}</a>`;
      }).join('')}</div>
      ${generatedArt.has('robot') ? `<div class="forest-robot" data-forest-depth="7" data-sway aria-hidden="true">${scenery('robot', '', 0)}</div>` : ''}</div>
      <div class="forest-atmosphere" aria-hidden="true"></div>
      <div class="forest-foreground" aria-hidden="true">${scenery('fern', 'forest-fern fern-left', 32, 'data-sway')}${scenery('fern', 'forest-fern fern-right', 36, 'data-sway')}</div>
      <div class="forest-lights" aria-hidden="true">${Array.from({length:12},(_,i) => `<i class="forest-firefly" style="left:${8+(i*17)%87}%;top:${25+(i*13)%67}%"></i>`).join('')}</div>
      <div class="forest-tooltip" data-forest-tooltip aria-hidden="true" hidden><span data-tooltip-title></span>${arrow('diagonal')}</div>
      <aside class="forest-preview" id="forest-preview" aria-labelledby="forest-preview-title" hidden><button type="button" data-preview-close aria-label="Close animal preview">×</button><p class="forest-preview-kicker">Work & interests</p><h2 id="forest-preview-title" tabindex="-1"></h2><p data-preview-summary></p><a class="text-link" data-preview-explore href="#/work" data-route="#/work">Read more ${arrow('diagonal')}</a></aside>
    </div>
    <div class="hero-baseline"><span>System architecture, from hardware to software.</span><a href="${enhanced ? '#/about' : '#about'}" data-route="#/about">About my background ${arrow('down')}</a></div>
  </section>`;
}

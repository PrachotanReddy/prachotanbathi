import { mountForest } from './forest.js';
import { mountMobileDeck } from './mobile-deck.js';
import { mountPointerScenes } from './pointer.js';

export function mountAnimations(root, runtime, motion) {
  const mobileCleanup = mountMobileDeck(root, motion, Boolean(runtime && motion.enabled));
  const forestCleanup = mountForest(root.querySelector('[data-forest]'), motion, Boolean(runtime));
  if (!runtime || !motion.enabled) return () => { mobileCleanup(); forestCleanup(); };
  const { gsap, ScrollTrigger } = runtime;
  const cleanups = [mobileCleanup, forestCleanup, mountPointerScenes(root, motion)];
  let context;
  try {
    context = gsap.context(() => {}, root);
    context.add(() => {
      const heading = root.querySelector('[data-letters]');
      if (heading) {
        const original = heading.innerHTML;
        const accessible = document.createElement('span');
        accessible.className = 'sr-only'; accessible.textContent = 'Curious by nature.';
        const visual = document.createElement('span');
        visual.setAttribute('aria-hidden', 'true'); visual.innerHTML = original;
        const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
        const texts = []; while (walker.nextNode()) texts.push(walker.currentNode);
        texts.forEach(text => {
          const fragment = document.createDocumentFragment();
          text.textContent.split(/(\s+)/).forEach(word => {
            if (/^\s+$/.test(word)) fragment.append(document.createTextNode(word));
            else {
              const wrapper = document.createElement('span'); wrapper.className = 'letter-word';
              [...word].forEach(letter => { const span = document.createElement('span'); span.className = 'letter'; span.textContent = letter; wrapper.append(span); });
              fragment.append(wrapper);
            }
          });
          text.replaceWith(fragment);
        });
        heading.replaceChildren(accessible, visual);
        gsap.from(heading.querySelectorAll('.letter'), { yPercent: 65, rotation: 9, opacity: .2, stagger: .025, ease: 'none', scrollTrigger: { trigger: heading, start: 'top 93%', end: 'top 46%', scrub: .6 } });
        cleanups.push(() => { heading.innerHTML = original; });
      }
      const deck = root.querySelector('.work-deck');
      if (deck) {
        const cards = [...deck.querySelectorAll('.work-card')];
        const media = gsap.matchMedia();
        media.add('(min-width: 901px)', () => {
          deck.classList.add('deck-enhanced');
          let active = -1;
          const activate = index => {
            if (index === active) return;
            active = index;
            cards.forEach((card, i) => { card.inert = i !== index; card.setAttribute('aria-hidden', String(i !== index)); });
          };
          gsap.set(cards, { zIndex: i => i + 1 });
          gsap.set(cards.slice(1), { y: () => innerHeight + 60, rotation: 3, autoAlpha: 0 });
          const timeline = gsap.timeline({ scrollTrigger: { trigger: deck, start: 'top 45px', end: () => `+=${cards.length * innerHeight * .72}`, pin: deck.querySelector('.deck-stage'), scrub: .65, invalidateOnRefresh: true, onUpdate: self => { activate(Math.min(5, Math.round(self.progress * 5))); } } });
          cards.slice(1).forEach((card, i) => {
            timeline.set(card, { autoAlpha: 1 }, i);
            timeline.to(cards[i], { scale: .955, y: -14, duration: 1, ease: 'none' }, i);
            timeline.to(card, { y: 0, rotation: 0, duration: 1, ease: 'none' }, i);
          });
          activate(0);
          return () => { deck.classList.remove('deck-enhanced'); cards.forEach(card => { card.inert = false; card.removeAttribute('aria-hidden'); }); };
        });
        cleanups.push(() => media.revert());
        let velocity = 0, smoothed = 0, lastScroll = 0;
        const trigger = ScrollTrigger.create({ trigger: deck, start: 'top bottom', end: 'bottom top', onUpdate: self => { velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 2800); lastScroll = performance.now(); } });
        const stage = deck.querySelector('.deck-stage');
        cleanups.push(motion.addFrame((dt, quality) => {
          if (performance.now() - lastScroll > 90) velocity = 0;
          smoothed += (velocity - smoothed) * Math.min(1, dt * 6);
          stage.style.rotate = quality === 'full' ? `x ${smoothed * 1.1}deg` : '';
          stage.style.translate = quality === 'full' ? `0 0 ${-Math.abs(smoothed) * 9}px` : '';
        }, () => trigger.isActive && innerWidth > 900));
        cleanups.push(() => { stage.style.removeProperty('rotate'); stage.style.removeProperty('translate'); });
      }
      root.querySelectorAll('[data-magnetic]').forEach(link => {
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const controller = new AbortController(); let rect;
        const x = gsap.quickTo(link, 'x', { duration: .4, ease: 'power2.out' });
        const y = gsap.quickTo(link, 'y', { duration: .4, ease: 'power2.out' });
        const tilt = gsap.quickTo(link, 'rotationY', { duration: .4 });
        link.addEventListener('pointerenter', () => { rect = link.getBoundingClientRect(); }, { signal: controller.signal });
        link.addEventListener('pointermove', event => { if (!rect) return; x((event.clientX - rect.left - rect.width / 2) * .15); y((event.clientY - rect.top - rect.height / 2) * .22); tilt((event.clientX - rect.left - rect.width / 2) * .06); }, { signal: controller.signal });
        link.addEventListener('pointerleave', () => { x(0); y(0); tilt(0); }, { signal: controller.signal });
        cleanups.push(() => { controller.abort(); x.tween.kill(); y.tween.kill(); tilt.tween.kill(); });
      });
    });
  } catch (error) {
    cleanups.reverse().forEach(fn => fn()); context?.revert();
    console.warn('Motion could not initialize; the static layout is available.', error);
    return () => {};
  }
  return () => { cleanups.reverse().forEach(fn => fn()); context.revert(); };
}

export function createTransitions(gsap, motion) {
  const grid = document.querySelector('#transition-grid');
  let animation;
  let finish;
  motion.subscribe(enabled => {
    if (!enabled) { animation?.kill(); finish?.(); grid.classList.remove('is-active'); }
  });
  const animate = vars => new Promise(resolve => {
    finish = () => { finish = null; resolve(); };
    animation = gsap.to(grid.children, { ...vars, onComplete: () => finish?.() });
  });
  return {
    async cover() {
      if (!gsap || !motion.enabled) return;
      const count = innerWidth <= 600 ? 12 : 24;
      grid.replaceChildren(...Array.from({ length: count }, () => { const tile = document.createElement('div'); tile.className = 'transition-tile'; return tile; }));
      grid.classList.add('is-active');
      gsap.set(grid.children, { yPercent: -105 });
      await animate({ yPercent: 0, duration: .34, stagger: { amount: .17, from: 'start' }, ease: 'power3.inOut' });
    },
    async reveal() {
      if (gsap && motion.enabled) await animate({ yPercent: 105, duration: .4, stagger: { amount: .17, from: 'start' }, ease: 'power3.inOut' });
      grid.classList.remove('is-active');
    },
    reset() { animation?.kill(); finish?.(); grid.classList.remove('is-active'); },
  };
}

export async function revealIntro(gsap, motion) {
  if (!document.documentElement.classList.contains('booting')) return;
  if (!gsap || !motion.enabled || window.__cowdyExpired) { document.documentElement.classList.remove('booting'); return; }
  const shape = { y: 0 };
  const path = document.querySelector('#curtain-path');
  await new Promise(resolve => {
    let animation, unsubscribe = () => {};
    const finish = () => { animation?.kill(); unsubscribe(); resolve(); };
    unsubscribe = motion.subscribe(enabled => { if (!enabled) finish(); });
    animation = gsap.to(shape, { y: 1.25, duration: .95, ease: 'power3.inOut', onUpdate: () => {
      const bend = Math.sin(Math.min(1, shape.y) * Math.PI) * .32;
      path.setAttribute('d', `M0 ${shape.y} Q.5 ${shape.y - bend} 1 ${shape.y} V1.5 H0 Z`);
    }, onComplete: finish });
  });
  document.documentElement.classList.remove('booting');
}

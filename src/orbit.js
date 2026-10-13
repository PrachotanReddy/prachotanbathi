export function mountOrbit(stage, motion) {
  if (!stage || !motion.enabled) return () => {};
  const cards = [...stage.querySelectorAll('.orbit-card')];
  const controller = new AbortController();
  const { signal } = controller;
  let visible = false, rect, radiusX, radiusY, narrow;
  let angle = -.04, inertia = 0, hover = null, focused = null;
  let pointer = null, dragging = false, suppressUntil = 0;
  let parallaxX = 0, parallaxY = 0, targetX = 0, targetY = 0;
  const phases = [Math.PI, Math.PI * 4 / 3, Math.PI * 5 / 3, 0, Math.PI / 3, Math.PI * 2 / 3];
  const precise = matchMedia('(hover: hover) and (pointer: fine)');
  const measure = () => {
    rect = stage.getBoundingClientRect();
    narrow = rect.width < 540;
    radiusX = Math.max(94, rect.width / 2 - (narrow ? 61 : 122));
    radiusY = narrow ? 161 : Math.min(208, rect.height * .35);
  };
  const dim = () => cards.forEach(card => {
    card.firstElementChild.style.opacity = (focused || hover) && card !== (focused || hover) ? '.52' : '1';
  });
  const draw = (dt = 0, quality = 'full') => {
    const selected = focused || hover;
    if (!dragging && !selected) {
      angle += (quality === 'full' ? .075 : .032) * dt + inertia * dt;
      inertia *= Math.exp(-4 * dt);
    }
    parallaxX += (targetX - parallaxX) * Math.min(1, dt * 4);
    parallaxY += (targetY - parallaxY) * Math.min(1, dt * 4);
    cards.forEach((card, i) => {
      const phase = phases[i] + angle;
      const active = card === selected;
      const x = Math.cos(phase) * radiusX;
      const y = Math.sin(phase) * radiusY;
      const z = active ? 135 : Math.sin(phase) * (narrow ? 12 : 35);
      const rotation = active ? 0 : Math.sin(phase * 1.2 + i) * 8;
      const px = quality === 'full' ? parallaxX : 0;
      const py = quality === 'full' ? parallaxY : 0;
      card.style.transform = `translate3d(${x + px}px, ${y + py}px, ${z}px) rotateX(${active ? 0 : -py * .3}deg) rotateY(${active ? 0 : -Math.cos(phase) * 7}deg) rotateZ(${rotation}deg) scale(${active ? 1.055 : 1})`;
    });
  };
  measure(); draw();
  const resize = new ResizeObserver(() => { measure(); draw(); });
  resize.observe(stage);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '40px' });
  observer.observe(stage);
  const stopFrame = motion.addFrame(draw, () => visible);
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    pointer = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastTime: performance.now() };
    inertia = 0;
  }, { signal });
  stage.addEventListener('pointermove', event => {
    if (pointer && event.pointerId === pointer.id) {
      const dx = event.clientX - pointer.startX;
      const dy = event.clientY - pointer.startY;
      if (!dragging && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        dragging = true; hover = null; dim();
        stage.setPointerCapture(event.pointerId);
        stage.classList.add('is-dragging');
      }
      if (dragging) {
        const now = performance.now();
        const movement = (event.clientX - pointer.lastX) * .006;
        angle += movement;
        inertia = Math.max(-2.5, Math.min(2.5, movement / Math.max(.012, (now - pointer.lastTime) / 1000)));
        pointer.lastX = event.clientX; pointer.lastTime = now;
        draw();
      }
    } else if (precise.matches) {
      // Geometry is cached on entry/resize; scrolling does not trigger layout reads per frame.
      targetX = ((event.clientX - rect.left) / rect.width - .5) * 12;
      targetY = ((event.clientY - rect.top) / rect.height - .5) * 9;
    }
  }, { signal });
  const end = event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (dragging) suppressUntil = performance.now() + 400;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    pointer = null; dragging = false;
    stage.classList.remove('is-dragging');
    if (event.type === 'pointercancel') inertia = 0;
  };
  window.addEventListener('pointerup', end, { signal });
  window.addEventListener('pointercancel', end, { signal });
  stage.addEventListener('click', event => {
    if (event.detail !== 0 && performance.now() < suppressUntil) { event.preventDefault(); event.stopPropagation(); }
  }, { capture: true, signal });
  stage.addEventListener('dragstart', event => event.preventDefault(), { signal });
  stage.addEventListener('pointerenter', measure, { signal });
  stage.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; hover = null; dim(); }, { signal });
  cards.forEach(card => {
    card.addEventListener('pointerenter', () => { if (precise.matches && !dragging) { hover = card; dim(); } }, { signal });
    card.addEventListener('pointerleave', () => { if (hover === card) { hover = null; dim(); } }, { signal });
    card.addEventListener('focus', () => { focused = card; dim(); draw(); }, { signal });
    card.addEventListener('blur', () => { focused = null; dim(); }, { signal });
  });
  return () => {
    controller.abort(); resize.disconnect(); observer.disconnect(); stopFrame();
    cards.forEach(card => { card.style.removeProperty('transform'); card.firstElementChild.style.removeProperty('opacity'); });
  };
}

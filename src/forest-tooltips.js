const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

// Labels live above the whole cast, not inside its moving/stacked artwork.
// Their text repeats each animal's accessible name, so this layer is decorative.
export function mountForestTooltips(scene) {
  const tooltip = scene.querySelector('[data-forest-tooltip]');
  const animals = [...scene.querySelectorAll('[data-forest-animal]')];
  const controller = new AbortController(), { signal } = controller;
  let hovered = null, focused = null, active = null, dismissed = null;
  let overLabel = false, leaveTimer, frame;

  const hide = () => { tooltip.hidden = true; active = null; overLabel = false; };
  const position = () => {
    if (!active || tooltip.hidden) return;
    const bounds = scene.getBoundingClientRect(), target = active.getBoundingClientRect();
    const width = tooltip.offsetWidth, height = tooltip.offsetHeight, gap = 16;
    const cast = [...animals, scene.querySelector('.forest-robot')].filter(Boolean).map(el => el.getBoundingClientRect());
    const group = { left: Math.min(...cast.map(r => r.left)), right: Math.max(...cast.map(r => r.right)),
      top: Math.min(...cast.map(r => r.top)), bottom: Math.max(...cast.map(r => r.bottom)) };
    const obstacles = [...cast, ...[
      scene.querySelector('.forest-clearing'), scene.querySelector('.forest-hint'),
      scene.querySelector('.celestial-toggle'), document.querySelector('.site-header'),
      document.querySelector('.dock-content'), document.querySelector('.dock-canopy'),
      document.querySelector('.dock-toggle'),
    ].filter(el => el && el.checkVisibility({ visibilityProperty: true, opacityProperty: true }))
      .map(el => el.getBoundingClientRect())];
    const cx = (target.left + target.right) / 2, cy = (target.top + target.bottom) / 2;
    const candidates = [
      [cx - width / 2, target.top - height - gap],
      [target.right + gap, cy - height / 2], [target.left - width - gap, cy - height / 2],
      [cx - width / 2, target.bottom + gap],
      [group.right + gap, cy - height / 2], [group.left - width - gap, cy - height / 2],
      [cx - width / 2, group.top - height - gap], [cx - width / 2, group.bottom + gap],
      [group.left - width - gap, group.top], [group.right + gap, group.top],
    ];
    // The dock's trees extend outside its tray. Also try the edges of other
    // occupied regions when a narrow screen has no clear space beside the cast.
    obstacles.forEach(rect => candidates.push(
      [cx - width / 2, rect.top - height - gap], [cx - width / 2, rect.bottom + gap],
      [rect.left - width - gap, cy - height / 2], [rect.right + gap, cy - height / 2],
    ));
    const minX = bounds.left + 12, maxX = bounds.right - width - 12;
    const minY = Math.max(bounds.top, 0) + 12, maxY = Math.min(bounds.bottom, innerHeight) - height - 12;
    // On phones a clear row may only be available on the opposite side.
    obstacles.forEach(rect => {
      for (const y of [rect.top - height - gap, rect.bottom + gap]) {
        candidates.push([minX, y], [maxX, y]);
      }
    });
    const best = candidates.map(([x, y]) => {
      const left = clamp(x, minX, maxX), top = clamp(y, minY, maxY);
      const rect = { left, top, right: left + width, bottom: top + height };
      const covered = obstacles.reduce((sum, obstacle) => sum + overlap(rect, obstacle), 0);
      const distance = Math.hypot(left + width / 2 - cx, top + height / 2 - cy);
      return { left, top, score: covered * 1000 + distance };
    }).sort((a, b) => a.score - b.score)[0];
    tooltip.style.left = `${Math.round(best.left - bounds.left)}px`;
    tooltip.style.top = `${Math.round(best.top - bounds.top)}px`;
  };
  const sync = () => {
    clearTimeout(leaveTimer);
    const animal = hovered || focused;
    if (scene.dataset.selected || !animal || animal === dismissed) { hide(); return; }
    active = animal;
    tooltip.querySelector('[data-tooltip-title]').textContent = animal.dataset.animalTitle;
    tooltip.hidden = false;
    position();
  };
  const leave = () => {
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => { if (!overLabel) sync(); }, 180);
  };
  const schedulePosition = () => {
    if (!active || frame) return;
    frame = requestAnimationFrame(() => { frame = null; position(); });
  };
  animals.forEach(animal => {
    animal.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = animal; dismissed = null; sync();
    }, { signal });
    animal.addEventListener('pointerleave', () => { hovered = null; leave(); }, { signal });
    animal.addEventListener('focus', () => {
      if (!animal.matches(':focus-visible')) return;
      focused = animal; dismissed = null; sync();
    }, { signal });
    animal.addEventListener('blur', () => { focused = null; leave(); }, { signal });
  });
  tooltip.addEventListener('pointerenter', () => { overLabel = true; clearTimeout(leaveTimer); }, { signal });
  tooltip.addEventListener('pointerleave', () => { overLabel = false; leave(); }, { signal });
  scene.addEventListener('forest:select', sync, { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) { dismissed = active; hide(); }
  }, { signal });
  window.addEventListener('resize', schedulePosition, { signal });
  window.addEventListener('scroll', schedulePosition, { signal, passive: true });
  return () => { controller.abort(); clearTimeout(leaveTimer); cancelAnimationFrame(frame); hide(); };
}

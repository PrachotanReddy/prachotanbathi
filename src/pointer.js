const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// One input-driven subscriber on the shared ticker. No work while idle or hidden.
export function createPointerExperience(motion, hasRuntime) {
  const precise = matchMedia('(hover: hover) and (pointer: fine)');
  let cleanup = () => {};
  const mount = () => {
    cleanup();
    if (!hasRuntime || !motion.enabled || !precise.matches) return;
    const root = document.documentElement;
    const cursor = document.querySelector('.woodland-cursor');
    const trail = [...document.querySelectorAll('.firefly-trail')];
    const trees = [...document.querySelectorAll('.forest-tree')];
    const controller = new AbortController();
    const { signal } = controller;
    let x = 0, y = 0, shown = false, dirty = false, lastMove = 0, wind = 0;
    let angle = 0, targetAngle = 0, previousX = 0;
    const points = trail.map(() => ({ x: 0, y: 0 }));
    const hide = () => {
      shown = false; dirty = false;
      root.classList.remove('cursor-active');
      cursor.classList.remove('is-hovering', 'is-pressed');
      trees.forEach(tree => tree.style.removeProperty('transform'));
    };
    document.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || root.classList.contains('booting') || root.dataset.navigating === 'true' || event.target.closest('input, textarea, select, [contenteditable="true"]')) { hide(); return; }
      x = event.clientX; y = event.clientY;
      if (!shown) { points.forEach(point => { point.x = x; point.y = y; }); previousX = x; }
      targetAngle = clamp((x - previousX) * 1.5, -28, 28);
      previousX = x; lastMove = performance.now(); shown = true; dirty = true;
      cursor.classList.toggle('is-hovering', Boolean(event.target.closest('a, button, [role="link"]')));
    }, { passive: true, signal });
    document.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && shown) cursor.classList.add('is-pressed');
    }, { passive: true, signal });
    document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'), { signal });
    document.addEventListener('pointercancel', hide, { signal });
    document.addEventListener('pointerout', event => { if (!event.relatedTarget) hide(); }, { signal });
    document.addEventListener('keydown', hide, { signal });
    document.addEventListener('visibilitychange', hide, { signal });
    window.addEventListener('blur', hide, { signal });
    window.addEventListener('resize', hide, { signal });
    const stop = motion.addFrame((dt, quality) => {
      if (root.dataset.navigating === 'true') { hide(); return; }
      const age = performance.now() - lastMove;
      const ease = Math.min(1, dt * 18);
      angle += ((age < 90 ? targetAngle : 0) - angle) * ease;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      cursor.style.setProperty('--flight-angle', `${angle}deg`);
      root.classList.add('cursor-active');
      let leader = { x, y };
      points.forEach((point, i) => {
        point.x += (leader.x - point.x) * ease;
        point.y += (leader.y - point.y) * ease;
        trail[i].style.transform = `translate3d(${point.x}px, ${point.y}px, 0) scale(${1 - i * .16})`;
        trail[i].style.opacity = quality === 'gentle' ? '0' : String(clamp(1 - age / 400, 0, 1) * (.6 - i * .1));
        leader = point;
      });
      const targetWind = age < 180 ? (x / innerWidth - .5) * 8 : 0;
      wind += (targetWind - wind) * Math.min(1, dt * 7);
      trees.forEach((tree, i) => { tree.style.transform = `rotate(${wind * (i % 2 ? 1 : -.6)}deg)`; });
      dirty = age < 450 || Math.abs(wind) > .02 || Math.abs(angle) > .1;
    }, () => shown && dirty);
    cleanup = () => { controller.abort(); stop(); hide(); };
  };
  mount();
  const unsubscribe = motion.subscribe(mount);
  precise.addEventListener('change', mount);
  return () => { cleanup(); unsubscribe(); precise.removeEventListener('change', mount); };
}

// Each scene owns its input geometry; individual artwork layers move, not text.
export function mountPointerScenes(root, motion) {
  const precise = matchMedia('(hover: hover) and (pointer: fine)');
  const controller = new AbortController();
  const { signal } = controller;
  const scenes = [...root.querySelectorAll('[data-pointer-scene]')].map(element => ({
    element, layers: [...element.querySelectorAll('[data-pointer-layer]')].map(layer => ({
      element: layer, strength: Number(layer.dataset.pointerLayer) || 10,
    })), rect: null, x: 0, y: 0, targetX: 0, targetY: 0, active: false, dirty: false,
  }));
  const reset = scene => {
    if (!scene.active && !scene.x && !scene.y) return;
    scene.targetX = 0; scene.targetY = 0; scene.active = false; scene.dirty = true;
  };
  scenes.forEach(scene => {
    scene.element.addEventListener('pointerenter', event => {
      if (!precise.matches || event.pointerType !== 'mouse') return;
      scene.rect = scene.element.getBoundingClientRect(); scene.active = true;
    }, { signal });
    scene.element.addEventListener('pointermove', event => {
      if (!precise.matches || event.pointerType !== 'mouse') return;
      if (!scene.active) { scene.rect = scene.element.getBoundingClientRect(); scene.active = true; }
      scene.targetX = clamp((event.clientX - scene.rect.left) / scene.rect.width - .5, -.5, .5) * 2;
      scene.targetY = clamp((event.clientY - scene.rect.top) / scene.rect.height - .5, -.5, .5) * 2;
      scene.dirty = true;
    }, { passive: true, signal });
    scene.element.addEventListener('pointerleave', () => reset(scene), { signal });
  });
  window.addEventListener('scroll', () => scenes.forEach(reset), { passive: true, signal });
  window.addEventListener('blur', () => scenes.forEach(reset), { signal });
  window.addEventListener('resize', () => scenes.forEach(reset), { signal });
  precise.addEventListener('change', () => scenes.forEach(reset), { signal });
  const stop = motion.addFrame((dt, quality) => {
    scenes.forEach(scene => {
      if (!scene.dirty) return;
      scene.x += (scene.targetX - scene.x) * Math.min(1, dt * 7);
      scene.y += (scene.targetY - scene.y) * Math.min(1, dt * 7);
      scene.dirty = Math.abs(scene.targetX - scene.x) + Math.abs(scene.targetY - scene.y) > .002;
      if (!scene.dirty) { scene.x = scene.targetX; scene.y = scene.targetY; }
      scene.layers.forEach(layer => {
        const strength = layer.strength * (quality === 'gentle' ? .35 : 1);
        layer.element.style.translate = `${scene.x * strength}px ${scene.y * strength * .55}px`;
        layer.element.style.rotate = `${scene.x * strength * .18}deg`;
      });
    });
  }, () => scenes.some(scene => scene.dirty));
  return () => {
    controller.abort(); stop();
    scenes.forEach(scene => scene.layers.forEach(({ element }) => {
      element.style.removeProperty('translate'); element.style.removeProperty('rotate');
    }));
  };
}

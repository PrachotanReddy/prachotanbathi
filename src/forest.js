import { projects } from './content.js';
import { mountForestVideo } from './forest-video.js';
import { mountForestTooltips } from './forest-tooltips.js';

export function mountForest(scene, motion, hasRuntime) {
  if (!scene) return () => {};
  const stopVideo = mountForestVideo(scene, motion);
  const stopTooltips = mountForestTooltips(scene);
  const controller = new AbortController();
  const { signal } = controller;
  const loadBackground = theme => {
    const picture = scene.querySelector(`.forest-backdrop-${theme}`);
    picture?.querySelectorAll('[data-srcset]').forEach(source => { source.srcset = source.dataset.srcset; delete source.dataset.srcset; });
    const image = picture?.querySelector('img[data-src]');
    if (image) { image.src = image.dataset.src; delete image.dataset.src; }
  };
  document.addEventListener('theme:change', event => loadBackground(event.detail.theme === 'dark' ? 'night' : 'day'), { signal });
  const backgroundTimer = setTimeout(() => { loadBackground('day'); loadBackground('night'); }, 1000);
  const animals = [...scene.querySelectorAll('[data-forest-animal]')];
  const panel = scene.querySelector('.forest-preview');
  const closeButton = panel.querySelector('[data-preview-close]');
  const title = panel.querySelector('h2');
  const summary = panel.querySelector('[data-preview-summary]');
  const explore = panel.querySelector('[data-preview-explore]');
  let selected = null;
  const close = (restore = false) => {
    const previous = selected;
    selected = null; panel.hidden = true; delete scene.dataset.selected;
    animals.forEach(animal => animal.setAttribute('aria-expanded', 'false'));
    if (restore) previous?.focus({ preventScroll: true });
    scene.dispatchEvent(new CustomEvent('forest:select', { bubbles: true }));
  };
  const open = (animal, keyboard = false) => {
    const project = projects.find(item => item.slug === animal.dataset.forestAnimal);
    if (!project) return;
    selected = animal; scene.dataset.selected = project.slug;
    animals.forEach(item => item.setAttribute('aria-expanded', String(item === animal)));
    title.textContent = project.title;
    panel.querySelector('.forest-preview-kicker').textContent = project.category;
    summary.textContent = project.summary;
    explore.href = explore.dataset.route = `#/work/${project.slug}`;
    explore.dataset.focusId = `forest-explore-${project.slug}`;
    const bounds = scene.getBoundingClientRect(), target = animal.getBoundingClientRect();
    const x = (target.left + target.width / 2 - bounds.left) / bounds.width * 100;
    const y = (target.top + target.height / 2 - bounds.top) / bounds.height * 100;
    panel.style.setProperty('--preview-x', `${Math.max(23, Math.min(77, x))}%`);
    panel.style.setProperty('--preview-y', `${Math.max(38, Math.min(62, y))}%`);
    panel.hidden = false;
    if (keyboard) title.focus({ preventScroll: true });
    scene.dispatchEvent(new CustomEvent('forest:select', { bubbles: true }));
  };
  animals.forEach(animal => {
    animal.setAttribute('role', 'button'); animal.setAttribute('aria-controls', panel.id);
    animal.setAttribute('aria-expanded', 'false');
    animal.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      if (selected === animal) close(true); else open(animal, event.detail === 0);
    }, { signal });
    animal.addEventListener('keydown', event => {
      if (event.key === ' ') { event.preventDefault(); animal.click(); }
    }, { signal });
  });
  closeButton.addEventListener('click', () => close(true), { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selected) { event.preventDefault(); close(true); }
  }, { signal });
  document.addEventListener('pointerdown', event => {
    if (selected && !event.target.closest('[data-forest-animal], .forest-preview, [data-theme-toggle]')) close();
  }, { signal, passive: true });
  scene.addEventListener('forest:restore', event => {
    const animal = animals.find(item => item.dataset.forestAnimal === event.detail?.slug);
    if (animal) open(animal); else close();
  }, { signal });
  const restored = animals.find(item => item.dataset.forestAnimal === scene.dataset.selected);
  if (restored) open(restored);

  let stop = () => {}, observer;
  if (hasRuntime && motion.enabled) {
    const layers = [...scene.querySelectorAll('[data-forest-depth]')].map(element => ({ element, depth: Number(element.dataset.forestDepth) }));
    const lights = [...scene.querySelectorAll('.forest-firefly')];
    const precise = matchMedia('(hover: hover) and (pointer: fine)');
    let visible = false, rect, x = 0, y = 0, targetX = 0, targetY = 0, time = 0;
    const measure = () => { rect = scene.getBoundingClientRect(); targetX = targetY = 0; };
    observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) measure(); });
    observer.observe(scene);
    scene.addEventListener('pointerenter', measure, { signal });
    scene.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || !precise.matches || !rect) return;
      targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    }, { signal, passive: true });
    scene.addEventListener('pointerleave', () => { targetX = targetY = 0; }, { signal });
    window.addEventListener('resize', measure, { signal });
    window.addEventListener('scroll', measure, { signal, passive: true });
    stop = motion.addFrame((dt, quality) => {
      time += dt; x += (targetX - x) * Math.min(1, dt * 4); y += (targetY - y) * Math.min(1, dt * 4);
      layers.forEach(({ element, depth }, i) => {
        const breeze = quality === 'full' ? Math.sin(time * .55 + i) * 1.4 : 0;
        const strength = quality === 'full' ? 1 : .3;
        element.style.translate = `${(x * depth + breeze) * strength}px ${y * depth * .45 * strength}px`;
        if (element.hasAttribute('data-sway')) element.style.rotate = `${breeze * .25}deg`;
      });
      lights.forEach((light, i) => {
        light.style.transform = `translate(${Math.sin(time * .4 + i * 7) * 16}px, ${Math.cos(time * .65 + i * 3) * 13}px)`;
        light.style.opacity = quality === 'full' ? String(.25 + (Math.sin(time * .8 + i * 2) + 1) * .25) : '0';
      });
    }, () => visible);
  }
  return () => {
    controller.abort(); clearTimeout(backgroundTimer); stopTooltips(); stopVideo(); stop(); observer?.disconnect();
    scene.querySelectorAll('[data-forest-depth]').forEach(layer => { layer.style.removeProperty('translate'); layer.style.removeProperty('rotate'); });
    scene.querySelectorAll('.forest-firefly').forEach(light => { light.style.removeProperty('transform'); light.style.removeProperty('opacity'); });
  };
}

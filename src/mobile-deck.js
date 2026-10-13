const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Native scrolling owns touch momentum, vertical gestures, and pinch zoom.
// Stable slide wrappers own snapping; only the surfaces and artwork transform.
export function mountMobileDeck(root, motion, animated) {
  const deck = root.querySelector('.work-deck');
  if (!deck) return () => {};
  const media = matchMedia('(max-width: 900px)');
  let teardown = () => {};
  function mount() {
    teardown();
    if (!media.matches) return;
    const stage = deck.querySelector('.deck-stage');
    const slides = [...deck.querySelectorAll('.work-slide')];
    const cards = slides.map(slide => slide.querySelector('.work-card'));
    const art = cards.map(card => card.querySelector('.work-illustration'));
    const copy = cards.map(card => card.querySelector('.work-card-copy'));
    const buttons = [...deck.querySelectorAll('.deck-pick')];
    const controls = deck.querySelector('.deck-controls');
    const counter = deck.querySelector('.deck-counter');
    const announcer = deck.querySelector('.deck-announcer');
    const controller = new AbortController();
    const { signal } = controller;
    let stops = [], stride = 1, stageTop = 0, stageHeight = 1;
    let current = Number(deck.dataset.activeIndex || 0);
    let visible = false, dirty = true, depth = 0;
    let announcement, pointer = null, dragging = false, suppressUntil = 0;

    controls.hidden = false;
    stage.style.removeProperty('rotate');
    stage.style.removeProperty('translate');
    stage.tabIndex = 0;
    stage.setAttribute('role', 'region');
    stage.setAttribute('aria-roledescription', 'carousel');
    stage.setAttribute('aria-label', 'Work and interests. Swipe or use the arrow keys to explore.');
    slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    });
    const updateSelection = (index, announce = false) => {
      current = index;
      deck.dataset.activeIndex = String(index);
      counter.textContent = `${String(index + 1).padStart(2, '0')} / 06`;
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      if (announce) announcer.textContent = `${cards[index].querySelector('h3').textContent}, ${index + 1} of ${slides.length}`;
    };
    const nearest = () => stops.reduce((best, stop, i) => Math.abs(stop - stage.scrollLeft) < Math.abs(stops[best] - stage.scrollLeft) ? i : best, 0);
    const goTo = (index, smooth = true) => {
      index = clamp(index, 0, slides.length - 1);
      stage.scrollTo({ left: stops[index] || 0, behavior: animated && smooth ? 'smooth' : 'instant' });
      updateSelection(index, true);
      dirty = true;
    };
    const measure = () => {
      const index = Number(deck.dataset.activeIndex || 0);
      stops = slides.map(slide => slide.offsetLeft + slide.offsetWidth / 2 - stage.clientWidth / 2);
      stride = stops[1] - stops[0] || 1;
      stageTop = stage.getBoundingClientRect().top + scrollY;
      stageHeight = stage.offsetHeight;
      stage.scrollTo({ left: stops[index], behavior: 'instant' });
      dirty = true;
    };
    const draw = (dt, quality) => {
      const target = clamp((scrollY + innerHeight / 2 - stageTop - stageHeight / 2) / ((innerHeight + stageHeight) / 2), -1, 1);
      depth += (target - depth) * Math.min(1, dt * 10);
      const strength = quality === 'gentle' ? .45 : 1;
      slides.forEach((slide, i) => {
        const distance = clamp((stops[i] - stage.scrollLeft) / stride, -1.5, 1.5);
        const side = Math.min(1, Math.abs(distance));
        cards[i].style.transform = `perspective(950px) translateY(${side * 12}px) rotateY(${-distance * 9 * strength}deg) rotateZ(${distance * 2.5 * strength}deg) scale(${1 - side * .045})`;
        art[i].style.transform = `translate3d(${-distance * 28 * strength}px, ${-depth * 16 * strength}px, 0) rotate(${-distance * 3 * strength}deg)`;
        copy[i].style.transform = `translate3d(${-distance * 7 * strength}px, ${depth * 5 * strength}px, 0)`;
      });
      dirty = Math.abs(target - depth) > .002;
    };
    measure(); updateSelection(current);
    if (animated) draw(1, 'full');
    const stopFrame = animated ? motion.addFrame(draw, () => visible && dirty) : () => {};
    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { stageTop = stage.getBoundingClientRect().top + scrollY; dirty = true; }
    });
    observer.observe(stage);

    stage.addEventListener('scroll', () => {
      dirty = true;
      updateSelection(nearest());
      if (pointer && Math.abs(stage.scrollLeft - pointer.scroll) > 8) suppressUntil = performance.now() + 400;
      clearTimeout(announcement);
      announcement = setTimeout(() => updateSelection(nearest(), true), 160);
    }, { passive: true, signal });
    window.addEventListener('scroll', () => { if (visible) dirty = true; }, { passive: true, signal });
    buttons.forEach((button, i) => button.addEventListener('click', () => {
      goTo(i);
      stage.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: animated ? 'smooth' : 'instant' });
    }, { signal }));
    stage.addEventListener('keydown', event => {
      const keys = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: slides.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault(); goTo(keys[event.key]);
    }, { signal });
    stage.addEventListener('focusin', event => {
      const slide = event.target.closest('.work-slide');
      if (slide) goTo(slides.indexOf(slide), false);
    }, { signal });
    deck.addEventListener('deck:restore', event => goTo(event.detail.index, false), { signal });
    stage.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return;
      pointer = { id: event.pointerId, type: event.pointerType, x: event.clientX, y: event.clientY, scroll: stage.scrollLeft };
    }, { signal });
    stage.addEventListener('pointermove', event => {
      if (!pointer || pointer.id !== event.pointerId || pointer.type !== 'mouse') return;
      const dx = event.clientX - pointer.x;
      if (!dragging && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(event.clientY - pointer.y)) {
        dragging = true;
        stage.classList.add('is-dragging');
        stage.setPointerCapture(event.pointerId);
      }
      if (dragging) { event.preventDefault(); stage.scrollLeft = pointer.scroll - dx; }
    }, { signal });
    const end = event => {
      if (!pointer || event.pointerId !== pointer.id) return;
      if (dragging) {
        suppressUntil = performance.now() + 400;
        stage.classList.remove('is-dragging');
        goTo(nearest());
      }
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      dragging = false; pointer = null;
    };
    window.addEventListener('pointerup', end, { signal });
    window.addEventListener('pointercancel', end, { signal });
    stage.addEventListener('dragstart', event => event.preventDefault(), { signal });
    stage.addEventListener('click', event => {
      if (event.detail && performance.now() < suppressUntil) { event.preventDefault(); event.stopPropagation(); }
    }, { capture: true, signal });

    teardown = () => {
      controller.abort(); resize.disconnect(); observer.disconnect(); stopFrame(); clearTimeout(announcement);
      controls.hidden = true;
      stage.classList.remove('is-dragging');
      ['tabindex', 'role', 'aria-roledescription', 'aria-label'].forEach(name => stage.removeAttribute(name));
      slides.forEach(slide => ['role', 'aria-roledescription', 'aria-label'].forEach(name => slide.removeAttribute(name)));
      [...cards, ...art, ...copy].forEach(element => element.style.removeProperty('transform'));
    };
  }
  mount();
  media.addEventListener('change', mount);
  return () => { teardown(); media.removeEventListener('change', mount); };
}

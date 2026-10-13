export function mountForestDock() {
  const dock = document.querySelector('.forest-dock');
  const toggle = dock.querySelector('.dock-toggle');
  const panel = dock.querySelector('.dock-content');
  const label = toggle.querySelector('.dock-toggle-label');
  const precise = matchMedia('(hover: hover) and (pointer: fine)');
  const controller = new AbortController();
  const { signal } = controller;
  let scrolled = scrollY > 48, expanded = true, hovering = false, keyboard = false;
  let lastY = scrollY, leaveTimer, restoringFocus = false;

  const setExpanded = value => {
    expanded = !scrolled || value;
    if (!expanded && panel.contains(document.activeElement)) {
      restoringFocus = true;
      toggle.focus({ preventScroll: true });
      restoringFocus = false;
    }
    dock.classList.toggle('is-expanded', expanded);
    panel.inert = !expanded;
    panel.setAttribute('aria-hidden', String(!expanded));
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', `${expanded ? 'Hide' : 'Show'} social links and appearance settings`);
    label.textContent = expanded ? 'Close' : 'Elsewhere';
  };
  const collapse = () => {
    clearTimeout(leaveTimer);
    setExpanded(false);
  };
  const onScroll = () => {
    const y = Math.max(0, scrollY);
    if (Math.abs(y - lastY) < 4) return;
    lastY = y;
    const wasScrolled = scrolled;
    if (y > 48) scrolled = true;
    else if (y <= 16) scrolled = false;
    dock.classList.toggle('is-scrolled', scrolled);
    if (!scrolled) setExpanded(true);
    // Keep a keyboard user's current control available during focus-driven scrolling.
    else if (!(keyboard && dock.contains(document.activeElement))) collapse();
    if (wasScrolled !== scrolled) hovering = false;
  };
  toggle.hidden = false;
  dock.classList.add('dock-enhanced');
  dock.classList.toggle('is-scrolled', scrolled);
  setExpanded(!scrolled);

  window.addEventListener('scroll', onScroll, { passive: true, signal });
  dock.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !precise.matches) return;
    hovering = true; clearTimeout(leaveTimer); setExpanded(true);
  }, { signal });
  dock.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = false;
    // A brief grace period bridges the space between the tree tab and tray.
    leaveTimer = setTimeout(() => {
      if (!(keyboard && dock.contains(document.activeElement))) collapse();
    }, 160);
  }, { signal });
  dock.addEventListener('focusin', () => {
    if (keyboard && !restoringFocus) { clearTimeout(leaveTimer); setExpanded(true); }
  }, { signal });
  dock.addEventListener('focusout', event => {
    // activeElement can briefly be body between blur and focus during Tab.
    if (!dock.contains(event.relatedTarget) && !hovering) collapse();
  }, { signal });
  toggle.addEventListener('click', () => { clearTimeout(leaveTimer); setExpanded(!expanded); }, { signal });
  document.addEventListener('pointerdown', event => {
    keyboard = false;
    if (!dock.contains(event.target)) collapse();
  }, { passive: true, signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') keyboard = true;
    if (event.key === 'Escape' && scrolled && expanded) {
      event.preventDefault(); collapse();
    }
  }, { signal });
  return () => {
    controller.abort(); clearTimeout(leaveTimer);
    panel.inert = false; panel.removeAttribute('aria-hidden'); toggle.hidden = true;
    dock.classList.remove('dock-enhanced', 'is-scrolled', 'is-expanded');
  };
}

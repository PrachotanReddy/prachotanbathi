// Displayed progress trails completed tasks; one GSAP tween supplies the pace.
export function createLoadingCounter(durationMs) {
  const root = document.documentElement;
  const count = document.querySelector('.loading-count');
  const reels = [...count.querySelectorAll('.digit-reel')];
  const deadline = window.__cowdyDeadline || Date.now() + 8000;
  const end = deadline - 8000 + durationMs;
  const state = { value: 0 };
  let tween, cancelFinish;

  const render = () => {
    const value = Math.max(0, Math.min(100, state.value));
    count.dataset.progress = String(Math.floor(value));
    reels.forEach((reel, i) => {
      const place = 10 ** (reels.length - i - 1);
      const digit = Math.floor(value / place) % 10;
      // Carry higher columns only during the last unit, as on a rolling meter.
      // The repeated zero at the bottom makes 9 -> 0 a seamless forward roll.
      const carry = Math.max(0, value % place - (place - 1));
      reel.style.transform = `translateY(${-(digit + carry) * 100 / 11}%)`;
    });
  };
  const secondsLeft = () => Math.max(0, Math.min(
    Math.max(180, end - Date.now()), deadline - Date.now() - 1050,
  )) / 1000;
  const animate = (value, gsap, onComplete) => {
    tween?.kill();
    tween = gsap.to(state, {
      value, duration: secondsLeft(), ease: 'power1.inOut',
      onUpdate: render, onComplete,
    });
  };
  const dispose = () => { tween?.kill(); cancelFinish?.(); };
  render();
  return {
    advance(value, gsap) {
      // Keep the first frame at zero until the animation runtime is ready.
      if (!gsap || !root.classList.contains('booting') || window.__cowdyExpired) return;
      animate(Math.min(100, value), gsap);
    },
    finish(gsap, motion) {
      if (!gsap || !motion.enabled || !root.classList.contains('booting') || window.__cowdyExpired) {
        dispose(); state.value = 100; render(); return Promise.resolve();
      }
      return new Promise(resolve => {
        let unsubscribe = () => {}, timer;
        const finish = () => {
          tween?.kill(); clearTimeout(timer); unsubscribe(); cancelFinish = null;
          state.value = 100; render(); resolve();
        };
        cancelFinish = finish;
        unsubscribe = motion.subscribe(enabled => { if (!enabled) finish(); });
        // Reserve time for the curtain, even when loading nearly hits the watchdog.
        timer = setTimeout(finish, Math.max(0, deadline - Date.now() - 1050));
        animate(100, gsap, finish);
      });
    },
    dispose,
  };
}

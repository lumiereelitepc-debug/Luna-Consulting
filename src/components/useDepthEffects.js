import { useEffect } from 'react';

export default function useDepthEffects() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const cards = [...document.querySelectorAll('[data-depth]')];
    const motionElements = [...document.querySelectorAll('[data-motion]')];
    const visible = new Map();
    const pending = new Map();
    const enabled = () => !reducedMotion.matches && finePointer.matches && !document.hidden;

    function reset(card) {
      if (pending.has(card)) cancelAnimationFrame(pending.get(card));
      pending.delete(card);
      ['--depth-x', '--depth-y', '--shine-x', '--shine-y'].forEach((name) => card.style.removeProperty(name));
      delete card.dataset.depthActive;
    }

    function onMove(event) {
      if (!enabled() || event.pointerType === 'touch') return;
      const card = event.currentTarget;
      const bounds = card.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      if (pending.has(card)) cancelAnimationFrame(pending.get(card));
      pending.set(card, requestAnimationFrame(() => {
        pending.delete(card);
        if (!enabled()) return;
        card.style.setProperty('--depth-x', `${(0.5 - y) * 5}deg`);
        card.style.setProperty('--depth-y', `${(x - 0.5) * 5}deg`);
        card.style.setProperty('--shine-x', `${x * 100}%`);
        card.style.setProperty('--shine-y', `${y * 100}%`);
        card.dataset.depthActive = 'true';
      }));
    }

    function onLeave(event) { reset(event.currentTarget); }
    function syncMotion() {
      motionElements.forEach((element) => {
        element.dataset.motionVisible = String(!!visible.get(element) && !document.hidden && !reducedMotion.matches);
      });
      if (!enabled()) cards.forEach(reset);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visible.set(entry.target, entry.isIntersecting));
      syncMotion();
    }, { threshold: 0.01 });
    motionElements.forEach((element) => observer.observe(element));
    cards.forEach((card) => {
      card.addEventListener('pointermove', onMove, { passive: true });
      card.addEventListener('pointerleave', onLeave);
      card.addEventListener('focusin', onLeave);
    });
    document.addEventListener('visibilitychange', syncMotion);
    reducedMotion.addEventListener('change', syncMotion);
    finePointer.addEventListener('change', syncMotion);

    return () => {
      observer.disconnect();
      cards.forEach((card) => {
        reset(card);
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
        card.removeEventListener('focusin', onLeave);
      });
      motionElements.forEach((element) => delete element.dataset.motionVisible);
      document.removeEventListener('visibilitychange', syncMotion);
      reducedMotion.removeEventListener('change', syncMotion);
      finePointer.removeEventListener('change', syncMotion);
    };
  }, []);
}

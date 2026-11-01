// Animates a copy of a product image from where it was clicked into the bag icon.
export const flyToBag = (sourceEl) => {
  if (typeof window === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const target = document.querySelector('[data-bag-icon]');
  const img = sourceEl?.tagName === 'IMG' ? sourceEl : sourceEl?.querySelector?.('img');
  if (!target || !img?.src) return;

  const from = img.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width || !to.width) return;

  const ghost = document.createElement('div');
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    backgroundImage: `url("${img.src}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '2px',
    zIndex: 300,
    pointerEvents: 'none',
    boxShadow: '0 12px 30px rgba(0,0,0,.25)',
  });
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const anim = ghost.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.2 },
    ],
    { duration: 750, easing: 'cubic-bezier(.5,0,.75,0)' }
  );
  anim.onfinish = () => ghost.remove();
  anim.oncancel = () => ghost.remove();
};

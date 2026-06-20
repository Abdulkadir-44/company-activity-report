/**
 * Observes elements with [data-reveal] and toggles .is-visible when they
 * enter the viewport. Works with the .reveal and .reveal-stagger CSS utilities
 * defined in global.css.
 *
 * Usage — add data-reveal to any element or use <SectionWrapper>:
 *   <div data-reveal>...</div>
 *
 * Call init() once in a client-side script after DOM is ready.
 */

interface ObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

export function init(options: ObserverOptions = {}): void {
  const { threshold = 0.1, rootMargin = '0px 0px -48px 0px' } = options;

  if (!('IntersectionObserver' in window)) {
    // Graceful degradation: make everything visible immediately
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // fire once only
        }
      });
    },
    { threshold, rootMargin }
  );

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
    observer.observe(el);
  });
}

export default { init };

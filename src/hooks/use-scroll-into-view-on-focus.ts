import { useEffect, type RefObject } from 'react';

export function useScrollIntoViewOnFocus(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timerId: ReturnType<typeof setTimeout>;

    function handleFocusIn(e: FocusEvent) {
      clearTimeout(timerId);
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        timerId = setTimeout(() => {
          target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 300);
      }
    }

    container.addEventListener('focusin', handleFocusIn);
    return () => {
      clearTimeout(timerId);
      container.removeEventListener('focusin', handleFocusIn);
    };
  }, [containerRef]);
}

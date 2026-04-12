import { useState, useEffect } from 'react';

/**
 * Tracks the visual viewport height, which shrinks when the on-screen
 * keyboard opens. Falls back to `window.innerHeight` if the API is
 * unavailable. Only subscribes while `enabled` is true.
 */
export function useVisualViewportHeight(enabled = true): number {
  const [height, setHeight] = useState(() => window.visualViewport?.height ?? window.innerHeight);

  useEffect(() => {
    if (!enabled) return;
    const vv = window.visualViewport;
    if (!vv) return;

    function onResize() {
      setHeight(vv!.height);
    }

    // Sync immediately in case viewport already changed
    onResize();

    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, [enabled]);

  return height;
}

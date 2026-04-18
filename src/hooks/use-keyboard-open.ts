import { useState, useEffect, useRef } from 'react';
import { useIsDesktop } from '@/hooks/use-breakpoint';

const KEYBOARD_THRESHOLD = 150;
const ORIENTATION_SETTLE_MS = 300;

export function useKeyboardOpen(): boolean {
  const [isOpen, setIsOpen] = useState(false);
  const orientationChanging = useRef(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    // Desktop doesn't have virtual keyboards — skip listener setup
    if (isDesktop) return;

    const vv = window.visualViewport;
    if (!vv) return;

    let fullHeight = window.innerHeight;
    let settleTimer: ReturnType<typeof setTimeout>;

    function onOrientationChange() {
      orientationChanging.current = true;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        orientationChanging.current = false;
        fullHeight = window.innerHeight;
        onResize();
      }, ORIENTATION_SETTLE_MS);
    }

    function onResize() {
      if (orientationChanging.current) return;
      const vv = window.visualViewport;
      if (!vv) return;
      setIsOpen(fullHeight - vv.height > KEYBOARD_THRESHOLD);
    }

    vv.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientationChange);

    return () => {
      vv.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientationChange);
      clearTimeout(settleTimer);
    };
  }, [isDesktop]);

  // Desktop never has a virtual keyboard
  return isDesktop ? false : isOpen;
}

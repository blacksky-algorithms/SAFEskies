import { useEffect, useRef } from 'react';

interface UseScrollRestorationOptions {
  key: string;
  shouldRestore: boolean;
  shouldClear: boolean;
}

export function useScrollRestoration({
  key,
  shouldRestore,
  shouldClear,
}: UseScrollRestorationOptions) {
  const containerRef = useRef<HTMLElement>(null);
  const storageKey = `scroll-${key}`;

  // Save on scroll
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleScroll = () => {
      sessionStorage.setItem(storageKey, element.scrollTop.toString());
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [storageKey]);

  // Restore when needed
  useEffect(() => {
    if (!shouldRestore || !containerRef.current) return;

    const savedPosition = sessionStorage.getItem(storageKey);
    if (!savedPosition) return;

    const scrollTop = parseInt(savedPosition, 10);
    if (isNaN(scrollTop) || scrollTop <= 0) return;

    const restore = () => {
      const element = containerRef.current;
      if (element && element.scrollHeight > element.clientHeight) {
        element.scrollTop = scrollTop;
        return true;
      }
      return false;
    };

    // Try immediate restore first
    if (restore()) return; // Success, no need for timeouts

    // If immediate restore failed, try with delays
    const timeouts = [setTimeout(restore, 100), setTimeout(restore, 300)];

    // Always cleanup timeouts on unmount or dependency change
    return () => timeouts.forEach(clearTimeout);
  }, [shouldRestore, storageKey]);

  // Clear when needed
  useEffect(() => {
    if (shouldClear) {
      sessionStorage.removeItem(storageKey);
    }
  }, [shouldClear, storageKey]);

  return { containerRef };
}

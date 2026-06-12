import { useRef, useCallback } from 'react';

export function useTilt(maxDeg = 6) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * maxDeg;
      const rotateY = (x - 0.5) * maxDeg;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;

      el.style.setProperty('--spot-x', `${x * 100}%`);
      el.style.setProperty('--spot-y', `${y * 100}%`);
    },
    [maxDeg],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

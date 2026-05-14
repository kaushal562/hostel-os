import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Smoothly animates toward a numeric target (GPU-friendly: only updates state).
 */
export function useAnimatedNumber(
  target: number,
  options?: { durationMs?: number; decimals?: number },
) {
  const durationMs = options?.durationMs ?? 900;
  const decimals = options?.decimals ?? 0;

  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);
  const valueRef = useRef(0);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!Number.isFinite(target)) return;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const from = valueRef.current;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);
      const next = from + (target - from) * eased;
      setValue(next);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  const rounded =
    decimals > 0
      ? Number(value.toFixed(decimals))
      : Math.round(value);

  return rounded;
}

"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export function AnimatedCounter({ value, duration = 1400, formatter, className }: Props) {
  const [display, setDisplay] = useState("0");
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const divRef = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  const fmt = formatter ?? ((n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return Math.round(n).toLocaleString("en-US");
  });

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    // Reset so animation runs again when value changes (e.g. month switch)
    hasRun.current = false;
    cancelAnimationFrame(rafRef.current);
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          startRef.current = null;

          const tick = (ts: number) => {
            if (!startRef.current) startRef.current = ts;
            const elapsed = ts - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            setDisplay(fmt(eased * value));
            if (progress < 1) rafRef.current = requestAnimationFrame(tick);
          };

          rafRef.current = requestAnimationFrame(tick);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observerRef.current.observe(el);
    return () => {
      cancelAnimationFrame(rafRef.current);
      observerRef.current?.disconnect();
    };
  }, [value, duration, fmt]);

  return (
    <span ref={divRef} className={className}>
      {display}
    </span>
  );
}

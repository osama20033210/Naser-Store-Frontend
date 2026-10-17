"use client";

import { useAnimate } from "motion/react-mini";
import { useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/** Animate after paint without hiding server content, delaying navigation or remounting forms. */
export function PageTransition({ children }: { children: ReactNode }) {
  const path = usePathname(), reduced = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  useEffect(() => {
    if (reduced || !scope.current) return;
    const animation = animate(scope.current, { opacity: [0.85, 1], transform: ["translateY(4px)", "translateY(0px)"] }, { duration: 0.18, ease: "easeOut" });
    return () => animation.stop();
  }, [path, reduced, scope, animate]);
  return <div ref={scope} className="min-w-0">{children}</div>;
}

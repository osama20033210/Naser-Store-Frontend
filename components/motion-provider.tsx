"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadFeatures = () => import("./motion-features").then(module => module.default);

/** Keep gesture/animation features out of the initial render; no layout/drag bundle is loaded. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}><LazyMotion features={loadFeatures} strict>{children}</LazyMotion></MotionConfig>;
}

"use client";

import "lenis/dist/lenis.css";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import ReactLenis from "lenis/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const AnimationContext = createContext(false);

export function AboutAnimations({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return (
    <AnimationContext.Provider value={enabled}>
      {enabled && (
        <ReactLenis root options={{ anchors: true, autoRaf: true }} />
      )}
      {children}
    </AnimationContext.Provider>
  );
}

function SuiteLetter({
  char,
  index,
  scrollY,
}: {
  char: string;
  index: number;
  scrollY: MotionValue<number>;
}) {
  const enabled = useContext(AnimationContext);
  const distance = index - 2;
  const x = useTransform(scrollY, [0, 240], [distance * 8, 0]);
  const rotateX = useTransform(scrollY, [0, 240], [distance * 8, 0]);

  return (
    <motion.span
      className="inline-block"
      style={{ x: enabled ? x : 0, rotateX: enabled ? rotateX : 0 }}
    >
      {char}
    </motion.span>
  );
}

export function AboutSuite() {
  const { scrollY } = useScroll();

  return (
    <span className="block text-orange-700 dark:text-orange-400">
      <span className="sr-only">Suite</span>
      <span
        aria-hidden="true"
        className="inline-block"
        style={{ perspective: 500 }}
      >
        {Array.from("Suite", (char, index) => (
          <SuiteLetter
            key={index}
            char={char}
            index={index}
            scrollY={scrollY}
          />
        ))}
      </span>
    </span>
  );
}

export function AboutCard({ children }: { children: ReactNode }) {
  const enabled = useContext(AnimationContext);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 80%"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.98, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ y: enabled ? y : 0, scale: enabled ? scale : 1 }}
    >
      {children}
    </motion.div>
  );
}

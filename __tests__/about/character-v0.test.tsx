import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { motionValue, useReducedMotion, useScroll } from "framer-motion";
import { expect, it, vi } from "vitest";

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useScroll: vi.fn(),
  useReducedMotion: vi.fn(),
}));
vi.mock("lenis/react", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

import AboutPage from "@/app/about/page";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

it.each([
  {
    progress: 0,
    reducedMotion: false,
    transform: "none",
    cardTransform: "translateX(-75px) translateY(75px) scale(0.75)",
  },
  {
    progress: 0.25,
    reducedMotion: false,
    transform: "translateX(-250px) rotateX(-250deg)",
    cardTransform: "translateX(-37.5px) translateY(37.5px) scale(0.875)",
  },
  {
    progress: 0.5,
    reducedMotion: false,
    transform: "translateX(-500px) rotateX(-500deg)",
    cardTransform: "none",
  },
  {
    progress: 0,
    reducedMotion: true,
    transform: "none",
    cardTransform: "none",
  },
])(
  "animates the heading and four cards at $progress (reduced motion: $reducedMotion)",
  ({ progress, reducedMotion, transform, cardTransform }) => {
    vi.mocked(useScroll).mockReturnValue({
      scrollX: motionValue(0),
      scrollY: motionValue(0),
      scrollXProgress: motionValue(0),
      scrollYProgress: motionValue(progress),
      scrollXLength: motionValue(0),
      scrollYLength: motionValue(0),
    });
    vi.mocked(useReducedMotion).mockReturnValue(reducedMotion);
    const container = document.createElement("div");
    const root = createRoot(container);

    try {
      act(() => root.render(<AboutPage />));
      const letters =
        container.querySelectorAll<HTMLElement>("span.text-primary");
      expect(letters[0]?.textContent).toBe("S");
      expect(letters[0]?.style.transform).toBe(transform);
      expect(letters[10]?.style.transform).toBe("none");
      expect(letters[7]?.classList.contains("w-4")).toBe(true);
      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards).toHaveLength(4);
      expect(cards[0]?.parentElement?.style.transform).toBe(cardTransform);
      expect(cards[3]?.closest(".grid")).toBe(cards[0]?.closest(".grid"));
    } finally {
      act(() => root.unmount());
    }
  },
);

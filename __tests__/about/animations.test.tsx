import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mount: vi.fn(),
  cleanup: vi.fn(),
}));

vi.mock("lenis/react", () => ({
  default: function Lenis() {
    useEffect(() => {
      mocks.mount();
      return () => {
        mocks.cleanup();
      };
    }, []);
    return null;
  },
}));

import {
  AboutAnimations,
  AboutCard,
  AboutSuite,
} from "@/app/about/about-animations";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const container = document.createElement("div");
document.body.append(container);
const root = createRoot(container);

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("keeps reduced-motion content settled and removes smooth scrolling when disabled or unmounted", () => {
  const preference = Object.assign(new EventTarget(), {
    matches: true,
    addListener: vi.fn(),
  });
  vi.stubGlobal("matchMedia", () => preference);
  const removeListener = vi.spyOn(preference, "removeEventListener");
  const page = (
    <AboutAnimations>
      <h1>
        Student Teaching <AboutSuite />
      </h1>
      <AboutCard>
        <h2>Data processing</h2>
      </AboutCard>
    </AboutAnimations>
  );
  act(() => root.render(page));

  expect(mocks.mount).not.toHaveBeenCalled();
  expect(container.querySelector(".sr-only")?.textContent).toBe("Suite");
  expect(container.querySelector("h2")?.textContent).toBe("Data processing");
  expect(container.querySelector("h2")?.parentElement?.style.transform).toBe(
    "none",
  );
  const letters = container.querySelectorAll('[aria-hidden="true"] > span');
  expect(letters).toHaveLength(5);
  for (const letter of letters) {
    expect((letter as HTMLElement).style.transform).toBe("none");
  }

  act(() => {
    preference.matches = false;
    preference.dispatchEvent(new Event("change"));
  });
  expect(mocks.mount).toHaveBeenCalledTimes(1);

  act(() => {
    preference.matches = true;
    preference.dispatchEvent(new Event("change"));
  });
  expect(mocks.cleanup).toHaveBeenCalledTimes(1);
  expect(container.querySelector("h2")?.parentElement?.style.transform).toBe(
    "none",
  );

  act(() => {
    preference.matches = false;
    preference.dispatchEvent(new Event("change"));
  });
  expect(mocks.mount).toHaveBeenCalledTimes(2);
  act(() => root.render(null));
  expect(mocks.cleanup).toHaveBeenCalledTimes(2);
  expect(removeListener).toHaveBeenCalledWith("change", expect.any(Function));
});

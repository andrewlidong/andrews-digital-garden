import React, { useEffect, useRef, useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

// Terminal-style "decode" effect: the text first renders as random glyphs and
// resolves left-to-right into the real string once it scrolls into view
// (think `nms` / `cmatrix`). The real text is always present for assistive
// tech in a visually-hidden span; the animated glyphs are aria-hidden.

const GLYPHS = "!<>-_\\/[]{}—=+*^?#░▒▓│─";
const TICK_MS = 30;
const WINDOW = 3;

// Keys that have already been decoded this session. Lets call sites (e.g. the
// blog index) skip the replay when the user navigates back to the page.
const decodedKeys = new Set<string>();

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function scrambleChar(ch: string): string {
  // Keep whitespace as-is so word boundaries (and widths) stay stable.
  return /\s/.test(ch) ? ch : randomGlyph();
}

function scrambleAll(chars: string[]): string[] {
  return chars.map(scrambleChar);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface ScrambledTextProps {
  text: string;
  /** Delay (ms) before the decode starts once the element is in view. */
  delay?: number;
  /** Characters resolved per tick (~30ms). Higher is faster. */
  speed?: number;
  /** Element to render as. Defaults to `span`. */
  as?: React.ElementType;
  className?: string;
  /**
   * Session-unique key. When set, the decode runs only once per key per page
   * session; later mounts with the same key render the final text immediately.
   */
  once?: string;
}

export const ScrambledText: React.FC<ScrambledTextProps> = ({
  text,
  delay = 0,
  speed = 1,
  as: Tag = "span",
  className,
  once,
}) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useIntersectionObserver(ref, { once: true, threshold: 0.1 });

  const skip = () => prefersReducedMotion() || (once ? decodedKeys.has(once) : false);

  const [display, setDisplay] = useState<string>(() =>
    skip() ? text : scrambleAll(Array.from(text)).join("")
  );

  useEffect(() => {
    if (skip()) {
      setDisplay(text);
      return;
    }

    const chars = Array.from(text);
    const current = scrambleAll(chars);
    setDisplay(current.join(""));

    if (!inView) return;

    let progress = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        progress += speed;
        if (progress >= chars.length + WINDOW) {
          if (interval) clearInterval(interval);
          setDisplay(text);
          if (once) decodedKeys.add(once);
          return;
        }
        const resolved = Math.floor(progress);
        for (let i = 0; i < chars.length; i++) {
          if (i < resolved) {
            current[i] = chars[i];
          } else if (i < resolved + WINDOW) {
            current[i] = scrambleChar(chars[i]);
          } else if (Math.random() < 0.15) {
            // Subtle shimmer on the not-yet-reached tail.
            current[i] = scrambleChar(chars[i]);
          }
        }
        setDisplay(current.join(""));
      }, TICK_MS);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
    // `skip` is a stable closure over `once`, which is already a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, inView, delay, speed, once]);

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
};

export default ScrambledText;

import React, { useEffect, useState } from "react";

// A thin terminal-style metadata strip pinned to the bottom of the page,
// inspired by maximeheckel.com. Shows build + runtime context: the git
// commit it was built from (links to GitHub), the browser, a live clock,
// the live viewport dimensions, and when the site was last updated.
//
// Pass `compact` for a trimmed two-field version suited to narrow mobile
// screens.

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  return "Unknown";
}

// Honor the user's reduced-motion preference: when set, we don't run the
// per-second clock interval (the seconds tick is decorative motion).
function usePrefersReducedMotion(): boolean {
  const query = "(prefers-reduced-motion: reduce)";
  const [prefers, setPrefers] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setPrefers(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return prefers;
}

function formatTime(reducedMotion: boolean): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    // Drop the per-second tick when motion is reduced.
    ...(reducedMotion ? {} : { second: "2-digit" }),
  });
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex items-baseline gap-1.5 whitespace-nowrap">
    <span className="text-term-faint">{label}</span>
    <span className="text-term-dim">{children}</span>
  </div>
);

const CommitValue: React.FC = () =>
  __REPO_URL__ && __COMMIT_FULL__ ? (
    <a
      href={`${__REPO_URL__}/commit/${__COMMIT_FULL__}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-term-dim hover:text-term-accent hover:underline"
    >
      {__COMMIT_HASH__}
    </a>
  ) : (
    <>{__COMMIT_HASH__}</>
  );

export const MetadataBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const reducedMotion = usePrefersReducedMotion();
  const [time, setTime] = useState<string>(() => formatTime(reducedMotion));
  const [dimensions, setDimensions] = useState<string>(
    `${window.innerWidth}x${window.innerHeight}`
  );
  const [browser] = useState<string>(detectBrowser);

  useEffect(() => {
    const update = () => setTime(formatTime(reducedMotion));
    update();
    // Reduced motion: refresh once a minute instead of every second.
    const intervalId = setInterval(update, reducedMotion ? 60000 : 1000);
    return () => clearInterval(intervalId);
  }, [reducedMotion]);

  useEffect(() => {
    const updateDimensions = () =>
      setDimensions(`${window.innerWidth}x${window.innerHeight}`);
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-term-border bg-[color-mix(in_srgb,var(--term-bg-inset)_88%,transparent)] backdrop-blur-sm px-4 py-1 font-mono text-xs">
      <div className="flex items-center gap-x-5 gap-y-1 overflow-x-auto">
        <Field label="commit">
          <CommitValue />
        </Field>
        {!compact && <Field label="browser">{browser}</Field>}
        {!compact && <Field label="time">{time}</Field>}
        {!compact && <Field label="dimensions">{dimensions}</Field>}
        <Field label="last updated">{__LAST_UPDATED__}</Field>
      </div>
    </div>
  );
};

export default MetadataBar;

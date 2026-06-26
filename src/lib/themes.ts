// Terminal "rice" palettes. Each theme maps to a small set of semantic tokens
// modeled on a terminal color scheme (background layers, foreground text, and a
// handful of accent colors from the ANSI palette). Themes are applied by writing
// these tokens to CSS custom properties on the document root; Tailwind's `term-*`
// colors read from those variables (see tailwind.config.js), so swapping a theme
// re-skins the entire site without touching component markup.

export type ThemeTokens = {
  /** Main canvas background (the desktop / deepest panel). */
  bg: string;
  /** Elevated surfaces: window bodies, panels, dropdowns. */
  bgElevated: string;
  /** Inset / recessed surfaces: title bars, deep wells. */
  bgInset: string;
  /** Hairline borders and dividers. */
  border: string;
  /** Primary text. */
  fg: string;
  /** Secondary text (labels, breadcrumbs). */
  fgDim: string;
  /** Tertiary text (hints, muted captions). */
  fgFaint: string;
  /** Primary accent — the "blue". Links, focus, active state. */
  accent: string;
  /** Prompt / success green. */
  green: string;
  /** Highlight yellow (clock, current path). */
  yellow: string;
  /** Error / close red. */
  red: string;
  /** Cyan. */
  cyan: string;
  /** Magenta / purple. */
  magenta: string;
};

export type Theme = {
  id: string;
  name: string;
  /** Set for light-background palettes so the browser uses a light color-scheme. */
  light?: boolean;
  tokens: ThemeTokens;
};

export const THEMES: Theme[] = [
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    tokens: {
      // Deeper "Night" base for more contrast; brighter Moon-variant accents so
      // links and syntax pop off the background.
      bg: "#1a1b26",
      bgElevated: "#24283b",
      bgInset: "#16161e",
      border: "#414868",
      fg: "#c8d3f5",
      fgDim: "#9aa5ce",
      fgFaint: "#565f89",
      accent: "#82aaff",
      green: "#c3e88d",
      yellow: "#ffc777",
      red: "#ff757f",
      cyan: "#86e1fc",
      magenta: "#c099ff",
    },
  },
  {
    id: "synthwave-84",
    name: "Synthwave '84",
    tokens: {
      // Deeper plum base makes the neon glow harder; magenta split from the pink
      // accent for a richer multi-hue gradient.
      bg: "#241b2f",
      bgElevated: "#2d2640",
      bgInset: "#18121f",
      border: "#4d3b6b",
      fg: "#f6f6f9",
      fgDim: "#b6b1c4",
      fgFaint: "#8b8fc7",
      accent: "#ff7edb",
      green: "#72f1b8",
      yellow: "#fede5d",
      red: "#fe4450",
      cyan: "#03edf9",
      magenta: "#d57bff",
    },
  },
  {
    id: "everforest",
    name: "Everforest",
    tokens: {
      // Deeper base and a touch more saturation in the accents lift this
      // naturally-muted palette without losing its soft forest feel.
      bg: "#272e33",
      bgElevated: "#2e383c",
      bgInset: "#1e2326",
      border: "#4a555b",
      fg: "#d3c6aa",
      fgDim: "#9da9a0",
      fgFaint: "#7a8478",
      accent: "#8eccc4",
      green: "#b3ce8a",
      yellow: "#e6c587",
      red: "#f08a8c",
      cyan: "#8fce9f",
      magenta: "#e2a6c2",
    },
  },
  {
    id: "strawberry-milk",
    name: "Strawberry Milk",
    light: true,
    tokens: {
      // A cute blush-pink light theme — soft strawberry-milk surfaces with
      // muted-rosé text and pine/rose/iris accents.
      bg: "#fdeaf1",
      bgElevated: "#fff3f8",
      bgInset: "#f8dce8",
      border: "#ecc5d6",
      fg: "#575279",
      fgDim: "#7c5e72",
      fgFaint: "#a98a9c",
      accent: "#286983",
      green: "#56949f",
      yellow: "#ea9d34",
      red: "#b4637a",
      cyan: "#d7827e",
      magenta: "#907aa9",
    },
  },
  {
    id: "catppuccin-latte",
    name: "Catppuccin Latte",
    light: true,
    tokens: {
      // Already-vivid accents on a clean light base; a stronger border gives
      // surfaces more definition so they pop instead of washing out.
      bg: "#eff1f5",
      bgElevated: "#e6e9ef",
      bgInset: "#dce0e8",
      border: "#acb0be",
      fg: "#4c4f69",
      fgDim: "#5c5f77",
      fgFaint: "#8c8fa1",
      accent: "#1e66f5",
      green: "#40a02b",
      yellow: "#df8e1d",
      red: "#d20f39",
      cyan: "#04a5e5",
      magenta: "#8839ef",
    },
  },
];

export const DEFAULT_THEME_ID = "tokyo-night";

const STORAGE_KEY = "garden-theme";

/** Maps a token key to its CSS custom property name. */
const CSS_VAR: Record<keyof ThemeTokens, string> = {
  bg: "--term-bg",
  bgElevated: "--term-bg-elevated",
  bgInset: "--term-bg-inset",
  border: "--term-border",
  fg: "--term-fg",
  fgDim: "--term-fg-dim",
  fgFaint: "--term-fg-faint",
  accent: "--term-accent",
  green: "--term-green",
  yellow: "--term-yellow",
  red: "--term-red",
  cyan: "--term-cyan",
  magenta: "--term-magenta",
};

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Writes a theme's tokens onto the document root as CSS variables. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  (Object.keys(CSS_VAR) as Array<keyof ThemeTokens>).forEach((key) => {
    root.style.setProperty(CSS_VAR[key], theme.tokens[key]);
  });
  root.style.colorScheme = theme.light ? "light" : "dark";
}

export function loadThemeId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function saveThemeId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore — private mode, etc. */
  }
}

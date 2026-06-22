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
      bg: "#24283b",
      bgElevated: "#292e42",
      bgInset: "#1f2335",
      border: "#3b4261",
      fg: "#c0caf5",
      fgDim: "#9aa5ce",
      fgFaint: "#565f89",
      accent: "#7aa2f7",
      green: "#9ece6a",
      yellow: "#e0af68",
      red: "#f7768e",
      cyan: "#7dcfff",
      magenta: "#bb9af7",
    },
  },
  {
    id: "synthwave-84",
    name: "Synthwave '84",
    tokens: {
      bg: "#262335",
      bgElevated: "#34294f",
      bgInset: "#1a1626",
      border: "#463465",
      fg: "#f0eff1",
      fgDim: "#b6b1c4",
      fgFaint: "#848bbd",
      accent: "#ff7edb",
      green: "#72f1b8",
      yellow: "#fede5d",
      red: "#fe4450",
      cyan: "#03edf9",
      magenta: "#ff7edb",
    },
  },
  {
    id: "everforest",
    name: "Everforest",
    tokens: {
      bg: "#2d353b",
      bgElevated: "#343f44",
      bgInset: "#232a2e",
      border: "#475258",
      fg: "#d3c6aa",
      fgDim: "#9da9a0",
      fgFaint: "#7a8478",
      accent: "#7fbbb3",
      green: "#a7c080",
      yellow: "#dbbc7f",
      red: "#e67e80",
      cyan: "#83c092",
      magenta: "#d699b6",
    },
  },
  {
    id: "rose-pine",
    name: "Rosé Pine",
    tokens: {
      bg: "#191724",
      bgElevated: "#1f1d2e",
      bgInset: "#161420",
      border: "#26233a",
      fg: "#e0def4",
      fgDim: "#908caa",
      fgFaint: "#6e6a86",
      accent: "#f6c177",
      green: "#5cb197",
      yellow: "#f6c177",
      red: "#eb6f92",
      cyan: "#9ccfd8",
      magenta: "#c4a7e7",
    },
  },
  {
    id: "catppuccin-latte",
    name: "Catppuccin Latte",
    light: true,
    tokens: {
      bg: "#eff1f5",
      bgElevated: "#e6e9ef",
      bgInset: "#dce0e8",
      border: "#bcc0cc",
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

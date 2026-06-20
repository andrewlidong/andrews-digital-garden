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
    id: "andrew-blue",
    name: "Andrew Blue",
    tokens: {
      bg: "#0b1020",
      bgElevated: "#131a2e",
      bgInset: "#070a14",
      border: "#1f2a44",
      fg: "#dce6ff",
      fgDim: "#93a4c8",
      fgFaint: "#586288",
      accent: "#4d8bff",
      green: "#4fe0b0",
      yellow: "#ffd166",
      red: "#ff6b8b",
      cyan: "#5ad7ff",
      magenta: "#9d7bff",
    },
  },
  {
    id: "catppuccin-mocha",
    name: "Catppuccin Mocha",
    tokens: {
      bg: "#1e1e2e",
      bgElevated: "#313244",
      bgInset: "#181825",
      border: "#45475a",
      fg: "#cdd6f4",
      fgDim: "#a6adc8",
      fgFaint: "#6c7086",
      accent: "#89b4fa",
      green: "#a6e3a1",
      yellow: "#f9e2af",
      red: "#f38ba8",
      cyan: "#94e2d5",
      magenta: "#cba6f7",
    },
  },
  {
    id: "nord",
    name: "Nord",
    tokens: {
      bg: "#2e3440",
      bgElevated: "#3b4252",
      bgInset: "#272c36",
      border: "#434c5e",
      fg: "#eceff4",
      fgDim: "#d8dee9",
      fgFaint: "#7b88a1",
      accent: "#81a1c1",
      green: "#a3be8c",
      yellow: "#ebcb8b",
      red: "#bf616a",
      cyan: "#88c0d0",
      magenta: "#b48ead",
    },
  },
  {
    id: "rose-pine",
    name: "Rosé Pine",
    tokens: {
      bg: "#191724",
      bgElevated: "#1f1d2e",
      bgInset: "#16141f",
      border: "#26233a",
      fg: "#e0def4",
      fgDim: "#908caa",
      fgFaint: "#6e6a86",
      accent: "#9ccfd8",
      green: "#95b1ac",
      yellow: "#f6c177",
      red: "#eb6f92",
      cyan: "#9ccfd8",
      magenta: "#c4a7e7",
    },
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    tokens: {
      bg: "#282828",
      bgElevated: "#3c3836",
      bgInset: "#1d2021",
      border: "#504945",
      fg: "#ebdbb2",
      fgDim: "#bdae93",
      fgFaint: "#928374",
      accent: "#83a598",
      green: "#b8bb26",
      yellow: "#fabd2f",
      red: "#fb4934",
      cyan: "#8ec07c",
      magenta: "#d3869b",
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
  root.style.colorScheme = "dark";
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

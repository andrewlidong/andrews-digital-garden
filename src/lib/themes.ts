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
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    tokens: {
      bg: "#000b1e",
      bgElevated: "#0a1933",
      bgInset: "#00060f",
      border: "#0d2847",
      fg: "#9beaef",
      fgDim: "#4fc3ca",
      fgFaint: "#2b7d82",
      accent: "#ea00d9",
      green: "#00ff9c",
      yellow: "#f3e600",
      red: "#ff003c",
      cyan: "#0abdc6",
      magenta: "#ea00d9",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    tokens: {
      bg: "#282a36",
      bgElevated: "#343746",
      bgInset: "#21222c",
      border: "#44475a",
      fg: "#f8f8f2",
      fgDim: "#b4b4c8",
      fgFaint: "#6272a4",
      accent: "#bd93f9",
      green: "#50fa7b",
      yellow: "#f1fa8c",
      red: "#ff5555",
      cyan: "#8be9fd",
      magenta: "#ff79c6",
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

import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  getTheme,
  loadThemeId,
  saveThemeId,
  THEMES,
} from "@/lib/themes";

/**
 * Manages the active terminal "rice" theme: applies its CSS variables to the
 * document root, persists the choice, and keeps it in sync across tabs.
 */
export function useTheme() {
  const [themeId, setThemeId] = useState<string>(() => loadThemeId());

  useEffect(() => {
    applyTheme(getTheme(themeId));
  }, [themeId]);

  // Keep multiple open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "garden-theme" && e.newValue) {
        setThemeId(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((id: string) => {
    setThemeId(id);
    saveThemeId(id);
  }, []);

  return { themeId, setTheme, themes: THEMES };
}

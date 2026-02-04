import { useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";
export type ThemeMode = "system" | Theme;

const KEY = "sv_theme_mode";

function getSystemTheme(): Theme {
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  return mq?.matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(KEY) as ThemeMode | null;
    if (saved === "system" || saved === "light" || saved === "dark") return saved;
    return "system";
  });

  const theme: Theme = useMemo(() => {
    return mode === "system" ? getSystemTheme() : mode;
  }, [mode]);

  // Apply theme always
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Persist only mode (system/light/dark)
  useEffect(() => {
    localStorage.setItem(KEY, mode);
  }, [mode]);

  // React to system changes ONLY when mode=system
  useEffect(() => {
    if (mode !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(getSystemTheme());

    // Safari fallback
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, [mode]);

  const toggle = () => {
    // toggle sets explicit mode
    setMode((m) => {
      const current = m === "system" ? getSystemTheme() : m;
      return current === "dark" ? "light" : "dark";
    });
  };

  const setSystem = () => setMode("system");

  return { mode, theme, setMode, toggle, setSystem };
}

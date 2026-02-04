import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { mode, theme, toggle, setSystem } = useTheme();

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={toggle}
        className="w-7 h-7 rounded-lg bg-[var(--bg-card)]
                   hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
        title="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4 text-[var(--accent-yellow)]" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--accent-blue)]" />
        )}
      </button>

      {/* <button
        onClick={setSystem}
        className={`w-7 h-7 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]
                    flex items-center justify-center transition-colors
                    ${mode === "system" ? "border-[var(--accent-blue)]" : "border-[var(--border)]"}`}
        title="Use system theme"
      >
        <Monitor className="w-4 h-4 text-[var(--text-muted)]" />
      </button> */}
    </div>
  );
}

export default ThemeToggle;

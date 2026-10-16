"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { THEME_COOKIE, type Theme } from "@/lib/theme";

const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null);

/** Root-owned preference survives route changes without remounting forms or account state. */
export function ThemeProvider({ initialTheme, children }: { initialTheme: Theme; children: ReactNode }) {
  const [theme, updateTheme] = useState<Theme>(initialTheme);
  const value = useMemo(() => ({
    theme,
    setTheme: (next: Theme) => {
      document.cookie = `${THEME_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      document.documentElement.classList.toggle("dark", next === "dark");
      updateTheme(next);
    },
  }), [theme]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("ThemeProvider is missing");
  return value;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();
  const label = t(theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  return <button type="button" aria-label={label} title={label} aria-pressed={theme === "dark"}
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800">
    {theme === "dark" ? <Sun aria-hidden="true" className="h-4 w-4"/> : <Moon aria-hidden="true" className="h-4 w-4"/>}
  </button>;
}

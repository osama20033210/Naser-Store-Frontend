export type Theme = "light" | "dark";
export const THEME_COOKIE = "naser-store-theme";

/** Invalid or missing preferences preserve the application's original light appearance. */
export function resolveTheme(value: string | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

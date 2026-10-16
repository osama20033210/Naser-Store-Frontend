"use client";

import { useSyncExternalStore } from "react";

function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener("list-filters", listener);
  return () => { window.removeEventListener("popstate", listener); window.removeEventListener("list-filters", listener); };
}
const snapshot = () => {
  if (window.location.search) return window.location.search;
  try { return sessionStorage.getItem(`naser-store-list:${window.location.pathname}`) ?? ""; } catch { return ""; }
};

/** URL-backed list state survives details/back navigation without changing supported API parameters. */
export function useListFilter(name: string, fallback: string): [string, (value: string) => void] {
  const search = useSyncExternalStore(subscribe, snapshot, () => "");
  const value = new URLSearchParams(search).get(name) ?? fallback;
  return [value, (next: string) => {
    const url = new URL(window.location.href);
    if (next === fallback) url.searchParams.delete(name); else url.searchParams.set(name, next);
    window.history.replaceState(window.history.state, "", url);
    try { sessionStorage.setItem(`naser-store-list:${url.pathname}`, url.search); } catch { /* URL state still works when browser storage is blocked. */ }
    window.dispatchEvent(new Event("list-filters"));
  }];
}

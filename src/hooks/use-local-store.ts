"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/types";

/**
 * Tiny localStorage-backed store. Library data lives on the reader's device,
 * so bookmarks and history cost nothing on the server.
 */

const EVENT = "kn-store";
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeStore<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked: library features degrade silently
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function useLocalStore<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      writeStore(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    // fallback is expected to be a stable constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set] as const;
}

// ---------------------------------------------------------------- library

export interface LibraryComic {
  slug: string;
  title: string;
  titleEn: string | null;
  cover: string;
}

export interface Bookmark extends LibraryComic {
  addedAt: number;
}

export interface HistoryEntry extends LibraryComic {
  chapter: number;
  lang: Locale;
  readAt: number;
}

export const KEYS = {
  bookmarks: "kn:bookmarks",
  history: "kn:history",
  reader: "kn:reader",
} as const;

const EMPTY: never[] = [];

export const useBookmarks = () => useLocalStore<Bookmark[]>(KEYS.bookmarks, EMPTY);
export const useHistory = () => useLocalStore<HistoryEntry[]>(KEYS.history, EMPTY);

export function recordHistory(entry: Omit<HistoryEntry, "readAt">) {
  const prev = read<HistoryEntry[]>(KEYS.history, EMPTY);
  const next = [{ ...entry, readAt: Date.now() }, ...prev.filter((h) => h.slug !== entry.slug)].slice(0, 100);
  writeStore(KEYS.history, next);
}

export interface ReaderPrefs {
  /** null = follow the comic's format (webtoon → vertical, page → paged). */
  mode: "vertical" | "paged" | null;
  width: number; // max width in px for vertical mode
}

export const DEFAULT_READER: ReaderPrefs = { mode: null, width: 800 };
export const useReaderPrefs = () => useLocalStore<ReaderPrefs>(KEYS.reader, DEFAULT_READER);

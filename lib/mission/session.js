"use client";

/**
 * Client-side mission session.
 *
 * The sync response carries a short-lived token plus the operator identity. We
 * persist it in localStorage (demo-friendly, survives a hard refresh) and expose
 * a tiny subscribe API so the dashboard header can react without a store lib.
 */
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "astroguard.session.v1";
const listeners = new Set();
let cache = null;
let cacheLoaded = false;

function readStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.expiresAt) return null;
    if (Date.parse(parsed.expiresAt) <= Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!cacheLoaded) {
    cache = readStorage();
    cacheLoaded = true;
  }
  return cache;
}

export function saveSession(session) {
  if (typeof window === "undefined") return session;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  cache = session;
  cacheLoaded = true;
  emit();
  return session;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  cache = null;
  emit();
}

/** Reactive hook — returns null until a session exists. */
export function useMissionSession() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

/** Imperative read for event handlers (no subscription). */
export function getMissionSession() {
  return getSnapshot();
}

/**
 * Single fetch wrapper for mission APIs.
 * `baseUrl` lets the app talk to the standalone Express server when
 * NEXT_PUBLIC_API_BASE_URL is set, and fall back to Next route handlers otherwise.
 */
export async function missionFetch(path, init = {}) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const session = getMissionSession();
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(session?.token ? { authorization: `Bearer ${session.token}` } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `Request failed (${response.status})`);
  }
  return payload;
}

/**
 * Pull the live mission snapshot. Falls back to the in-bundle simulator if the
 * network call fails, so the console never shows an empty screen mid-EVA.
 */
export async function fetchTelemetry() {
  return missionFetch("/api/telemetry");
}

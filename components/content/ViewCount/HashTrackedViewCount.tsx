"use client";

import { useEffect, useState } from "react";

import ViewCount, { type ViewCountTone } from "./ViewCount";

const requestedEndpoints = new Set<string>();

type HashTrackedViewCountProps = {
  endpoint: string;
  projectSlug: string;
  initialCount: number;
  className?: string;
  tone?: ViewCountTone;
};

function responseCount(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;

  const raw = (data as { views_count?: unknown }).views_count;
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.trunc(value) : null;
}

function activeHash() {
  const raw = window.location.hash.replace(/^#/, "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * The hadith-cards page presents several projects at once. A view is counted
 * only after the visitor explicitly opens a project anchor, never merely
 * because its gallery was rendered alongside other projects.
 */
export default function HashTrackedViewCount({
  endpoint,
  projectSlug,
  initialCount,
  className,
  tone,
}: HashTrackedViewCountProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [endpoint, initialCount]);

  useEffect(() => {
    const recordWhenActive = () => {
      if (activeHash() !== projectSlug || requestedEndpoints.has(endpoint)) {
        return;
      }

      requestedEndpoints.add(endpoint);
      void fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        keepalive: true,
      })
        .then(async (response) => {
          if (!response.ok) return null;
          return response.json().catch(() => null);
        })
        .then((payload) => {
          const nextCount = responseCount(payload);
          if (nextCount !== null) setCount(nextCount);
        })
        .catch(() => {
          // Counting is non-critical and must never interrupt public reading.
        });
    };

    recordWhenActive();
    window.addEventListener("hashchange", recordWhenActive);
    return () => window.removeEventListener("hashchange", recordWhenActive);
  }, [endpoint, projectSlug]);

  return <ViewCount count={count} className={className} tone={tone} />;
}

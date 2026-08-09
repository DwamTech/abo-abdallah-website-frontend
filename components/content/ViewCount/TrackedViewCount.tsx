"use client";

import { useEffect, useState } from "react";

import ViewCount, { type ViewCountTone } from "./ViewCount";

const requestedEndpoints = new Set<string>();

type TrackedViewCountProps = {
  endpoint: string;
  initialCount: number;
  className?: string;
  tone?: ViewCountTone;
};

function responseCount(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  const raw = (data as { views_count?: unknown }).views_count;
  const parsed = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : null;
}

/**
 * Records a detail-page view through a same-origin mutation endpoint and keeps
 * the visible total in sync with the server response. Rendering this component
 * never mutates the backend directly; the dedicated BFF route owns that work.
 */
export default function TrackedViewCount({
  endpoint,
  initialCount,
  className,
  tone,
}: TrackedViewCountProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [endpoint, initialCount]);

  useEffect(() => {
    if (requestedEndpoints.has(endpoint)) return;
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
        // Analytics must never interrupt access to the public content.
      });
  }, [endpoint]);

  return <ViewCount count={count} className={className} tone={tone} />;
}

"use client";

import { useEffect, useState } from "react";

export function useGitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const cacheKey = "bionicjs:gh-stars";
    const cacheTtl = 60 * 60 * 1000; // 1 hour
    let cancelled = false;

    async function load() {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { count, ts } = JSON.parse(cached);
          if (Date.now() - ts < cacheTtl) {
            if (!cancelled) setStars(count);
            return;
          }
        }
      } catch {}

      try {
        const res = await fetch("/api/stars");
        if (!res.ok) return;
        const data = (await res.json()) as { stars?: number | null };
        if (cancelled) return;
        if (typeof data.stars === "number") {
          setStars(data.stars);
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ count: data.stars, ts: Date.now() })
          );
        }
      } catch {}
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return stars;
}
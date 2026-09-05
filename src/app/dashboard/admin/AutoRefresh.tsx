"use client";

import { useEffect } from "react";

export function AutoRefresh({ intervalMs }: { intervalMs: number }) {
  useEffect(() => {
    const timer = setTimeout(() => window.location.reload(), intervalMs);
    return () => clearTimeout(timer);
  }, [intervalMs]);

  return null;
}

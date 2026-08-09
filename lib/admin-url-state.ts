"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useAdminUrlState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const update = useCallback((patch: Record<string, string | number | null | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === undefined || value === "" || value === "todos" || value === 1 || value === "1") next.delete(key);
      else next.set(key, String(value));
    }
    window.history.replaceState(null, "", `${pathname}${next.size ? `?${next}` : ""}`);
  }, [pathname, searchParams]);
  return { searchParams, update };
}

export function adminPageParam(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

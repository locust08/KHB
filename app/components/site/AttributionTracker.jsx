"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { buildAttributionPayload } from "@/src/lib/tracking/attribution";

export default function AttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const nextUrl = `${pathname}${query ? `?${query}` : ""}`;
    buildAttributionPayload(nextUrl);
  }, [pathname, searchParams]);

  return null;
}

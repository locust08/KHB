"use client";

import { useEffect } from "react";

import { persistAttributionSnapshot } from "@/src/lib/tracking/attribution";

export default function AttributionTracker() {
  useEffect(() => {
    persistAttributionSnapshot();
  }, []);

  return null;
}

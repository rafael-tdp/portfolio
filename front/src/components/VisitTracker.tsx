"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api";

interface VisitTrackerProps {
  slug: string;
}

export default function VisitTracker({ slug }: VisitTrackerProps) {
  const tracked = useRef(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Don't track if preview mode (owner viewing from dashboard)
    if (searchParams.get("preview") === "true") {
      return;
    }

    // Don't track if user is logged in (it's the owner viewing their own page)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      return;
    }

    const trackVisit = async () => {
      try {
        await api.trackVisit(slug);
      } catch (err) {
        // Silently fail - tracking should not break the page
        console.warn("[VisitTracker] Visit tracking failed", err);
      }
    };

    trackVisit();
  }, [slug, searchParams]);

  // This component renders nothing
  return null;
}

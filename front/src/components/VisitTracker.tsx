"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

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
      console.log("[VisitTracker] Visit not tracked: preview mode");
      return;
    }

    // Don't track if user is logged in (it's the owner viewing their own page)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      console.log("[VisitTracker] Visit not tracked: user is logged in");
      return;
    }

    const trackVisit = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";
        console.log("[VisitTracker] Tracking visit for slug:", slug, "to:", base);
        const res = await fetch(`${base}/api/visits/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        console.log("[VisitTracker] Response:", res.status, data);
      } catch (err) {
        // Silently fail - tracking should not break the page
        console.warn("[VisitTracker] Visit tracking failed", err);
      }
    };

    trackVisit();
  }, [slug]);

  // This component renders nothing
  return null;
}

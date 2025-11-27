"use client";

import { useEffect, useRef } from "react";

interface VisitTrackerProps {
  slug: string;
}

export default function VisitTracker({ slug }: VisitTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Don't track if user is logged in (it's the owner viewing their own page)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      console.log("Visit not tracked: user is logged in");
      return;
    }

    const trackVisit = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";
        await fetch(`${base}/api/visits/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
      } catch (err) {
        // Silently fail - tracking should not break the page
        console.warn("Visit tracking failed", err);
      }
    };

    trackVisit();
  }, [slug]);

  // This component renders nothing
  return null;
}

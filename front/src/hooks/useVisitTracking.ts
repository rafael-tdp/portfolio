"use client";

import { useEffect, useRef, useCallback } from "react";
import * as api from "@/lib/api";

type SectionsViewed = {
  cv: boolean;
  coverLetter: boolean;
  skills: boolean;
  experiences: boolean;
  projects: boolean;
};

export function useVisitTracking(slug: string | null) {
  const visitIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const sectionsViewedRef = useRef<SectionsViewed>({
    cv: false,
    coverLetter: false,
    skills: false,
    experiences: false,
    projects: false,
  });
  const lastUpdateRef = useRef<number>(0);
  const scrollDepthRef = useRef<number>(0);

  // Initialize visit tracking
  useEffect(() => {
    if (!slug) return;

    const initVisit = async () => {
      try {
        const result = await api.trackVisit(slug);
        if (result.visitId) {
          visitIdRef.current = result.visitId;
        }
      } catch (err) {
        console.warn("Failed to track visit", err);
      }
    };

    initVisit();
    startTimeRef.current = Date.now();
  }, [slug]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const depth = scrollHeight > 0 ? Math.round((scrolled / scrollHeight) * 100) : 0;
      scrollDepthRef.current = Math.max(scrollDepthRef.current, depth);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mark a section as viewed
  const markSectionViewed = useCallback((section: keyof SectionsViewed) => {
    sectionsViewedRef.current[section] = true;
  }, []);

  // Send update to server
  const sendUpdate = useCallback(async () => {
    if (!visitIdRef.current) return;

    const now = Date.now();
    // Throttle updates to every 5 seconds minimum
    if (now - lastUpdateRef.current < 5000) return;
    lastUpdateRef.current = now;

    const timeSpent = Math.round((now - startTimeRef.current) / 1000);

    try {
      await api.updateVisit(visitIdRef.current, {
        timeSpent,
        sectionsViewed: sectionsViewedRef.current,
        scrollDepth: scrollDepthRef.current,
      });
    } catch (err) {
      console.warn("Failed to update visit", err);
    }
  }, []);

  // Send updates periodically and on page leave
  useEffect(() => {
    // Update every 10 seconds
    const interval = setInterval(sendUpdate, 10000);

    // Send update when page becomes hidden (user switches tab or closes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendUpdate();
      }
    };

    // Send update before page unload
    const handleBeforeUnload = () => {
      if (visitIdRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        // Use sendBeacon for reliable delivery on page unload
        const data = JSON.stringify({
          visitId: visitIdRef.current,
          timeSpent,
          sectionsViewed: sectionsViewedRef.current,
          scrollDepth: scrollDepthRef.current,
        });
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/api/visits/update`,
          new Blob([data], { type: "application/json" })
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Final update on unmount
      sendUpdate();
    };
  }, [sendUpdate]);

  return {
    markSectionViewed,
    visitId: visitIdRef.current,
  };
}

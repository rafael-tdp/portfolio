"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api";

interface VisitTrackerProps {
  slug: string;
  onSectionView?: (section: "cv" | "coverLetter" | "skills" | "experiences" | "projects") => void;
}

type SectionsViewed = {
  cv: boolean;
  coverLetter: boolean;
  skills: boolean;
  experiences: boolean;
  projects: boolean;
};

export default function VisitTracker({ slug }: VisitTrackerProps) {
  const tracked = useRef(false);
  const visitIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const sectionsViewedRef = useRef<SectionsViewed>({
    cv: false,
    coverLetter: false,
    skills: false,
    experiences: false,
    projects: false,
  });
  const scrollDepthRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const searchParams = useSearchParams();

  const shouldTrack = useCallback(() => {
    // Don't track if preview mode
    if (searchParams.get("preview") === "true") return false;
    // Don't track if user is logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) return false;
    return true;
  }, [searchParams]);

  // Send update to server
  const sendUpdate = useCallback(async () => {
    if (!visitIdRef.current || !shouldTrack()) return;

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
      console.warn("[VisitTracker] Failed to update visit", err);
    }
  }, [shouldTrack]);

  // Initial tracking
  useEffect(() => {
    if (tracked.current || !shouldTrack()) return;
    tracked.current = true;

    const trackVisit = async () => {
      try {
        const result = await api.trackVisit(slug);
        if (result.visitId) {
          visitIdRef.current = result.visitId;
        }
      } catch (err) {
        console.warn("[VisitTracker] Visit tracking failed", err);
      }
    };

    trackVisit();
    startTimeRef.current = Date.now();
  }, [slug, shouldTrack]);

  // Track scroll depth
  useEffect(() => {
    if (!shouldTrack()) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const depth = scrollHeight > 0 ? Math.round((scrolled / scrollHeight) * 100) : 0;
      scrollDepthRef.current = Math.max(scrollDepthRef.current, depth);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldTrack]);

  // Observe collapsible sections opening
  useEffect(() => {
    if (!shouldTrack()) return;

    // Use MutationObserver to detect when sections are opened
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" || mutation.type === "childList") {
          // Check for open sections by looking at CollapsibleSection containers
          const cvSection = document.querySelector('[data-section="cv"]');
          const coverLetterSection = document.querySelector('[data-section="coverLetter"]');
          
          // Also detect by checking if content is visible (for CollapsibleSection)
          document.querySelectorAll('[data-section]').forEach((el) => {
            const sectionName = el.getAttribute('data-section') as keyof SectionsViewed;
            const isOpen = el.getAttribute('data-open') === 'true';
            if (sectionName && isOpen) {
              sectionsViewedRef.current[sectionName] = true;
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['data-open'],
    });

    return () => observer.disconnect();
  }, [shouldTrack]);

  // Periodic updates and cleanup
  useEffect(() => {
    if (!shouldTrack()) return;

    // Update every 10 seconds
    const interval = setInterval(sendUpdate, 10000);

    // Send update when page becomes hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendUpdate();
      }
    };

    // Send update before page unload using sendBeacon
    const handleBeforeUnload = () => {
      if (visitIdRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        const data = JSON.stringify({
          visitId: visitIdRef.current,
          timeSpent,
          sectionsViewed: sectionsViewedRef.current,
          scrollDepth: scrollDepthRef.current,
        });
        navigator.sendBeacon(
          `${API_BASE}/api/visits/update`,
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
      sendUpdate();
    };
  }, [sendUpdate, shouldTrack]);

  return null;
}

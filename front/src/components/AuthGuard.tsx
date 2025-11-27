"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setStatus("unauthenticated");
      router.replace("/auth/login");
      return;
    }

    // Verify token with backend
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";
        const res = await fetch(`${base}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem("token");
          setStatus("unauthenticated");
          router.replace("/auth/login");
          return;
        }
        setStatus("authenticated");
      } catch (err) {
        console.warn("Auth check failed", err);
        localStorage.removeItem("token");
        setStatus("unauthenticated");
        router.replace("/auth/login");
      }
    })();
  }, [router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Vérification de l&apos;authentification...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Redirection vers la connexion...</div>
      </div>
    );
  }

  return <>{children}</>;
}

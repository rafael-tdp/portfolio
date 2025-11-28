"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";

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
        const user = await api.getMe();
        if (!user) {
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

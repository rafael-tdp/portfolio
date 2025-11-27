"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";
import AuthGuard from "../../components/AuthGuard";
import Button from "../../components/Button";
import { LuEye, LuUsers, LuClock } from "react-icons/lu";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

type VisitStats = {
  totalVisits: number;
  applications: Array<{
    applicationId: string;
    jobTitle: string;
    companyId: string;
    totalVisits: number;
    uniqueVisitors: number;
    lastVisit: string | null;
  }>;
  visits: Array<{
    _id: string;
    createdAt: string;
    ip?: string;
    userAgent?: string;
    company?: { name: string; logoUrl?: string };
    application?: { jobTitle: string };
  }>;
};

function DashboardContent() {
  const [user, setUser] = React.useState<any | null>(null);
  const [visitStats, setVisitStats] = React.useState<VisitStats | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!t) return;
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";
        const res = await fetch(`${base}/api/auth/me`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) return setUser(null);
        const json = await res.json();
        setUser(json.user || json.profile || json || null);
      } catch (err) {
        console.warn("Failed to load profile", err);
        setUser(null);
      }
    })();
  }, []);

  // Load visit stats
  React.useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!t) {
      setLoadingStats(false);
      return;
    }
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";
        const res = await fetch(`${base}/api/visits/stats`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) {
          setVisitStats(null);
          return;
        }
        const json = await res.json();
        setVisitStats(json);
      } catch (err) {
        console.warn("Failed to load visit stats", err);
        setVisitStats(null);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, []);

  function logout() {
    if (typeof window !== "undefined") {
      setLoggingOut(true);
      localStorage.removeItem("token");
      setUser(null);
      toast.success("Déconnexion réussie");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDeviceFromUA(ua?: string) {
    if (!ua) return "Inconnu";
    if (/mobile/i.test(ua)) return "📱 Mobile";
    if (/tablet/i.test(ua)) return "📱 Tablette";
    return "💻 Desktop";
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <div className="font-medium">{user.name || user.fullName || user.email}</div>
                  {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
                </div>
                <Button
                  onClick={logout}
                  loading={loggingOut}
                  className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                >
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-sm text-sky-600">Se connecter</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        {!loadingStats && visitStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded shadow p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                <LuEye className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{visitStats.totalVisits}</div>
                <div className="text-sm text-gray-500">Visites totales</div>
              </div>
            </div>
            <div className="bg-white rounded shadow p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <LuUsers className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {visitStats.applications.reduce((sum, a) => sum + a.uniqueVisitors, 0)}
                </div>
                <div className="text-sm text-gray-500">Visiteurs uniques</div>
              </div>
            </div>
            <div className="bg-white rounded shadow p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                <LuClock className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {visitStats.visits[0]
                    ? formatDate(visitStats.visits[0].createdAt)
                    : "—"}
                </div>
                <div className="text-sm text-gray-500">Dernière visite</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent visits */}
        {!loadingStats && visitStats && visitStats.visits.length > 0 && (
          <div className="bg-white rounded shadow mb-8">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-medium">Visites récentes</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {visitStats.visits.slice(0, 10).map((v) => (
                <div key={v._id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{getDeviceFromUA(v.userAgent)}</div>
                    <div>
                      <div className="text-sm font-medium">
                        {v.company?.name || "Entreprise"} — {v.application?.jobTitle || "Poste"}
                      </div>
                      <div className="text-xs text-gray-400">{v.ip || "IP inconnue"}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{formatDate(v.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats per application */}
        {!loadingStats && visitStats && visitStats.applications.length > 0 && (
          <div className="bg-white rounded shadow mb-8">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-medium">Statistiques par candidature</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {visitStats.applications.map((app) => (
                <div key={app.applicationId} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{app.jobTitle || "Sans titre"}</div>
                    <div className="text-xs text-gray-400">
                      Dernière visite : {formatDate(app.lastVisit)}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-sky-600">{app.totalVisits}</div>
                      <div className="text-xs text-gray-400">visites</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-emerald-600">{app.uniqueVisitors}</div>
                      <div className="text-xs text-gray-400">uniques</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loadingStats && (!visitStats || visitStats.totalVisits === 0) && (
          <div className="bg-white rounded shadow p-6 mb-8 text-center text-gray-500">
            <LuEye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <div>Aucune visite enregistrée pour le moment.</div>
            <div className="text-sm mt-1">Partagez vos pages de candidature pour commencer à recevoir des visites !</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/applications"
            className="block p-4 bg-white rounded shadow hover:shadow-md"
          >
            <div className="font-medium">Mes candidatures</div>
            <div className="text-sm text-gray-500">Voir et gérer vos candidatures</div>
          </Link>

          <Link
            href="/dashboard/create"
            className="block p-4 bg-white rounded shadow hover:shadow-md"
          >
            <div className="font-medium">Nouvelle candidature</div>
            <div className="text-sm text-gray-500">Créer une nouvelle candidature</div>
          </Link>
        </div>
      </div>
    </div>
  );
}


"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";
import AuthGuard from "../../components/AuthGuard";
import Button from "../../components/Button";
import { LuEye, LuUsers, LuClock, LuLogOut } from "react-icons/lu";
import * as api from "@/lib/api";

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
        const user = await api.getMe();
        setUser(user);
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
        const stats = await api.getVisitStats();
        setVisitStats(stats);
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
                    <LuLogOut className="w-4 h-4" />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <LuEye className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{visitStats.totalVisits}</div>
                <div className="text-sm text-gray-400">Visites totales</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <LuUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {visitStats.applications.reduce((sum, a) => sum + a.uniqueVisitors, 0)}
                </div>
                <div className="text-sm text-gray-400">Visiteurs uniques</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <LuClock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {visitStats.visits[0]
                    ? formatDate(visitStats.visits[0].createdAt).replace(",", " à ")
                    : "—"}
                </div>
                <div className="text-sm text-gray-400">Dernière visite</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent visits */}
        {!loadingStats && visitStats && visitStats.visits.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-800">Visites récentes</h2>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {visitStats.visits.slice(0, 20).map((v, index) => (
                <div
                  key={v._id}
                  className={`px-5 py-2 flex items-center justify-between hover:bg-gray-50/50 transition-colors ${
                    index !== visitStats.visits.slice(0, 20).length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-base shadow-sm">
                      {getDeviceFromUA(v.userAgent).split(" ")[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {v.company?.name || "Entreprise"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {v.application?.jobTitle || "Poste"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{formatDate(v.createdAt)}</div>
                    {/* <div className="text-xs text-gray-300 mt-0.5 font-mono">{v.ip || ""}</div> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats per application */}
        {!loadingStats && visitStats && visitStats.applications.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-800">Statistiques par candidature</h2>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {visitStats.applications.map((app, index) => (
                <div
                  key={app.applicationId}
                  className={`px-5 py-2 flex items-center justify-between hover:bg-gray-50/50 transition-colors ${
                    index !== visitStats.applications.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate text-sm">{app.jobTitle || "Sans titre"}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {app.lastVisit ? `Dernière visite : ${formatDate(app.lastVisit)}` : "Aucune visite"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="flex flex-col items-center px-3 py-1.5 bg-sky-50 rounded-lg min-w-[60px]">
                      <div className="text-sm font-bold text-sky-600">{app.totalVisits}</div>
                      <div className="text-[7px] uppercase tracking-wide text-sky-400 font-medium">visites</div>
                    </div>
                    <div className="flex flex-col items-center px-1 py-1 bg-emerald-50 rounded-lg min-w-[60px]">
                      <div className="text-sm font-bold text-emerald-600">{app.uniqueVisitors}</div>
                      <div className="text-[7px] uppercase tracking-wide text-emerald-400 font-medium">uniques</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loadingStats && (!visitStats || visitStats.totalVisits === 0) && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <LuEye className="w-8 h-8 text-gray-300" />
            </div>
            <div className="text-gray-600 font-medium">Aucune visite enregistrée</div>
            <div className="text-sm text-gray-400 mt-1">Partagez vos pages de candidature pour commencer à recevoir des visites</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/applications"
            className="block p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div className="font-semibold text-gray-800">Mes candidatures</div>
            <div className="text-sm text-gray-400 mt-1">Voir et gérer vos candidatures</div>
          </Link>

          <Link
            href="/dashboard/create"
            className="block p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div className="font-semibold text-gray-800">Nouvelle candidature</div>
            <div className="text-sm text-gray-400 mt-1">Créer une nouvelle candidature</div>
          </Link>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuArrowLeft, LuExternalLink, LuQrCode } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import AuthGuard from "../../../../../components/AuthGuard";
import ApplicationTracking from "../../../../../components/ApplicationTracking";
import * as api from "../../../../../lib/api";

// Status display configuration
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-700" },
  sent: { label: "Envoyée", color: "bg-blue-100 text-blue-700" },
  interview: { label: "Entretien", color: "bg-yellow-100 text-yellow-700" },
  offer: { label: "Offre", color: "bg-green-100 text-green-700" },
  accepted: { label: "Acceptée", color: "bg-green-200 text-green-800" },
  rejected: { label: "Refusée", color: "bg-red-100 text-red-700" },
  withdrawn: { label: "Retirée", color: "bg-gray-200 text-gray-600" },
};

export default function TrackingPage(props: { params: any }) {
  return (
    <AuthGuard>
      <TrackingContent params={props.params} />
    </AuthGuard>
  );
}

function TrackingContent({ params: rawParams }: { params: any }) {
  const params = (React as any).use ? (React as any).use(rawParams) : rawParams;
  const id = params?.id as string | undefined;
  const [application, setApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        const app = await api.getApplication(id);
        if (!mounted) return;
        setApplication(app);
      } catch (err) {
        console.error("Failed to load application", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleUpdate = (updatedApp: any) => {
    setApplication(updatedApp);
  };

  function resolveLogoUrl(url: string | null | undefined) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${base}${url}`;
  }

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!application) return <div className="p-6">Candidature introuvable</div>;

  const publicUrl = application.slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${application.slug}`
    : null;

  return (
    <div className="mx-auto px-4 py-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <LuArrowLeft className="w-4 h-4" />
          <span>Retour aux candidatures</span>
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden bg-gray-100">
              {application.company?.logoUrl ? (
                <img
                  src={resolveLogoUrl(application.company.logoUrl) || undefined}
                  alt={application.company?.name || "logo"}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-gray-400">No logo</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900">
                {application.company?.name || "Entreprise inconnue"}
              </h1>
              <p className="text-gray-600">{application.jobTitle || "Poste non spécifié"}</p>
              <div className="flex items-center gap-3 mt-2">
                {application.status && (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      STATUS_CONFIG[application.status]?.color || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUS_CONFIG[application.status]?.label || application.status}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  Créée le{" "}
                  {new Date(application.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/dashboard/applications/${id}`)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Modifier"
              >
                <MdEdit className="w-5 h-5" />
              </button>
              {publicUrl && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Voir la page publique"
                >
                  <LuExternalLink className="w-5 h-5" />
                </a>
              )}
              {publicUrl && (
                <button
                  onClick={() => router.push(`/dashboard/applications/${id}/qrcode`)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="QR Code"
                >
                  <LuQrCode className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tracking component */}
        <ApplicationTracking
          applicationId={id!}
          privateNotes={application.privateNotes || []}
          reminders={application.reminders || []}
          timeline={application.timeline || []}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}

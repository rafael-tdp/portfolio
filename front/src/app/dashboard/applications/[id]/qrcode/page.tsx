"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LuArrowLeft, LuQrCode } from "react-icons/lu";
import AuthGuard from "../../../../../components/AuthGuard";
import QRCodeGenerator from "../../../../../components/QRCodeGenerator";
import * as api from "../../../../../lib/api";

interface Application {
  company?: {
    publicSlug?: string;
    logoUrl?: string;
    name?: string;
  };
  jobTitle?: string;
}

export default function QRCodePage(props: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard>
      <QRCodeContent params={props.params} />
    </AuthGuard>
  );
}

function QRCodeContent({ params: rawParams }: { params: Promise<{ id: string }> }) {
  const params = React.use(rawParams);
  const id = params?.id;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        const app = await api.getApplication(id);
        if (!mounted) return;
        setApplication(app);
      } catch {
        console.error("Failed to load application");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  function resolveLogoUrl(url: string | null | undefined) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${base}${url}`;
  }

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!application) return <div className="p-6">Candidature introuvable</div>;

  const publicSlug = application.company?.publicSlug;
  if (!publicSlug) {
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <LuQrCode className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Cette candidature n&apos;a pas de lien public configuré.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${publicSlug}`
      : `/${publicSlug}`;

  return (
    <div className="mx-auto px-4 py-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/dashboard/applications/${id}/tracking`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <LuArrowLeft className="w-4 h-4" />
          <span>Retour au suivi</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden bg-gray-100">
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
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                QR Code - {application.company?.name}
              </h1>
              <p className="text-gray-600">{application.jobTitle}</p>
            </div>
          </div>
        </div>

        {/* QR Code Generator */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <QRCodeGenerator
            url={publicUrl}
            companyName={application.company?.name}
            jobTitle={application.jobTitle}
            size={280}
            logoUrl={resolveLogoUrl(application.company?.logoUrl)}
          />
        </div>
      </div>
    </div>
  );
}

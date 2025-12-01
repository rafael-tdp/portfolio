"use client";

import React, { useState } from "react";
import { LuX, LuMaximize, LuMinimize, LuExternalLink } from "react-icons/lu";
import CvViewer from "./CvViewer";
import ClientCoverLetterViewer from "./ClientCoverLetterViewer";
import cvSample from "../data/cvSample";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  jobTitle: string;
  coverLetter: string;
  softSkills: string[];
  hardSkills: Record<string, string>;
  companyTheme: Record<string, string> | null;
  logoUrl?: string | null;
}

export default function PreviewModal({
  isOpen,
  onClose,
  companyName,
  jobTitle,
  coverLetter,
  softSkills,
  hardSkills,
  companyTheme,
  logoUrl,
}: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"cv" | "coverLetter">("cv");
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  // Build theme with defaults
  const theme = {
    primary: companyTheme?.primary || "#0b74de",
    secondary: companyTheme?.secondary || companyTheme?.primary || "#0b74de",
    accent: companyTheme?.accent || "#ffffff",
    background: companyTheme?.background || "#f8fafc",
    text: companyTheme?.text || "#111827",
    title: companyTheme?.title || "#fff",
  };

  // Build CV data with user's skills
  const cvData = {
    ...cvSample,
    softSkills: softSkills.length > 0 ? softSkills : cvSample.softSkills,
    skills: Object.keys(hardSkills).length > 0 ? hardSkills : cvSample.skills,
  };

  // Cover letter data
  const coverLetterData = {
    text: coverLetter,
    applicantName: cvSample.name,
    date: new Date().toLocaleDateString("fr-FR"),
    companyName,
    jobTitle,
    logoUrl,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`absolute bg-white shadow-2xl transition-all duration-300 ${
          isFullscreen
            ? "inset-0"
            : "inset-4 sm:inset-8 md:inset-12 lg:inset-16 rounded-xl"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Aperçu - {companyName}
            </h2>
            <span className="text-sm text-gray-500">{jobTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title={isFullscreen ? "Réduire" : "Plein écran"}
            >
              {isFullscreen ? (
                <LuMinimize className="w-5 h-5" />
              ) : (
                <LuMaximize className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Fermer"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab("cv")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "cv"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mon CV
          </button>
          <button
            onClick={() => setActiveTab("coverLetter")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "coverLetter"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Lettre de motivation
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto h-[calc(100%-120px)] p-4 sm:p-6 bg-gray-100">
          {/* Simulated browser header */}
          <div className="mb-4 bg-gray-200 rounded-t-lg p-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600 truncate">
              votre-site.com/{companyName.toLowerCase().replace(/\s+/g, "-")}
            </div>
            <LuExternalLink className="w-4 h-4 text-gray-400" />
          </div>

          {/* Preview content */}
          <div className="bg-white rounded-b-lg shadow-sm overflow-hidden">
            {/* Simulated hero */}
            <div
              className="p-6 sm:p-8"
              style={{ background: theme.background }}
            >
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt={companyName}
                    className="w-16 h-16 object-contain rounded-md bg-white/10 p-1"
                  />
                )}
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: theme.title }}
                  >
                    Bienvenue {companyName} 👋
                  </h1>
                  <p className="mt-1 text-sm opacity-90" style={{ color: theme.title }}>
                    Candidature au poste de <strong>{jobTitle || "—"}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="p-6 sm:p-8">
              {activeTab === "cv" ? (
                <div className="cv-viewer-container">
                  <CvViewer
                    data={cvData}
                    pdfSrc=""
                    showHtml
                    theme={theme}
                    jobTitle={jobTitle}
                    logoUrl={logoUrl || undefined}
                  />
                </div>
              ) : (
                <div className="cover-letter-section">
                  {coverLetter ? (
                    <ClientCoverLetterViewer
                      data={coverLetterData}
                      showHtml
                      theme={theme}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>Aucune lettre de motivation générée.</p>
                      <p className="text-sm mt-2">
                        Cliquez sur &quot;Générer la lettre (IA)&quot; dans le formulaire.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-sm text-center rounded-b-xl">
          💡 Ceci est un aperçu. Le recruteur verra cette page après avoir cliqué sur le lien de partage.
        </div>
      </div>
    </div>
  );
}

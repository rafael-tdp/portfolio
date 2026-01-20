"use client";

import React from "react";
import Link from "next/link";
import AuthGuard from "../../../components/AuthGuard";
import ModelSelector from "../../../components/ModelSelector";
import { LuArrowLeft } from "react-icons/lu";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen px-4 py-4 sm:pt-12 sm:p-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 mb-6"
          >
            <LuArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </Link>

          <h1 className="text-2xl font-semibold mb-8">Paramètres</h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Modèle d'IA
              </h2>
              <ModelSelector />
            </div>

            <div className="bg-white rounded-xl border border-blue-100 p-5 bg-blue-50">
              <h3 className="font-semibold text-blue-900 mb-2">
                À propos des modèles Gemini (GRATUITS)
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <div>
                  • <strong>gemini-2.5-flash</strong> : Modèle le plus récent et performant. Recommandé. Gratuit avec limite de requêtes.
                </div>
                <div>
                  • <strong>gemini-2.0-flash</strong> : Bonne alternative si gemini-2.5 atteint son quota. Gratuit.
                </div>
                <div>
                  • <strong>gemini-1.5-flash</strong> : Version antérieure mais stable. Gratuit avec moins de limite que les versions plus récentes.
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-3">
                ⚠️ Seuls les modèles GRATUITS sont affichés. Les modèles payants (pro) ont été exclus pour éviter les frais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

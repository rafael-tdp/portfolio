"use client";

import React from "react";
import CoverLetterHtml from "./CoverLetterHtml";

type CLData = any;

export default function CoverLetterViewer({ data, showHtml = false, theme }: { data?: CLData; showHtml?: boolean; theme?: any }) {
  if (showHtml && data) {
    return (
      <div className="flex m-auto justify-center">
        <div className="border border-gray-200 shadow-lg">
          <CoverLetterHtml data={data} theme={theme} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-sm text-gray-700">
      <div className="mb-3 font-medium">Lettre de motivation</div>
      <div className="text-sm text-gray-500">Aucune lettre disponible.</div>
    </div>
  );
}

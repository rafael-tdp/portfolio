"use client";

import React from "react";
import CoverLetterHtml from "./CoverLetterHtml";

type CLData = any;

export default function CoverLetterViewer({ data, showHtml = false, theme }: { data?: CLData; showHtml?: boolean; theme?: any }) {
  if (showHtml && data) {
    // Cover letter dimensions: 794px x 1123px (A4 at 96 DPI)
    // Scale factors: mobile 0.4, sm 0.5, md 0.65, lg 1
    return (
      <div className="w-full overflow-hidden">
        {/* Container with responsive height based on scale */}
        <div className="h-[450px] sm:h-[562px] md:h-[730px] lg:h-auto overflow-hidden flex justify-center">
          <div 
            className="origin-top scale-[0.4] sm:scale-[0.5] md:scale-[0.65] lg:scale-100"
            style={{ transformOrigin: 'top center' }}
          >
            <div className="border border-gray-200 shadow-lg">
              <CoverLetterHtml data={data} theme={theme} />
            </div>
          </div>
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

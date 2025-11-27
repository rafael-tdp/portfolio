"use client";

import React from "react";
import { toast } from "sonner";
import CoverLetterHtml from "./CoverLetterHtml";
import Button from "./Button";
import { Tailwind, compile } from "@fileforge/react-print";
import { LuDownload } from "react-icons/lu";

type CLData = any;

export default function CoverLetterViewer({ data, showHtml = false, theme }: { data?: CLData; showHtml?: boolean; theme?: any }) {
  const [printing, setPrinting] = React.useState<boolean>(false);

  async function handleDownload() {
    try {
      setPrinting(true);
      const html = await getHTML();
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";
      const res = await fetch(`${BACKEND}/api/pdf/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, baseUrl: window.location.origin }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`PDF generation failed: ${res.status} ${txt}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-letter.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      toast.error("Erreur lors du téléchargement de la lettre");
    } finally {
      setPrinting(false);
    }
  }

  async function getHTML() {
    return await compile(
      <Tailwind>
        <CoverLetterHtml data={data} theme={theme} />
      </Tailwind>
    );
  }

  if (showHtml && data) {
    return (
      <div className="relative flex m-auto gap-2 justify-center">
        <div className="border border-gray-200 shadow-lg">
          <CoverLetterHtml data={data} theme={theme} />
        </div>
        <Button
          onClick={async () => {
            await handleDownload();
          }}
          disabled={printing}
          loading={printing}
          className="absolute top-0 right-2 text-white border-none"
          style={{ backgroundColor: theme?.primary }}
          icon={<LuDownload size={16} />}
        ></Button>
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

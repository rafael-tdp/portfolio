"use client";

import React, { useRef, useEffect, useState } from "react";
import { LuDownload, LuCopy, LuCheck } from "react-icons/lu";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  url: string;
  companyName?: string;
  jobTitle?: string;
  size?: number;
  logoUrl?: string | null;
}

export default function QRCodeGenerator({
  url,
  companyName,
  jobTitle,
  size = 256,
  logoUrl,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;

      try {
        // Dynamically import qrcode library
        const QRCode = (await import("qrcode")).default;

        // Generate QR code on canvas
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          color: {
            dark: "#1f2937",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H", // High error correction to allow logo overlay
        });

        // If we have a logo, overlay it in the center
        if (logoUrl) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              const logoSize = size * 0.2; // Logo takes 20% of QR code
              const x = (size - logoSize) / 2;
              const y = (size - logoSize) / 2;
              
              // Draw white background for logo
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);
              
              // Draw logo
              ctx.drawImage(img, x, y, logoSize, logoSize);
              setQrReady(true);
            };
            img.onerror = () => {
              setQrReady(true);
            };
            img.src = logoUrl;
          }
        } else {
          setQrReady(true);
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
        setQrReady(false);
      }
    };

    generateQR();
  }, [url, size, logoUrl]);

  const downloadQR = (format: "png" | "svg") => {
    if (!canvasRef.current) return;

    if (format === "png") {
      const link = document.createElement("a");
      link.download = `qrcode-${companyName || "candidature"}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
      toast.success("QR Code téléchargé");
    } else {
      // For SVG, we need to regenerate
      import("qrcode").then((QRCode) => {
        QRCode.toString(url, { type: "svg", width: size }, (err, svgString) => {
          if (err) {
            toast.error("Erreur lors de la génération");
            return;
          }
          const blob = new Blob([svgString], { type: "image/svg+xml" });
          const link = document.createElement("a");
          link.download = `qrcode-${companyName || "candidature"}.svg`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
          toast.success("QR Code SVG téléchargé");
        });
      });
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL copiée");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code Canvas */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <canvas ref={canvasRef} width={size} height={size} />
      </div>

      {/* Info */}
      {(companyName || jobTitle) && (
        <div className="text-center">
          {companyName && (
            <p className="font-medium text-gray-900">{companyName}</p>
          )}
          {jobTitle && <p className="text-sm text-gray-600">{jobTitle}</p>}
        </div>
      )}

      {/* URL display */}
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg max-w-full">
        <span className="text-sm text-gray-600 truncate flex-1">{url}</span>
        <button
          onClick={copyUrl}
          className="p-1 text-gray-500 hover:text-gray-700 flex-shrink-0"
          title="Copier l'URL"
        >
          {copied ? (
            <LuCheck className="w-4 h-4 text-green-600" />
          ) : (
            <LuCopy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Download buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => downloadQR("png")}
          disabled={!qrReady}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuDownload className="w-4 h-4" />
          PNG
        </button>
        <button
          onClick={() => downloadQR("svg")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <LuDownload className="w-4 h-4" />
          SVG
        </button>
      </div>

      {/* Usage instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md">
        <h4 className="font-medium text-blue-900 mb-2">💡 Conseils d&apos;utilisation</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Imprimez ce QR code sur votre CV papier</li>
          <li>• Le recruteur peut le scanner pour accéder à votre profil complet</li>
          <li>• Utilisez le format SVG pour une meilleure qualité d&apos;impression</li>
          <li>• Testez le QR code avant impression</li>
        </ul>
      </div>
    </div>
  );
}

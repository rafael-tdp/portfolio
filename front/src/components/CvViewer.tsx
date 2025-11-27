"use client";

import React from "react";
import { toast } from "sonner";
import CvHtml from "./CvHtml";
import Button from "./Button";
import { Tailwind, compile } from "@fileforge/react-print";
import { LuDownload } from "react-icons/lu";

type CVData = any;

export default function CvViewer({
	pdfSrc,
	data,
	showHtml = false,
	theme,
	jobTitle,
    logoUrl,
}: {
	pdfSrc?: string;
	data?: CVData;
	showHtml?: boolean;
	theme?: any;
	jobTitle?: string;
	logoUrl?: string;
}) {
	const [showHtmlState, setShowHtmlState] = React.useState<boolean>(showHtml);
	const [printing, setPrinting] = React.useState<boolean>(false);

	async function handlePrint() {
		try {
			setPrinting(true);
			const el = document.getElementById("cv-content");
			if (!el) {
				toast.error("CV content not found on the page");
				setPrinting(false);
				return;
			}

			const html = await getHTML();
			const BACKEND =
				process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";

			const res = await fetch(`${BACKEND}/api/pdf/generate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ html, baseUrl: window.location.origin }),
			});

			if (!res.ok) {
				const txt = await res.text();
				throw new Error(`PDF generation failed: ${res.status} ${txt}`);
			}

			const contentType = res.headers.get("content-type") || "";
			if (contentType.includes("application/json")) {
				const j = await res.json();
				if (j.pdfBase64) {
					const b = Uint8Array.from(atob(j.pdfBase64), (c) =>
						c.charCodeAt(0)
					);
					const blob = new Blob([b], { type: "application/pdf" });
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `cv.pdf`;
					document.body.appendChild(a);
					a.click();
					a.remove();
					URL.revokeObjectURL(url);
				}
				setPrinting(false);
				return;
			}

			// Otherwise assume PDF binary
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `cv.pdf`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (e: any) {
			console.error(e);
			toast.error("Erreur lors du téléchargement du CV");
		} finally {
			setPrinting(false);
		}
	}

	async function getHTML() {
		return await compile(
			<Tailwind>
				<CvHtml data={data} theme={theme} jobTitle={jobTitle} logoUrl={logoUrl} />
			</Tailwind>
		);
	}

	// Simple viewer: show HTML replica or embed a static PDF if provided.
	if (showHtmlState && data) {
		return (
			<div className="relative flex m-auto gap-2 justify-center">
				<div className="border border-gray-200 shadow-lg">
					<CvHtml data={data} theme={theme} jobTitle={jobTitle} logoUrl={logoUrl} />
				</div>
				<Button
					onClick={async () => {

						await handlePrint();
					}}
					disabled={printing}
					loading={printing}
					className="absolute top-0 right-2 text-white border-none"
					style={{
						backgroundColor: theme?.primary,
					}}
					icon={<LuDownload size={16} />}
				></Button>
			</div>
		);
	}

	if (pdfSrc) {
		return (
			<div>
				<div className="flex items-center gap-3 mb-4">
					<button
						className="px-3 py-1 bg-gray-100 border rounded text-sm"
						onClick={() => setShowHtmlState(true)}
					>
						Afficher HTML
					</button>
					<a
						href={pdfSrc}
						target="_blank"
						rel="noreferrer"
						className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
					>
						Ouvrir le PDF
					</a>
				</div>

				<div className="w-full max-w-4xl h-[1100px] border border-gray-200 shadow-sm bg-white">
					<iframe
						src={pdfSrc}
						title="CV PDF"
						className="w-full h-full bg-white"
						style={{ border: "none" }}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 text-sm text-gray-700">
			<div className="mb-3 font-medium">CV Viewer</div>
			<div>No PDF or CV data provided.</div>
			<div className="mt-2 text-xs text-gray-500">
				To embed your PDF, place the file under `public/` and pass its
				path to `pdfSrc`, for example: <code>/cv-fullstack.pdf</code>.
			</div>
		</div>
	);
}

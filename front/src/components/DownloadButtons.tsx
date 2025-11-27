"use client";

import React from "react";
import { toast } from "sonner";
import { LuDownload, LuExternalLink } from "react-icons/lu";
import CvHtml from "./CvHtml";
import CoverLetterHtml from "./CoverLetterHtml";
import { Tailwind, compile } from "@fileforge/react-print";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface DownloadButtonsProps {
	cvData: any;
	coverLetterData: any;
	theme: any;
	jobTitle?: string;
	logoUrl?: string;
	companyName?: string;
	applicantName?: string;
	portfolioUrl?: string;
}

export default function DownloadButtons({
	cvData,
	coverLetterData,
	theme,
	jobTitle,
	logoUrl,
	companyName,
	applicantName,
	portfolioUrl = "/",
}: DownloadButtonsProps) {
	const [downloadingAll, setDownloadingAll] = React.useState(false);
	const [downloadingCv, setDownloadingCv] = React.useState(false);
	const [downloadingLetter, setDownloadingLetter] = React.useState(false);

	const generateCvFilename = () => {
		const parts = ["CV"];
		if (applicantName) parts.push(applicantName.replace(/\s+/g, "_"));
		if (companyName) parts.push(companyName.replace(/\s+/g, "_"));
		return `${parts.join("_")}.pdf`;
	};

	const generateLetterFilename = () => {
		const parts = ["Lettre_Motivation"];
		if (applicantName) parts.push(applicantName.replace(/\s+/g, "_"));
		if (companyName) parts.push(companyName.replace(/\s+/g, "_"));
		return `${parts.join("_")}.pdf`;
	};

	async function downloadPdf(
		html: string,
		filename: string,
		title: string
	): Promise<boolean> {
		const BACKEND =
			process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";

		const res = await fetch(`${BACKEND}/api/pdf/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				html,
				baseUrl: window.location.origin,
				title,
			}),
		});

		if (!res.ok) {
			throw new Error(`PDF generation failed: ${res.status}`);
		}

		const contentType = res.headers.get("content-type") || "";
		let blob: Blob;

		if (contentType.includes("application/json")) {
			const j = await res.json();
			if (j.pdfBase64) {
				const b = Uint8Array.from(atob(j.pdfBase64), (c) =>
					c.charCodeAt(0)
				);
				blob = new Blob([b], { type: "application/pdf" });
			} else {
				throw new Error("No PDF data in response");
			}
		} else {
			blob = await res.blob();
		}

		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);

		return true;
	}

	async function handleDownloadAll() {
		try {
			setDownloadingAll(true);

			// Generate CV HTML
			const cvHtml = await compile(
				<Tailwind>
					<CvHtml
						data={cvData}
						theme={theme}
						jobTitle={jobTitle}
						logoUrl={logoUrl}
					/>
				</Tailwind>
			);

			// Generate Cover Letter HTML
			const letterHtml = await compile(
				<Tailwind>
					<CoverLetterHtml data={coverLetterData} theme={theme} />
				</Tailwind>
			);

			// Download CV
			await downloadPdf(
				cvHtml,
				generateCvFilename(),
				generateCvFilename().replace(".pdf", "")
			);

			// Small delay between downloads
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Download Cover Letter
			await downloadPdf(
				letterHtml,
				generateLetterFilename(),
				generateLetterFilename().replace(".pdf", "")
			);

			toast.success("Documents téléchargés avec succès");
		} catch (e: any) {
			console.error(e);
			toast.error("Erreur lors du téléchargement des documents");
		} finally {
			setDownloadingAll(false);
		}
	}

	async function handleDownloadCv() {
		try {
			setDownloadingCv(true);
			const cvHtml = await compile(
				<Tailwind>
					<CvHtml
						data={cvData}
						theme={theme}
						jobTitle={jobTitle}
						logoUrl={logoUrl}
					/>
				</Tailwind>
			);
			await downloadPdf(
				cvHtml,
				generateCvFilename(),
				generateCvFilename().replace(".pdf", "")
			);
			toast.success("CV téléchargé");
		} catch (e: any) {
			console.error(e);
			toast.error("Erreur lors du téléchargement du CV");
		} finally {
			setDownloadingCv(false);
		}
	}

	async function handleDownloadLetter() {
		try {
			setDownloadingLetter(true);
			const letterHtml = await compile(
				<Tailwind>
					<CoverLetterHtml data={coverLetterData} theme={theme} />
				</Tailwind>
			);
			await downloadPdf(
				letterHtml,
				generateLetterFilename(),
				generateLetterFilename().replace(".pdf", "")
			);
			toast.success("Lettre téléchargée");
		} catch (e: any) {
			console.error(e);
			toast.error("Erreur lors du téléchargement de la lettre");
		} finally {
			setDownloadingLetter(false);
		}
	}

	return (
		<div className="flex items-center gap-4 text-sm flex-wrap">
			<button
				onClick={handleDownloadAll}
				disabled={downloadingAll || downloadingCv || downloadingLetter}
				className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
			>
				{downloadingAll ? (
					<AiOutlineLoading3Quarters className="animate-spin" />
				) : (
					<LuDownload size={14} />
				)}
				<span className="underline underline-offset-2">
					Télécharger tout
				</span>
			</button>

			<span className="text-gray-300">|</span>

			<button
				onClick={handleDownloadCv}
				disabled={downloadingAll || downloadingCv || downloadingLetter}
				className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
			>
				{downloadingCv ? (
					<AiOutlineLoading3Quarters className="animate-spin" />
				) : (
					<LuDownload size={14} />
				)}
				<span className="underline underline-offset-2">CV</span>
			</button>

			<span className="text-gray-300">|</span>

			<button
				onClick={handleDownloadLetter}
				disabled={downloadingAll || downloadingCv || downloadingLetter}
				className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
			>
				{downloadingLetter ? (
					<AiOutlineLoading3Quarters className="animate-spin" />
				) : (
					<LuDownload size={14} />
				)}
				<span className="underline underline-offset-2">Lettre</span>
			</button>

			<span className="text-gray-300">|</span>

			<a
				href={portfolioUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
			>
				<LuExternalLink size={14} />
				<span className="underline underline-offset-2">
					Mon portfolio
				</span>
			</a>
		</div>
	);
}

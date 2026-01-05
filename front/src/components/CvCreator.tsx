"use client";

import React, { useState } from "react";
import { LuEye, LuDownload } from "react-icons/lu";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "sonner";
import FormSectionTitle from "./FormSectionTitle";
import Button from "./Button";
import PreviewModal from "./PreviewModal";
import ProjectSelector from "./ProjectSelector";
import CvHtml from "./CvHtml";
import { Tailwind, compile } from "@fileforge/react-print";
import cvSample from "../data/cvSample";
import * as api from "@/lib/api";

export default function CvCreator() {
	const [primaryColor, setPrimaryColor] = useState("#0b5ed7");
	const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
	const [hardSkills, setHardSkills] = useState<Record<string, string>>(cvSample.skills);
	const [showPreview, setShowPreview] = useState(false);
	const [downloadingCv, setDownloadingCv] = useState(false);

	// Get projects from cvSample
	const cvProjects = ((cvSample.projects || []) as Array<{
		name: string;
		period: string;
		description: string[];
		tags: string[];
		isDefault?: boolean;
	}>).map(p => ({
		...p,
		isDefault: p.isDefault !== false,
	}));

	// Define theme early so it can be used in functions
	const theme = {
		primary: primaryColor,
		secondary: primaryColor,
		accent: primaryColor,
		background: primaryColor,
		text: "#111827",
		title: "#fff",
	};

	// Build CV data with selected projects
	const cvData = {
		...cvSample,
		skills: hardSkills,
		projects: selectedProjects.length > 0
			? cvProjects.filter((p) => selectedProjects.includes(p.name))
			: cvProjects.filter((p) => p.isDefault !== false),
	};

	const generateCvFilename = () => {
		const parts = ["CV", cvSample.name?.replace(/\s+/g, "_") || "CV"];
		return `${parts.join("_")}.pdf`;
	};

	async function downloadPdf(
		html: string,
		filename: string,
		title: string
	): Promise<boolean> {
		const res = await api.generatePdf(html, title);

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

	const handleDownloadPDF = async () => {
		try {
			setDownloadingCv(true);
			const cvHtml = await compile(
				<Tailwind>
					<CvHtml
						data={cvData}
						theme={theme}
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
	};

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<h2 className="text-xl sm:text-2xl font-normal">Créateur de CV</h2>
				<p className="text-xs sm:text-sm text-gray-500">
					Personnalisez votre CV en choisissant une couleur et les projets à afficher.
				</p>
			</div>

			{/* Color Picker */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
				<FormSectionTitle>
					Couleur Personnalisée
				</FormSectionTitle>
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-4">
						<label className="text-sm font-medium text-gray-700 min-w-fit">
							Couleur primaire:
						</label>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={primaryColor}
								onChange={(e) => setPrimaryColor(e.target.value)}
								className="w-16 h-10 rounded cursor-pointer border border-gray-300"
							/>
							<input
								type="text"
								value={primaryColor}
								onChange={(e) => setPrimaryColor(e.target.value)}
								placeholder="#0b5ed7"
								className="px-3 py-2 border border-gray-300 rounded text-sm font-mono w-28"
								maxLength={7}
							/>
							<div
								className="w-10 h-10 rounded border-2 border-gray-300"
								style={{ backgroundColor: primaryColor }}
								title={`Aperçu: ${primaryColor}`}
							/>
						</div>
					</div>
					<p className="text-xs text-gray-500">
						Cette couleur sera appliquée comme couleur primaire, secondaire et accent du CV.
					</p>
				</div>
			</div>

			{/* Projects Selection */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
				<FormSectionTitle>
					Sélection des Projets
				</FormSectionTitle>
				<p className="text-sm text-gray-600 mb-4">
					Choisissez les projets à afficher dans votre CV. Par défaut, seuls les projets marqués comme favoris seront affichés.
				</p>
				<ProjectSelector
					projects={cvProjects}
					selectedProjects={selectedProjects}
					recommendedProjects={[]}
					onSelectionChange={setSelectedProjects}
				/>
				<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
					{selectedProjects.length === 0
						? "ℹ️ Aucun projet sélectionné - les projets par défaut seront affichés"
						: `✓ ${selectedProjects.length} projet(s) sélectionné(s)`}
				</div>
			</div>

			{/* Technology Skills */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
				<FormSectionTitle>
					Compétences Techniques
				</FormSectionTitle>
				<p className="text-sm text-gray-600 mb-4">
					Modifiez les compétences de chaque catégorie.
				</p>
				<div className="space-y-4">
					{(() => {
						const categoryLabels: Record<string, string> = {
							languages: "Langages",
							frontend: "Frontend",
							backend: "Backend",
							databases: "Bases de données",
							tests: "Tests",
							devops: "DevOps",
							methodologies: "Méthodologies",
							mobile: "Mobile",
						};
						
						const orderedKeys = ['languages', 'frontend', 'backend', 'databases', 'tests', 'devops', 'methodologies', 'mobile'];
						const sortedEntries = Object.entries(hardSkills).sort(([a], [b]) => {
							const aIndex = orderedKeys.indexOf(a);
							const bIndex = orderedKeys.indexOf(b);
							if (aIndex === -1 && bIndex === -1) return 0;
							if (aIndex === -1) return 1;
							if (bIndex === -1) return -1;
							return aIndex - bIndex;
						});
						
						return sortedEntries.map(([category, skillsString]) => (
							<div key={category} className="border border-gray-200 rounded-lg p-3 sm:p-4">
								<h4 className="font-medium text-gray-700 text-xs sm:text-sm mb-2">
									{categoryLabels[category] || category}
								</h4>
								<input
									type="text"
									value={skillsString}
									onChange={(e) => {
										setHardSkills({
											...hardSkills,
											[category]: e.target.value,
										});
									}}
									className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Compétences séparées par des virgules..."
								/>
							</div>
						));
					})()}
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-4 flex-wrap">
				<Button
					onClick={() => setShowPreview(true)}
					variant="primary"
					className="flex items-center gap-2"
				>
					<LuEye className="w-4 h-4" />
					Aperçu
				</Button>
				<Button
					onClick={handleDownloadPDF}
					disabled={downloadingCv}
					variant="primary"
					className="flex items-center gap-2"
				>
					{downloadingCv ? (
						<AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
					) : (
						<LuDownload className="w-4 h-4" />
					)}
					{downloadingCv ? "Téléchargement..." : "Télécharger (PDF)"}
				</Button>
			</div>

			{/* Preview Modal */}
			<PreviewModal
				isOpen={showPreview}
				onClose={() => setShowPreview(false)}
				companyName=""
				jobTitle=""
				coverLetter=""
				softSkills={cvData.softSkills || []}
				hardSkills={cvData.skills || {}}
				companyTheme={theme}
				selectedProjects={selectedProjects}
				isGeneric={true}
			/>
		</div>
	);
}

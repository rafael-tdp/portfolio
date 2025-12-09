"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import LogoUploader from "../components/LogoUploader";
import LogoColorPicker from "../components/LogoColorPicker";
import FormSectionTitle from "../components/FormSectionTitle";
import FormLabel from "../components/FormLabel";
import TextField from "../components/TextField";
import Button from "../components/Button";
import PreviewModal from "../components/PreviewModal";
import ProjectSelector from "../components/ProjectSelector";
import { LuPipette, LuCopy, LuTrash, LuSparkles, LuEye } from "react-icons/lu";
import * as api from "../lib/api";
import cvSample from "../data/cvSample";

// Application status options
const STATUS_OPTIONS = [
	{ value: 'draft', label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
	{ value: 'sent', label: 'Envoyée', color: 'bg-blue-100 text-blue-700' },
	{ value: 'interview', label: 'Entretien en cours', color: 'bg-yellow-100 text-yellow-700' },
	{ value: 'offer', label: 'Offre reçue', color: 'bg-green-100 text-green-700' },
	{ value: 'accepted', label: 'Acceptée', color: 'bg-green-200 text-green-800' },
	{ value: 'rejected', label: 'Refusée', color: 'bg-red-100 text-red-700' },
	{ value: 'withdrawn', label: 'Retirée', color: 'bg-gray-200 text-gray-600' },
];

type InitialData = Partial<{
	companyName: string;
	companyId: string;
	companyLogoUrl: string | null;
	companyColors: Record<string, string> | null;
	companyTheme: Record<string, string> | null;
	jobTitle: string;
	jobDescription: string;
	coverLetter: string;
	softSkills: string[];
	hardSkills: Record<string, string>;
	applicationId: string | null;
	status: string;
}>;

export default function ApplicationForm({
	initial = {},
	onSaved,
}: {
	initial?: InitialData;
	onSaved?: (application: any) => void;
}) {
	function normalizeColors(
		colors: Record<string, string> | null | undefined
	) {
		if (!colors) return null;
		const vals = Object.values(colors).filter(Boolean);
		const out: Record<string, string> = {};
		for (let i = 0; i < vals.length; i++) {
			out[`color${i + 1}`] = vals[i];
		}
		return out;
	}

	const [companyName, setCompanyName] = useState(initial.companyName || "");
	const [logoFile, setLogoFile] = useState<File | null>(
		initial.companyLogoUrl ? null : null
	);
	const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(
		initial.companyLogoUrl || null
	);
	const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
	const [companyColors, setCompanyColors] = useState<Record<
		string,
		string
	> | null>(normalizeColors(initial.companyColors as any) || null);
	const [companyTheme, setCompanyTheme] = useState<Record<
		string,
		string
	> | null>((initial.companyTheme as any) || null);
	const [editingColorKey, setEditingColorKey] = useState<string | null>(null);
	const [showColors, setShowColors] = useState(false);
	const [jobTitle, setJobTitle] = useState(initial.jobTitle || "");
	const [jobDescription, setJobDescription] = useState(
		initial.jobDescription || ""
	);
	const [coverLetter, setCoverLetter] = useState(initial.coverLetter || "");
	// Use existing softSkills or default to cvSample.softSkills
	const [softSkills, setSoftSkills] = useState<string[]>(
		initial.softSkills && initial.softSkills.length > 0
			? initial.softSkills
			: cvSample.softSkills
	);
	// Use existing hardSkills or default to cvSample.skills
	const [hardSkills, setHardSkills] = useState<Record<string, string>>(
		initial.hardSkills && Object.keys(initial.hardSkills).length > 0 
			? initial.hardSkills 
			: cvSample.skills
	);
	const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
	const [recommendedProjects, setRecommendedProjects] = useState<string[]>([]);
	const [loadingRecommendations, setLoadingRecommendations] = useState(false);
	const [generatingSoftSkills, setGeneratingSoftSkills] = useState(false);
	const [companyId, setCompanyId] = useState<string | null>(
		initial.companyId || null
	);
	const [applicationId, setApplicationId] = useState<string | null>(
		initial.applicationId || null
	);
	const [status, setStatus] = useState(initial.status || 'sent');
	const [loading, setLoading] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [isSpontaneous, setIsSpontaneous] = useState(false);

	// Company selection states
	const [existingCompanies, setExistingCompanies] = useState<Array<{
		_id: string;
		name: string;
		logoUrl?: string;
		colors?: Record<string, string>;
		theme?: Record<string, string>;
	}>>([]);
	const [loadingCompanies, setLoadingCompanies] = useState(true);
	const [showCompanyForm, setShowCompanyForm] = useState(!initial.companyId);
	const [companySearchTerm, setCompanySearchTerm] = useState("");
	const [filteredCompanies, setFilteredCompanies] = useState<typeof existingCompanies>([]);

	// Helper to extract colors from theme if no colors are available
	function colorsFromTheme(theme: Record<string, string> | null): Record<string, string> | null {
		if (!theme) return null;
		const themeColors = [theme.primary, theme.secondary, theme.accent, theme.background, theme.text, theme.title].filter(Boolean);
		if (themeColors.length === 0) return null;
		const out: Record<string, string> = {};
		themeColors.forEach((c, i) => {
			out[`color${i + 1}`] = c;
		});
		return out;
	}

	// Sync state with initial data when it changes (e.g., after async fetch)
	React.useEffect(() => {
		if (initial.companyColors) {
			setCompanyColors(normalizeColors(initial.companyColors));
		} else if (initial.companyTheme) {
			// If no colors but we have a theme, extract colors from theme
			setCompanyColors(colorsFromTheme(initial.companyTheme));
		}
		if (initial.companyTheme) {
			setCompanyTheme(initial.companyTheme);
		}
	}, [initial.companyColors, initial.companyTheme]);

	// Handle spontaneous toggle
	React.useEffect(() => {
		if (isSpontaneous) {
			setJobTitle("Développeur Full Stack Junior");
			setJobDescription("");
		}
	}, [isSpontaneous]);

	// Load existing companies
	React.useEffect(() => {
		const loadCompanies = async () => {
			try {
				setLoadingCompanies(true);
				const companies = await api.getCompanies();
				setExistingCompanies(companies);
			} catch (error) {
				console.error('Failed to load companies:', error);
			} finally {
				setLoadingCompanies(false);
			}
		};
		loadCompanies();
	}, []);

	// Filter companies based on search term
	React.useEffect(() => {
		if (!companySearchTerm.trim()) {
			setFilteredCompanies(existingCompanies);
		} else {
			const term = companySearchTerm.toLowerCase();
			setFilteredCompanies(
				existingCompanies.filter(c =>
					c.name.toLowerCase().includes(term)
				)
			);
		}
	}, [companySearchTerm, existingCompanies]);

	function resolveLogoUrl(url: string | null | undefined) {
		if (!url) return null;
		if (url.startsWith("http")) return url;
		const base =
			process.env.NEXT_PUBLIC_BACKEND_URL;
		return `${base}${url}`;
	}

	React.useEffect(() => {
		if (!logoFile) return;
		const obj = URL.createObjectURL(logoFile);
		setLogoPreviewUrl(obj);
		return () => {
			URL.revokeObjectURL(obj);
			setLogoPreviewUrl(null);
		};
	}, [logoFile]);

	async function clientExtractPaletteFromUrl(url: string | null) {
		if (!url) return;
		try {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.src = url;
			await new Promise((res, rej) => {
				img.onload = () => res(true);
				img.onerror = rej;
			});
			const canvas = document.createElement("canvas");
			const w = Math.min(120, img.naturalWidth || 120);
			const h = Math.min(120, img.naturalHeight || 120);
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.drawImage(img, 0, 0, w, h);
			const data = ctx.getImageData(0, 0, w, h).data;
			const counts: Record<string, number> = {};
			for (let i = 0; i < data.length; i += 4 * 6) {
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];
				const hex =
					"#" +
					[r, g, b]
						.map((v) => v.toString(16).padStart(2, "0"))
						.join("");
				counts[hex] = (counts[hex] || 0) + 1;
			}
			const ordered = Object.entries(counts)
				.sort((a, b) => b[1] - a[1])
				.map((x) => x[0]);
			const palette = ordered.slice(0, 6);
			if (palette.length > 0) {
				setCompanyColors(
					palette.reduce<Record<string, string>>((acc, v, i) => {
						acc[`color${i + 1}`] = v;
						return acc;
					}, {})
				);
				if (!companyTheme)
					setCompanyTheme({
						primary: palette[0],
						secondary: palette[1] || palette[0],
						accent: palette[2] || palette[1] || palette[0],
						background: "#ffffff",
						text: "#111827",
						title: palette[3] || palette[0],
					});
			}
		} catch (err) {
			console.warn("clientExtractPalette failed", err);
		}
	}

	React.useEffect(() => {
		if (!logoPreviewUrl) return;
		if (!companyName) return;
		let cancelled = false;
		(async () => {
			await clientExtractPaletteFromUrl(logoPreviewUrl);
			if (cancelled) return;
		})();
		return () => {
			cancelled = true;
		};
	}, [logoPreviewUrl, companyName]);

	// If we have an existing company logo URL (editing an existing company)
	// and no palette yet, attempt to extract colors from that remote image so
	// the form shows the detected palette without re-uploading the logo.
	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			if (companyLogoUrl && !companyColors) {
				const resolved = resolveLogoUrl(companyLogoUrl);
				if (resolved) {
					try {
						await clientExtractPaletteFromUrl(resolved);
						if (cancelled) return;
					} catch (err) {
						console.warn("auto extract palette failed", err);
					}
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [companyLogoUrl]);

	// Load project recommendations when jobDescription changes
	React.useEffect(() => {
		// Initialize with default projects
		const defaultProjects = (cvSample.projects as any[])
			.filter((p) => p.isDefault)
			.map((p) => p.name);
		setSelectedProjects(defaultProjects);
		setRecommendedProjects([]);
	}, []);

	async function handleGetProjectRecommendations() {
		if (!jobDescription || jobDescription.trim() === "") return;
		
		setLoadingRecommendations(true);
		try {
			const data = await api.recommendProjects(
				jobDescription,
				(cvSample.projects as any[]).map((p) => ({
					name: p.name,
					description: p.description,
					tags: p.tags,
				}))
			);
			setRecommendedProjects(data.recommendedProjects || []);
			// Auto-select recommended projects
			setSelectedProjects(data.recommendedProjects || []);
		} catch (error) {
			console.warn("Failed to get project recommendations:", error);
			toast.error("Erreur lors de la recommandation des projets");
		} finally {
			setLoadingRecommendations(false);
		}
	}

	async function handleSelectCompany(company: typeof existingCompanies[number]) {
		setCompanyId(company._id);
		setCompanyName(company.name);
		setCompanyLogoUrl(company.logoUrl || null);
		setCompanyColors(company.colors || null);
		setCompanyTheme(company.theme || null);
		setShowCompanyForm(false);
		setCompanySearchTerm("");
	}

	async function finalizeCreateCompany() {
		if (!companyName) return toast.error("Entrez le nom de l'entreprise");
		setLoading(true);
		const wasNew = !companyId;
		try {
			let id = companyId;
			if (!id) {
				const company = await api.createCompany(companyName);
				id = company._id || company.id;
				setCompanyId(id);
			} else {
				// If editing, ensure the company name is persisted
				try {
					await api.patchCompany(id, { name: companyName });
				} catch {
					// ignore patch errors here; we'll still try to continue
				}
			}

			let uploadedUrl: string | null = companyLogoUrl;
			if (logoFile) {
				const upJson = await api.uploadLogo(id as string, logoFile);
				uploadedUrl = upJson.logoUrl || null;
				if (uploadedUrl) setCompanyLogoUrl(uploadedUrl);
			}

			const exJson = await api.extractColors(id as string, uploadedUrl);
			if (exJson.colors) setCompanyColors(normalizeColors(exJson.colors));

			if (companyTheme) {
				try {
					const patchJson = await api.patchCompany(id as string, {
						theme: companyTheme,
					});
					if (patchJson.company && patchJson.company.theme)
						setCompanyTheme(patchJson.company.theme);
					else setCompanyTheme(companyTheme);
				} catch {
					setCompanyTheme(companyTheme);
				}
			} else if (exJson.theme) {
				setCompanyTheme(exJson.theme);
			}
			toast.success(
				wasNew
					? "Entreprise créée et logo uploadé"
					: "Entreprise mise à jour"
			);
		} catch (err) {
			toast.error((err as Error).message || String(err));
		} finally {
			setLoading(false);
		}
	}

	async function generateCover() {
		if (!companyId)
			return toast.error("Entreprise requise");
		setLoading(true);
		try {
			// Generate cover letter only (spontaneous if no jobDescription)
			const coverJson = await api.generateCover({
				userId: null,
				companyId,
				applicationId,
				jobTitle,
				jobDescription,
				tone: "professionnel",
				length: 300,
				saveApplication: false,
			});
			
			setCoverLetter(coverJson.coverLetter || "");
			const message = jobDescription 
				? "Lettre de motivation générée - vérifiez et enregistrez"
				: "Candidature spontanée générée - vérifiez et enregistrez";
			toast.success(message);
		} catch (err) {
			toast.error((err as Error).message || String(err));
		} finally {
			setLoading(false);
		}
	}

	async function generateSoftSkillsOnly() {
		if (!jobDescription) return toast.error("Description du poste requise");
		setGeneratingSoftSkills(true);
		try {
			const json = await api.generateSoftSkills(jobTitle, jobDescription);
			if (json.softSkills && Array.isArray(json.softSkills)) {
				setSoftSkills(json.softSkills);
				toast.success("Soft skills générés");
			}
		} catch (err) {
			toast.error((err as Error).message || String(err));
		} finally {
			setGeneratingSoftSkills(false);
		}
	}

	async function saveApplication() {
		if (!companyId) return toast.error("Entreprise requise");
		setLoading(true);
		try {
			const payload = {
				company: companyId,
				user: null,
				jobTitle,
				jobDescription,
				requiredSkills: [],
				coverLetter,
				softSkills,
				hardSkills,
				selectedProjects,
				status,
			};
			const json = await api.saveApplication(payload, applicationId);
			if (applicationId) {
				toast.success("Candidature mise à jour");
			} else {
				toast.success("Candidature enregistrée");
				setApplicationId(
					json.application?._id || json.application?.id || null
				);
			}
			if (onSaved) onSaved(json.application);
		} catch (err) {
			toast.error((err as Error).message || String(err));
		} finally {
			setLoading(false);
		}
	}

	function getColorNameFromKey(key: string) {
		switch (key) {
			case "color1":
				return "Couleur 1";
			case "color2":
				return "Couleur 2";
			case "color3":
				return "Couleur 3";
			case "color4":
				return "Couleur 4";
			case "color5":
				return "Couleur 5";
			case "color6":
				return "Couleur 6";
			default:
				return key;
		}
	}

	return (
		<div className="mx-auto px-4 sm:p-6 sm:pt-0 bg-gray-50 min-h-screen">
			<div className="max-w-3xl mx-auto">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
					<h1 className="text-xl sm:text-2xl font-normal">
						{applicationId
							? "Modifier la candidature"
							: "Créer une candidature"}
					</h1>
					
					{/* Status selector */}
					<div className="flex items-center gap-2">
						<label htmlFor="status" className="text-sm text-gray-600">
							Statut :
						</label>
						<select
							id="status"
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-sky-500 ${
								STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700'
							}`}
						>
							{STATUS_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Sections copied from original page (company, job, cover letter) */}
				<section className="bg-white shadow-sm rounded-md p-4 sm:p-6 mb-8 sm:mb-12">
					<FormSectionTitle className="mb-6 sm:mb-8">
						1. L&apos;entreprise
					</FormSectionTitle>
					<div className="flex flex-col gap-6">
						{/* Company selection UI */}
						{!showCompanyForm && companyId && (
							<div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										{companyLogoUrl && (
											<img
												src={resolveLogoUrl(companyLogoUrl) || ""}
												alt={companyName}
												className="w-12 h-12 rounded object-contain"
											/>
										)}
										<div>
											<p className="text-sm font-medium text-gray-900">{companyName}</p>
											<p className="text-xs text-gray-600">Entreprise sélectionnée</p>
										</div>
									</div>
									<button
										type="button"
										onClick={() => {
											setShowCompanyForm(true);
											setCompanySearchTerm("");
										}}
										className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
									>
										Modifier
									</button>
								</div>
							</div>
						)}

						{/* Company selection or form */}
						{showCompanyForm ? (
							<>
								{/* Search existing companies */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Sélectionner une entreprise existante
									</label>
									{loadingCompanies ? (
										<div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
											Chargement des entreprises...
										</div>
									) : existingCompanies.length > 0 ? (
										<>
											<input
												type="text"
												placeholder="Rechercher une entreprise..."
												value={companySearchTerm}
												onChange={(e) => setCompanySearchTerm(e.target.value)}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											/>
											{filteredCompanies.length > 0 ? (
												<div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
													{filteredCompanies.map((company) => (
														<button
															key={company._id}
															type="button"
															onClick={() => handleSelectCompany(company)}
															className="w-full text-left px-3 py-2 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3 transition-colors"
														>
															{company.logoUrl && (
																<img
																	src={resolveLogoUrl(company.logoUrl) || ""}
																	alt={company.name}
																	className="w-8 h-8 rounded object-contain flex-shrink-0"
																/>
															)}
															<div className="flex-1">
																<p className="text-sm font-medium text-gray-900">{company.name}</p>
															</div>
														</button>
													))}
												</div>
											) : (
												<div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
													Aucune entreprise correspondante
												</div>
											)}
										</>
									) : null}
								</div>

								{/* Separator or new company option */}
								{existingCompanies.length > 0 && (
									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-gray-200"></div>
										</div>
										<div className="relative flex justify-center text-sm">
											<span className="px-2 bg-white text-gray-500">ou</span>
										</div>
									</div>
								)}

								{/* Create new company form */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										{existingCompanies.length > 0 ? 'Créer une nouvelle entreprise' : 'Nom de l\'entreprise'}
									</label>
									<TextField
										id="company-name"
										label=""
										placeholder="Entrez le nom de l'entreprise"
										value={companyName}
										onChange={(e) => setCompanyName(e.target.value)}
									/>
								</div>
							</>
					) : null}

					<div className="md:flex md:flex-col">
						<FormLabel>Logo</FormLabel>
						{companyId && !showCompanyForm ? (
							// Entreprise existante sélectionnée - afficher un avertissement
							<div className="mt-2 w-full">
								<LogoUploader
									initialUrl={resolveLogoUrl(companyLogoUrl)}
									onFileChange={(f: File | null) =>
										setLogoFile(f)
									}
								/>
								<div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
									<p className="text-xs text-amber-900">
										⚠️ <strong>Attention:</strong> La modification du logo affectera cette entreprise pour{' '}
										<strong>toutes les candidatures</strong>.
									</p>
								</div>
							</div>
						) : (
							// Formulaire de création - upload normal
							<div className="mt-2 w-full">
								<LogoUploader
									initialUrl={resolveLogoUrl(companyLogoUrl)}
									onFileChange={(f: File | null) =>
										setLogoFile(f)
									}
								/>
							</div>
						)}
						<div className="mt-3 w-full">
							<div className="text-xs text-gray-500">
								Les couleurs sont prélevées automatiquement
								lors de la sélection du logo — ou depuis le
								logo existant lorsque vous editez une
								entreprise.
							</div>
						</div>
					</div>
				</div>					{companyColors && (
						<div className="mt-6">
							{/* Bouton toggle avec aperçu des couleurs */}
							<button
								type="button"
								onClick={() => setShowColors(!showColors)}
								className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-colors"
							>
								<div className="flex items-center gap-3">
									<span className="text-sm font-medium text-gray-700">
										Palette de couleurs
									</span>
									{/* Aperçu des couleurs */}
									<div className="flex -space-x-1">
										{Object.values(companyColors).slice(0, 6).map((color, i) => (
											<div
												key={i}
												className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
												style={{ backgroundColor: color }}
											/>
										))}
									</div>
								</div>
								<svg
									className={`w-5 h-5 text-gray-400 transition-transform ${showColors ? 'rotate-180' : ''}`}
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{/* Contenu des couleurs (affiché/caché) */}
							{showColors && (
								<div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
									<div className="text-sm font-medium text-gray-700 mb-3">
										Palette détectée
									</div>
									<div className="grid grid-cols-2 gap-3">
										{Object.entries(companyColors).map(([k, v]) => (
											<div
												key={k}
												className="relative flex items-center gap-3 p-2 rounded border border-gray-300 bg-white"
											>
												<div
													className="w-10 h-10 rounded-sm"
													style={{
														background: v,
														border: "1px solid rgba(0,0,0,0.06)",
													}}
												/>
												<div className="flex-1">
													<div className="text-xs text-gray-600">
														{getColorNameFromKey(k)}
													</div>
													<div className="flex items-center gap-2 mt-1">
														<input
															className="font-mono text-xs sm:text-sm border rounded px-2 py-1 w-20 sm:w-28 border-gray-300"
															value={v}
															onChange={(e) => {
																const newHex = e.target.value;
																setCompanyColors((prev) =>
																	prev ? { ...prev, [k]: newHex } : prev
																);
															}}
														/>
														<Button
															className="text-xs px-1 py-1 ml-auto"
															variant="neutral"
															onClick={() => setEditingColorKey(k)}
														>
															<LuPipette />
														</Button>
														<Button
															className="text-xs px-1 py-1"
															variant="neutral"
															onClick={() => navigator.clipboard?.writeText(v)}
														>
															<LuCopy />
														</Button>
													</div>
												</div>

												{editingColorKey === k && (companyLogoUrl || logoPreviewUrl) && (
													<div className="absolute z-50 right-0 top-0 w-64 sm:w-80">
														<div className="p-3 rounded bg-white shadow-lg border border-gray-300">
															<LogoColorPicker
																pipetteMode={true}
																initialUrl={resolveLogoUrl(companyLogoUrl) || logoPreviewUrl}
																onPickColor={(hex: string) => {
																	setCompanyColors((prev) =>
																		prev ? { ...prev, [k]: hex } : prev
																	);
																	setEditingColorKey(null);
																}}
															/>
															<div className="mt-2 text-right">
																<Button
																	size="sm"
																	variant="ghost"
																	onClick={() => setEditingColorKey(null)}
																>
																	Fermer
																</Button>
															</div>
														</div>
													</div>
												)}
											</div>
										))}
									</div>

									<div className="mt-6">
										<div className="text-sm font-medium text-gray-700 mb-2">
											Assigner les couleurs
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											{[
												{ key: "background", label: "Couleur de fond" },
												{ key: "text", label: "Couleur du texte" },
												{ key: "primary", label: "Couleur principale" },
												{ key: "accent", label: "Couleur d'accent" },
												{ key: "title", label: "Couleur du titre" },
												{ key: "secondary", label: "Couleur secondaire" },
											].map((r) => (
												<div
													key={r.key}
													className="flex items-center gap-3 p-2 rounded border border-gray-300 bg-white"
												>
													<div
														className="w-10 h-10 rounded-sm"
														style={{
															background:
																(companyTheme && (companyTheme as any)[r.key]) ||
																Object.values(companyColors)[0],
															border: "1px solid rgba(0,0,0,0.06)",
														}}
													/>
													<div className="flex-1">
														<div className="text-xs text-gray-600">{r.label}</div>
														<div className="flex flex-col gap-2 mt-1">
															<select
																className="border rounded px-2 py-1 text-sm border-gray-300"
																value={(companyTheme && (companyTheme as any)[r.key]) || ""}
																onChange={(e) => {
																	const hex = e.target.value || "";
																	setCompanyTheme((prev) => ({
																		...(prev || {}),
																		[r.key]: hex,
																	}));
																}}
															>
																<option value="">Choisir depuis la palette</option>
																{Object.entries(companyColors).map(([k, v]) => (
																	<option key={k} value={v}>
																		{k} — {v}
																	</option>
																))}
															</select>
															<div className="flex items-center gap-2">
																<input
																	type="color"
																	value={
																		((companyTheme && (companyTheme as any)[r.key]) as string) ||
																		Object.values(companyColors)[0] ||
																		"#000000"
																	}
																	onChange={(e) =>
																		setCompanyTheme((prev) => ({
																			...(prev || {}),
																			[r.key]: e.target.value,
																		}))
																	}
																	className="w-10 h-8 p-0 border rounded cursor-pointer border-gray-300"
																	title="Sélectionner une couleur"
																/>
																<input
																	className="font-mono text-sm border rounded px-2 py-1 border-gray-300 w-full"
																	value={
																		((companyTheme && (companyTheme as any)[r.key]) as string) || ""
																	}
																	onChange={(e) =>
																		setCompanyTheme((prev) => ({
																			...(prev || {}),
																			[r.key]: e.target.value,
																		}))
																	}
																	placeholder="#rrggbb"
																/>
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					<div className="mt-4">
						{(() => {
							const isEditing = !!companyId;
							const disabled =
								loading ||
								!companyName ||
								(!isEditing && !logoFile);
							return (
								<Button
									type="button"
									variant="primary"
									onClick={finalizeCreateCompany}
									disabled={disabled}
								>
									{isEditing
										? "Modifier l'entreprise"
										: "Créer l'entreprise"}
								</Button>
							);
						})()}
					</div>
				</section>

			<section className="bg-white shadow-sm rounded-md p-4 sm:p-6 mb-8 sm:mb-12">
				<FormSectionTitle className="mb-3">
					2. Le poste
				</FormSectionTitle>
				
				{/* Spontaneous toggle */}
				<div className="mb-4 flex items-center gap-3">
					<input
						type="checkbox"
						id="spontaneous-toggle"
						checked={isSpontaneous}
						onChange={(e) => setIsSpontaneous(e.target.checked)}
						className="w-4 h-4 cursor-pointer"
					/>
					<label htmlFor="spontaneous-toggle" className="text-sm text-gray-700 cursor-pointer">
						Candidature spontanée (sans description du poste)
					</label>
				</div>

				{!isSpontaneous && (
					<>
						<TextField
							id="job-title"
							label="Titre du poste"
							value={jobTitle}
							onChange={(e) => setJobTitle(e.target.value)}
						/>
						<div className="mt-4">
							<TextField
								id="job-description"
								label="Description du poste"
								placeholder="Décrivez le poste, les responsabilités, les compétences requises, etc."
								textarea
								rows={6}
								value={jobDescription}
								onChange={(e) => setJobDescription(e.target.value)}
							/>
						</div>
					</>
				)}

				{isSpontaneous && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
						<p className="text-sm text-blue-900">
							✓ Titre automatique : <strong>Développeur Full Stack Junior</strong>
						</p>
						<p className="text-xs text-blue-700 mt-1">
							L&apos;IA générera une candidature adaptée à l&apos;entreprise sans détails de poste spécifique.
						</p>
					</div>
				)}

				<div className="mt-3">
					<div>
						<Button
							type="button"
							variant="indigo"
							onClick={generateCover}
							disabled={
								loading || !companyId || (!isSpontaneous && !jobDescription)
							}
							loading={loading}
							icon={<LuSparkles />}
						>
							Générer la lettre
						</Button>
					</div>
				</div>
			</section>				<section className="bg-white shadow-sm rounded-md p-4 sm:p-6 mb-8 sm:mb-12">
					<FormSectionTitle className="mb-3">
						3. La Lettre de Motivation	
					</FormSectionTitle>
					<TextField
						id="cover-letter"
						label="Lettre de motivation (éditer)"
						placeholder="La lettre de motivation générée ou votre propre lettre."
						textarea
						rows={10}
						value={coverLetter}
						onChange={(e) => setCoverLetter(e.target.value)}
					/>
				</section>

				<section className="bg-white shadow-sm rounded-md p-4 sm:p-6 mb-8 sm:mb-12">
					<FormSectionTitle className="mb-3">
						4. Le CV - Soft Skills
					</FormSectionTitle>
					<p className="text-xs text-gray-500 mb-4">
						Les soft skills sont générés automatiquement lors de la génération de la lettre de motivation, ou vous pouvez les générer/modifier manuellement.
					</p>
					
					<div className="mb-4">
						<Button
							type="button"
							variant="indigo"
							onClick={generateSoftSkillsOnly}
							disabled={generatingSoftSkills || !jobDescription}
							loading={generatingSoftSkills}
							className="text-sm"
							icon={<LuSparkles />}
						>
							Régénérer les soft skills
						</Button>
					</div>

					{softSkills.length > 0 ? (
						<div className="space-y-2">
							{softSkills.map((skill, index) => (
								<div key={index} className="flex items-center gap-2">
									<span className="text-blue-500 font-medium hidden sm:inline">•</span>
									<input
										type="text"
										value={skill}
										onChange={(e) => {
											const newSkills = [...softSkills];
											newSkills[index] = e.target.value;
											setSoftSkills(newSkills);
										}}
										className="flex-1 px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none"
									/>
									<button
										type="button"
										onClick={() => {
											const newSkills = softSkills.filter((_, i) => i !== index);
											setSoftSkills(newSkills);
										}}
										className="text-red-500 hover:text-red-700 p-1 bg-red-100 rounded cursor-pointer text-xs"
										title="Supprimer"
									>
										<LuTrash />
									</button>
								</div>
							))}
							<button
								type="button"
								onClick={() => setSoftSkills([...softSkills, ""])}
								className="text-sm text-sky-600 hover:text-sky-700 mt-2"
							>
								+ Ajouter un soft skill
							</button>
						</div>
					) : (
						<div className="text-gray-400 text-sm italic">
							Aucun soft skill généré. Cliquez sur &quot;Générer la lettre (IA)&quot; ou &quot;Régénérer les soft skills&quot; pour en générer.
						</div>
					)}
				</section>

				<section className="bg-white shadow-sm rounded-md p-4 sm:p-6 mb-8 sm:mb-12">
					<FormSectionTitle className="mb-3">
						5. Le CV - Compétences techniques
					</FormSectionTitle>
					<p className="text-xs text-gray-500 mb-4">
						Modifiez les compétences de chaque catégorie selon le poste visé.
					</p>

					{Object.keys(hardSkills).length > 0 ? (
						<div className="space-y-4">
							{(() => {
								// Display labels for categories
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
								
								// Order categories in a logical way
								const orderedKeys = ['languages', 'frontend', 'backend', 'databases', 'tests', 'devops', 'methodologies', 'mobile'];
								const sortedEntries = Object.entries(hardSkills).sort(([a], [b]) => {
									const aIndex = orderedKeys.indexOf(a);
									const bIndex = orderedKeys.indexOf(b);
									if (aIndex === -1 && bIndex === -1) return 0;
									if (aIndex === -1) return 1;
									if (bIndex === -1) return -1;
									return aIndex - bIndex;
								});
								
								// Get available categories that are not yet added
								const availableCategories = orderedKeys.filter(key => !hardSkills[key]);
								
								return (
									<>
										{sortedEntries.map(([category, skillsString]) => (
											<div key={category} className="border border-gray-200 rounded-lg p-3 sm:p-4">
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-medium text-gray-700 text-xs sm:text-sm">
														{categoryLabels[category] || category}
													</h4>
													<button
														type="button"
														onClick={() => {
															const newHardSkills = { ...hardSkills };
															delete newHardSkills[category];
															setHardSkills(newHardSkills);
														}}
														className="text-xs text-red-500 hover:text-red-700 p-1 bg-red-100 rounded cursor-pointer"
														title="Supprimer cette catégorie"
													>
														<LuTrash />
													</button>
												</div>
												<input
													type="text"
													value={skillsString}
													onChange={(e) => {
														setHardSkills({
															...hardSkills,
															[category]: e.target.value,
														});
													}}
													className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
													placeholder="Compétences séparées par des virgules..."
												/>
											</div>
										))}
										
										{/* Add new category button */}
										{availableCategories.length > 0 && (
											<div className="border border-dashed border-gray-300 rounded-lg p-4">
												<label className="block text-sm font-medium text-gray-600 mb-2">
													Ajouter une catégorie
												</label>
												<select
													onChange={(e) => {
														const selectedCategory = e.target.value;
														if (selectedCategory) {
															setHardSkills({
																...hardSkills,
																[selectedCategory]: "",
															});
															e.target.value = "";
														}
													}}
													className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
													defaultValue=""
												>
													<option value="" disabled>Choisir une catégorie...</option>
													{availableCategories.map((key) => (
														<option key={key} value={key}>
															{categoryLabels[key] || key}
														</option>
													))}
												</select>
											</div>
										)}
									</>
								);
							})()}
						</div>
					) : (
						<div className="text-gray-400 text-sm italic">
							Aucune compétence technique générée. Cliquez sur &quot;Générer la lettre (IA)&quot; ou &quot;Régénérer les compétences&quot; pour en générer.
						</div>
					)}
				</section>

				<section className="bg-white shadow-sm rounded-md p-4 sm:p-6 mb-8 sm:mb-12">
					<FormSectionTitle className="mb-3">
						6. Le CV - Projets
					</FormSectionTitle>		
					<ProjectSelector
						projects={(cvSample.projects as any[]) || []}
						selectedProjects={selectedProjects}
						recommendedProjects={recommendedProjects}
						onSelectionChange={setSelectedProjects}
						jobDescription={jobDescription}
						onGetRecommendations={handleGetProjectRecommendations}
						loadingRecommendations={loadingRecommendations}
					/>
				</section>
				{/* Projects Selection Section */}

				<section className="bg-white shadow-sm rounded-md p-4 sm:p-6 mb-6">
					<div className="flex flex-col sm:flex-row gap-3">
						<Button
							type="button"
							variant="neutral"
							onClick={() => setShowPreview(true)}
							disabled={!companyName}
						>
							<LuEye className="w-4 h-4 mr-2" />
							Aperçu
						</Button>
						<Button
							type="button"
							variant="primary"
							onClick={saveApplication}
							disabled={loading || !companyId || !coverLetter}
							loading={loading}
						>
							Enregistrer la candidature
						</Button>
					</div>
				</section>
			</div>

			{/* Preview Modal */}
			<PreviewModal
				isOpen={showPreview}
				onClose={() => setShowPreview(false)}
				companyName={companyName}
				jobTitle={jobTitle}
				jobDescription={jobDescription}
				coverLetter={coverLetter}
				softSkills={softSkills}
				hardSkills={hardSkills}
				companyTheme={companyTheme}
				logoUrl={logoPreviewUrl || resolveLogoUrl(companyLogoUrl)}
				selectedProjects={selectedProjects}
			/>
		</div>
	);
}

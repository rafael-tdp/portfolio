"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import LogoUploader from "../components/LogoUploader";
import LogoColorPicker from "../components/LogoColorPicker";
import FormSectionTitle from "../components/FormSectionTitle";
import FormLabel from "../components/FormLabel";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { LuPipette, LuCopy } from "react-icons/lu";
import * as api from "../lib/api";

type InitialData = Partial<{
	companyName: string;
	companyId: string;
	companyLogoUrl: string | null;
	companyColors: Record<string, string> | null;
	companyTheme: Record<string, string> | null;
	publicSlug: string | null;
	jobTitle: string;
	jobDescription: string;
	coverLetter: string;
	applicationId: string | null;
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
	const [companyId, setCompanyId] = useState<string | null>(
		initial.companyId || null
	);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [publicSlug, setPublicSlug] = useState<string | null>(
		initial.publicSlug || null
	);
	const [applicationId, setApplicationId] = useState<string | null>(
		initial.applicationId || null
	);
	const [loading, setLoading] = useState(false);

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

	function resolveLogoUrl(url: string | null | undefined) {
		if (!url) return null;
		if (url.startsWith("http")) return url;
		const base =
			process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";
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
				setPublicSlug(company.publicSlug || null);
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
		if (!companyId || !jobDescription)
			return toast.error("Entreprise et description requises");
		setLoading(true);
		try {
			const payload = {
				userId: null,
				companyId,
				applicationId,
				jobTitle,
				jobDescription,
				tone: "professionnel",
				length: 300,
				saveApplication: false,
			};
			const json = await api.generateCover(payload);
			setCoverLetter(json.coverLetter || "");
			toast.success("Lettre générée - vérifiez et enregistrez manuellement");
		} catch (err) {
			toast.error((err as Error).message || String(err));
		} finally {
			setLoading(false);
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
		<div className="mx-auto p-6 bg-gray-50 min-h-screen">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-2xl font-normal mb-6">
					{applicationId
						? "Modifier la candidature"
						: "Créer une candidature"}
				</h1>

				{/* Sections copied from original page (company, job, cover letter) */}
				<section className="bg-white shadow-sm rounded-md p-6 mb-12">
					<FormSectionTitle className="mb-8">
						1. L&apos;entreprise
					</FormSectionTitle>
					<div className="flex flex-col gap-6">
						<div className="md:col-span-2">
							<TextField
								id="company-name"
								label="Nom de l'entreprise"
								value={companyName}
								onChange={(e) => setCompanyName(e.target.value)}
							/>
						</div>

						<div className="md:flex md:flex-col">
							<FormLabel>Logo</FormLabel>
							<div className="mt-2 w-full">
								<LogoUploader
									initialUrl={resolveLogoUrl(companyLogoUrl)}
									onFileChange={(f: File | null) =>
										setLogoFile(f)
									}
								/>
							</div>
							<div className="mt-3 w-full">
								<div className="text-sm text-gray-500">
									Les couleurs sont prélevées automatiquement
									lors de la sélection du logo — ou depuis le
									logo existant lorsque vous editez une
									entreprise.
								</div>
							</div>
						</div>
					</div>

					{companyColors && (
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
															className="font-mono text-sm border rounded px-2 py-1 w-28 border-gray-300"
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
													<div className="absolute z-50 right-0 top-0 w-80">
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

				<section className="bg-white shadow-sm rounded-md p-6 mb-12">
					<FormSectionTitle className="mb-3">
						2. Le poste
					</FormSectionTitle>
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
					<div className="mt-3">
						<div>
							<Button
								type="button"
								variant="indigo"
								onClick={generateCover}
								disabled={
									loading || !companyId || !jobDescription
								}
								loading={loading}
							>
								Générer la lettre (IA)
							</Button>
						</div>
					</div>
				</section>

				<section className="bg-white shadow-sm rounded-md p-6 mb-6">
					<FormSectionTitle className="mb-3">
						3. Lettre de motivation
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
					<div className="mt-3">
						<div>
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
					</div>
				</section>
			</div>
		</div>
	);
}

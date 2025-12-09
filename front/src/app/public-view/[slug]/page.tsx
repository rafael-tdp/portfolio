import React from "react";
import { notFound } from "next/navigation";
import CvViewer from "../../../components/CvViewer";
import ClientCoverLetterViewer from "../../../components/ClientCoverLetterViewer";
import CopySlugBadge from "../../../components/CopySlugBadge";
import VisitTracker from "../../../components/VisitTracker";
import cvSample from "../../../data/cvSample";
import CollapsibleSection from "../../../components/CollapsibleSection";
import DownloadButtons from "../../../components/DownloadButtons";
import { GoLink } from "react-icons/go";
import * as api from "@/lib/api";

interface Props {
	params: { slug: string };
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ params, searchParams }: Props) {
	// Some Next runtimes provide `params` as a thenable — await it first.
	const resolvedParams = (await params) as { slug: string };
	const resolvedSearchParams = (await searchParams) as Record<string, string | string[] | undefined>;
	const slug = resolvedParams.slug;
	const isPreview = resolvedSearchParams.preview === "true";
	
	const json = await api.getPublicApplication(slug);
	if (!json) return notFound();
	
	const company = json.company;
	const application = json.application;
	if (!company) return notFound();
	if (!application) return notFound();
	
	// Detect if this is a spontaneous application
	const isSpontaneous = !application.jobDescription || application.jobDescription.trim() === "";
	
	// If company provides a colours palette but not a full theme, derive a usable theme
	function hexToRgb(hex?: string) {
		if (!hex) return null;
		const h = hex.replace("#", "");
		if (h.length === 3) {
			return {
				r: parseInt(h[0] + h[0], 16),
				g: parseInt(h[1] + h[1], 16),
				b: parseInt(h[2] + h[2], 16),
			};
		}
		if (h.length !== 6) return null;
		return {
			r: parseInt(h.slice(0, 2), 16),
			g: parseInt(h.slice(2, 4), 16),
			b: parseInt(h.slice(4, 6), 16),
		};
	}

	function luminance(hex?: string) {
		const rgb = hexToRgb(hex);
		if (!rgb) return 1;
		const srgb = [rgb.r, rgb.g, rgb.b].map((v) => {
			const c = v / 255;
			return c <= 0.03928
				? c / 12.92
				: Math.pow((c + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
	}

	function pickReadableOn(hex?: string) {
		// return white or dark text depending on contrast with hex
		const L = luminance(hex);
		// WCAG-ish threshold
		return L > 0.5 ? "#0f172a" : "#ffffff";
	}

	function deriveThemeFromColors(colors?: Record<string, string>) {
		if (!colors) return null;
		// try several candidate keys in order
		// Accept both semantic keys (primary/secondary/...) and palettes of color1..colorN
		const map = Object.keys(colors).reduce<Record<string, string>>(
			(acc, k) => {
				acc[k.toLowerCase()] = String(colors[k]);
				return acc;
			},
			{}
		);

		// Helper to pick first available from a list of keys
		const pick = (...keys: string[]) => {
			for (const k of keys) {
				if (map[k]) return map[k];
			}
			return undefined;
		};

		// prefer explicit semantic keys, then fall back to color1..colorN (palette)
		const primary =
			pick("primary", "brand", "color1") || Object.values(map)[0];
		const background = pick("background", "colorN") || "#ffffff";
		const text =
			pick("text") ||
			(luminance(background) > 0.5 ? "#0f172a" : "#ffffff");
		const secondary = pick("secondary", "color2", "color1") || primary;
		const accent = pick("accent", "color3", "color2") || secondary;

		return { primary, secondary, accent, background, text };
	}

	const derived = company?.theme
		? company.theme
		: deriveThemeFromColors(company?.colors);

	// Normalize theme so older entries containing `onPrimary` continue to work.
	const themeRaw = derived || {};
	const themeFinal = {
		primary: (themeRaw as any).primary || "#0b74de",
		secondary:
			(themeRaw as any).secondary ||
			(themeRaw as any).primary ||
			"#0b74de",
		accent:
			(themeRaw as any).accent ||
			(themeRaw as any).onPrimary ||
			(themeRaw as any).primary ||
			"#ffffff",
		background: (themeRaw as any).background || "#f8fafc",
		text: (themeRaw as any).text || "#111827",
		title: (themeRaw as any).title || "#fff",
	};

	function getLighterColor(color: string, amount: number): string {
		// Hex format
		if (color.startsWith("#")) {
			let hex = color.slice(1);
			if (hex.length === 3) {
				hex = hex
					.split("")
					.map((c) => c + c)
					.join("");
			}
			const num = parseInt(hex, 16);
			const r = (num >> 16) & 255;
			const g = (num >> 8) & 255;
			const b = num & 255;
			const lr = Math.round((1 - amount) * r + amount * 255);
			const lg = Math.round((1 - amount) * g + amount * 255);
			const lb = Math.round((1 - amount) * b + amount * 255);
			return `rgb(${lr}, ${lg}, ${lb})`;
		}
		// rgb/rgba format
		const rgbMatch = color.match(
			/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([01]?\.?\d*))?\)/
		);
		if (rgbMatch) {
			const r = parseInt(rgbMatch[1], 10);
			const g = parseInt(rgbMatch[2], 10);
			const b = parseInt(rgbMatch[3], 10);
			const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
			const lr = Math.round((1 - amount) * r + amount * 255);
			const lg = Math.round((1 - amount) * g + amount * 255);
			const lb = Math.round((1 - amount) * b + amount * 255);
			return `rgba(${lr}, ${lg}, ${lb}, ${a})`;
		}
		// Fallback: return original color if unknown format
		return color;
	}

	// compute readable text-on-primary at render time
	const onPrimary = pickReadableOn(themeFinal.primary);

	// Compute a resolved logo URL to pass to client components (absolute when possible)
	const FRONTEND_ASSET_BASE =
		process.env.NEXT_PUBLIC_BACKEND_URL;
	let logoSrc: string | null = null;
	if (company?.logoUrl) {
		const logo = company.logoUrl;
		logoSrc =
			typeof logo === "string" &&
			(logo.startsWith("http://") || logo.startsWith("https://"))
				? logo
				: `${FRONTEND_ASSET_BASE}${
						logo.startsWith("/") ? logo : `/${logo}`
				  }`;
	}

	// Generate adapted soft skills using AI based on job description
	let adaptedCvData = { ...cvSample };
	
	// Use hardSkills from application if they exist, otherwise keep default cvSample skills
	// The new format stores hardSkills as Record<string, string> (same as cvSample.skills)
	if (application?.hardSkills && typeof application.hardSkills === 'object' && Object.keys(application.hardSkills).length > 0) {
		const hardSkillsObj = application.hardSkills as Record<string, string | string[]>;
		const skills: Record<string, string> = {};
		
		for (const [category, skillsValue] of Object.entries(hardSkillsObj)) {
			if (Array.isArray(skillsValue) && skillsValue.length > 0) {
				// Old format: convert array to string
				skills[category] = skillsValue.join(', ');
			} else if (typeof skillsValue === 'string' && skillsValue.trim() !== '') {
				// New format: use directly
				skills[category] = skillsValue;
			}
		}
		
		// Use only the application's hardSkills (no merge with cvSample)
		adaptedCvData = {
			...adaptedCvData,
			skills: skills as typeof cvSample.skills,
		};
	}
	
	// Use softSkills from application if they exist
	if (application?.softSkills && Array.isArray(application.softSkills) && application.softSkills.length > 0) {
		adaptedCvData = {
			...adaptedCvData,
			softSkills: application.softSkills,
		};
	} else if (application?.jobDescription) {
		// Generate soft skills via AI if not stored but job description exists
		try {
			const softSkillsData = await api.serverGenerateSoftSkills(
				application?.jobTitle,
				application?.jobDescription
			);
			if (softSkillsData?.softSkills && Array.isArray(softSkillsData.softSkills)) {
				adaptedCvData = {
					...adaptedCvData,
					softSkills: softSkillsData.softSkills,
				};
			}
		} catch (err) {
			console.warn('Failed to generate adapted soft skills:', err);
			// Keep default cvSample soft skills
		}
	}

	// Use selectedProjects from application if they exist
	let selectedProjects: string[] = [];
	if (application?.selectedProjects && Array.isArray(application.selectedProjects) && application.selectedProjects.length > 0) {
		selectedProjects = application.selectedProjects;
	}

	return (
		<div className="min-h-screen">
			{/* Track visit when page loads */}
			<VisitTracker slug={slug} />
			<main className="w-full mx-auto overflow-hidden">
				{/* Hero: full-width colored header using company primary */}
<div
						className="w-full"
						style={{
							background: themeFinal.background,
							color: onPrimary,
						}}
					>
						<div className="max-w-5xl mx-auto py-8 sm:py-12 md:py-16 px-4 md:px-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
							<div className="flex items-center gap-4">
								{company?.logoUrl ? (
									(() => {
										const BACKEND =
											process.env.NEXT_PUBLIC_BACKEND_URL;
										const logo = company.logoUrl;
										const src =
											typeof logo === "string" &&
											(logo.startsWith("http://") ||
												logo.startsWith("https://"))
												? logo
												: `${BACKEND}${
														logo.startsWith("/")
															? logo
															: `/${logo}`
												  }`;
										return (
											<img
												src={src}
												alt={company.name}
												className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain rounded-md bg-white/10 p-1"
											/>
										);
									})()
								) : (
									<div
										className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-md font-semibold text-xl sm:text-2xl"
										style={{
											background: onPrimary,
											color: themeFinal.primary,
										}}
									>
										{company?.name?.charAt(0) || "?"}
									</div>
								)}
							</div>
							<div className="text-center sm:text-left">
								<h1
									className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
									style={{ color: themeFinal.title }}
								>
									Bienvenue {company?.name}
									<span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl ml-2 sm:ml-3">👋</span>
								</h1>
							<p className="mt-2 text-sm sm:text-base md:text-lg opacity-90" style={{ color: themeFinal.title }}>
								{!application?.jobDescription || application.jobDescription.trim() === "" ? (
									<>
										Candidature spontanée pour un poste de{" "}
										<span className="font-semibold">
											{application?.jobTitle || "—"}
										</span>
									</>
								) : (
									<>
										Candidature au poste de{" "}
										<span className="font-semibold">
											{application?.jobTitle || "—"}
										</span>
									</>
								)}
							</p>
							{company?.tagline && (
								<p className="mt-1 text-xs sm:text-sm opacity-80">
									{company.tagline}
								</p>
							)}
						</div>
						</div>
					</div>

				<div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
					<div className="mb-8 sm:mb-12 inline-flex items-center gap-2 text-xs sm:text-sm text-gray-500">
						<GoLink size={14} />
						<span>Lien de partage</span>
						<CopySlugBadge
							slug={application?.slug}
							accent={themeFinal.accent}
							bg={getLighterColor(themeFinal.accent, 0.85)}
						/>
					</div>

				<div className="mb-8 sm:mb-12 text-sm sm:text-base text-gray-700 leading-relaxed">
					<p>
						{isSpontaneous ? (
							<>
								Merci de prendre le temps de consulter ma candidature spontanée pour un poste de{" "}
								<span className="font-semibold" style={{ color: themeFinal.secondary }}>
									{application?.jobTitle || "—"}
								</span>.
							</>
						) : (
							<>
								Merci de prendre le temps de consulter ma candidature pour le poste de{" "}
								<span className="font-semibold" style={{ color: themeFinal.secondary }}>
									{application?.jobTitle || "—"}
								</span>.
							</>
						)}
					</p>
						<p className="mt-2 text-gray-700">
							Vous trouverez ci-dessous mon CV ainsi que ma lettre de motivation, 
							qui détaillent mon parcours et ma motivation à rejoindre {company?.name}.
						</p>
					</div>

                    {/* Download & Portfolio Links */}
                    <div className="mb-6 sm:mb-10">
                        <DownloadButtons
                            cvData={adaptedCvData}
                            coverLetterData={{
                                text: application?.coverLetter || "",
                                applicantName: application?.applicantName || adaptedCvData.name,
                                date: new Date().toLocaleDateString(),
                                companyName: company?.name,
                                jobTitle: application?.jobTitle,
                                jobDescription: application?.jobDescription,
                                logoUrl: logoSrc,
                            }}
                            theme={themeFinal}
                            jobTitle={application?.jobTitle}
                            logoUrl={logoSrc ?? undefined}
                            companyName={company?.name}
                            applicantName={adaptedCvData?.name}
                            portfolioUrl="/"
                        />
                    </div>					{/* CV Section */}
					<CollapsibleSection
						title="Mon CV"
						defaultOpen={false}
						theme={themeFinal}
						sectionId="cv"
					>
						<article className="p-3 sm:p-6">
							<CvViewer
								data={adaptedCvData}
								pdfSrc="cv.pdf"
								showHtml
								theme={themeFinal}
								jobTitle={application?.jobTitle}
								jobDescription={application?.jobDescription}
								logoUrl={logoSrc ?? undefined}
								selectedProjects={selectedProjects}
							/>
						</article>
					</CollapsibleSection>

					{/* Cover Letter Section */}
					<CollapsibleSection
						title="Ma lettre de motivation"
						defaultOpen={false}
						theme={themeFinal}
						sectionId="coverLetter"
					>
						<article className="p-3 sm:p-6">
							{/* Use CoverLetterViewer to show/download the cover letter */}
							{/* Import dynamically to avoid bundling issues with server components */}
							{/* We'll render the viewer as a client component via a lazy dynamic import */}
							<div>
								<ClientCoverLetterViewer
									data={{
										text: application?.coverLetter || "",
										applicantName:
											application?.applicantName ||
											adaptedCvData.name,
										date: new Date().toLocaleDateString(),
										companyName: company?.name,
										jobTitle: application?.jobTitle,
										logoUrl: logoSrc,
									}}
									showHtml
									theme={themeFinal}
								/>
							</div>
						</article>
					</CollapsibleSection>

					{/* Job Description Section - Only in preview mode */}
					{isPreview && application?.jobDescription && application.jobDescription.trim() !== "" && (
						<CollapsibleSection
							title="Descriptif du poste"
							defaultOpen={false}
							theme={themeFinal}
							sectionId="jobDescription"
						>
							<article className="p-3 sm:p-6 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
								{application.jobDescription}
							</article>
						</CollapsibleSection>
					)}
				</div>
			</main>
		</div>
	);
}

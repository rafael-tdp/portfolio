import React from "react";
import { notFound } from "next/navigation";
import CvViewer from "../../../components/CvViewer";
import ClientCoverLetterViewer from "../../../components/ClientCoverLetterViewer";
import CopySlugBadge from "../../../components/CopySlugBadge";
import VisitTracker from "../../../components/VisitTracker";
import cvSample from "../../../data/cvSample";
import CollapsibleSection from "../../../components/CollapsibleSection";

interface Props {
	params: { slug: string };
}

export default async function Page({ params }: Props) {
	// Some Next runtimes provide `params` as a thenable — await it first.
	const resolvedParams = (await params) as { slug: string };
	const slug = resolvedParams.slug;
	const BACKEND =
		process.env.BACKEND_URL ??
		process.env.NEXT_PUBLIC_BACKEND_URL ??
		"http://localhost:3333";
	const base = BACKEND.replace(/\/+$/, "");
	const res = await fetch(`${base}/public/${encodeURIComponent(slug)}`, {
		cache: "no-store",
	});
	if (!res.ok) return notFound();
	const json = await res.json();
	const company = json.company;
	const application = json.application;
	if (!company) return notFound();
	if (!application) return notFound();
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
		process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";
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
					<div className="max-w-5xl mx-auto py-16 px-4 md:px-8 flex items-center gap-6">
						<div className="flex items-center gap-4">
							{company?.logoUrl ? (
								(() => {
									const BACKEND =
										process.env.NEXT_PUBLIC_BACKEND_URL ||
										"http://localhost:3333";
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
											className="w-24 h-24 object-contain rounded-md bg-white/10 p-1"
										/>
									);
								})()
							) : (
								<div
									className="w-24 h-24 flex items-center justify-center rounded-md font-semibold text-2xl"
									style={{
										background: onPrimary,
										color: themeFinal.primary,
									}}
								>
									{company?.name?.charAt(0) || "?"}
								</div>
							)}
						</div>
						<div>
							<h1
								className="text-5xl md:text-4xl font-bold"
								style={{ color: themeFinal.title }}
							>
								Bienvenue {company?.name}
								<span className="text-5xl ml-3">👋</span>
							</h1>
							<p className="mt-2 text-lg opacity-90">
								Candidature au poste de{" "}
								<span className="font-semibold">
									{application?.jobTitle || "—"}
								</span>
							</p>
							{company?.tagline && (
								<p className="mt-1 text-sm opacity-80">
									{company.tagline}
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="max-w-5xl mx-auto p-6 md:p-8">
					<div className="mb-10 text-sm text-gray-500 flex items-center">
						Partagé publiquement via{" "}
						<CopySlugBadge
							slug={company?.publicSlug}
							accent={themeFinal.accent}
							bg={getLighterColor(themeFinal.accent, 0.85)}
						/>
					</div>

					<div className="mb-10 text-base text-gray-700 font-light">
						Bonjour,
						<br />
						Je vous adresse ma candidature pour le poste de{" "}
						<span className="font-semibold">
							{application?.jobTitle || "—"}
						</span>
						.
						<br />
						Veuillez trouver ci-joints mon CV et ma lettre de motivation,
						qui présentent mes compétences, mon expérience et ma motivation
						pour rejoindre vos équipes.
					</div>

					{/* CV Section */}
					<CollapsibleSection
						title="Mon CV"
						defaultOpen={false}
						theme={themeFinal}
					>
						<article className="p-6">
							<CvViewer
								data={cvSample}
								pdfSrc="cv.pdf"
								showHtml
								theme={themeFinal}
								jobTitle={application?.jobTitle}
								logoUrl={logoSrc ?? undefined}
							/>
						</article>
					</CollapsibleSection>

					{/* Cover Letter Section */}
					<CollapsibleSection
						title="Ma lettre de motivation"
						defaultOpen={false}
						theme={themeFinal}
					>
						<article className="p-6">
							{/* Use CoverLetterViewer to show/download the cover letter */}
							{/* Import dynamically to avoid bundling issues with server components */}
							{/* We'll render the viewer as a client component via a lazy dynamic import */}
							<div>
								<ClientCoverLetterViewer
									data={{
										text: application?.coverLetter || "",
										applicantName:
											application?.applicantName ||
											cvSample.name,
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
				</div>
			</main>
		</div>
	);
}

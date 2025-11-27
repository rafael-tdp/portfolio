"use client";

import React from "react";
import { FaGlobe, FaLinkedinIn, FaPhoneAlt } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import { TbBrandGithubFilled } from "react-icons/tb";

type CVData = {
	name?: string;
	contact?: {
		email?: string;
		phone?: string;
		github?: string;
		linkedin?: string;
		website?: string;
	};
	formations?: Array<{ title?: string; period?: string; school?: string }>;
	title?: string;
	experiencesSummary?: string;
	experiences?: Array<{
		company?: string;
		role?: string;
		period?: string;
		bullets?: string[];
	}>;
	projects?: Array<{ name?: string; period?: string; description?: string }>;
	availability?: string;
	languages?: Array<{ name?: string; level?: string }>;
	interests?: string[];
	strengths?: string;
	skills?: {
		mainLanguages?: string;
		cloud?: string;
		methodologies?: string;
		databases?: string;
		frontend?: string;
		backend?: string;
		tests?: string;
		mobile?: string;
	};
};

function SkillsSectionGroup({
	title,
	content,
}: {
	title: string;
	content?: string;
}) {
	return (
		<>
			<div className="mt-3 font-semibold">{title}</div>
			<div className="text-[0.65rem]">{content}</div>
		</>
	);
}

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

export default function CvHtml({
	data,
	theme,
	jobTitle,
	logoUrl,
}: {
	data: CVData;
	theme?: any;
	jobTitle?: string;
	logoUrl?: string;
}) {
	const d = data || {};

	function CvSectionTitle({ title }: { title?: string }) {
		return (
			<div
				className="flex items-center gap-3 mb-3 font-semibold uppercase text-sm"
				style={{ color: theme?.background }}
			>
				<h4>{title}</h4>
				<hr
					className="flex-grow border-t"
					style={{ borderColor: theme?.background }}
				/>
			</div>
		);
	}

	function ContactItem({
		icon,
		value,
		href,
		className,
		iconClassName,
		style,
	}: {
		icon: React.ReactNode;
		label: string;
		value: string;
		href?: string;
		className?: string;
		iconClassName?: string;
		style?: React.CSSProperties;
	}) {
		return (
			<div
				className={`flex items-center gap-2 ${className}`}
				style={style}
			>
				<div
					className={`rounded-full w-4 h-4 flex items-center justify-center text-white p-0.5 ${iconClassName}`}
					style={{ backgroundColor: theme?.background }}
				>
					{icon}
				</div>
				{href ? (
					<a href={href} className="break-words">
						{value}
					</a>
				) : (
					<span>{value}</span>
				)}
			</div>
		);
	}

	return (
		<div
			id="cv-content"
			className="bg-white overflow-hidden relative text-[0.65rem] w-[794px] h-[1123px]"
		>
			<style>{`
				#cv-content strong {
					font-weight: 500;
				}
			`}</style>
			<header
				className="absolute top-10 left-10 right-10 flex gap-4 p-1 rounded-full text-white overflow-hidden"
				style={{ backgroundColor: theme?.background }}
			>
				<img
					src="/img/photo-pro-without-bg.png"
					alt="Photo"
					className="w-32 h-32 object-cover rounded-full mr-6"
					style={{
						backgroundColor: getLighterColor(
							theme?.background,
							0.85
						),
					}}
				/>
				<div className="flex flex-col justify-center">
					<h1
						className="text-4xl z-10"
						style={{
							color: getLighterColor(theme?.background, 0.7),
						}}
					>
						{d.name}
					</h1>
					<h2 className="text-2xl font-semibold tracking-wide uppercase z-10">
						{jobTitle || d.title}
					</h2>
					<h3
						className="text-base uppercase font-medium z-10"
						style={{
							color: getLighterColor(theme?.background, 0.7),
						}}
					>
						Disponibilité immédiate
					</h3>
				</div>

				{/* Company logo as faint background on the right side of the header */}
				{logoUrl ? (
					<div className="absolute top-0 bottom-0 right-1 flex items-center pointer-events-none rounded-full overflow-hidden">
						<img
							src={logoUrl}
							alt="logo"
							className="object-contain"
							style={{
								width: 180,
								height: "auto",
								opacity: 0.3,
								objectFit: "contain",
								WebkitMaskImage:
									"linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))",
								maskImage:
									"linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))",
							}}
						/>
					</div>
				) : null}
			</header>
			<div className="flex">
				{/* Left colored sidebar */}
				<aside
					className="w-[30rem] pt-[13rem] text-black pb-8"
					style={{
						backgroundColor: getLighterColor(
							theme?.background,
							0.85
						),
					}}
				>
					<div className="px-7">
						<div className="">
							<CvSectionTitle title="Contact" />
							<div className="leading-relaxed space-y-0.5">
								<ContactItem
									icon={<MdAlternateEmail />}
									label="Email"
									value={d.contact?.email || ""}
									href={`mailto:${d.contact?.email}`}
								/>

								<ContactItem
									icon={<FaPhoneAlt />}
									label="Phone"
									value={d.contact?.phone || ""}
									href={`tel:${d.contact?.phone}`}
									iconClassName="p-1"
								/>

								<ContactItem
									icon={<TbBrandGithubFilled />}
									label="GitHub"
									value={d.contact?.github || ""}
									href={`https://github.com/${d.contact?.github}`}
								/>

								<ContactItem
									icon={<FaLinkedinIn />}
									label="LinkedIn"
									value={d.contact?.linkedin || ""}
									href={`https://linkedin.com/in/${d.contact?.linkedin}`}
									iconClassName="p-1"
								/>

								<ContactItem
									icon={<FaGlobe />}
									label="Website"
									value={d.contact?.website || ""}
									href={d.contact?.website}
									className="font-semibold"
									style={{ color: theme?.background }}
								/>
							</div>
						</div>

						<div className="mt-6">
							<CvSectionTitle title="Compétences" />
							<SkillsSectionGroup
								title="Langages principaux"
								content={d.skills?.mainLanguages}
							/>
							<SkillsSectionGroup
								title="Frontend"
								content={d.skills?.frontend}
							/>
							<SkillsSectionGroup
								title="Backend"
								content={d.skills?.backend}
							/>
							<SkillsSectionGroup
								title="Bases de données"
								content={d.skills?.databases}
							/>
							<SkillsSectionGroup
								title="Tests"
								content={d.skills?.tests}
							/>
							<SkillsSectionGroup
								title="Cloud & DevOps"
								content={d.skills?.cloud}
							/>
							<SkillsSectionGroup
								title="Méthodologies"
								content={d.skills?.methodologies}
							/>
							<SkillsSectionGroup
								title="Mobile"
								content={d.skills?.mobile}
							/>
						</div>

						<div className="mt-6">
							<CvSectionTitle title="Atouts" />
							<div className=" leading-relaxed whitespace-pre-line">
								{d.strengths}
							</div>
						</div>

						<div className="mt-6">
							<CvSectionTitle title="Langues" />
							<ul className="space-y-0.5">
								{d.languages?.map((l: any, i: number) => (
									<li key={i} className="flex items-center">
										<img
											src={`../img/languages/${l.name}.png`}
											alt={l.name}
											className="w-3 h-3 mr-2 rounded-full"
										/>
										{l.name}: {l.level}
									</li>
								))}
							</ul>
						</div>

						<div className="mt-6">
							<CvSectionTitle title="Intérêts" />
							<div className="">
								{(d.interests || []).join(", ")}
							</div>
						</div>
					</div>
				</aside>

				{/* Right main area */}
				<main className="w-auto p-8 pt-[13rem]">
					<section className="mb-6">
						<CvSectionTitle title="Expériences professionnelles" />
						<div className="space-y-5  text-gray-700">
							{d.experiences?.map((ex: any, i: number) => (
								<div key={i}>
									<div className="flex justify-between items-start">
										<div className="text-[0.73rem]">
											<div className="font-semibold">
												{ex.role}
											</div>
											<div className="font-medium">
												{ex.company}
											</div>
										</div>
										<div className="text-gray-500">
											{ex.period}
										</div>
									</div>
									{ex.bullets && (
										<ul className="mt-1 list-disc list-inside text-gray-700">
											{ex.bullets.map(
												(b: string, bi: number) => (
													<li
														key={bi}
														dangerouslySetInnerHTML={{
															__html: b ?? "",
														}}
													/>
												)
											)}
										</ul>
									)}
								</div>
							))}
						</div>
					</section>

					<section className="mb-6">
						<CvSectionTitle title="Formations" />
						<div className="mt-3 space-y-4 text-gray-700 text-[0.73rem]">
							{d.formations?.map((f: any, i: number) => (
								<div key={i}>
									<div className="flex justify-between">
										<div className="font-semibold">
											{f.title}
										</div>
										<div className="text-gray-500 font-normal text-[0.65rem]">
											{f.period}
										</div>
									</div>
									<div className="text-gray-500">
										{f.school}
									</div>
								</div>
							))}
						</div>
					</section>

					<section className="mb-6">
						<CvSectionTitle title="Projets" />
						<div className="mt-3 space-y-4 text-gray-700">
							{d.projects?.map((p: any, i: number) => (
								<div key={i}>
									<div className="flex justify-between mb-1">
										<span className="text-[0.73rem] font-semibold">
											{p.name}{" "}
										</span>
										<span className="text-gray-500 text-[0.65rem]">
											{p.period}
										</span>
									</div>
									<ul className="list-disc list-inside">
										{p.description?.map(
											(desc: string, di: number) => (
												<li
													key={di}
													dangerouslySetInnerHTML={{
														__html: desc ?? "",
													}}
												/>
											)
										)}
									</ul>
								</div>
							))}
						</div>
					</section>
				</main>
			</div>
		</div>
	);
}

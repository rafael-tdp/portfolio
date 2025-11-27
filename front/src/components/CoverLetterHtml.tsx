"use client";

import React from "react";
import { MdAlternateEmail } from "react-icons/md";
import { FaGlobe, FaPhoneAlt } from "react-icons/fa";

type CLData = {
	text?: string;
	applicantName?: string;
	date?: string;
	companyName?: string;
	jobTitle?: string;
	logoUrl?: string;
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

export default function CoverLetterHtml({
	data,
	theme,
}: {
	data?: CLData;
	theme?: any;
}) {
	function ContactItem({
		icon,
		value,
		href,
		className,
		iconClassName,
		style,
	}: {
		icon: React.ReactNode;
		label?: string;
		value: string;
		href?: string;
		className?: string;
		iconClassName?: string;
		style?: React.CSSProperties;
	}) {
		return (
			<div
				className={`flex items-center gap-2 ${className} font-light`}
				style={style}
			>
				<div
					className={`rounded-full w-4 h-4 flex items-center justify-center text-white p-0.5 ${iconClassName}`}
					style={{ color: theme?.background }}
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

	const d = data || {};
	return (
		<div
			id="cover-letter-content"
			className="bg-white text-base w-[794px] h-[1123px] flex flex-col"
			style={{ position: "relative", zIndex: 10 }}
		>
			<header
				style={{
					backgroundColor: theme?.background,
					color: theme?.title,
				}}
				className="flex p-10"
			>
				{/* title */}
				<div className="flex flex-col font-semibold justify-between">
					<h1 className="text-3xl">
						{d.applicantName || "Rafael Tavares De Pinho"}
					</h1>
					<h2 className="text-lg font-normal text-white/70 max-w-[400px]">
						{d.jobTitle || "Développeur Full-Stack"}
					</h2>
				</div>

				{/* contact info */}
				<div className="ml-auto text-sm flex flex-col text-right gap-1">
					<ContactItem
						icon={<MdAlternateEmail />}
						label="Email"
						value={"tavaresrafael93@gmail.com"}
						href={`mailto:tavaresrafael93@gmail.com`}
						iconClassName="bg-white"
					/>
					<ContactItem
						icon={<FaPhoneAlt size={12} />}
						value={"06 95 22 49 32"}
						iconClassName="bg-white p-1"
						href={`tel:0695224932`}
					/>
					<ContactItem
						icon={<FaGlobe size={12} />}
						value={"rafaeltavares.fr"}
						iconClassName="bg-white"
						className="font-normal"
						href={`https://www.rafaeltavares.fr`}
					/>
				</div>
			</header>

			<div
				className="h-6 w-full"
				style={{
					backgroundColor: getLighterColor(
						theme?.background || "#000000",
						0.85
					),
				}}
			></div>

			<div className="p-10 h-max flex-grow">
				<div className="mb-4 flex">
					<div className="font-semibold text-sm">
						À l&apos;intention du service de recrutement de{" "}
						{d.companyName || "Entreprise"}
					</div>
					{d.logoUrl ? (
						<img
							src={d.logoUrl}
							alt={d.companyName || "Company"}
							className="h-12 object-contain rounded-md bg-white/10 p-1 ml-auto"
						/>
					) : null}
				</div>
				<div className="font-semibold text-sm mb-10">
					Objet: Candidature au poste de {d.jobTitle || "Poste"}
				</div>

				<article className="prose text-sm text-gray-800 whitespace-pre-wrap font-light text-justify	">
					{d.text || ""}
					{/* signature */}
					<br />
                    <br />
					<p className="font-semibold">
						{d.applicantName || "Rafael Tavares De Pinho"}
					</p>
				</article>
			</div>
			<div
				className="w-full h-6 mt-auto"
				style={{
					backgroundColor: theme?.background || "#000000",
				}}
			></div>
		</div>
	);
}

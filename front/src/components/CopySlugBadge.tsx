"use client";

import React from "react";
import { LuCopy } from "react-icons/lu";

export default function CopySlugBadge({
	slug,
	accent,
	bg,
}: {
	slug?: string;
	accent?: string;
	bg?: string;
}) {
	const [copied, setCopied] = React.useState(false);

	const handleClick = async () => {
		try {
			if (!slug) return;
			const full = ((): string => {
				if (/^https?:\/\//i.test(slug)) return slug;
				const s = slug.replace(/^\/+/, "");
				return `${window.location.origin}/${s}`;
			})();

			await navigator.clipboard.writeText(full);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch (e) {
			console.error("copy failed", e);
		}
	};

	return (
		<span
			className="rounded px-2 py-1 inline-flex items-center gap-2 cursor-pointer ml-2 text-xs"
			style={{ color: accent, backgroundColor: bg }}
			onClick={handleClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") handleClick();
			}}
			aria-label={copied ? "Lien copié" : "Copier le lien"}
		>
			{copied ? "Lien copié !" : slug}
			<LuCopy />
		</span>
	);
}

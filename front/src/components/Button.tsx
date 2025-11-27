"use client";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import React from "react";
// small helper to join classes without adding a dependency
function cx(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "success" | "indigo" | "neutral" | "ghost";
type Size = "sm" | "md";

export default function Button({
	children,
	className,
	disabled,
	title,
	type = "button",
	onClick,
	icon,
	style,
	loading,
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: Variant;
	size?: Size;
	icon?: React.ReactNode;
	style?: React.CSSProperties;
	loading?: boolean;
}) {
	const base =
		"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-gray-100 shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 text-gray-700 border-gray-300";

	const hoverClass = disabled ? "" : "hover:bg-gray-100 cursor-pointer";

	return (
		<button
			type={type}
			className={cx(base, hoverClass, className)}
			disabled={disabled}
			title={title}
			onClick={onClick}
			style={style}
		>
			{loading ? (
				<AiOutlineLoading3Quarters className="animate-spin" />
			) : (
				icon
			)}
			{children}
		</button>
	);
}

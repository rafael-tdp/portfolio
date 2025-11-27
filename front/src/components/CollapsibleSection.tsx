"use client";

import React from "react";
import { LuMinus, LuPlus } from "react-icons/lu";

export default function CollapsibleSection({
	title,
	defaultOpen = true,
	theme,
	children,
}: {
	title: string;
	defaultOpen?: boolean;
	theme?: any;
	placeholderText?: string;
	children?: React.ReactNode;
}) {
	const [open, setOpen] = React.useState<boolean>(defaultOpen);

	function hexToRgba(hex?: string, alpha = 1) {
		if (!hex) return undefined;
		const h = hex.replace("#", "");
		if (h.length !== 6) return hex;
		const r = parseInt(h.slice(0, 2), 16);
		const g = parseInt(h.slice(2, 4), 16);
		const b = parseInt(h.slice(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	return (
		<section className="mb-4">
			<div
				className={`rounded-md shadow-sm overflow-hidden`}
				style={{ backgroundColor: hexToRgba(theme?.primary, 0.04) }}
			>
				<div
					role="button"
					tabIndex={0}
					onClick={() => setOpen(!open)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") setOpen(!open);
					}}
					className="flex items-center justify-between p-4 cursor-pointer select-none border-b"
                    style={{ borderColor: hexToRgba(theme?.primary, 0.06) }}
				>
					<h2
						className="text-lg font-medium"
						style={{ color: theme?.primary }}
					>
						{title}
					</h2>

					<button
						aria-expanded={open}
						className={`w-9 h-9 flex items-center justify-center rounded-md text-lg`}
                        style={{
                            background: hexToRgba(theme?.primary, 0.1),
                            color: theme?.primary,
                        }}
						onClick={(e) => {
							e.stopPropagation();
							setOpen(!open);
						}}
					>
						{open ? (
							<LuMinus aria-hidden="true" />
						) : (
							<LuPlus aria-hidden="true" />
						)}
					</button>
				</div>

				{open && (
					<div
						className="border-l-4"
						style={{ borderColor: theme?.primary }}
					>
						{children}
					</div>
				)}
			</div>
		</section>
	);
}

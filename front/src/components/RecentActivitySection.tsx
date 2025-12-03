"use client";

import React from "react";
import {
	LuMonitor,
	LuSmartphone,
	LuTablet,
	LuGlobe,
	LuTimer,
	LuMail,
	LuLink,
} from "react-icons/lu";
import { FaLinkedin, FaGoogle, FaTwitter } from "react-icons/fa";

type Activity = {
	_id: string;
	createdAt: string;
	userAgent: string;
	source?: string;
	timeSpent?: number;
	sectionsViewed?: Record<string, boolean>;
	companyName: string;
	jobTitle: string;
};

interface RecentActivitySectionProps {
	recentActivity: Activity[];
	maxItems?: number;
}

export default function RecentActivitySection({
	recentActivity,
	maxItems = 15,
}: RecentActivitySectionProps) {
	function getDeviceIcon(device: string) {
		switch (device.toLowerCase()) {
			case "mobile":
				return <LuSmartphone className="w-4 h-4" />;
			case "tablet":
				return <LuTablet className="w-4 h-4" />;
			case "desktop":
				return <LuMonitor className="w-4 h-4" />;
			default:
				return <LuGlobe className="w-4 h-4" />;
		}
	}

	function getDeviceFromUA(ua?: string) {
		if (!ua) return "Inconnu";
		if (/mobile/i.test(ua) && !/tablet/i.test(ua)) return "Mobile";
		if (/tablet|ipad/i.test(ua)) return "Tablette";
		return "Desktop";
	}

	function getSourceIcon(source: string) {
		const s = source.toLowerCase();
		if (s.includes("linkedin"))
			return <FaLinkedin className="w-4 h-4 text-[#0077b5]" />;
		if (
			s.includes("mail.google") ||
			s.includes("outlook") ||
			s.includes("mail.")
		)
			return <LuMail className="w-4 h-4 text-red-500" />;
		if (s.includes("google"))
			return <FaGoogle className="w-4 h-4 text-[#4285f4]" />;
		if (s.includes("twitter") || s.includes("x.com"))
			return <FaTwitter className="w-4 h-4 text-[#1da1f2]" />;
		if (s === "direct") return <LuLink className="w-4 h-4 text-gray-500" />;
		return <LuGlobe className="w-4 h-4 text-gray-400" />;
	}

	function getSourceLabel(source: string) {
		const s = source.toLowerCase();
		if (s.includes("linkedin")) return "LinkedIn";
		if (s.includes("mail.google")) return "Gmail";
		if (s.includes("outlook")) return "Outlook";
		if (s.includes("google")) return "Google";
		if (s.includes("twitter")) return "Twitter";
		if (s.includes("x.com")) return "X (Twitter)";
		if (s === "direct") return "Lien direct";
		return source;
	}

	function formatTime(seconds: number) {
		if (seconds < 60) return `${seconds}s`;
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		if (mins < 60) return `${mins}m ${secs}s`;
		const hours = Math.floor(mins / 60);
		const remainMins = mins % 60;
		return `${hours}h ${remainMins}m`;
	}

	function formatDateTime(dateStr: string) {
		const d = new Date(dateStr);
		return d.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	return (
		<div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
			<div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
				<h2 className="font-semibold text-gray-800">Activité récente</h2>
			</div>
			{recentActivity && recentActivity.length > 0 ? (
				<div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
					{recentActivity.slice(0, maxItems).map((activity) => (
						<div
							key={activity._id}
							className="px-4 sm:px-5 py-3 hover:bg-gray-50/50 transition-colors"
						>
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-sm flex-shrink-0">
										{getDeviceIcon(
											getDeviceFromUA(
												activity.userAgent
											)
										)}
									</div>
									<div className="min-w-0">
										<div className="text-sm font-medium text-gray-800 truncate">
											{activity.companyName ||
												"Entreprise"}
										</div>
										<div className="text-xs text-gray-400 truncate">
											{activity.jobTitle || "Poste"}
										</div>
									</div>
								</div>
								<div className="text-xs text-gray-500 flex-shrink-0 ml-2">
									{formatDateTime(activity.createdAt)}
								</div>
							</div>
							{/* Additional activity details */}
							<div className="ml-11 flex flex-wrap items-center gap-2 text-xs">
								{activity.source && (
									<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
										{getSourceIcon(activity.source)}
										{getSourceLabel(activity.source)}
									</span>
								)}
								{activity.timeSpent &&
									activity.timeSpent > 0 && (
										<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 rounded-full text-violet-600">
											<LuTimer className="w-3 h-3" />
											{formatTime(activity.timeSpent)}
										</span>
									)}
								{activity.sectionsViewed && (
									<>
										{activity.sectionsViewed.cv && (
											<span className="px-2 py-0.5 bg-emerald-50 rounded-full text-emerald-600">
												CV ✓
											</span>
										)}
										{activity.sectionsViewed
											.coverLetter && (
											<span className="px-2 py-0.5 bg-sky-50 rounded-full text-sky-600">
												Lettre ✓
											</span>
										)}
									</>
								)}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="p-8 text-center text-gray-400 text-sm">
					Aucune activité récente
				</div>
			)}
		</div>
	);
}

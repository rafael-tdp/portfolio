"use client";

import React from "react";
import Link from "next/link";
import AuthGuard from "../../../components/AuthGuard";
import {
	LuArrowLeft,
	LuEye,
	LuUsers,
	LuMonitor,
	LuSmartphone,
	LuTablet,
	LuGlobe,
	LuClock,
	LuActivity,
	LuFileText,
	LuMail,
	LuLink,
	LuTimer,
	LuScroll,
} from "react-icons/lu";
import { FaLinkedin, FaGoogle, FaTwitter } from "react-icons/fa";
import * as api from "@/lib/api";

type AnalyticsData = {
	visitsByDay: Array<{ date: string; count: number; uniqueVisitors: number }>;
	visitsByHour: Array<{ hour: number; count: number }>;
	deviceStats: Array<{ device: string; count: number }>;
	browserStats: Array<{ browser: string; count: number }>;
	sourceStats: Array<{ source: string; count: number }>;
	sectionStats: Array<{ section: string; count: number; key: string }>;
	topApplications: Array<{
		applicationId: string;
		jobTitle: string;
		companyName: string;
		totalVisits: number;
		uniqueVisitors: number;
		lastVisit: string;
	}>;
	recentActivity: Array<{
		_id: string;
		createdAt: string;
		userAgent: string;
		source?: string;
		timeSpent?: number;
		sectionsViewed?: Record<string, boolean>;
		companyName: string;
		jobTitle: string;
	}>;
	totalVisits: number;
	uniqueVisitors: number;
	avgVisitsPerDay: number;
	avgTimeSpent: number;
	avgScrollDepth: number;
};

export default function AnalyticsPage() {
	return (
		<AuthGuard>
			<AnalyticsContent />
		</AuthGuard>
	);
}

function AnalyticsContent() {
	const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(
		null
	);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		(async () => {
			try {
				const data = await api.getAnalytics();
				setAnalytics(data);
			} catch (err) {
				console.warn("Failed to load analytics", err);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	function formatDate(dateStr: string) {
		const d = new Date(dateStr);
		return d.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
		});
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
		// For known domains, return friendly names; otherwise show domain as-is
		const s = source.toLowerCase();
		if (s.includes("linkedin")) return "LinkedIn";
		if (s.includes("mail.google")) return "Gmail";
		if (s.includes("outlook")) return "Outlook";
		if (s.includes("google")) return "Google";
		if (s.includes("twitter")) return "Twitter";
		if (s.includes("x.com")) return "X (Twitter)";
		if (s === "direct") return "Lien direct";
		// Return the domain as-is for other sources
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

	// Fill missing days in the last 30 days
	function getFilledDays() {
		if (!analytics) return [];
		const days: Array<{
			date: string;
			count: number;
			uniqueVisitors: number;
		}> = [];
		const today = new Date();

		for (let i = 29; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const dateStr = d.toISOString().split("T")[0];
			const existing = analytics.visitsByDay.find(
				(v) => v.date === dateStr
			);
			days.push({
				date: dateStr,
				count: existing?.count || 0,
				uniqueVisitors: existing?.uniqueVisitors || 0,
			});
		}
		return days;
	}

	// Fill all 24 hours
	function getFilledHours() {
		if (!analytics) return [];
		const hours: Array<{ hour: number; count: number }> = [];
		for (let i = 0; i < 24; i++) {
			const existing = analytics.visitsByHour.find((v) => v.hour === i);
			hours.push({ hour: i, count: existing?.count || 0 });
		}
		return hours;
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
			</div>
		);
	}

	const filledDays = getFilledDays();
	const filledHours = getFilledHours();
	const maxDayVisits = Math.max(...filledDays.map((d) => d.count), 1);
	const maxHourVisits = Math.max(...filledHours.map((h) => h.count), 1);

	return (
		<div className="min-h-screen px-4 py-4 sm:p-6 bg-gray-50">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<Link
						href="/dashboard"
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
					>
						<LuArrowLeft className="w-5 h-5 text-gray-600" />
					</Link>
					<div>
						<h1 className="text-xl sm:text-2xl font-semibold">
							Analytics détaillés
						</h1>
						<p className="text-sm text-gray-500 mt-0.5">
							Statistiques des 30 derniers jours
						</p>
					</div>
				</div>

				{/* Summary cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
					<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
								<LuEye className="w-5 h-5 text-white" />
							</div>
							<div>
								<div className="text-xl sm:text-2xl font-bold text-gray-800">
									{analytics?.totalVisits || 0}
								</div>
								<div className="text-xs text-gray-400">
									Visites totales
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
								<LuUsers className="w-5 h-5 text-white" />
							</div>
							<div>
								<div className="text-xl sm:text-2xl font-bold text-gray-800">
									{analytics?.uniqueVisitors || 0}
								</div>
								<div className="text-xs text-gray-400">
									Visiteurs uniques
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
								<LuTimer className="w-5 h-5 text-white" />
							</div>
							<div>
								<div className="text-xl sm:text-2xl font-bold text-gray-800">
									{formatTime(analytics?.avgTimeSpent || 0)}
								</div>
								<div className="text-xs text-gray-400">
									Temps moyen
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
								<LuScroll className="w-5 h-5 text-white" />
							</div>
							<div>
								<div className="text-xl sm:text-2xl font-bold text-gray-800">
									{analytics?.avgScrollDepth || 0}%
								</div>
								<div className="text-xs text-gray-400">
									Scroll moyen
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Charts row */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
					{/* Visits by day chart */}
					<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
						<div className="flex items-center gap-2 mb-4">
							<LuActivity className="w-5 h-5 text-gray-400" />
							<h2 className="font-semibold text-gray-800">
								Visites par jour
							</h2>
						</div>
						<div className="h-48 sm:h-56 flex flex-col">
							{/* Chart area */}
							<div className="flex-1 flex items-end gap-[2px] sm:gap-1 min-h-0">
								{filledDays.map((day) => (
									<div
										key={day.date}
										className="flex-1 flex flex-col items-center justify-end h-full group relative"
									>
										<div
											className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-sm transition-all hover:from-sky-600 hover:to-sky-500 cursor-pointer"
											style={{
												height:
													day.count > 0
														? `${Math.max(
																(day.count /
																	maxDayVisits) *
																	100,
																8
														  )}%`
														: "3px",
												minHeight:
													day.count > 0
														? "12px"
														: "3px",
											}}
										/>
										{/* Tooltip */}
										<div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
											<div className="bg-gray-800 text-white text-xs rounded px-2 py-1.5 whitespace-nowrap shadow-lg">
												<div className="font-medium">
													{formatDate(day.date)}
												</div>
												<div>
													{day.count} visite
													{day.count !== 1 ? "s" : ""}
												</div>
												<div className="text-gray-300">
													{day.uniqueVisitors} unique
													{day.uniqueVisitors !== 1
														? "s"
														: ""}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
							{/* X-axis labels */}
							<div className="flex gap-[2px] sm:gap-1 mt-2 pt-2 border-t border-gray-100">
								{filledDays.map((day, index) => (
									<div
										key={day.date}
										className="flex-1 text-center"
									>
										{index % 7 === 0 && (
											<span className="text-[9px] sm:text-[10px] text-gray-400">
												{formatDate(day.date)}
											</span>
										)}
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Visits by hour chart */}
					<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
						<div className="flex items-center gap-2 mb-4">
							<LuClock className="w-5 h-5 text-gray-400" />
							<h2 className="font-semibold text-gray-800">
								Visites par heure
							</h2>
						</div>
						<div className="h-48 sm:h-56 flex flex-col">
							{/* Chart area */}
							<div className="flex-1 flex items-end gap-[2px] sm:gap-1 min-h-0">
								{filledHours.map((hour) => (
									<div
										key={hour.hour}
										className="flex-1 flex flex-col items-center justify-end h-full group relative"
									>
										<div
											className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm transition-all hover:from-emerald-600 hover:to-emerald-500 cursor-pointer"
											style={{
												height:
													hour.count > 0
														? `${Math.max(
																(hour.count /
																	maxHourVisits) *
																	100,
																8
														  )}%`
														: "3px",
												minHeight:
													hour.count > 0
														? "12px"
														: "3px",
											}}
										/>
										{/* Tooltip */}
										<div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
											<div className="bg-gray-800 text-white text-xs rounded px-2 py-1.5 whitespace-nowrap shadow-lg">
												<div className="font-medium">
													{hour.hour}h -{" "}
													{hour.hour + 1}h
												</div>
												<div>
													{hour.count} visite
													{hour.count !== 1
														? "s"
														: ""}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
							{/* X-axis labels */}
							<div className="flex gap-[2px] sm:gap-1 mt-2 pt-2 border-t border-gray-100">
								{filledHours.map((hour) => (
									<div
										key={hour.hour}
										className="flex-1 text-center"
									>
										{hour.hour % 4 === 0 && (
											<span className="text-[9px] sm:text-[10px] text-gray-400">
												{hour.hour}h
											</span>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Device & Browser stats */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
					{/* Device stats */}
					<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
						<div className="flex items-center gap-2 mb-4">
							<LuMonitor className="w-5 h-5 text-gray-400" />
							<h2 className="font-semibold text-gray-800">
								Appareils
							</h2>
						</div>
						{analytics?.deviceStats &&
						analytics.deviceStats.length > 0 ? (
							<div className="space-y-3">
								{analytics.deviceStats.map((stat) => {
									const percentage = Math.round(
										(stat.count / analytics.totalVisits) *
											100
									);
									return (
										<div key={stat.device}>
											<div className="flex items-center justify-between text-sm mb-1">
												<div className="flex items-center gap-2">
													{getDeviceIcon(stat.device)}
													<span className="text-gray-700">
														{stat.device}
													</span>
												</div>
												<span className="text-gray-500">
													{stat.count} ({percentage}%)
												</span>
											</div>
											<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
												<div
													className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all"
													style={{
														width: `${percentage}%`,
													}}
												/>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center text-gray-400 text-sm py-8">
								Aucune donnée disponible
							</div>
						)}
					</div>

					{/* Browser stats */}
					<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
						<div className="flex items-center gap-2 mb-4">
							<LuGlobe className="w-5 h-5 text-gray-400" />
							<h2 className="font-semibold text-gray-800">
								Navigateurs
							</h2>
						</div>
						{analytics?.browserStats &&
						analytics.browserStats.length > 0 ? (
							<div className="space-y-3">
								{analytics.browserStats.map((stat) => {
									const percentage = Math.round(
										(stat.count / analytics.totalVisits) *
											100
									);
									return (
										<div key={stat.browser}>
											<div className="flex items-center justify-between text-sm mb-1">
												<span className="text-gray-700">
													{stat.browser}
												</span>
												<span className="text-gray-500">
													{stat.count} ({percentage}%)
												</span>
											</div>
											<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
												<div
													className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
													style={{
														width: `${percentage}%`,
													}}
												/>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center text-gray-400 text-sm py-8">
								Aucune donnée disponible
							</div>
						)}
					</div>
				</div>

				{/* Source & Sections stats */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
					{/* Source stats */}
					<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
						<div className="flex items-center gap-2 mb-4">
							<LuLink className="w-5 h-5 text-gray-400" />
							<h2 className="font-semibold text-gray-800">
								Sources de trafic
							</h2>
						</div>
						{analytics?.sourceStats &&
						analytics.sourceStats.length > 0 ? (
							<div className="space-y-3">
								{analytics.sourceStats.map((stat) => {
									const percentage = Math.round(
										(stat.count / analytics.totalVisits) *
											100
									);
									return (
										<div key={stat.source}>
											<div className="flex items-center justify-between text-sm mb-1">
												<div className="flex items-center gap-2">
													{getSourceIcon(stat.source)}
													<span className="text-gray-700">
														{getSourceLabel(
															stat.source
														)}
													</span>
												</div>
												<span className="text-gray-500">
													{stat.count} ({percentage}%)
												</span>
											</div>
											<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
												<div
													className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all"
													style={{
														width: `${percentage}%`,
													}}
												/>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center text-gray-400 text-sm py-8">
								Aucune donnée disponible
							</div>
						)}
					</div>

					{/* Sections viewed stats */}
					<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
						<div className="flex items-center gap-2 mb-4">
							<LuFileText className="w-5 h-5 text-gray-400" />
							<h2 className="font-semibold text-gray-800">
								Sections consultées
							</h2>
						</div>
						{analytics?.sectionStats &&
						analytics.sectionStats.length > 0 ? (
							<div className="space-y-3">
								{analytics.sectionStats.map((stat) => {
									const percentage =
										analytics.totalVisits > 0
											? Math.round(
													(stat.count /
														analytics.totalVisits) *
														100
											  )
											: 0;
									return (
										<div key={stat.key}>
											<div className="flex items-center justify-between text-sm mb-1">
												<span className="text-gray-700">
													{stat.section}
												</span>
												<span className="text-gray-500">
													{stat.count} ({percentage}%)
												</span>
											</div>
											<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
												<div
													className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
													style={{
														width: `${percentage}%`,
													}}
												/>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center text-gray-400 text-sm py-8">
								Aucune donnée disponible
							</div>
						)}
					</div>
				</div>

				{/* Top applications */}
				<div className="bg-white rounded-xl border border-gray-100 mb-6 overflow-hidden">
					<div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
						<h2 className="font-semibold text-gray-800">
							Top candidatures
						</h2>
					</div>
					{analytics?.topApplications &&
					analytics.topApplications.length > 0 ? (
						<div className="divide-y divide-gray-50">
							{analytics.topApplications.map((app, index) => (
								<div
									key={app.applicationId}
									className="px-4 sm:px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
								>
									<div className="flex items-center gap-3 min-w-0">
										<div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center text-sm font-bold text-sky-600 flex-shrink-0">
											{index + 1}
										</div>
										<div className="min-w-0">
											<div className="font-medium text-gray-800 truncate text-sm">
												{app.jobTitle || "Sans titre"}
											</div>
											<div className="text-xs text-gray-400 truncate">
												{app.companyName ||
													"Entreprise"}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
										<div className="flex flex-col items-center px-2 sm:px-3 py-1 bg-sky-50 rounded-lg min-w-[50px]">
											<div className="text-sm font-bold text-sky-600">
												{app.totalVisits}
											</div>
											<div className="text-[7px] uppercase tracking-wide text-sky-400 font-medium">
												visites
											</div>
										</div>
										<div className="flex flex-col items-center px-2 sm:px-3 py-1 bg-emerald-50 rounded-lg min-w-[50px]">
											<div className="text-sm font-bold text-emerald-600">
												{app.uniqueVisitors}
											</div>
											<div className="text-[7px] uppercase tracking-wide text-emerald-400 font-medium">
												uniques
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="p-8 text-center text-gray-400 text-sm">
							Aucune candidature avec des visites
						</div>
					)}
				</div>

				{/* Recent activity */}
				<div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
					<div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
						<h2 className="font-semibold text-gray-800">
							Activité récente
						</h2>
					</div>
					{analytics?.recentActivity &&
					analytics.recentActivity.length > 0 ? (
						<div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
							{analytics.recentActivity.map((activity) => (
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
													{activity.jobTitle ||
														"Poste"}
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
												{getSourceLabel(
													activity.source
												)}
											</span>
										)}
										{activity.timeSpent &&
											activity.timeSpent > 0 && (
												<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 rounded-full text-violet-600">
													<LuTimer className="w-3 h-3" />
													{formatTime(
														activity.timeSpent
													)}
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
			</div>
		</div>
	);
}

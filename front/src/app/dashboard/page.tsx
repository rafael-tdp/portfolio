"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";
import AuthGuard from "../../components/AuthGuard";
import Button from "../../components/Button";
import RecentActivitySection from "../../components/RecentActivitySection";
import { LuEye, LuClock, LuLogOut, LuFileText, LuPlus, LuFolderOpen } from "react-icons/lu";
import { FiTrendingUp } from "react-icons/fi";
import * as api from "@/lib/api";

export default function DashboardPage() {
	return (
		<AuthGuard>
			<DashboardContent />
		</AuthGuard>
	);
}

type VisitStats = {
	totalVisits: number;
	uniqueVisitors: number;
	avgVisitsPerDay?: number;
	avgTimeSpent?: number;
	avgScrollDepth?: number;
	visitsByDay?: Array<{ date: string; count: number; uniqueVisitors: number }>;
	visitsByHour?: Array<{ hour: number; count: number }>;
	deviceStats?: Array<{ device: string; count: number }>;
	browserStats?: Array<{ browser: string; count: number }>;
	sourceStats?: Array<{ source: string; count: number }>;
	sectionStats?: Array<{ section: string; count: number; key: string }>;
	topApplications?: Array<{
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
	applications?: Array<{
		applicationId: string;
		jobTitle: string;
		companyId: string;
		totalVisits: number;
		uniqueVisitors: number;
		lastVisit: string | null;
	}>;
	visits?: Array<{
		_id: string;
		createdAt: string;
		ip?: string;
		userAgent?: string;
		company?: { name: string; logoUrl?: string };
		application?: { jobTitle: string };
	}>;
	applicationCount?: number;
};

function DashboardContent() {
	const [user, setUser] = React.useState<any | null>(null);
	const [visitStats, setVisitStats] = React.useState<VisitStats | null>(null);
	const [loadingStats, setLoadingStats] = React.useState(true);
	const [applicationCount, setApplicationCount] = React.useState(0);
	const [loggingOut, setLoggingOut] = React.useState(false);

	React.useEffect(() => {
		const t =
			typeof window !== "undefined"
				? localStorage.getItem("token")
				: null;
		if (!t) return;
		(async () => {
			try {
				const user = await api.getMe();
				setUser(user);
			} catch (err) {
				console.warn("Failed to load profile", err);
				setUser(null);
			}
		})();
	}, []);

	// Load visit stats and application count
	React.useEffect(() => {
		const t =
			typeof window !== "undefined"
				? localStorage.getItem("token")
				: null;
		if (!t) {
			setLoadingStats(false);
			return;
		}
		(async () => {
			try {
				const [stats, apps] = await Promise.all([
					api.getAnalytics(),
					api.getApplications(),
				]);
				setVisitStats(stats);
				setApplicationCount(Array.isArray(apps) ? apps.length : 0);
			} catch (err) {
				console.warn("Failed to load visit stats or applications", err);
				setVisitStats(null);
				setApplicationCount(0);
			} finally {
				setLoadingStats(false);
			}
		})();
	}, []);

	function logout() {
		if (typeof window !== "undefined") {
			setLoggingOut(true);
			localStorage.removeItem("token");
			setUser(null);
			toast.success("Déconnexion réussie");
			setTimeout(() => {
				window.location.reload();
			}, 500);
		}
	}

	function formatDate(dateStr: string | null) {
		if (!dateStr) return "—";
		const d = new Date(dateStr);
		return d.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	return (
		<div className="min-h-screen px-4 py-4 sm:p-6 bg-gray-50">
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<h1 className="text-xl sm:text-2xl font-semibold">
						Dashboard
					</h1>
					<div>
						{user ? (
							<div className="flex items-center gap-3 justify-between">
								<div className="text-sm">
									<div className="font-medium truncate max-w-[150px] sm:max-w-none">
										{user.name ||
											user.fullName ||
											user.email}
									</div>
									{user.email && (
										<div className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">
											{user.email}
										</div>
									)}
								</div>
								<Button
									onClick={logout}
									loading={loggingOut}
									className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 flex-shrink-0"
								>
									<LuLogOut className="w-4 h-4" />
								</Button>
							</div>
						) : (
							<div className="flex items-center gap-3">
								<Link
									href="/auth/login"
									className="text-sm text-sky-600"
								>
									Se connecter
								</Link>
							</div>
						)}
					</div>
				</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
				<Link
					href="/dashboard/applications"
					className="block p-4 sm:p-5 bg-white rounded-xl border border-gray-100 hover:border-sky-200 hover:shadow-md transition-all group"
				>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-lg bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
							<LuFolderOpen className="w-5 h-5 text-sky-600" />
						</div>
						<div className="font-semibold text-gray-800">Mes candidatures</div>
					</div>
					<div className="text-xs sm:text-sm text-gray-500">
						Voir et gérer vos candidatures
					</div>
				</Link>

				<Link
					href="/dashboard/create"
					className="block p-4 sm:p-5 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group"
				>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
							<LuPlus className="w-5 h-5 text-emerald-600" />
						</div>
						<div className="font-semibold text-gray-800">Nouvelle candidature</div>
					</div>
					<div className="text-xs sm:text-sm text-gray-500">
						Ciblée ou spontanée
					</div>
				</Link>
			</div>				{/* Quick stats */}
				{!loadingStats && visitStats && (
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
						<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0">
								<LuEye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
							</div>
							<div>
								<div className="text-xl sm:text-2xl font-bold text-gray-800">
									{visitStats.totalVisits}
								</div>
								<div className="text-xs sm:text-sm text-gray-400">
									Visites totales
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
								<LuFileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
							</div>
							<div>
								<div className="text-xl sm:text-2xl font-bold text-gray-800">
									{applicationCount}
								</div>
								<div className="text-xs sm:text-sm text-gray-400">
									Nombre de candidatures
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
								<LuClock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
							</div>
							<div>
								<div className="text-xs sm:text-sm font-semibold text-gray-800">
									{visitStats.recentActivity && visitStats.recentActivity.length > 0
										? formatDate(
												visitStats.recentActivity[0].createdAt
										  ).replace(",", " à ")
										: "—"}
								</div>
								<div className="text-xs sm:text-sm text-gray-400">
									Dernière visite
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Analytics link */}
				{!loadingStats && visitStats && visitStats.totalVisits > 0 && (
					<Link
						href="/dashboard/analytics"
						className="mb-6 flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl border border-sky-100 hover:border-sky-200 hover:shadow-sm transition-all group"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
								<FiTrendingUp className="w-5 h-5 text-sky-600" />
							</div>
							<div>
								<div className="font-semibold text-gray-800 text-sm sm:text-base">
									Analytics détaillés
								</div>
								<div className="text-xs text-gray-500">
									Graphiques, tendances et statistiques
									avancées
								</div>
							</div>
						</div>
						<div className="text-sky-600 group-hover:translate-x-1 transition-transform">
							→
						</div>
					</Link>
				)}

				{/* Recent activity */}
				{!loadingStats &&
					visitStats &&
					visitStats.recentActivity &&
					visitStats.recentActivity.length > 0 && (
						<div className="mb-6">
							<RecentActivitySection
								recentActivity={visitStats.recentActivity}
								maxItems={15}
							/>
						</div>
					)}

				{/* Old Recent visits - shown only if recentActivity is not available */}
				{!loadingStats &&
					visitStats &&
					(!visitStats.recentActivity || visitStats.recentActivity.length === 0) &&
					visitStats.visits &&
					visitStats.visits.length > 0 && (
						<div className="bg-white rounded-xl border border-gray-100 mb-6 overflow-hidden">
							<div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
								<h2 className="font-semibold text-gray-800 text-sm sm:text-base">
									Visites récentes
								</h2>
							</div>
							<div className="max-h-60 overflow-y-auto">
								{visitStats.visits
									.slice(0, 20)
									.map((v, index) => (
										<div
											key={v._id}
											className={`px-4 sm:px-5 py-2 flex items-center justify-between hover:bg-gray-50/50 transition-colors ${
												index !==
												(visitStats.visits?.slice(0, 20) || [])
													.length -
													1
													? "border-b border-gray-50"
													: ""
											}`}
										>
											<div className="flex items-center gap-3 sm:gap-4 min-w-0">
											<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-sm sm:text-base shadow-sm flex-shrink-0">
												💻
											</div>
												<div className="min-w-0">
													<div className="text-xs sm:text-sm font-medium text-gray-800 truncate">
														{v.company?.name ||
															"Entreprise"}
													</div>
													<div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
														{v.application
															?.jobTitle ||
															"Poste"}
													</div>
												</div>
											</div>
											<div className="text-right flex-shrink-0 ml-2">
												<div className="text-xs sm:text-sm text-gray-600">
													{formatDate(v.createdAt)}
												</div>
											</div>
										</div>
									))}
							</div>
						</div>
					)}

				{/* Stats per application */}
				{!loadingStats &&
					visitStats &&
					visitStats.applications &&
					visitStats.applications.length > 0 && (
						<div className="bg-white rounded-xl border border-gray-100 mb-6 overflow-hidden">
							<div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
								<h2 className="font-semibold text-gray-800 text-sm sm:text-base">
									Statistiques par candidature
								</h2>
							</div>
							<div className="max-h-60 overflow-y-auto">
								{(visitStats.applications || []).map((app, index) => (
									<div
										key={app.applicationId}
										className={`px-4 sm:px-5 py-2 flex items-center justify-between hover:bg-gray-50/50 transition-colors ${
											index !==
											(visitStats.applications?.length || 1) - 1
												? "border-b border-gray-50"
												: ""
										}`}
									>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-gray-800 truncate text-xs sm:text-sm">
												{app.jobTitle || "Sans titre"}
											</div>
											<div className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
												{app.lastVisit
													? `Dernière visite : ${formatDate(
															app.lastVisit
													  )}`
													: "Aucune visite"}
											</div>
										</div>
										<div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4 flex-shrink-0">
											<div className="flex flex-col items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-sky-50 rounded-lg min-w-[45px] sm:min-w-[60px]">
												<div className="text-xs sm:text-sm font-bold text-sky-600">
													{app.totalVisits}
												</div>
												<div className="text-[6px] sm:text-[7px] uppercase tracking-wide text-sky-400 font-medium">
													visites
												</div>
											</div>
											<div className="flex flex-col items-center px-1 sm:px-1 py-1 bg-emerald-50 rounded-lg min-w-[45px] sm:min-w-[60px]">
												<div className="text-xs sm:text-sm font-bold text-emerald-600">
													{app.uniqueVisitors}
												</div>
												<div className="text-[6px] sm:text-[7px] uppercase tracking-wide text-emerald-400 font-medium">
													uniques
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

				{!loadingStats &&
					(!visitStats || visitStats.totalVisits === 0) && (
						<div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 mb-6 text-center">
							<div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
								<LuEye className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
							</div>
							<div className="text-gray-600 font-medium text-sm sm:text-base">
								Aucune visite enregistrée
							</div>
							<div className="text-xs sm:text-sm text-gray-400 mt-1">
								Partagez vos pages de candidature pour commencer
								à recevoir des visites
							</div>
						</div>
					)}
			</div>
		</div>
	);
}

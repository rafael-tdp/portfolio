"use client";

import React, { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuArrowLeft, LuEye, LuEyeOff, LuMessageSquare, LuBell } from "react-icons/lu";
import AuthGuard from "../../../components/AuthGuard";
import Button from "@/components/Button";
import * as api from "@/lib/api";

type AppType = any;

type VisitStats = {
	[applicationId: string]: {
		totalVisits: number;
		uniqueVisitors: number;
		lastVisit: string | null;
	};
};

// Status display configuration
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
	draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
	sent: { label: 'Envoyée', color: 'bg-blue-100 text-blue-700' },
	interview: { label: 'Entretien', color: 'bg-yellow-100 text-yellow-700' },
	offer: { label: 'Offre', color: 'bg-green-100 text-green-700' },
	accepted: { label: 'Acceptée', color: 'bg-green-200 text-green-800' },
	rejected: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
	withdrawn: { label: 'Retirée', color: 'bg-gray-200 text-gray-600' },
};

export default function Page() {
	return (
		<AuthGuard>
			<ApplicationsContent />
		</AuthGuard>
	);
}

function ApplicationsContent() {
	const [apps, setApps] = useState<AppType[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [visitStats, setVisitStats] = useState<VisitStats>({});
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editData, setEditData] = useState<{
		jobTitle?: string;
		jobDescription?: string;
		coverLetter?: string;
	}>({});
	const router = useRouter();
	const [openActionsId, setOpenActionsId] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				// Load applications
				const applications = await api.getApplications();
				setApps(applications);

				// Load visit stats
				const t = localStorage.getItem("token");
				if (t) {
					const statsJson = await api.getVisitStats();
					if (statsJson) {
						const statsMap: VisitStats = {};
						(statsJson.applications || []).forEach((app: any) => {
							statsMap[app.applicationId] = {
								totalVisits: app.totalVisits,
								uniqueVisitors: app.uniqueVisitors,
								lastVisit: app.lastVisit,
							};
						});
						setVisitStats(statsMap);
					}
				}
			} catch (err) {
				console.error(err);
				setApps([]);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	function resolveLogoUrl(url: string | null | undefined) {
		if (!url) return null;
		if (url.startsWith("http")) return url;
		const base =
			process.env.NEXT_PUBLIC_BACKEND_URL;
		return `${base}${url}`;
	}

	const handleDelete = async (a: AppType) => {
		const ok = window.confirm("Supprimer cette candidature ?");
		if (!ok) return;
		try {
			await api.deleteApplication(a._id);
			setApps((prev) => (prev || []).filter((x) => x._id !== a._id));
		} catch (err) {
			alert("Impossible de supprimer: " + String(err));
		}
	};

	const saveEdit = async (a: AppType) => {
		try {
			const json = await api.saveApplication(editData, a._id);
			setApps((prev) =>
				(prev || []).map((x) =>
					x._id === a._id ? { ...x, ...json.application } : x
				)
			);
			setEditingId(null);
		} catch (err) {
			alert("Impossible de mettre à jour: " + String(err));
		}
	};

	return (
		<div className="mx-auto px-4 py-4 sm:p-6 bg-gray-50 min-h-screen">
			<div className="max-w-3xl mx-auto">
				<Link
					href="/dashboard"
					className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
				>
					<LuArrowLeft className="w-4 h-4" />
					<span>Retour au tableau de bord</span>
				</Link>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
				<h2 className="text-xl sm:text-2xl font-normal">Candidatures</h2>
				<Button
					onClick={() => router.push("/dashboard/create")}
					className="w-full sm:w-auto"
				>
					Nouvelle candidature
				</Button>
			</div>
				{loading && <div>Chargement...</div>}
				{!loading && (!apps || apps.length === 0) && (
					<div>Aucune candidature trouvée.</div>
				)}
				<div className="grid grid-cols-1 gap-4">
					{apps?.map((a: AppType) => {
						return (
							<div
								key={a._id}
								className="bg-white p-3 sm:p-4 rounded shadow-sm flex flex-col gap-3 cursor-pointer"
								onClick={() =>
									window.open(
										`/${a.slug}?preview=true`,
										"_blank"
									)
								}
							>
								<div className="flex items-start sm:items-center justify-between gap-2">
									<div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
										<div className="w-10 h-10 sm:w-12 sm:h-12 rounded flex-shrink-0 flex items-center justify-center overflow-hidden bg-gray-100">
											{a.company?.logoUrl ? (
												<img
													src={
														resolveLogoUrl(
															a.company.logoUrl
														) || undefined
													}
													alt={
														a.company?.name ||
														"logo"
													}
													className="w-full h-full object-contain"
													onError={(e) => {
														(
															e.currentTarget as HTMLImageElement
														).style.display =
															"none";
													}}
												/>
											) : (
												<span className="text-xs">
													No logo
												</span>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<div className="font-medium text-sm sm:text-base truncate">
												{a.company?.name ||
													"Entreprise inconnue"}
											</div>
											<div className="text-xs sm:text-sm text-gray-500 truncate">
												{a.jobTitle}
											</div>
											{/* Status badge */}
											{a.status && (
												<span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${STATUS_CONFIG[a.status]?.color || 'bg-gray-100 text-gray-700'}`}>
													{STATUS_CONFIG[a.status]?.label || a.status}
												</span>
											)}
											{/* Pending reminder indicator */}
											{a.reminders && a.reminders.some((r: any) => !r.completed && new Date(r.date) <= new Date()) && (
												<span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-amber-100 text-amber-700">
													<LuBell className="w-3 h-3" />
													Rappel
												</span>
											)}
										</div>
									</div>

									<div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
										{/* Notes indicator */}
										{a.privateNotes && a.privateNotes.length > 0 && (
											<div
												className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium bg-indigo-50 text-indigo-700"
												title={`${a.privateNotes.length} note${a.privateNotes.length > 1 ? "s" : ""}`}
											>
												<LuMessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
												<span>{a.privateNotes.length}</span>
											</div>
										)}

										{/* Visit indicator */}
										{(() => {
											const stats = visitStats[a._id];
											const hasVisits = stats && stats.totalVisits > 0;
											return (
												<div
													className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium ${
														hasVisits
															? "bg-emerald-50 text-emerald-700"
															: "bg-gray-100 text-gray-500"
													}`}
													title={
														hasVisits
															? `${stats.totalVisits} visite${stats.totalVisits > 1 ? "s" : ""} (${stats.uniqueVisitors} unique${stats.uniqueVisitors > 1 ? "s" : ""})`
															: "Aucune visite"
													}
												>
													{hasVisits ? (
														<>
															<LuEye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
															<span>{stats.totalVisits}</span>
														</>
													) : (
														<>
															<LuEyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
															<span>0</span>
														</>
													)}
												</div>
											);
										})()}

										<div className="relative">
											<button
												onClick={(e) => {
													e.stopPropagation();
													setOpenActionsId(
														openActionsId === a._id
															? null
															: a._id
													);
												}}
												className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-white hover:bg-gray-100 cursor-pointer"
												title="Actions"
											>
												<CiMenuKebab size={16} className="text-gray-600 sm:hidden" />
												<CiMenuKebab size={18} className="text-gray-600 hidden sm:block" /> 
											</button>

											{openActionsId === a._id && (
												<div
													className="absolute right-0 mt-2 w-44 sm:w-48 bg-white border rounded-lg shadow-lg z-50 border-gray-200 text-sm p-2"
													onClick={(e) =>
														e.stopPropagation()
													}
												>
													{/* Status selector */}
													<label className="text-xs text-gray-500 mb-1 ml-2 mt-1 block">Statut</label>
													<div className="flex flex-wrap gap-1 px-2 pb-2 mb-2 border-b border-gray-100">
														{Object.entries(STATUS_CONFIG).map(([key, config]) => (
															<button
																key={key}
																className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
																	a.status === key 
																		? `${config.color} ring-2 ring-offset-1 ring-gray-300` 
																		: 'bg-gray-50 text-gray-500 hover:bg-gray-100'
																}`}
																onClick={async () => {
																	try {
																		await api.saveApplication({ status: key }, a._id);
																		setApps((prev) =>
																			(prev || []).map((x) =>
																				x._id === a._id ? { ...x, status: key } : x
																			)
																		);
																	} catch (err) {
																		alert("Erreur: " + String(err));
																	}
																}}
															>
																{config.label}
															</button>
														))}
													</div>
                                                    <label className="text-xs text-gray-500 mb-1 ml-2 mt-1 block">Actions</label>
													<button
														className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer text-gray-600"
														onClick={() => {
															setOpenActionsId(null);
															router.push(`/dashboard/applications/${a._id}/tracking`);
														}}
													>
														<LuMessageSquare className="inline w-4 h-4 mr-2" />
														Notes & Suivi
													</button>
													<button
														className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer text-gray-600"
														onClick={() => {
															setOpenActionsId(null);
															router.push(`/dashboard/applications/${a._id}`);
														}}
													>
														Modifier
													</button>
													<button
														className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-md cursor-pointer"
														onClick={() => {
															setOpenActionsId(
																null
															);
															handleDelete(a);
														}}
													>
														Supprimer
													</button>
												</div>
											)}
										</div>
									</div>
								</div>

								{editingId === a._id && (
									<div className="w-full mt-3">
										<div className="bg-white p-4 rounded shadow-sm">
											<div className="flex flex-col gap-2">
												<input
													className="border p-2 rounded"
													value={
														editData.jobTitle || ""
													}
													onChange={(e) =>
														setEditData((d) => ({
															...d,
															jobTitle:
																e.target.value,
														}))
													}
													placeholder="Titre du poste"
												/>
												<textarea
													className="border p-2 rounded"
													rows={4}
													value={
														editData.jobDescription ||
														""
													}
													onChange={(e) =>
														setEditData((d) => ({
															...d,
															jobDescription:
																e.target.value,
														}))
													}
													placeholder="Description du poste"
												/>
												<textarea
													className="border p-2 rounded"
													rows={4}
													value={
														editData.coverLetter ||
														""
													}
													onChange={(e) =>
														setEditData((d) => ({
															...d,
															coverLetter:
																e.target.value,
														}))
													}
													placeholder="Lettre de motivation"
												/>
												<div className="flex gap-2">
													<button
														className="px-3 py-1 bg-green-600 text-white rounded"
														onClick={() =>
															saveEdit(a)
														}
													>
														Enregistrer
													</button>
													<button
														className="px-3 py-1 bg-gray-100 rounded"
														onClick={(e) => {
															e.stopPropagation();
															setEditingId(null);
														}}
													>
														Annuler
													</button>
												</div>
											</div>
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			);
}

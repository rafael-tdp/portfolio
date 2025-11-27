"use client";

import React, { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { useRouter } from "next/navigation";
import AuthGuard from "../../../components/AuthGuard";

type AppType = any;

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
				const t = localStorage.getItem("token");
				const res = await fetch(
					`${
						process.env.NEXT_PUBLIC_BACKEND_URL ||
						"http://localhost:3333"
					}/api/applications`,
					{
						headers: t
							? { Authorization: `Bearer ${t}` }
							: undefined,
					}
				);
				if (res.ok) {
					const json = await res.json();
					setApps(json.applications || json);
				} else {
					setApps([]);
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
			process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3333";
		return `${base}${url}`;
	}

	const handleDelete = async (a: AppType) => {
		const ok = window.confirm("Supprimer cette candidature ?");
		if (!ok) return;
		const delLogo = window.confirm(
			"Supprimer également le logo de l'entreprise associé à cette candidature ?"
		);
		try {
			const t = localStorage.getItem("token");
			const res = await fetch(
				`${
					process.env.NEXT_PUBLIC_BACKEND_URL ||
					"http://localhost:3333"
				}/api/applications/${a._id}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${t}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ deleteCompanyLogo: delLogo }),
				}
			);
			if (!res.ok) throw new Error("Échec suppression");
			setApps((prev) => (prev || []).filter((x) => x._id !== a._id));
		} catch (err) {
			alert("Impossible de supprimer: " + String(err));
		}
	};

	const saveEdit = async (a: AppType) => {
		try {
			const t = localStorage.getItem("token");
			const res = await fetch(
				`${
					process.env.NEXT_PUBLIC_BACKEND_URL ||
					"http://localhost:3333"
				}/api/applications/${a._id}`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${t}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(editData),
				}
			);
			if (!res.ok) throw new Error("Échec mise à jour");
			const json = await res.json();
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
		<div className="mx-auto p-6 bg-gray-50 min-h-screen">
			<div className="max-w-3xl mx-auto">
				<h2 className="text-2xl font-normal mb-4">Candidatures</h2>
				{loading && <div>Chargement...</div>}
				{!loading && (!apps || apps.length === 0) && (
					<div>Aucune candidature trouvée.</div>
				)}
				<div className="grid grid-cols-1 gap-4">
					{apps?.map((a: AppType) => {
						const theme = a.company?.theme || {};
						return (
							<div
								key={a._id}
								className="bg-white p-4 rounded shadow-sm flex flex-col gap-3 cursor-pointer"
								onClick={() =>
									window.open(
										`/${a.company?.publicSlug}?preview=true`,
										"_blank"
									)
								}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded flex items-center justify-center overflow-hidden bg-gray-100">
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
										<div>
											<div className="font-medium">
												{a.company?.name ||
													"Entreprise inconnue"}
											</div>
											<div className="text-sm text-gray-500">
												{a.jobTitle}
											</div>
										</div>
									</div>

									<div className="flex items-center gap-4">
										<div className="flex items-center gap-1">
											{[
													["primary", theme.primary],
													["accent", theme.accent],
													["secondary", theme.secondary],
													[
														"background",
														theme.background,
													],
													["text", theme.text],
												].map(([k, v]) => (
												<div
													key={String(k)}
													className="w-6 h-6 rounded border border-gray-300"
													style={{
														background:
															(v as string) ||
															"transparent",
														border: v
															? undefined
															: "1px solid #e5e7eb",
													}}
													title={String(k)}
												/>
											))}
										</div>

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
												className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white hover:bg-gray-100 cursor-pointer"
												title="Actions"
											>
												<CiMenuKebab size={18} className="text-gray-600" /> 
											</button>

											{openActionsId === a._id && (
												<div
													className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-50 border-gray-200 text-sm p-2"
													onClick={(e) =>
														e.stopPropagation()
													}
												>
                                                    <label className="text-xs text-gray-500 mb-1 ml-2 mt-1 block">Actions</label>
													<button
														className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer text-gray-600"
														onClick={() =>
															window.open(
																`/${a.company?.publicSlug}?preview=true`,
																"_blank"
															)
														}
													>
														Voir la page
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

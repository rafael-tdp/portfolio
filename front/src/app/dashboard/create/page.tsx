"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import ApplicationForm from "../../../components/ApplicationForm";
import AuthGuard from "../../../components/AuthGuard";

export default function CreatePage() {
	return (
		<AuthGuard>
			<CreateContent />
		</AuthGuard>
	);
}

function CreateContent() {
	const router = useRouter();
	return (
		<div className="mx-auto px-4 py-4 sm:p-6 bg-gray-50 min-h-screen">
			<div className="max-w-3xl mx-auto">
				<Link
					href="/dashboard/applications"
					className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
				>
					<LuArrowLeft className="w-4 h-4" />
					<span>Retour aux candidatures</span>
				</Link>
			</div>
			<ApplicationForm
				initial={{}}
				onSaved={() => router.push("/dashboard/applications")}
			/>
		</div>
	);
}

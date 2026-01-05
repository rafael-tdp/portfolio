"use client";

import React from "react";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import AuthGuard from "../../../components/AuthGuard";
import CvCreator from "../../../components/CvCreator";

export default function CvCreatorPage() {
	return (
		<AuthGuard>
			<CvCreatorContent />
		</AuthGuard>
	);
}

function CvCreatorContent() {
	return (
		<div className="mx-auto px-4 py-4 sm:p-6 bg-gray-50 min-h-screen">
			<div className="max-w-4xl mx-auto">
				<Link
					href="/dashboard"
					className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
				>
					<LuArrowLeft className="w-4 h-4" />
					<span>Retour au dashboard</span>
				</Link>
			</div>
			<CvCreator />
		</div>
	);
}

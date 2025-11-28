"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
		<ApplicationForm
			initial={{}}
			onSaved={() => router.push("/dashboard/applications")}
		/>
	);
}

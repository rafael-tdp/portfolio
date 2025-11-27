"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ApplicationForm from "../../components/ApplicationForm";
import AuthGuard from "../../components/AuthGuard";

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
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Créer une candidature</h1>
        <ApplicationForm
          initial={{}}
          onSaved={() => router.push("/dashboard/applications")}
        />
      </div>
    </div>
  );
}
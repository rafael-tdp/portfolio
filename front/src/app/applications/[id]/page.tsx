"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ApplicationForm from "../../../components/ApplicationForm";
import AuthGuard from "../../../components/AuthGuard";
import * as api from "../../../lib/api";

export default function EditPage(props: { params: any }) {
  return (
    <AuthGuard>
      <EditContent params={props.params} />
    </AuthGuard>
  );
}

function EditContent({ params: rawParams }: { params: any }) {
  // `params` may be a Promise in newer Next.js runtime; try to unwrap with
  // `React.use()` when available. Fall back to direct access for older runtimes.
  const params = (React as any).use ? (React as any).use(rawParams) : rawParams;
  const id = params?.id as string | undefined;
  const [initial, setInitial] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        const app = await api.getApplication(id);
        if (!mounted) return;
        // Map API shape to initial data expected by ApplicationForm
        const init = {
          companyName: app.company?.name || "",
          companyId: app.company?._id || app.company?.id || null,
          companyLogoUrl: app.company?.logoUrl || null,
          companyColors: app.company?.colors || null,
          companyTheme: app.company?.theme || null,
          publicSlug: app.company?.publicSlug || null,
          jobTitle: app.jobTitle || "",
          jobDescription: app.jobDescription || "",
          coverLetter: app.coverLetter || "",
          applicationId: app._id || app.id || null,
        };
        setInitial(init);
      } catch (err) {
        console.error("Failed to load application", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!initial) return <div className="p-6">Candidature introuvable</div>;

  return (
    <div>
      <ApplicationForm initial={initial} onSaved={() => router.push("/dashboard/applications")} />
    </div>
  );
}

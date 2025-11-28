const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

// ============ AUTH ============

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Login failed")
  return json
}

export async function register(email: string, password: string, fullName: string) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Register failed")
  return json
}

export async function getMe() {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.user || json.profile || json || null
}

// ============ COMPANIES ============

export async function createCompany(name: string) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/companies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Failed to create company")
  return json.company
}

export async function uploadLogo(companyId: string, file: File) {
  const token = getToken()
  const form = new FormData()
  form.append("logo", file)
  const res = await fetch(`${API_BASE}/api/companies/${companyId}/upload-logo`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Upload failed")
  return json
}

export async function extractColors(companyId: string, logoUrl?: string | null) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/companies/${companyId}/extract-colors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ logoUrl: logoUrl || undefined }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Extraction failed")
  return json
}

export async function patchCompany(companyId: string, payload: any) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/companies/${companyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Patch failed")
  return json
}

export async function generateCover(payload: any) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/ia/generate-cover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Generation failed")
  return json
}

export async function saveApplication(payload: any, applicationId?: string | null) {
  const token = getToken()
  let res
  if (applicationId) {
    res = await fetch(`${API_BASE}/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
  } else {
    res = await fetch(`${API_BASE}/api/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
  }
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Save failed")
  return json
}

export async function getApplication(applicationId: string) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/applications/${applicationId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Fetch failed")
  return json.application || json
}

export async function generateSoftSkills(jobTitle: string, jobDescription: string) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/ia/generate-soft-skills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ jobTitle, jobDescription }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Generation failed")
  return json
}

export async function generateHardSkills(jobTitle: string, jobDescription: string) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/ia/generate-hard-skills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ jobTitle, jobDescription }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Generation failed")
  return json
}

// ============ APPLICATIONS (list & delete) ============

export async function getApplications() {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/applications`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.applications || json
}

export async function deleteApplication(applicationId: string, deleteCompanyLogo?: boolean) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/applications/${applicationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deleteCompanyLogo }),
  })
  if (!res.ok) throw new Error("Échec suppression")
  return res.json()
}

// ============ VISITS ============

export async function getVisitStats() {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API_BASE}/api/visits/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function trackVisit(slug: string) {
  const res = await fetch(`${API_BASE}/api/visits/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  })
  return res.json()
}

// ============ PDF ============

export async function generatePdf(html: string, title: string) {
  const res = await fetch(`${API_BASE}/api/pdf/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      html,
      baseUrl: typeof window !== "undefined" ? window.location.origin : "",
      title,
    }),
  })
  if (!res.ok) throw new Error(`PDF generation failed: ${res.status}`)
  return res
}

// ============ SERVER-SIDE FUNCTIONS ============
// These functions are meant to be used in Server Components (no localStorage)

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3333";

export async function getPublicApplication(slug: string) {
  const base = BACKEND_URL.replace(/\/+$/, "");
  const res = await fetch(`${base}/public/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function serverGenerateSoftSkills(jobTitle: string, jobDescription: string) {
  const base = BACKEND_URL.replace(/\/+$/, "");
  const res = await fetch(`${base}/api/ia/generate-soft-skills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobTitle, jobDescription }),
    cache: "force-cache",
  });
  if (!res.ok) return null;
  return res.json();
}

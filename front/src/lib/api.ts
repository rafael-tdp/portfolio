const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

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

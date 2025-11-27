"use client"

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/Button'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

  async function register(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Register failed')
      localStorage.setItem('token', json.token)
      toast.success('Compte créé avec succès')
      window.location.href = '/dashboard'
    } catch (err) {
      toast.error((err as Error).message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={register} className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Créer un compte</h2>
        <label className="block text-sm font-medium">Nom complet</label>
        <input className="mt-1 mb-3 block w-full rounded border p-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 mb-3 block w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block text-sm font-medium">Mot de passe</label>
        <input type="password" className="mt-1 mb-3 block w-full rounded border p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex items-center gap-3">
          <Button type="submit" loading={loading} disabled={loading}>Créer</Button>
          <Link href="/auth/login" className="text-sm text-gray-600">Déjà un compte ?</Link>
        </div>
      </form>
    </div>
  )
}

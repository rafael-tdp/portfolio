"use client"

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/Button'
import * as api from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const json = await api.login(email, password)
      localStorage.setItem('token', json.token)
      toast.success('Connecté avec succès')
      window.location.href = '/dashboard'
    } catch (err) {
      toast.error((err as Error).message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Se connecter</h2>
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 mb-3 block w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block text-sm font-medium">Mot de passe</label>
        <input type="password" className="mt-1 mb-3 block w-full rounded border p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex items-center gap-3">
          <Button type="submit" loading={loading} disabled={loading}>Se connecter</Button>
          <Link href="/auth/register" className="text-sm text-gray-600">Créer un compte</Link>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPasswordAction } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const result = await resetPasswordAction(email, `${window.location.origin}/auth/reset-password`)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(result?.message ?? 'Correo enviado. Revisa tu bandeja para continuar.')
      setEmail('')
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Recuperar contraseña</h1>
        <p className="text-slate-400">Te enviaremos un enlace para restablecer tu contraseña.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">
            Correo Electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold h-10"
        >
          {loading ? 'Enviando...' : 'Enviar correo de recuperación'}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-400">
        <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  )
}

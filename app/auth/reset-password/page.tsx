'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    async function initRecoverySession() {
      const supabase = createBrowserClient()

      try {
        if (
          window.location.search.includes('access_token') ||
          window.location.search.includes('type=recovery')
        ) {
          const { error } = await supabase.auth.getSessionFromUrl({
            storeSession: true,
          })

          if (error) {
            setError(error.message)
            return
          }
        }

        const { data, error } = await supabase.auth.getUser()

        if (error || !data.user) {
          setError('No se encontró sesión de recuperación. Solicita un nuevo enlace.')
          return
        }

        setSessionReady(true)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudo validar el enlace de recuperación.',
        )
      }
    }

    initRecoverySession()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    const supabase = createBrowserClient()
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    setSuccess('Contraseña actualizada correctamente. Redirigiendo al login...')

    setTimeout(() => {
      router.push('/login?reset=success')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Restablecer contraseña</h1>
        <p className="text-slate-400">
          Ingresa tu nueva contraseña para continuar con seguridad.
        </p>
      </div>

      {!sessionReady && !error && (
        <div className="bg-slate-800/80 border border-slate-700 text-slate-300 p-3 rounded-lg text-sm">
          Validando enlace de recuperación...
        </div>
      )}

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

      {sessionReady && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Nueva contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-300">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold h-10"
          >
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
        </form>
      )}

      <div className="text-center text-sm text-slate-400">
        <Link href="/forgot-password" className="text-cyan-400 hover:text-cyan-300 font-semibold">
          Volver a solicitar enlace de recuperación
        </Link>
      </div>
    </div>
  )
}

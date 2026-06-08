'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUpAction, signInWithGoogleAction } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validations
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setLoading(true)

    try {
      const result = await signUpAction(email, password)

      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignUp() {
    setLoading(true)

    try {
      await signInWithGoogleAction()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido al iniciar sesión con Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
        <p className="text-slate-400">Únete a nuestra comunidad en COAR</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm">
          Cuenta creada. Por favor verifica tu correo para activarla.
        </div>
      )}

      {/* Signup form */}
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

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">
            Contraseña
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
          <p className="text-xs text-slate-500">Mínimo 8 caracteres</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-300">
            Confirmar Contraseña
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

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer">
            Acepto los{' '}
            <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
              términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
              política de privacidad
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold h-10"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-900 text-slate-500">O continúa con</span>
        </div>
      </div>

      {/* Google OAuth */}
      <Button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={loading}
        variant="outline"
        className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
      >
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="currentColor"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="currentColor"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="currentColor"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="currentColor"
          />
        </svg>
        Google
      </Button>

      {/* Login link */}
      <div className="text-center text-sm">
        <span className="text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            Iniciar sesión
          </Link>
        </span>
      </div>
    </div>
  )
}

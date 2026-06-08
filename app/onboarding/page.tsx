'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction, getCurrentUserAction } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OnboardingPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get current user on mount
  useEffect(() => {
    async function getUser() {
      const user = await getCurrentUserAction()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)
      // Pre-fill email as username if available
      if (user.email) {
        setUsername(user.email.split('@')[0])
      }
    }
    getUser()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('El nombre de usuario es obligatorio')
      return
    }

    if (!fullName.trim()) {
      setError('El nombre completo es obligatorio')
      return
    }

    setLoading(true)

    const result = await updateProfileAction(userId, {
      username: username.trim(),
      full_name: fullName.trim(),
      birth_date: birthDate,
      gender: gender,
    })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Redirect to home on success
      router.push('/home')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">⚡</span>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Completa tu perfil</h1>
              <p className="text-slate-400">
                Ayúdanos a conocerte mejor para personalizar tu experiencia
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Onboarding form */}
          <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900 p-6 rounded-lg border border-slate-800">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                Nombre de usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="tu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
              <p className="text-xs text-slate-500">Debe ser único en la plataforma</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">
                Nombre completo
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-slate-300">
                Fecha de nacimiento (opcional)
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-slate-300">
                Género (opcional)
              </Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
              >
                <option value="">No especificado</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold h-10 mt-6"
            >
              {loading ? 'Guardando...' : 'Continuar a COAR'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Puedes cambiar estos datos en cualquier momento desde tu perfil
          </p>
        </div>
      </div>
    </main>
  )
}

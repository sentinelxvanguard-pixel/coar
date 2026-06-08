'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserAction, signOutAction } from '@/lib/auth'
import { PrivacySettings } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [settings, setSettings] = useState<PrivacySettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadSettings = async () => {
      const user = await getCurrentUserAction()
      if (!user) {
        router.push('/login')
        return
      }

      setCurrentUserId(user.id)

      const { data: privacySettings } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (privacySettings) {
        setSettings(privacySettings)
      }

      setLoading(false)
    }

    loadSettings()
  }, [router, supabase])

  const handleSaveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .update({
          profile_visibility: settings.profile_visibility,
          comment_visibility: settings.comment_visibility,
          post_visibility: settings.post_visibility,
          friends_visibility: settings.friends_visibility,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', currentUserId)

      if (error) throw error

      setMessage('Configuración guardada correctamente')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Eliminar perfil (esto eliminará en cascada todos los datos)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', currentUserId)

      if (error) throw error

      // Cerrar sesión
      await signOutAction()
      router.push('/login')
    } catch (error) {
      console.error('Error deleting account:', error)
      setMessage('Error al eliminar la cuenta')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Cargando configuración...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Configuración</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes('Error')
              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
              : 'bg-green-500/10 border border-green-500/20 text-green-400'
          }`}
        >
          {message}
        </div>
      )}

      {/* Privacy Settings */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-6">Privacidad</h2>

        <div className="space-y-6">
          {/* Profile Visibility */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Visibilidad del perfil</label>
            <select
              value={settings?.profile_visibility || 'public'}
              onChange={(e) =>
                setSettings(
                  settings
                    ? { ...settings, profile_visibility: e.target.value as any }
                    : null
                )
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="public">Público</option>
              <option value="friends_only">Solo amigos</option>
              <option value="private">Privado</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Controla quién puede ver tu perfil
            </p>
          </div>

          {/* Post Visibility */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Quién puede ver tus publicaciones</label>
            <select
              value={settings?.post_visibility || 'everyone'}
              onChange={(e) =>
                setSettings(
                  settings
                    ? { ...settings, post_visibility: e.target.value as any }
                    : null
                )
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="everyone">Todos</option>
              <option value="friends_only">Solo amigos</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Define la audiencia predeterminada de tus publicaciones
            </p>
          </div>

          {/* Comment Visibility */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Quién puede comentar</label>
            <select
              value={settings?.comment_visibility || 'everyone'}
              onChange={(e) =>
                setSettings(
                  settings
                    ? { ...settings, comment_visibility: e.target.value as any }
                    : null
                )
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="everyone">Todos</option>
              <option value="friends_only">Solo amigos</option>
              <option value="none">Nadie</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Controla quién puede comentar en tus publicaciones
            </p>
          </div>

          {/* Friends List Visibility */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Visibilidad de amigos</label>
            <select
              value={settings?.friends_visibility || 'friends_only'}
              onChange={(e) =>
                setSettings(
                  settings
                    ? { ...settings, friends_visibility: e.target.value as any }
                    : null
                )
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="everyone">Todos</option>
              <option value="friends_only">Solo amigos</option>
              <option value="nobody">Nadie</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Controla quién puede ver tu lista de amigos
            </p>
          </div>
        </div>

        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Zona de peligro</h3>
            <p className="text-sm text-slate-400 mb-4">
              Las acciones en esta sección son irreversibles. Procede con cuidado.
            </p>

            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar cuenta
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-400">
                  ¿Estás seguro? Esta acción eliminará tu cuenta y todos tus datos permanentemente.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Sí, eliminar
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="border border-slate-600 hover:border-slate-500 text-slate-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

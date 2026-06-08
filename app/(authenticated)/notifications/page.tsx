'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserAction } from '@/lib/auth'
import { Notification } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { formatTimeAgo } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

export default function NotificationsPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadNotifications = async () => {
      const user = await getCurrentUserAction()
      if (!user) {
        router.push('/login')
        return
      }

      setCurrentUserId(user.id)

      const { data } = await supabase
        .from('notifications')
        .select(
          `
          *,
          actor:actor_id(id, username, full_name, avatar_url)
          `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications(data || [])
      setLoading(false)
    }

    loadNotifications()
  }, [router, supabase])

  const handleMarkAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    )
  }

  const handleDelete = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'friend_request':
        return `${notification.actor?.username || 'Alguien'} te envió una solicitud de amistad`
      case 'friend_accepted':
        return `${notification.actor?.username || 'Alguien'} aceptó tu solicitud de amistad`
      case 'post_like':
        return `A ${notification.actor?.username || 'alguien'} le gustó tu publicación`
      case 'comment':
        return `${notification.actor?.username || 'Alguien'} comentó tu publicación`
      case 'comment_like':
        return `A ${notification.actor?.username || 'alguien'} le gustó tu comentario`
      case 'message':
        return `Nuevo mensaje de ${notification.actor?.username || 'alguien'}`
      default:
        return `Notificación de ${notification.actor?.username || 'alguien'}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Cargando notificaciones...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Notificaciones</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-lg p-4 hover:border-slate-700/50 transition-colors ${
                !notification.is_read ? 'border-cyan-500/30 bg-cyan-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {notification.actor?.avatar_url ? (
                  <Image
                    src={notification.actor.avatar_url}
                    alt={notification.actor.username}
                    width={40}
                    height={40}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {notification.actor?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    {getNotificationMessage(notification)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatTimeAgo(notification.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="w-2 h-2 rounded-full bg-cyan-500"
                      title="Marcar como leído"
                    />
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-1 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

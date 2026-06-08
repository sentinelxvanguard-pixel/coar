'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Notification } from '@/lib/types'
import { getNotifications, markNotificationAsRead, deleteNotification } from '@/lib/supabase-client'
import Image from 'next/image'
import { formatTimeAgo } from '@/lib/utils'

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [userId])

  const loadNotifications = async () => {
    try {
      const data = await getNotifications(userId)
      setNotifications(data)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'friend_request':
        return `${notification.actor?.username || 'Alguien'} te envió una solicitud de amistad`
      case 'friend_accepted':
        return `${notification.actor?.username || 'Alguien'} aceptó tu solicitud de amistad`
      case 'post_like':
        return `${notification.actor?.username || 'Alguien'} le gustó tu publicación`
      case 'comment':
        return `${notification.actor?.username || 'Alguien'} comentó tu publicación`
      case 'comment_like':
        return `${notification.actor?.username || 'Alguien'} le gustó tu comentario`
      case 'message':
        return `Nuevo mensaje de ${notification.actor?.username || 'Alguien'}`
      default:
        return `Notificación de ${notification.actor?.username || 'Alguien'}`
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-slate-800 rounded-full transition-colors"
      >
        <Bell size={20} className="text-cyan-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-slate-400">
              No tienes notificaciones
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-slate-700/30' : ''
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex gap-3">
                    {notification.actor?.avatar_url ? (
                      <Image
                        src={notification.actor.avatar_url}
                        alt={notification.actor.username}
                        width={32}
                        height={32}
                        className="rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
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

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification.id)
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

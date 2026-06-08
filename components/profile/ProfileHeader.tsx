'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MoreHorizontal, MessageCircle, UserPlus, UserCheck, UserMinus } from 'lucide-react'
import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface ProfileHeaderProps {
  profile: Profile
  currentUserId: string
  isOwnProfile: boolean
  friendStatus?: 'friends' | 'pending' | 'none' | 'blocked'
  followerCount?: number
  followingCount?: number
  postCount?: number
  onEditClick?: () => void
  onFriendAction?: (action: 'request' | 'accept' | 'reject' | 'delete') => Promise<void>
  onMessageClick?: () => void
  onFollowClick?: () => Promise<void>
  isFollowing?: boolean
}

export function ProfileHeader({
  profile,
  currentUserId,
  isOwnProfile,
  friendStatus = 'none',
  followerCount = 0,
  followingCount = 0,
  postCount = 0,
  onEditClick,
  onFriendAction,
  onMessageClick,
  onFollowClick,
  isFollowing = false,
}: ProfileHeaderProps) {
  const [loading, setLoading] = useState(false)

  const handleFriendAction = async (action: 'request' | 'accept' | 'reject' | 'delete') => {
    setLoading(true)
    try {
      await onFriendAction?.(action)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowClick = async () => {
    setLoading(true)
    try {
      await onFollowClick?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl overflow-hidden">
      {/* Cover Background */}
      <div className="h-32 bg-gradient-to-r from-cyan-500/20 to-purple-500/20"></div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-16 mb-4">
          {/* Avatar */}
          <div>
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                width={120}
                height={120}
                className="rounded-full border-4 border-slate-900 w-32 h-32 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-4xl">{profile.username?.[0]?.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isOwnProfile && (
            <div className="flex gap-2">
              {friendStatus === 'friends' && (
                <>
                  <Button
                    onClick={onMessageClick}
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    <MessageCircle size={16} />
                    Mensaje
                  </Button>
                  <Button
                    onClick={() => handleFriendAction('delete')}
                    disabled={loading}
                    size="sm"
                    className="border border-slate-600 hover:border-red-500 hover:text-red-500 text-slate-300"
                  >
                    <UserMinus size={16} />
                  </Button>
                </>
              )}

              {friendStatus === 'none' && (
                <>
                  <Button
                    onClick={() => handleFriendAction('request')}
                    disabled={loading}
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    <UserPlus size={16} />
                    Agregar amigo
                  </Button>
                  <Button
                    onClick={handleFollowClick}
                    disabled={loading}
                    size="sm"
                    className={isFollowing ? 'border border-slate-600 hover:border-slate-500 text-slate-300' : 'border border-cyan-500 hover:border-cyan-600 text-cyan-400'}
                  >
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </Button>
                </>
              )}

              {friendStatus === 'pending' && (
                <Button disabled size="sm" className="bg-slate-700 text-slate-300">
                  Solicitud enviada
                </Button>
              )}
            </div>
          )}

          {isOwnProfile && (
            <Button
              onClick={onEditClick}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
            >
              Editar perfil
            </Button>
          )}
        </div>

        {/* Profile Info */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">{profile.full_name || profile.username}</h1>
          <p className="text-slate-400 text-sm">@{profile.username}</p>
          {profile.bio && <p className="text-slate-300 text-sm mt-2">{profile.bio}</p>}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-4 py-2 border-t border-b border-slate-800">
          <div>
            <p className="text-lg font-bold text-white">{postCount}</p>
            <p className="text-xs text-slate-400">Publicaciones</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{followerCount}</p>
            <p className="text-xs text-slate-400">Seguidores</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{followingCount}</p>
            <p className="text-xs text-slate-400">Siguiendo</p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit2 } from 'lucide-react'
import { Post } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { formatTimeAgo } from '@/lib/utils'

interface PostCardProps {
  post: Post
  currentUserId: string
  onDelete?: (postId: string) => void
  onEdit?: (post: Post) => void
  onComment?: (postId: string) => void
  onLike?: (postId: string) => void
  liked?: boolean
}

export function PostCard({
  post,
  currentUserId,
  onDelete,
  onEdit,
  onComment,
  onLike,
  liked = false,
}: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const isAuthor = post.user_id === currentUserId

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4 mb-4 hover:border-slate-700/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {post.user?.avatar_url ? (
            <Image
              src={post.user.avatar_url}
              alt={post.user.username}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{post.user?.username?.[0]?.toUpperCase()}</span>
            </div>
          )}
          <div>
            <Link href={`/profile/${post.user?.username}`} className="font-semibold text-white hover:text-cyan-400">
              {post.user?.full_name || post.user?.username}
            </Link>
            <p className="text-xs text-slate-400">@{post.user?.username}</p>
            <p className="text-xs text-slate-500">{formatTimeAgo(post.created_at)}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <MoreHorizontal size={16} className="text-slate-400" />
          </button>

          {showMenu && isAuthor && (
            <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onEdit?.(post)
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Edit2 size={14} />
                Editar
              </button>
              <button
                onClick={() => {
                  onDelete?.(post.id)
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <Image
            src={post.image_url}
            alt="Post image"
            width={500}
            height={400}
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-xs text-slate-400 mb-4 py-2 border-t border-b border-slate-800">
        <span>👍 {post._count?.reactions || 0} Me gusta</span>
        <span>💬 {post._count?.comments || 0} Comentarios</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onLike?.(post.id)}
          className={`flex items-center gap-2 flex-1 p-2 rounded-lg transition-colors ${
            liked
              ? 'text-red-500 bg-red-500/10'
              : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10'
          }`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span className="text-xs">Me gusta</span>
        </button>

        <button
          onClick={() => onComment?.(post.id)}
          className="flex items-center gap-2 flex-1 p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
        >
          <MessageCircle size={16} />
          <span className="text-xs">Comentar</span>
        </button>

        <button className="flex items-center gap-2 flex-1 p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors">
          <Share2 size={16} />
          <span className="text-xs">Compartir</span>
        </button>
      </div>
    </div>
  )
}

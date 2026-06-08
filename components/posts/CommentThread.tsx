'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, Reply, Trash2, MessageCircle } from 'lucide-react'
import { Comment, Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { formatTimeAgo } from '@/lib/utils'

interface CommentThreadProps {
  comments: Comment[]
  currentUserId: string
  currentUser: Profile | null
  postId: string
  onAddComment: (content: string, parentId?: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
  onLikeComment?: (commentId: string) => Promise<void>
}

export function CommentThread({
  comments,
  currentUserId,
  currentUser,
  postId,
  onAddComment,
  onDeleteComment,
  onLikeComment,
}: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReplySubmit = async (parentId?: string) => {
    if (!replyContent.trim()) return

    setLoading(true)
    try {
      await onAddComment(replyContent, parentId)
      setReplyContent('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setLoading(false)
    }
  }

  // Organizar comentarios por jerarquía
  const rootComments = comments.filter((c) => !c.parent_comment_id)
  const repliesByParent = comments.reduce(
    (acc, comment) => {
      if (comment.parent_comment_id) {
        if (!acc[comment.parent_comment_id]) {
          acc[comment.parent_comment_id] = []
        }
        acc[comment.parent_comment_id].push(comment)
      }
      return acc
    },
    {} as Record<string, Comment[]>
  )

  return (
    <div className="space-y-4">
      {/* Root Comments */}
      {rootComments.map((comment) => (
        <div key={comment.id} className="space-y-2">
          {/* Comment Card */}
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="flex gap-2">
              {/* Avatar */}
              {comment.user?.avatar_url ? (
                <Image
                  src={comment.user.avatar_url}
                  alt={comment.user.username}
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{comment.user?.username?.[0]?.toUpperCase()}</span>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{comment.user?.full_name || comment.user?.username}</p>
                    <p className="text-xs text-slate-500">@{comment.user?.username} · {formatTimeAgo(comment.created_at)}</p>
                  </div>

                  {comment.user_id === currentUserId && (
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-1 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-100 mt-2">{comment.content}</p>

                {/* Comment Actions */}
                <div className="flex items-center gap-4 mt-2">
                  <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
                    <Heart size={14} />
                    <span>{comment._count?.reactions || 0}</span>
                  </button>

                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <Reply size={14} />
                    <span>Responder</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="ml-4 bg-slate-800/20 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                {currentUser?.avatar_url ? (
                  <Image
                    src={currentUser.avatar_url}
                    alt={currentUser.username}
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{currentUser?.username?.[0]?.toUpperCase()}</span>
                  </div>
                )}

                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Responder a @${comment.user?.username}`}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <Button
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={loading || !replyContent.trim()}
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {loading ? '...' : 'Enviar'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Replies */}
          {repliesByParent[comment.id]?.map((reply) => (
            <div key={reply.id} className="ml-4 bg-slate-800/20 rounded-lg p-3">
              <div className="flex gap-2">
                {reply.user?.avatar_url ? (
                  <Image
                    src={reply.user.avatar_url}
                    alt={reply.user.username}
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{reply.user?.username?.[0]?.toUpperCase()}</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        <span className="text-cyan-400">@{comment.user?.username}</span> {reply.user?.full_name || reply.user?.username}
                      </p>
                      <p className="text-xs text-slate-500">@{reply.user?.username} · {formatTimeAgo(reply.created_at)}</p>
                    </div>

                    {reply.user_id === currentUserId && (
                      <button
                        onClick={() => onDeleteComment(reply.id)}
                        className="p-1 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-slate-100 mt-2">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Add Comment Input (Root Level) */}
      {!replyingTo && (
        <div className="bg-slate-800/30 rounded-lg p-3 flex gap-2">
          {currentUser?.avatar_url ? (
            <Image
              src={currentUser.avatar_url}
              alt={currentUser.username}
              width={32}
              height={32}
              className="rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{currentUser?.username?.[0]?.toUpperCase()}</span>
            </div>
          )}

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Agregar comentario..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Button
              onClick={() => handleReplySubmit()}
              disabled={loading || !replyContent.trim()}
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {loading ? '...' : 'Comentar'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PostCard } from '@/components/posts/PostCard'
import { PostComposer } from '@/components/posts/PostComposer'
import { CommentThread } from '@/components/posts/CommentThread'
import { getCurrentUserAction } from '@/lib/auth'
import { Post, Profile, Comment } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function FeedPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createClient()

  // Cargar usuario actual
  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUserAction()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setCurrentUser(profile)
      setLoading(false)
    }

    loadUser()
  }, [router, supabase])

  // Cargar posts del feed
  const { data: feedData, mutate: mutateFeed } = useSWR(
    currentUser ? '/api/posts?offset=0' : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  // Cargar comentarios del post seleccionado
  const { data: commentsData } = useSWR(
    selectedPost ? `/api/comments?post_id=${selectedPost}` : null,
    fetcher,
    { refreshInterval: 10000 }
  )

  const posts = feedData?.posts || []
  const comments = commentsData?.comments || []

  const handleCreatePost = async (content: string, imageUrl: string | null, privacy: string) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          image_url: imageUrl,
          privacy,
        }),
      })

      if (!response.ok) throw new Error('Failed to create post')

      await mutateFeed()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Error al crear la publicación')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete post')

      await mutateFeed()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error al eliminar la publicación')
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          reaction_type: 'like',
        }),
      })

      if (!response.ok) throw new Error('Failed to like post')

      // Toggle like state
      const newLiked = new Set(likedPosts)
      if (newLiked.has(postId)) {
        newLiked.delete(postId)
      } else {
        newLiked.add(postId)
      }
      setLikedPosts(newLiked)

      await mutateFeed()
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!selectedPost) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: selectedPost,
          content,
          parent_comment_id: parentId,
        }),
      })

      if (!response.ok) throw new Error('Failed to add comment')

      // Recargar comentarios
      const commentsResponse = await fetch(`/api/comments?post_id=${selectedPost}`)
      const commentsResult = await commentsResponse.json()
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete comment')
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      {/* Post Composer */}
      <PostComposer user={currentUser} onSubmit={handleCreatePost} />

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No hay publicaciones en tu feed. ¡Sigue a más personas!</p>
          </div>
        ) : (
          posts.map((post: Post) => (
            <div key={post.id} className="space-y-3">
              {/* Post Card */}
              <PostCard
                post={post}
                currentUserId={currentUser?.id || ''}
                onDelete={handleDeletePost}
                onLike={handleLikePost}
                onComment={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                liked={likedPosts.has(post.id)}
              />

              {/* Comments Section */}
              {selectedPost === post.id && (
                <div className="bg-slate-900/30 backdrop-blur border border-slate-800/50 rounded-xl p-4">
                  <CommentThread
                    comments={comments}
                    currentUserId={currentUser?.id || ''}
                    currentUser={currentUser}
                    postId={post.id}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

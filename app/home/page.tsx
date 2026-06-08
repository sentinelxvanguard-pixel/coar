'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { PostComposer } from '@/components/posts/PostComposer'
import { PostCard } from '@/components/posts/PostCard'
import { CommentThread } from '@/components/posts/CommentThread'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Button } from '@/components/ui/button'
import { Post, Profile } from '@/lib/types'
import { createBrowserClient } from '@supabase/ssr'
import { Loader } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'for-you'
  
  const [user, setUser] = useState<Profile | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch current user
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push('/login')
          return
        }

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (data) {
          setUser(data)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  // Fetch posts based on tab
  const { data: posts = [], mutate: mutatePosts } = useSWR(
    user ? `/api/posts?tab=${tab}` : null,
    fetcher
  )

  const handleCreatePost = async (content: string, imageUrl: string | null, privacy: string) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl, privacy }),
      })

      if (response.ok) {
        mutatePosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      mutatePosts()
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, type: 'like' }),
      })
      mutatePosts()
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader className="animate-spin text-cyan-500" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pb-16 md:pb-0">
      <Sidebar />
      <MobileNav />
      
      {/* Main Content */}
      <div className="md:ml-64 2xl:mr-80">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 border-b border-slate-800/50 bg-gradient-to-b from-slate-900/95 to-slate-900/85 backdrop-blur">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {tab === 'for-you' && 'Para ti'}
                {tab === 'following' && 'Siguiendo'}
                {tab === 'friends' && 'Amigos'}
                {tab === 'trending' && 'Tendencia'}
              </h2>
            </div>
            <NotificationBell userId={user?.id || ''} />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 px-4 md:px-6 border-t border-slate-800/30">
            {['for-you', 'following', 'friends', 'trending'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('tab', t)
                  router.push(`/home?${params.toString()}`)
                }}
                className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                  tab === t
                    ? 'text-white border-cyan-500'
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                }`}
              >
                {t === 'for-you' && 'Para ti'}
                {t === 'following' && 'Siguiendo'}
                {t === 'friends' && 'Amigos'}
                {t === 'trending' && 'Tendencia'}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="max-w-2xl mx-auto">
          {/* Post Composer */}
          {user && (
            <div className="sticky top-20 z-30 bg-gradient-to-b from-slate-900 to-slate-900/80 backdrop-blur px-4 md:px-6 py-4 border-b border-slate-800/50">
              <PostComposer user={user} onSubmit={handleCreatePost} />
            </div>
          )}

          {/* Posts Feed */}
          <div className="px-4 md:px-6 py-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">No hay publicaciones aún</p>
              </div>
            ) : (
              posts.map((post: Post) => (
                <div key={post.id}>
                  <PostCard
                    post={post}
                    currentUserId={user?.id || ''}
                    onDelete={handleDeletePost}
                    onLike={handleLikePost}
                    onComment={() => setSelectedPost(post)}
                  />
                  
                  {/* Comment Thread Modal */}
                  {selectedPost?.id === post.id && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-800/50 rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/95">
                          <h3 className="font-bold text-white">Respuestas</h3>
                          <button
                            onClick={() => setSelectedPost(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                        <CommentThread
                          post={selectedPost}
                          currentUserId={user?.id || ''}
                          onCommented={() => mutatePosts()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <RightSidebar />
    </div>
  )
}

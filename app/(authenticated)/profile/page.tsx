'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserAction } from '@/lib/auth'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { PostCard } from '@/components/posts/PostCard'
import { Post, Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [postCount, setPostCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
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

      if (!profile) {
        router.push('/onboarding')
        return
      }

      setCurrentUser(profile)

      // Cargar posts
      const { data: posts, count } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setUserPosts(posts || [])
      setPostCount(count || 0)

      // Cargar follower count
      const { count: followers } = await supabase
        .from('followers')
        .select('id', { count: 'exact' })
        .eq('following_id', user.id)

      setFollowerCount(followers || 0)

      // Cargar following count
      const { count: following } = await supabase
        .from('followers')
        .select('id', { count: 'exact' })
        .eq('follower_id', user.id)

      setFollowingCount(following || 0)

      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      setUserPosts((prev) => prev.filter((p) => p.id !== postId))
      setPostCount((prev) => prev - 1)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error al eliminar la publicación')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Cargando perfil...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        profile={currentUser!}
        currentUserId={currentUser?.id || ''}
        isOwnProfile={true}
        postCount={postCount}
        followerCount={followerCount}
        followingCount={followingCount}
        onEditClick={() => setShowEditModal(true)}
      />

      {/* Posts */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Mis publicaciones</h2>
        {userPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No tienes publicaciones aún. ¡Crea tu primera publicación!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id || ''}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

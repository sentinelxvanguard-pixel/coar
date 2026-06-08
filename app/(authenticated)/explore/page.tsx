'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserAction } from '@/lib/auth'
import { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { UserPlus, UserMinus, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ExplorePage() {
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set())
  const [friends, setFriends] = useState<Set<string>>(new Set())
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfiles = async () => {
      const user = await getCurrentUserAction()
      if (!user) {
        router.push('/login')
        return
      }

      setCurrentUserId(user.id)

      // Cargar todos los perfiles excepto el actual
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(50)

      setProfiles(allProfiles || [])

      // Cargar amigos
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, receiver_id, status')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

      const friendIds = new Set<string>()
      const requestIds = new Set<string>()

      friendships?.forEach((f) => {
        if (f.status === 'accepted') {
          if (f.requester_id === user.id) friendIds.add(f.receiver_id)
          else friendIds.add(f.requester_id)
        } else if (f.status === 'pending' && f.requester_id === user.id) {
          requestIds.add(f.receiver_id)
        }
      })

      setFriends(friendIds)
      setFriendRequests(requestIds)

      // Cargar seguidores
      const { data: followers } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = new Set(followers?.map((f) => f.following_id) || [])
      setFollowing(followingIds)

      setLoading(false)
    }

    loadProfiles()
  }, [router, supabase])

  const handleSendRequest = async (receiverId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert([
          {
            requester_id: currentUserId,
            receiver_id: receiverId,
            status: 'pending',
          },
        ])

      if (!error) {
        setFriendRequests((prev) => new Set([...prev, receiverId]))
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  const handleFollow = async (followingId: string) => {
    try {
      if (following.has(followingId)) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', followingId)

        if (!error) {
          setFollowing((prev) => {
            const newSet = new Set(prev)
            newSet.delete(followingId)
            return newSet
          })
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert([
            {
              follower_id: currentUserId,
              following_id: followingId,
            },
          ])

        if (!error) {
          setFollowing((prev) => new Set([...prev, followingId]))
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Cargando perfiles...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Descubrir personas</h1>

      {profiles.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>No hay más personas para descubrir</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => {
            const isFriend = friends.has(profile.id)
            const hasRequest = friendRequests.has(profile.id)
            const isFollowing = following.has(profile.id)

            return (
              <div
                key={profile.id}
                className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-lg p-4 hover:border-slate-700/50 transition-colors"
              >
                {/* Avatar */}
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username}
                    width={80}
                    height={80}
                    className="rounded-lg w-full aspect-square object-cover mb-4"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-3xl">{profile.username?.[0]?.toUpperCase()}</span>
                  </div>
                )}

                {/* Info */}
                <p className="font-semibold text-white text-center">{profile.full_name || profile.username}</p>
                <p className="text-sm text-slate-400 text-center">@{profile.username}</p>

                {profile.bio && <p className="text-xs text-slate-500 text-center mt-2">{profile.bio}</p>}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  {isFriend ? (
                    <>
                      <Button size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
                        <MessageCircle size={16} />
                        Mensaje
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleFollow(profile.id)}
                        className={`flex-1 ${
                          isFollowing
                            ? 'border border-slate-600 hover:border-slate-500 text-slate-300'
                            : 'border border-cyan-500 hover:border-cyan-600 text-cyan-400'
                        }`}
                      >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(profile.id)}
                        disabled={hasRequest}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white disabled:opacity-50"
                      >
                        <UserPlus size={16} />
                        {hasRequest ? 'Enviado' : 'Agregar'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleFollow(profile.id)}
                        className={`flex-1 ${
                          isFollowing
                            ? 'border border-slate-600 hover:border-slate-500 text-slate-300'
                            : 'border border-cyan-500 hover:border-cyan-600 text-cyan-400'
                        }`}
                      >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

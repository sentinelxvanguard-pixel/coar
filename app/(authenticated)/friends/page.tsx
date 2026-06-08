'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserAction } from '@/lib/auth'
import { Friendship, Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { UserMinus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FriendsPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [friends, setFriends] = useState<Friendship[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const user = await getCurrentUserAction()
      if (!user) {
        router.push('/login')
        return
      }

      setCurrentUserId(user.id)

      // Cargar amigos
      const { data: friendships } = await supabase
        .from('friendships')
        .select(
          `
          *,
          requester:requester_id(id, username, full_name, avatar_url),
          receiver:receiver_id(id, username, full_name, avatar_url)
          `
        )
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      setFriends(friendships || [])

      // Cargar solicitudes pendientes
      const { data: requests } = await supabase
        .from('friendships')
        .select(
          `
          *,
          requester:requester_id(id, username, full_name, avatar_url)
          `
        )
        .eq('receiver_id', user.id)
        .eq('status', 'pending')

      setPendingRequests(requests || [])
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const handleAcceptRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', friendshipId)

    if (!error) {
      setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId))
      // Recargar amigos
      const { data: friendship } = await supabase
        .from('friendships')
        .select(
          `
          *,
          requester:requester_id(id, username, full_name, avatar_url),
          receiver:receiver_id(id, username, full_name, avatar_url)
          `
        )
        .eq('id', friendshipId)
        .single()

      if (friendship) {
        setFriends((prev) => [...prev, friendship])
      }
    }
  }

  const handleRejectRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)

    if (!error) {
      setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId))
    }
  }

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este amigo?')) return

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)

    if (!error) {
      setFriends((prev) => prev.filter((f) => f.id !== friendshipId))
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
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'friends'
              ? 'border-cyan-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Mis amigos ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-cyan-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Solicitudes ({pendingRequests.length})
        </button>
      </div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <>
          {friends.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No tienes amigos aún. ¡Envía solicitudes!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend) => {
                const contact = friend.requester_id === currentUserId ? friend.receiver : friend.requester

                return (
                  <div
                    key={friend.id}
                    className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-lg p-4 hover:border-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {contact?.avatar_url ? (
                        <Image
                          src={contact.avatar_url}
                          alt={contact.username}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">{contact?.username?.[0]?.toUpperCase()}</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{contact?.full_name || contact?.username}</p>
                        <p className="text-sm text-slate-400">@{contact?.username}</p>
                      </div>

                      <Button
                        onClick={() => handleRemoveFriend(friend.id)}
                        size="sm"
                        className="border border-red-500 hover:bg-red-500/10 text-red-400"
                      >
                        <UserMinus size={16} />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Pending Requests */}
      {activeTab === 'requests' && (
        <>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No tienes solicitudes pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-lg p-4 hover:border-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {request.requester?.avatar_url ? (
                        <Image
                          src={request.requester.avatar_url}
                          alt={request.requester.username}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">
                            {request.requester?.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">
                          {request.requester?.full_name || request.requester?.username}
                        </p>
                        <p className="text-sm text-slate-400">@{request.requester?.username}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptRequest(request.id)}
                        size="sm"
                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                      >
                        <Check size={16} />
                        Aceptar
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        size="sm"
                        className="border border-slate-600 hover:border-red-500 hover:text-red-500 text-slate-300"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

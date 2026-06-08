'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserAction } from '@/lib/auth'
import { Message, Profile, Friendship } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { formatTimeAgo } from '@/lib/utils'

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [selectedContact, setSelectedContact] = useState<Profile | null>(null)
  const [friends, setFriends] = useState<Friendship[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [messageContent, setMessageContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

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
      await loadFriends(user.id)
      setLoading(false)
    }

    loadUser()
  }, [router, supabase])

  const loadFriends = async (userId: string) => {
    const { data: friendships } = await supabase
      .from('friendships')
      .select(
        `
        *,
        requester:requester_id(id, username, full_name, avatar_url),
        receiver:receiver_id(id, username, full_name, avatar_url)
        `
      )
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted')

    setFriends(friendships || [])
  }

  const loadMessages = async (contactId: string) => {
    const { data } = await supabase
      .from('messages')
      .select(
        `
        *,
        sender:sender_id(id, username, full_name, avatar_url),
        receiver:receiver_id(id, username, full_name, avatar_url)
        `
      )
      .or(`and(sender_id.eq.${currentUser?.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${currentUser?.id})`)
      .order('created_at', { ascending: true })

    setMessages(data || [])
    scrollToBottom()

    // Mark as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', currentUser?.id)
      .eq('sender_id', contactId)
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }

  const handleSelectContact = async (friend: Friendship) => {
    const contact = friend.requester_id === currentUser?.id ? friend.receiver : friend.requester
    setSelectedContact(contact)
    await loadMessages(contact.id)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageContent.trim() || !selectedContact) return

    setSendingMessage(true)
    try {
      const { data: message } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: currentUser?.id,
            receiver_id: selectedContact.id,
            content: messageContent.trim(),
          },
        ])
        .select(
          `
          *,
          sender:sender_id(id, username, full_name, avatar_url),
          receiver:receiver_id(id, username, full_name, avatar_url)
          `
        )
        .single()

      if (message) {
        setMessages((prev) => [...prev, message])
        setMessageContent('')
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
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
    <div className="h-screen flex">
      {/* Contacts List */}
      <div className="w-full md:w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Mensajes</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {friends.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>No tienes amigos aún</p>
            </div>
          ) : (
            friends.map((friend) => {
              const contact = friend.requester_id === currentUser?.id ? friend.receiver : friend.requester
              const isSelected = selectedContact?.id === contact.id

              return (
                <button
                  key={friend.id}
                  onClick={() => handleSelectContact(friend)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isSelected ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-800/50'
                  }`}
                >
                  {contact.avatar_url ? (
                    <Image
                      src={contact.avatar_url}
                      alt={contact.username}
                      width={40}
                      height={40}
                      className="rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{contact.username?.[0]?.toUpperCase()}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{contact.full_name || contact.username}</p>
                    <p className="text-xs text-slate-500">@{contact.username}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="hidden md:flex flex-1 flex-col">
          {/* Header */}
          <div className="border-b border-slate-800 p-4 flex items-center gap-3">
            {selectedContact.avatar_url ? (
              <Image
                src={selectedContact.avatar_url}
                alt={selectedContact.username}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">{selectedContact.username?.[0]?.toUpperCase()}</span>
              </div>
            )}

            <div className="flex-1">
              <p className="font-semibold text-white">{selectedContact.full_name || selectedContact.username}</p>
              <p className="text-xs text-slate-500">@{selectedContact.username}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>No hay mensajes. ¡Inicia la conversación!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === currentUser?.id

                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        isOwn ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-cyan-100' : 'text-slate-500'}`}>
                        {formatTimeAgo(message.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-800 p-4 flex gap-2">
            <input
              type="text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Button
              type="submit"
              disabled={!messageContent.trim() || sendingMessage}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-slate-400">
          <p>Selecciona un contacto para comenzar a chatear</p>
        </div>
      )}
    </div>
  )
}

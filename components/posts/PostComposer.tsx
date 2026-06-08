'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImageIcon, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Profile } from '@/lib/types'

interface PostComposerProps {
  user: Profile | null
  onSubmit: (content: string, imageUrl: string | null, privacy: string) => Promise<void>
  onCancel?: () => void
  isOpen?: boolean
}

export function PostComposer({ user, onSubmit, onCancel, isOpen = true }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [privacy, setPrivacy] = useState<'public' | 'friends_only'>('public')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('El contenido no puede estar vacío')
      return
    }

    setLoading(true)
    try {
      // TODO: Subir imagen a Cloudinary si existe
      await onSubmit(content, imageUrl, privacy)
      setContent('')
      setImageUrl(null)
      setImageFile(null)
      setPrivacy('public')
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {user?.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.username}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{user?.username?.[0]?.toUpperCase()}</span>
          </div>
        )}
        <div>
          <p className="font-semibold text-white">{user?.full_name || user?.username}</p>
          <p className="text-xs text-slate-400">@{user?.username}</p>
        </div>
      </div>

      {/* Content Input */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué está en tu mente?"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 mb-4"
        rows={4}
      />

      {/* Image Preview */}
      {imageUrl && (
        <div className="relative mb-4 rounded-lg overflow-hidden">
          <img src={imageUrl} alt="Preview" className="w-full max-h-64 object-cover" />
          <button
            onClick={() => {
              setImageUrl(null)
              setImageFile(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-1 rounded-full transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      )}

      {/* Privacy & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Subir imagen"
          >
            <ImageIcon size={18} className="text-cyan-400" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Privacy Selector */}
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as 'public' | 'friends_only')}
            className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300"
          >
            <option value="public">Público</option>
            <option value="friends_only">Solo amigos</option>
          </select>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold disabled:opacity-50"
        >
          <Send size={16} />
          {loading ? 'Publicando...' : 'Publicar'}
        </Button>
      </div>
    </div>
  )
}

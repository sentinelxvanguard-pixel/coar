'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, TrendingUp, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Story {
  id: string
  username: string
  avatar: string
  title: string
}

interface Trending {
  id: string
  tag: string
  posts: number
  trend: 'up' | 'down'
}

interface UserToFollow {
  id: string
  name: string
  username: string
  avatar: string
}

export function RightSidebar() {
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      username: 'luciadev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luciana',
      title: 'You',
    },
    {
      id: '2',
      username: 'alexmiles',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      title: 'Alex',
    },
    {
      id: '3',
      username: 'sofiamendes',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
      title: 'Sofia',
    },
    {
      id: '4',
      username: 'dianaolive',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
      title: 'Diana',
    },
  ])

  const [trending, setTrending] = useState<Trending[]>([
    {
      id: '1',
      tag: '#WebDevelopment',
      posts: 25100,
      trend: 'up',
    },
    {
      id: '2',
      tag: '#Design',
      posts: 18600,
      trend: 'up',
    },
    {
      id: '3',
      tag: '#JavaScript',
      posts: 14300,
      trend: 'down',
    },
    {
      id: '4',
      tag: '#Startup',
      posts: 9700,
      trend: 'up',
    },
  ])

  const [usersToFollow, setUsersToFollow] = useState<UserToFollow[]>([
    {
      id: '1',
      name: 'Daniel Cortez',
      username: 'danielcortez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    },
    {
      id: '2',
      name: 'Valentina R.',
      username: 'valera',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Valentina',
    },
    {
      id: '3',
      name: 'Lucas Veras',
      username: 'lucasveras',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    },
  ])

  return (
    <aside className="fixed right-0 top-0 h-screen w-80 bg-gradient-to-b from-slate-900/95 to-slate-900/85 backdrop-blur border-l border-slate-800/50 p-6 overflow-y-auto hidden 2xl:flex 2xl:flex-col">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Buscar personas"
          className="w-full bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {/* Stories */}
      <div className="mb-8">
        <h3 className="text-white font-bold text-lg mb-4">Historias</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {stories.map((story) => (
            <button
              key={story.id}
              className="flex-shrink-0 relative group cursor-pointer"
            >
              <div className="w-16 h-20 rounded-lg bg-gradient-to-b from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 overflow-hidden flex items-center justify-center hover:border-cyan-500 transition-all">
                <Image
                  src={story.avatar}
                  alt={story.username}
                  width={56}
                  height={56}
                  className="rounded-full w-12 h-12"
                />
              </div>
              <p className="text-xs text-slate-400 text-center mt-1 truncate w-16">
                {story.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">Tendencia para ti</h3>
          <button className="text-cyan-400 text-sm hover:text-cyan-300 font-semibold">
            Ver más
          </button>
        </div>
        <div className="space-y-3">
          {trending.map((trend) => (
            <button
              key={trend.id}
              className="w-full text-left p-3 rounded-lg bg-slate-800/30 border border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">{trend.tag}</p>
                  <p className="text-xs text-slate-400">
                    {(trend.posts / 1000).toFixed(1)}K publicaciones
                  </p>
                </div>
                <TrendingUp
                  size={16}
                  className={trend.trend === 'up' ? 'text-green-500' : 'text-red-500'}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Who to Follow */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">A quién seguir</h3>
          <button className="text-cyan-400 text-sm hover:text-cyan-300 font-semibold">
            Ver más
          </button>
        </div>
        <div className="space-y-3">
          {usersToFollow.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-800/50 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-white font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-slate-400">@{user.username}</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-xs font-semibold px-4 py-1 rounded-full h-auto">
                Seguir
              </Button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

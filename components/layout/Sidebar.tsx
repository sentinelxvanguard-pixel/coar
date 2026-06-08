'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Compass,
  Bell,
  MessageCircle,
  Bookmark,
  User,
  Settings,
  LogOut,
  Heart,
} from 'lucide-react'
import { signOutAction } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { icon: Home, label: 'Inicio', href: '/home', active: pathname === '/home' },
    { icon: Compass, label: 'Explorar', href: '/home?tab=explore', active: pathname.includes('explore') },
    { icon: Bell, label: 'Notificaciones', href: '/home?tab=notifications', active: pathname.includes('notifications') },
    { icon: MessageCircle, label: 'Mensajes', href: '/home?tab=messages', active: pathname.includes('messages') },
    { icon: Bookmark, label: 'Guardados', href: '/home?tab=bookmarks', active: pathname.includes('bookmarks') },
    { icon: User, label: 'Perfil', href: '/home?tab=profile', active: pathname.includes('profile') },
    { icon: Settings, label: 'Configuración', href: '/home?tab=settings', active: pathname.includes('settings') },
  ]

  const handleLogout = async () => {
    await signOutAction()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900/95 to-slate-900/85 backdrop-blur border-r border-slate-800/50 p-6 overflow-y-auto hidden md:flex md:flex-col">
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">⚡</span>
        </div>
        <span className="text-white font-bold text-2xl">COAR</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 mb-8">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-3 rounded-full font-semibold transition-all ${
                item.active
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Create Post Button */}
      <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3 rounded-full mb-4">
        <Heart size={18} className="mr-2" />
        Publicar
      </Button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-4 px-6 py-3 rounded-full font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
      >
        <LogOut size={20} />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  )
}

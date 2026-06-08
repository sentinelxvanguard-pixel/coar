'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Compass,
  Bell,
  MessageCircle,
  User,
} from 'lucide-react'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { icon: Home, label: 'Inicio', href: '/home' },
    { icon: Compass, label: 'Explorar', href: '/home?tab=explore' },
    { icon: Bell, label: 'Notificaciones', href: '/home?tab=notifications' },
    { icon: MessageCircle, label: 'Mensajes', href: '/home?tab=messages' },
    { icon: User, label: 'Perfil', href: '/home?tab=profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-slate-900/85 backdrop-blur border-t border-slate-800/50 md:hidden z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href.split('?')[0])
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex-1 flex items-center justify-center py-3 transition-colors ${
                isActive ? 'text-cyan-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={24} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}

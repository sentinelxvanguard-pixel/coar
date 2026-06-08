import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOutAction, getCurrentUserAction } from '@/lib/auth'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Home, Users, MessageSquare, Settings, LogOut, Search } from 'lucide-react'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar autenticación
  const user = await getCurrentUserAction()
  if (!user) {
    redirect('/login')
  }

  // Obtener perfil
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.completed_onboarding) {
    redirect('/onboarding')
  }

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/50 backdrop-blur border-r border-slate-800 sticky top-0">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-3 px-6 py-6 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>
          <span className="text-white font-bold text-xl">COAR</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink href="/feed" icon={<Home size={20} />} label="Feed" />
          <NavLink href="/explore" icon={<Search size={20} />} label="Explorar" />
          <NavLink href="/friends" icon={<Users size={20} />} label="Amigos" />
          <NavLink href="/messages" icon={<MessageSquare size={20} />} label="Mensajes" />
          <NavLink href="/settings" icon={<Settings size={20} />} label="Configuración" />
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-800 px-4 py-4 space-y-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">{profile?.username?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.full_name || profile?.username}</p>
              <p className="text-xs text-slate-500 truncate">@{profile?.username}</p>
            </div>
          </Link>

          <form
            action={async () => {
              'use server'
              await signOutAction()
              redirect('/login')
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation - Mobile */}
        <header className="lg:hidden border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <Link href="/feed" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚡</span>
              </div>
              <span className="text-white font-bold">COAR</span>
            </Link>
            <NotificationBell userId={user.id} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors group"
    >
      <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}

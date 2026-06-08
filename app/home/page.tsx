'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOutAction } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const router = useRouter()

  async function handleLogout() {
    const result = await signOutAction()

    if (result?.success) {
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <span className="text-white font-bold text-2xl">COAR</span>
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            Cerrar sesión
          </Button>
        </div>
      </nav>

      {/* Welcome section */}
      <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Text content */}
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white text-balance leading-tight">
                ¡Bienvenido a{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  COAR
                </span>
              </h1>
              <p className="text-xl text-slate-300 text-balance">
                Ya estás dentro de la comunidad. Explora, conecta y comparte lo que más te importa.
              </p>
            </div>

            {/* Feature list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="flex gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition">
                <span className="text-2xl">📰</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Mi Feed</h3>
                  <p className="text-sm text-slate-400">
                    Descubre publicaciones de personas que sigues
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 transition">
                <span className="text-2xl">👥</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Descubrir</h3>
                  <p className="text-sm text-slate-400">
                    Encuentra nuevas personas y comunidades
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Publicar</h3>
                  <p className="text-sm text-slate-400">
                    Comparte tus pensamientos y experiencias
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 transition">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Mensajes</h3>
                  <p className="text-sm text-slate-400">
                    Chatea con amigos y colegas
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 pt-4">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold h-10 px-8">
                Comenzar
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 h-10 px-8"
              >
                Explorar comunidades
              </Button>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent border border-cyan-500/20 rounded-3xl p-12 aspect-square flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-8xl">🎉</div>
                <h2 className="text-2xl font-bold text-white">¡Listo para comenzar!</h2>
                <p className="text-slate-300">
                  Tu perfil está completo y tu comunidad te espera
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-slate-800/50 border-y border-slate-700 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <p className="text-slate-300">Usuarios activos</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
                1M+
              </div>
              <p className="text-slate-300">Publicaciones diarias</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <p className="text-slate-300">Disponible siempre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">COAR</h4>
              <p className="text-sm text-slate-400">
                La red social donde conectas con tu comunidad
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/home" className="hover:text-cyan-400">
                    Feed
                  </Link>
                </li>
                <li>
                  <Link href="/home" className="hover:text-cyan-400">
                    Descubrir
                  </Link>
                </li>
                <li>
                  <Link href="/home" className="hover:text-cyan-400">
                    Mensajes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/privacy" className="hover:text-cyan-400">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-cyan-400">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="mailto:support@coar.social" className="hover:text-cyan-400">
                    Soporte
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 COAR. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-slate-900 to-slate-950 flex-col justify-between p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <span className="text-white font-bold text-2xl">COAR</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
            Conecta con tu comunidad
          </h1>
          <p className="text-xl text-cyan-200 mb-8">
            Únete a COAR, la red social donde descubres publicaciones, sigues amistades y mantienes tu feed siempre actualizado.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 text-2xl mt-1">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1">Comunidad Activa</h3>
                <p className="text-slate-300">Conecta con estudiantes y profesores</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 text-2xl mt-1">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1">Seguridad Avanzada</h3>
                <p className="text-slate-300">Tu privacidad es nuestra prioridad</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 text-2xl mt-1">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1">Moderno y Rápido</h3>
                <p className="text-slate-300">Diseño intuitivo y responsivo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-slate-400 text-sm">
          <p>COAR © 2024. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-900">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}

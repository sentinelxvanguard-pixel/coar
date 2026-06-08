import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <span className="text-white font-bold text-xl">COAR</span>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              Volver
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 lg:py-16">
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white">Términos y Condiciones</h1>
            <p className="text-slate-400">Última actualización: Enero 2024</p>
          </div>

          {/* Table of contents */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-3">
            <h2 className="font-semibold text-white mb-4">Contenido</h2>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a href="#1" className="hover:text-cyan-400 transition">
                  1. Aceptación de Términos
                </a>
              </li>
              <li>
                <a href="#2" className="hover:text-cyan-400 transition">
                  2. Uso Permitido
                </a>
              </li>
              <li>
                <a href="#3" className="hover:text-cyan-400 transition">
                  3. Contenido del Usuario
                </a>
              </li>
              <li>
                <a href="#4" className="hover:text-cyan-400 transition">
                  4. Propiedad Intelectual
                </a>
              </li>
              <li>
                <a href="#5" className="hover:text-cyan-400 transition">
                  5. Limitación de Responsabilidad
                </a>
              </li>
              <li>
                <a href="#6" className="hover:text-cyan-400 transition">
                  6. Cambios en los Términos
                </a>
              </li>
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <section id="1" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">1. Aceptación de Términos</h2>
              <p className="text-slate-300 leading-relaxed">
                Al acceder y usar COAR, aceptas estar vinculado por estos términos y condiciones.
                Si no estás de acuerdo con alguna parte de estos términos, no debes usar el servicio.
              </p>
            </section>

            <section id="2" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">2. Uso Permitido</h2>
              <p className="text-slate-300 leading-relaxed mb-3">
                Te comprometes a usar COAR solo para propósitos legales y de manera que no infrinja
                los derechos de otros ni restrinja su uso y disfrute.
              </p>
              <ul className="space-y-2 text-slate-300 list-disc list-inside">
                <li>No publicarás contenido ofensivo, discriminatorio o ilegal</li>
                <li>No intentarás piratear o dañar la plataforma</li>
                <li>No usarás bots o herramientas automatizadas sin autorización</li>
                <li>No compartiré información privada de otros usuarios</li>
              </ul>
            </section>

            <section id="3" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">3. Contenido del Usuario</h2>
              <p className="text-slate-300 leading-relaxed">
                Eres responsable de todo el contenido que publicas en COAR. Al publicar contenido,
                nos otorgas una licencia para usar, modificar y distribuir ese contenido en la
                plataforma. No nos hacemos responsables del contenido publicado por los usuarios.
              </p>
            </section>

            <section id="4" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">4. Propiedad Intelectual</h2>
              <p className="text-slate-300 leading-relaxed">
                Todo el contenido, diseño y funcionalidad de COAR es propiedad de COAR o de sus
                proveedores de contenido y está protegido por leyes de derechos de autor
                internacionales.
              </p>
            </section>

            <section id="5" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">5. Limitación de Responsabilidad</h2>
              <p className="text-slate-300 leading-relaxed">
                COAR se proporciona &quot;tal como está&quot; sin garantías de ningún tipo. No seremos
                responsables por daños directos, indirectos, incidentales o consecuentes que surjan
                del uso o la imposibilidad de usar el servicio.
              </p>
            </section>

            <section id="6" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">6. Cambios en los Términos</h2>
              <p className="text-slate-300 leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los
                cambios serán efectivos inmediatamente después de su publicación. Tu uso continuo
                del servicio constituye tu aceptación de los términos modificados.
              </p>
            </section>

            <section className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">¿Preguntas?</h3>
              <p className="text-slate-300">
                Si tienes preguntas sobre estos términos, puedes contactarnos en{' '}
                <a href="mailto:legal@coar.social" className="text-cyan-400 hover:text-cyan-300">
                  legal@coar.social
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

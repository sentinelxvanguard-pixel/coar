import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
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
            <h1 className="text-4xl font-bold text-white">Política de Privacidad</h1>
            <p className="text-slate-400">Última actualización: Enero 2024</p>
          </div>

          {/* Table of contents */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-3">
            <h2 className="font-semibold text-white mb-4">Contenido</h2>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a href="#1" className="hover:text-cyan-400 transition">
                  1. Información que Recopilamos
                </a>
              </li>
              <li>
                <a href="#2" className="hover:text-cyan-400 transition">
                  2. Cómo Usamos tu Información
                </a>
              </li>
              <li>
                <a href="#3" className="hover:text-cyan-400 transition">
                  3. Protección de Datos
                </a>
              </li>
              <li>
                <a href="#4" className="hover:text-cyan-400 transition">
                  4. Tus Derechos
                </a>
              </li>
              <li>
                <a href="#5" className="hover:text-cyan-400 transition">
                  5. Compartir Información
                </a>
              </li>
              <li>
                <a href="#6" className="hover:text-cyan-400 transition">
                  6. Cookies
                </a>
              </li>
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <section id="1" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">1. Información que Recopilamos</h2>
              <p className="text-slate-300 leading-relaxed mb-3">
                Recopilamos información que nos proporcionas directamente y información que
                obtenemos cuando usas nuestro servicio:
              </p>
              <ul className="space-y-2 text-slate-300 list-disc list-inside">
                <li>
                  <strong className="text-slate-200">Información de Cuenta:</strong> Correo
                  electrónico, contraseña (encriptada), nombre, foto de perfil
                </li>
                <li>
                  <strong className="text-slate-200">Información de Perfil:</strong> Fecha de
                  nacimiento, género, biografía, ubicación
                </li>
                <li>
                  <strong className="text-slate-200">Contenido:</strong> Publicaciones, comentarios,
                  mensajes directos
                </li>
                <li>
                  <strong className="text-slate-200">Información Técnica:</strong> Dirección IP,
                  tipo de dispositivo, navegador, actividad en el sitio
                </li>
              </ul>
            </section>

            <section id="2" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">2. Cómo Usamos tu Información</h2>
              <p className="text-slate-300 leading-relaxed mb-3">
                Utilizamos tu información para:
              </p>
              <ul className="space-y-2 text-slate-300 list-disc list-inside">
                <li>Proporcionar y mejorar nuestro servicio</li>
                <li>Verificar tu identidad y autenticar tu acceso</li>
                <li>Comunicarnos contigo sobre cambios en el servicio</li>
                <li>Personalizar tu experiencia</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Prevenir fraude y abusos</li>
              </ul>
            </section>

            <section id="3" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">3. Protección de Datos</h2>
              <p className="text-slate-300 leading-relaxed">
                Tomamos medidas de seguridad para proteger tu información personal. Tu contraseña
                está encriptada con bcryptjs y tus datos están almacenados en servidores seguros
                de Supabase. Sin embargo, ningún método de transmisión por Internet es 100% seguro.
              </p>
            </section>

            <section id="4" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">4. Tus Derechos</h2>
              <p className="text-slate-300 leading-relaxed mb-3">
                Tienes derecho a:
              </p>
              <ul className="space-y-2 text-slate-300 list-disc list-inside">
                <li>Acceder a tu información personal</li>
                <li>Rectificar información incorrecta</li>
                <li>Solicitar la eliminación de tu cuenta</li>
                <li>Oponerme al procesamiento de tu información</li>
                <li>Solicitar portabilidad de datos</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-3">
                Para ejercer estos derechos, contacta a{' '}
                <a href="mailto:privacy@coar.social" className="text-cyan-400 hover:text-cyan-300">
                  privacy@coar.social
                </a>
              </p>
            </section>

            <section id="5" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">5. Compartir Información</h2>
              <p className="text-slate-300 leading-relaxed">
                No compartimos tu información personal con terceros sin tu consentimiento, excepto:
                (a) cuando sea requerido por ley, (b) para procesar pagos, (c) para proporcionar
                servicios que solicitas, o (d) cuando sea necesario para proteger nuestros derechos.
              </p>
            </section>

            <section id="6" className="space-y-3">
              <h2 className="text-2xl font-bold text-white">6. Cookies</h2>
              <p className="text-slate-300 leading-relaxed">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia. Las cookies
                nos ayudan a mantener tu sesión iniciada y a entender cómo usas nuestro servicio.
                Puedes controlar las cookies a través de la configuración de tu navegador.
              </p>
            </section>

            <section className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Cambios en esta Política</h3>
              <p className="text-slate-300">
                Nos reservamos el derecho de actualizar esta política de privacidad. Publicaremos
                los cambios en esta página y actualizaremos la fecha de &quot;Última actualización&quot;.
              </p>
            </section>

            <section className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Contacto</h3>
              <p className="text-slate-300">
                Si tienes preguntas sobre nuestra política de privacidad, puedes contactarnos en{' '}
                <a href="mailto:privacy@coar.social" className="text-cyan-400 hover:text-cyan-300">
                  privacy@coar.social
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

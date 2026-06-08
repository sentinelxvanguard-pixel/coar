# COAR - Sistema de Autenticación Profesional

Sistema de autenticación moderno, seguro y avanzado para la red social universitaria COAR.

## ✨ Características

- **Autenticación por Email** - Registro con verificación de código OTP
- **OAuth Google** - Integración lista para Google Sign-In
- **Verificación por Email** - Códigos de 6 dígitos con Resend
- **Perfil de Usuario** - Recopilación de fecha de nacimiento y género
- **Página Home** - Bienvenida después del registro
- **Términos y Privacidad** - Páginas legales profesionales
- **Diseño Moderno** - Dark theme con colores vibrant (cyan y purple)
- **100% Responsive** - Funciona perfectamente en todos los dispositivos
- **Seguridad Avanzada** - Contraseñas con bcrypt, JWT, RLS en BD

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Base de Datos**: Supabase (PostgreSQL)
- **Email**: Resend
- **Hosting**: Vercel
- **Autenticación**: JWT + Cookies HTTP-only
- **Criptografía**: bcryptjs

## 📋 Requisitos Previos

1. Cuenta de Supabase (https://supabase.com)
2. API Key de Resend (https://resend.com)
3. Node.js 18+ y pnpm
4. Cuenta de Vercel (opcional, para deploy)

## 🔧 Instalación Local

### 1. Clonar el proyecto

```bash
git clone <tu-repo>
cd coar-auth
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Luego completa con tus credenciales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend
RESEND_API_KEY=your-resend-api-key

# JWT Secret (cambiar en producción)
JWT_SECRET=tu-secreto-jwt-seguro-aqui

# Ambiente
NODE_ENV=development
```

### 4. Ejecutar la aplicación

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📊 Flujo de Autenticación

### Registro
1. Usuario ingresa email y contraseña
2. Sistema valida y crea usuario en BD
3. Resend envía código de verificación (6 dígitos)
4. Usuario ingresa código
5. Sistema valida y marca email como verificado
6. Usuario completa perfil (fecha nacimiento, género)
7. Sistema crea sesión JWT y redirige a Home

### Login
1. Usuario ingresa email y contraseña
2. Sistema valida credenciales contra BD
3. Sistema verifica email verificado
4. Sistema crea sesión JWT
5. Usuario redirigido a Home

### Logout
1. Usuario hace click en "Cerrar sesión"
2. Sistema elimina cookie de sesión
3. Usuario redirigido a login

## 📁 Estructura del Proyecto

```
├── app/
│   ├── (auth)/              # Rutas de autenticación
│   │   ├── layout.tsx       # Layout con branding
│   │   ├── login/
│   │   ├── signup/
│   │   ├── verify/
│   │   └── profile-setup/
│   ├── home/                # Página principal protegida
│   ├── terms/               # Términos y condiciones
│   ├── privacy/             # Política de privacidad
│   ├── api/auth/            # APIs de autenticación
│   ├── globals.css          # Estilos y design tokens
│   └── layout.tsx           # Layout raíz
├── lib/
│   ├── auth-actions.ts      # Server actions de auth
│   ├── auth-context.tsx     # Context para auth
│   ├── session.ts           # Manejo de sesiones JWT
│   └── utils.ts             # Utilidades
├── components/ui/           # Componentes shadcn
└── middleware.ts            # (Removido - usar protección en páginas)
```

## 🗄️ Base de Datos

El esquema incluye 3 tablas:

### users
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `google_id` (VARCHAR, UNIQUE, nullable)
- `email_verified` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### email_verifications
- `id` (UUID, PK)
- `email` (VARCHAR)
- `code` (VARCHAR)
- `expires_at` (TIMESTAMP)
- `verified` (BOOLEAN)
- `created_at` (TIMESTAMP)

### user_profiles
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `date_of_birth` (DATE)
- `gender` (VARCHAR)
- `completed_setup` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcryptjs
- ✅ JWT con expiración (7 días)
- ✅ Cookies HTTP-only, Secure, SameSite
- ✅ Row Level Security (RLS) en Supabase
- ✅ Validación de inputs
- ✅ Protección CSRF (via Next.js)
- ✅ Verificación de email obligatoria

## 🎨 Diseño

**Colores:**
- Primary: Cyan (#00d9ff)
- Secondary: Purple (#7c3aed)
- Background: Slate-950 (#0f172a)
- Cards: Slate-800/900

**Tipografía:**
- Font: Geist (Google Fonts)
- Tailwind CSS v4 para estilos

## 📱 Responsividad

- Desktop: Layout de 2 columnas (branding + formulario)
- Tablet: Stack con ajustes
- Mobile: Layout de 1 columna optimizado

## 🚀 Deployment en Vercel

### 1. Preparar el proyecto

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Conectar a Vercel

1. Ir a [vercel.com](https://vercel.com)
2. Importar proyecto desde GitHub
3. Configurar variables de entorno
4. Deploy

### 3. Variables en Vercel

En la sección de "Environment Variables":

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
JWT_SECRET=... (genera con: openssl rand -base64 32)
```

## 🧪 Testing

Para probar el flujo completo:

1. Ir a `/signup`
2. Crear cuenta con un email de prueba
3. Resend enviará código a la consola (en dev)
4. Ingresar código en la página de verificación
5. Completar perfil
6. Ser redirigido a `/home`

## 🐛 Troubleshooting

**Error: Cannot find module**
- Ejecutar `pnpm install` nuevamente
- Limpiar `.next`: `rm -rf .next`

**Error de CORS en Supabase**
- Verificar que `NEXT_PUBLIC_SUPABASE_URL` es correcto
- Verificar que `NEXT_PUBLIC_SUPABASE_ANON_KEY` es válido

**Email no llega**
- En desarrollo, verificar logs de Resend
- En producción, verificar que RESEND_API_KEY es correcto

**Problema de hidratación**
- Limpiar caché del navegador
- Ejecutar `pnpm dev` nuevamente

## 📚 API Endpoints

### POST /api/auth/check
Verifica si el usuario tiene sesión válida

```bash
curl http://localhost:3000/api/auth/check
```

### POST /api/auth/logout
Cierra la sesión del usuario

```bash
curl -X POST http://localhost:3000/api/auth/logout
```

## 🔮 Próximos Pasos

- [ ] Integrar OAuth Google completamente
- [ ] Agregar reseteo de contraseña
- [ ] Implementar 2FA
- [ ] Agregar reCAPTCHA en signup
- [ ] Rate limiting en APIs
- [ ] Analytics de usuarios
- [ ] Feed de publicaciones
- [ ] Sistema de mensajería

## 📄 Licencia

Proyecto para Universidad. Todos los derechos reservados.

## 👨‍💻 Soporte

Para reportar bugs o sugerencias, abre un issue en el repositorio.

---

**COAR © 2024** - Construido con ❤️ para conectar comunidades

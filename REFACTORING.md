# COAR - Refactorización a Supabase Auth

## Resumen de Cambios

Se ha refactorizado completamente el sistema de autenticación para usar **ÚNICAMENTE Supabase Auth** en lugar de una autenticación manual. Esto elimina la duplicación, los conflictos de RLS y proporciona una arquitectura profesional, segura y escalable.

## ¿Qué Cambió?

### ❌ Eliminado

- `bcryptjs` y `password_hash` manual
- `jose` y JWT manual
- `Resend` para OTP manual
- Tabla custom `users` con contraseñas
- Tabla `email_verifications` manual
- Autenticación dual/conflictiva

### ✅ Implementado

- **Supabase Auth** para autenticación de usuarios
- **Google OAuth** nativo de Supabase
- **Verificación de email** automática de Supabase
- **Tabla única `profiles`** para datos sociales
- **RLS correcto** con `auth.uid()`
- **Trigger automático** para crear perfiles

## Archivos Modificados

### Nuevos Archivos
- `/lib/supabase/client.ts` - Cliente Supabase (browser)
- `/lib/supabase/server.ts` - Cliente Supabase (servidor)
- `/lib/supabase/proxy.ts` - Proxy para sesiones
- `/lib/auth.ts` - Server actions para autenticación
- `/app/auth/callback/route.ts` - Callback para OAuth y email links
- `/app/onboarding/page.tsx` - Página de configuración de perfil
- `/scripts/setup-database.sql` - Script SQL actualizado
- `/middleware.ts` - Middleware de protección de rutas

### Eliminados
- `/lib/auth-actions.ts` (reemplazado por `/lib/auth.ts`)
- `/lib/session.ts` (sesiones nativas de Supabase)
- `/lib/auth-context.tsx` (no necesario)
- `/app/(auth)/verify/page.tsx` (Supabase Auth lo maneja)
- `/app/(auth)/profile-setup/page.tsx` (movido a `/app/onboarding`)
- `/app/api/auth/check/route.ts` (middleware lo maneja)
- `/app/api/auth/logout/route.ts` (Supabase Auth lo maneja)

### Modificados
- `/app/(auth)/login/page.tsx` - Ahora usa `signInAction` de Supabase Auth
- `/app/(auth)/signup/page.tsx` - Ahora usa `signUpAction` de Supabase Auth
- `/app/home/page.tsx` - Logout simplificado
- `/app/layout.tsx` - Removed AuthProvider
- `/.env.example` - Variables actualizadas

## Flujo de Autenticación Nuevo

### 1. Signup (Registro)

```
Usuario abre app
    ↓
Redirige a /login (middleware)
    ↓
Click en "Crear cuenta" → /signup
    ↓
Completa email + password
    ↓
Server Action: signUpAction()
    ↓
Supabase Auth.signUp({email, password})
    ↓
Supabase envía email de verificación automáticamente
    ↓
Usuario recibe email y hace click en link
    ↓
Link redirige a /auth/callback
    ↓
exchangeCodeForSession() → crea sesión
    ↓
Middleware detecta autenticación → redirige a /onboarding
    ↓
Usuario completa perfil (username, fecha nacimiento, género)
    ↓
completedOnboarding = true
    ↓
Redirige a /home ✅
```

### 2. Login (Iniciar Sesión)

```
Usuario abre app
    ↓
Middleware detecta no autenticado → /login
    ↓
Completa email + password
    ↓
Server Action: signInAction()
    ↓
Supabase Auth.signInWithPassword({email, password})
    ↓
Verifica completedOnboarding en profiles
    ↓
Si no: → /onboarding
Si sí: → /home ✅
```

### 3. Google OAuth

```
Click "Continuar con Google"
    ↓
Server Action: signInWithGoogleAction()
    ↓
Supabase Auth.signInWithOAuth({provider: 'google'})
    ↓
Redirige a Google login
    ↓
Usuario autoriza
    ↓
Redirige a /auth/callback
    ↓
exchangeCodeForSession()
    ↓
Trigger crea profile automáticamente
    ↓
Detecta completedOnboarding = false
    ↓
Redirige a /onboarding
    ↓
Usuario completa datos
    ↓
Redirige a /home ✅
```

### 4. Logout

```
Usuario click "Cerrar sesión"
    ↓
Server Action: signOutAction()
    ↓
Supabase Auth.signOut()
    ↓
Limpia sesión/cookies
    ↓
Redirige a /login ✅
```

### 5. Rutas Protegidas

```
Middleware.ts maneja:
  - /home → requiere auth, sino → /login
  - /onboarding → requiere auth
  - /login, /signup → si autenticado, → /home
  - / (raíz) → sin auth → /login
```

## Base de Datos

### Tabla `profiles`

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,           -- Identificador único del usuario
  full_name TEXT,                          -- Nombre completo
  bio TEXT,                                -- Biografía (para futuro)
  avatar_url TEXT,                         -- URL de foto de perfil
  birth_date DATE,                         -- Fecha de nacimiento
  gender VARCHAR(50),                      -- Género
  verified BOOLEAN,                        -- Verificación de email
  completed_onboarding BOOLEAN,            -- ¿Completó onboarding?
  created_at TIMESTAMP,                    -- Fecha de creación
  updated_at TIMESTAMP                     -- Última actualización
);
```

### Auth: `auth.users` (Supabase)

Automáticamente manejado por Supabase:
- `id` (UUID)
- `email` (único)
- `encrypted_password` (bcryptjs, Supabase lo maneja)
- `email_confirmed_at` (verificación de email)
- `user_metadata` (datos adicionales)
- `created_at`
- `updated_at`

### RLS Policies

```sql
-- SELECT: Todos pueden ver perfiles públicos
CREATE POLICY "Profiles viewable by everyone" 
  ON profiles FOR SELECT USING (TRUE);

-- INSERT: Solo el usuario autenticado puede insertar su perfil
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Solo el usuario puede actualizar su perfil
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- DELETE: Solo el usuario puede eliminar su perfil
CREATE POLICY "Users can delete own profile" 
  ON profiles FOR DELETE USING (auth.uid() = id);
```

## Server Actions (`/lib/auth.ts`)

### Funciones Disponibles

1. **`signUpAction(email, password)`**
   - Crea usuario con Supabase Auth
   - Supabase envía email de verificación automáticamente
   - Retorna mensaje de confirmación

2. **`signInAction(email, password)`**
   - Login con email/password
   - Verifica `completed_onboarding`
   - Redirige a `/onboarding` o `/home`

3. **`signInWithGoogleAction()`**
   - Inicia Google OAuth
   - Redirige a Google login
   - Callback automático a `/auth/callback`

4. **`signOutAction()`**
   - Logout seguro
   - Limpia sesión
   - Redirige a `/login`

5. **`getCurrentUserAction()`**
   - Obtiene usuario autenticado
   - Retorna objeto `user` o `null`

6. **`updateProfileAction(userId, profileData)`**
   - Actualiza tabla `profiles`
   - Usada en onboarding
   - Setea `completed_onboarding = true`

## Middleware (`/middleware.ts`)

Protege rutas automáticamente:

```typescript
// Rutas protegidas (requieren autenticación):
/home
/onboarding

// Rutas públicas (pero redirige si autenticado):
/login → si autenticado → /home
/signup → si autenticado → /home
/ → si no autenticado → /login
```

## Setup Inicial

### 1. Ejecutar Script SQL

```bash
# En Supabase Dashboard > SQL Editor, pegar:
cat /vercel/share/v0-project/scripts/setup-database.sql
# Ejecutar
```

Esto:
- ✅ Crea tabla `profiles`
- ✅ Configura RLS
- ✅ Crea trigger para auto-crear perfiles
- ✅ Crea índices para performance

### 2. Variables de Entorno

Crear `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### 3. Instalar Dependencias

```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm install
```

### 4. Ejecutar Dev

```bash
pnpm dev
```

Visita:
- `http://localhost:3000` → Redirige a `/login`
- Prueba signup/login

## Testing del Flujo

### Test 1: Signup con Email

```
1. Ir a /signup
2. Email: test@example.com
3. Password: Test123456
4. Aceptar términos
5. Click "Crear cuenta"
6. ✅ Verás: "Verifica tu correo"
7. En Supabase > Auth > Users, verás usuario con email_confirmed_at = null
8. Click link en email
9. ✅ Redirige a /onboarding
10. Completa perfil
11. ✅ Redirige a /home
```

### Test 2: Login

```
1. Ir a /login
2. Email: test@example.com
3. Password: Test123456
4. Click "Iniciar sesión"
5. ✅ Redirige a /home (si completó onboarding)
6. ✅ Redirige a /onboarding (si no lo completó)
```

### Test 3: Google OAuth

```
1. Ir a /signup o /login
2. Click "Google"
3. Autoriza cuenta Google
4. ✅ Redirige a /onboarding
5. Completa datos
6. ✅ Redirige a /home
```

### Test 4: Protección de Rutas

```
1. Logout
2. Intenta acceder a /home
3. ✅ Redirige a /login (middleware)
4. Haz login
5. Intenta acceder a /login
6. ✅ Redirige a /home (middleware)
```

## Seguridad

✅ **Contraseñas**: Bcryptjs (Supabase lo maneja)
✅ **Sesiones**: JWT + Cookies HTTP-only (Supabase)
✅ **RLS**: Todas las tablas protegidas
✅ **OAuth**: Google nativo, sin credenciales en código
✅ **CSRF**: Token automático en sesiones
✅ **Rate Limiting**: Configurar en Supabase Dashboard

## Próximas Características

Tabla `profiles` está lista para:
- Posts/publicaciones
- Likes y comentarios
- Seguir/followers
- Mensajes directos
- Notificaciones
- Guardar publicaciones

Simplemente agrega las tablas y crea las RLS policies necesarias.

## Conclusión

Sistema completamente refactorizado, profesional, escalable y listo para producción. No hay código duplicado, no hay conflictos de RLS, y la arquitectura es limpia y mantenible.

¡A construir la mejor red social de tu universidad! 🚀

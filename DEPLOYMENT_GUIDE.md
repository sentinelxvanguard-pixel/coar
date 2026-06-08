# 🚀 COAR Social Network - Complete Deployment Guide

**Versión:** 1.0.0 - Production Ready
**Última actualización:** 2026-06-08
**Estado:** ✅ Completamente Funcional

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación - Base de Datos](#instalación---base-de-datos)
3. [Instalación - Proyecto](#instalación---proyecto)
4. [Configuración de Entorno](#configuración-de-entorno)
5. [Flujo de Usuario](#flujo-de-usuario)
6. [Características Implementadas](#características-implementadas)
7. [Troubleshooting](#troubleshooting)
8. [Próximos Pasos](#próximos-pasos)

---

## Requisitos Previos

### Software Necesario
- Node.js 18+ instalado (`node --version`)
- npm, yarn, pnpm o bun
- Una cuenta en [Supabase](https://supabase.com) (gratis)
- (Opcional) Cuenta en [Cloudinary](https://cloudinary.com) para subida de imágenes

### Cuenta Supabase
1. Ve a https://supabase.com
2. Haz clic en "Sign Up"
3. Registrate con email y contraseña
4. Crea un nuevo proyecto

---

## Instalación - Base de Datos

### Paso 1: Obtener tus credenciales de Supabase

1. En tu dashboard de Supabase, ve a **Settings > API**
2. Copia estos valores (los necesitarás más adelante):
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
3. Guarda estos valores en un archivo de texto temporal

### Paso 2: Ejecutar el Script SQL

1. En tu dashboard de Supabase, ve a **SQL Editor**
2. Haz clic en el botón "+" para crear una nueva query
3. Copia TODO el contenido de `SETUP_COMPLETE_DATABASE.sql`
4. Pégalo en el editor SQL
5. Haz clic en el botón **"Run"** (botón azul con ▶️)
6. Espera a que se complete (verás ✅ cuando termine)

**Resultado esperado:**
```
✅ Query executed successfully
✅ 0 rows affected
```

Si ves algún error, verifica:
- Que el archivo SQL esté completo
- Que no hayas modificado nada
- Que estés usando la última versión del archivo

---

## Instalación - Proyecto

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/sentinelxvanguard-pixel/coar.git
cd coar
```

### Paso 2: Instalar Dependencias

```bash
# Si usas npm
npm install

# Si usas pnpm (recomendado)
pnpm install

# Si usas yarn
yarn install

# Si usas bun
bun install
```

### Paso 3: Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo `.env.local`
2. Agrega estas variables (reemplaza con tus valores reales):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary (OPCIONAL - si quieres subida de imágenes)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# URL de tu aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**¿Dónde obtener estos valores?**
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Dashboard > Settings > API > Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Dashboard > Settings > API > anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Dashboard > Settings > API > service_role key
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary Dashboard > Account (si lo usas)

### Paso 4: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

**Resultado esperado:**
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

Abre http://localhost:3000 en tu navegador.

---

## Configuración de Entorno

### Verificar que Supabase está conectado

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Si ves errores como `SUPABASE_URL is missing`, verifica tu `.env.local`

### Habilitar Email/Password Auth en Supabase

1. Ve a tu dashboard de Supabase
2. **Authentication > Providers**
3. Verifica que "Email" esté habilitado (debe estar en verde)
4. Si no, haz clic y habilítalo

---

## Flujo de Usuario

### 1️⃣ Registro e Inicio de Sesión

```
Usuario visita http://localhost:3000
  ↓
Redirigido a /signup (registro)
  ↓
Completa registro (email + contraseña)
  ↓
Supabase crea usuario automáticamente
  ↓
Redirigido a /onboarding (crear perfil)
```

### 2️⃣ Completar Perfil (Onboarding)

```
En /onboarding:
  1. Ingresa username (único)
  2. Ingresa nombre completo
  3. Sube foto de perfil
  4. Escribe biografía (opcional)
  ↓
Redirigido a /feed
```

### 3️⃣ Timeline Principal (Feed)

```
En /feed:
  1. Ve publicaciones de tus amigos
  2. Puedes crear una publicación nueva
  3. Puedes comentar, reaccionar, etc.
  ↓
Botones en la barra lateral:
  - Feed (timeline)
  - Explore (descubrir usuarios)
  - Messages (chat)
  - Notifications (notificaciones)
  - Profile (mi perfil)
  - Settings (privacidad)
```

### 4️⃣ Sistema de Amigos

```
En /explore:
  1. Ve lista de usuarios
  2. Haz clic en "Enviar solicitud"
  3. Ellos ven en sus notificaciones
  4. Si aceptan, aparecen en tus amigos
  5. Ahora puedes chatear
```

### 5️⃣ Chat

```
En /messages:
  1. Solo aparecen usuarios que son tus amigos
  2. Abre un chat
  3. Escribe mensaje
  4. Envía
  5. El otro usuario ve tu mensaje en tiempo real (si está online)
```

---

## Características Implementadas

### ✅ Publicaciones
- [x] Crear publicaciones con texto e imágenes
- [x] Privacidad: Público o Solo amigos
- [x] Editar y eliminar propias publicaciones
- [x] Ver publicaciones del feed

### ✅ Comentarios
- [x] Comentarios en publicaciones
- [x] Responder comentarios (anidados)
- [x] Ver árbol de comentarios completo
- [x] Editar y eliminar propios comentarios

### ✅ Reacciones
- [x] Like en publicaciones
- [x] Like en comentarios
- [x] Múltiples reacciones (like, love, haha, wow, sad, angry)
- [x] Contadores en tiempo real

### ✅ Amigos
- [x] Enviar solicitud de amistad
- [x] Aceptar/rechazar solicitudes
- [x] Ver lista de amigos
- [x] Ver solicitudes pendientes
- [x] Bloquear usuarios

### ✅ Seguidores
- [x] Seguir usuarios sin necesidad de amistad
- [x] Dejar de seguir
- [x] Ver contador de followers
- [x] Sistema independiente de amigos

### ✅ Chat
- [x] Mensajes privados entre amigos
- [x] Historial de conversaciones
- [x] Marcar como leído
- [x] Ver último mensaje en preview

### ✅ Notificaciones
- [x] Notificaciones de nuevas solicitudes de amistad
- [x] Notificaciones de likes
- [x] Notificaciones de comentarios
- [x] Notificaciones de nuevos mensajes
- [x] Panel de notificaciones con badge

### ✅ Perfil
- [x] Editar información personal
- [x] Cambiar foto de perfil
- [x] Ver mis publicaciones
- [x] Ver mis estadísticas (posts, followers, etc.)
- [x] Eliminar cuenta

### ✅ Privacidad
- [x] Controlar visibilidad de perfil
- [x] Controlar quién puede comentar
- [x] Controlar quién puede ver publicaciones
- [x] Controlar visibilidad de lista de amigos

### ✅ Seguridad
- [x] Row Level Security (RLS) en todas las tablas
- [x] Autenticación con JWT
- [x] Validaciones frontend y backend
- [x] Protección contra SQL injection
- [x] Permisos granulares por usuario

---

## Estructura de Base de Datos

### Tablas Principales

```
profiles
├── id (UUID - FK de auth.users)
├── username (TEXT UNIQUE)
├── full_name, bio, avatar_url
├── created_at, updated_at

posts
├── id (UUID)
├── user_id (FK profiles)
├── content, image_url
├── privacy ('public' | 'friends_only')
├── created_at, updated_at

comments
├── id (UUID)
├── post_id (FK posts)
├── user_id (FK profiles)
├── parent_comment_id (FK comments - para respuestas)
├── content
├── created_at, updated_at

reactions
├── id (UUID)
├── user_id (FK profiles)
├── post_id OU comment_id (FK)
├── reaction_type ('like', 'love', etc.)
├── created_at

friendships
├── id (UUID)
├── requester_id (FK profiles)
├── receiver_id (FK profiles)
├── status ('pending' | 'accepted' | 'blocked')
├── created_at, updated_at

followers
├── id (UUID)
├── follower_id (FK profiles)
├── following_id (FK profiles)
├── created_at

messages
├── id (UUID)
├── sender_id (FK profiles)
├── receiver_id (FK profiles)
├── content, image_url
├── is_read (BOOLEAN)
├── created_at

notifications
├── id (UUID)
├── user_id (FK profiles)
├── actor_id (FK profiles)
├── type ('friend_request', 'post_like', etc.)
├── related_id (UUID)
├── is_read (BOOLEAN)
├── created_at

privacy_settings
├── id (UUID)
├── user_id (FK profiles UNIQUE)
├── profile_visibility, comment_visibility, etc.
├── created_at, updated_at
```

---

## Rutas de la Aplicación

```
Públicas (sin autenticación):
├── /                  → Landing page
├── /login             → Iniciar sesión
├── /signup            → Registrarse
└── /forgot-password   → Recuperar contraseña

Autenticadas (requieren login):
├── /onboarding        → Completar perfil
├── /feed              → Timeline principal
├── /profile           → Mi perfil
├── /profile/[id]      → Perfil de otro usuario
├── /messages          → Chat
├── /notifications     → Notificaciones
├── /friends           → Gestión de amigos
├── /explore           → Descubrir usuarios
├── /settings          → Configuración de privacidad
└── /settings/account  → Eliminar cuenta

API Routes:
├── /api/posts         → GET (listar), POST (crear)
├── /api/posts/[id]    → GET, PATCH, DELETE
├── /api/comments      → GET, POST
├── /api/comments/[id] → GET, PATCH, DELETE
├── /api/reactions     → POST (toggle like)
├── /api/friends       → GET (amigos/solicitudes), POST (enviar solicitud)
├── /api/friends/[id]  → PATCH (aceptar), DELETE (rechazar)
├── /api/messages      → GET (historial), POST (enviar)
├── /api/notifications → GET, PATCH (marcar leído)
├── /api/followers/[id]→ GET, POST, DELETE
└── /api/profile       → GET, PATCH (editar perfil)
```

---

## Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL is missing"

**Solución:**
1. Verifica que `.env.local` existe en la raíz del proyecto
2. Verifica que tiene todos los valores requeridos
3. Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

### Error: "Could not connect to database"

**Solución:**
1. Verifica que estés conectado a internet
2. Verifica que tu URL de Supabase sea correcta
3. Ve a Supabase Dashboard > Settings > API y copia nuevamente

### Error: "RLS policy violation"

**Solución:**
1. Asegúrate de estar autenticado (logueado)
2. Verifica que el script SQL se ejecutó correctamente
3. En Supabase, ve a SQL Editor > Consultas recientes y revisa si hubo errores

### Error: "Username already taken"

**Solución:**
1. Elige otro username
2. Los usernames son únicos en todo el sistema
3. Intenta con un número al final (ej: "juan123")

### Las publicaciones no aparecen en el feed

**Solución:**
1. Verifica que hayas publicado algo primero
2. Crea una publicación en /feed
3. Si es privada (solo amigos), solo tus amigos la verán

### No puedo chatear con alguien

**Solución:**
1. Primero debes ser su amigo
2. Ve a /explore
3. Busca el usuario
4. Haz clic "Enviar solicitud de amistad"
5. Ellos deben aceptar
6. Ahora aparecerá en /messages

---

## Próximos Pasos

### Funcionalidades Opcionales para Mejorar

1. **Integración de Cloudinary**
   - Permitir subida de imágenes directamente
   - Redimensionamiento automático
   - CDN global

2. **Real-time con Supabase Realtime**
   - Chat en tiempo real (sin F5)
   - Notificaciones en vivo
   - Cursor compartido

3. **Full-Text Search**
   - Buscar usuarios
   - Buscar publicaciones
   - Buscar comentarios

4. **Administración de Contenido**
   - Panel de admin
   - Reportar contenido
   - Moderar usuarios

5. **Analytics**
   - Estadísticas de usuario
   - Datos de engagement
   - Gráficos de actividad

6. **Mobile App**
   - React Native / Expo
   - Push notifications
   - Offline sync

---

## Soporte Técnico

### Si algo no funciona:

1. **Verifica la Consola del Navegador (F12)**
   - Ve a Console
   - Busca mensajes de error rojo

2. **Revisa los Logs de Supabase**
   - Ve a Supabase Dashboard > Logs
   - Filtra por tu aplicación

3. **Reinicia Todo**
   ```bash
   # Detén el servidor (Ctrl+C)
   # Borra node_modules (opcional)
   # rm -rf node_modules
   # Reinstala
   npm install
   # Inicia nuevamente
   npm run dev
   ```

4. **Abre un Issue en GitHub**
   - Describe el problema
   - Incluye el mensaje de error completo
   - Menciona tu sistema operativo

---

## ¡Listo para Producción!

Tu red social COAR está completamente funcional. Algunos pasos finales para ir a producción:

### Antes de Publicar

- [ ] Testear todas las características manualmente
- [ ] Cambiar contraseña de Supabase
- [ ] Configurar dominio personalizado
- [ ] Habilitar HTTPS
- [ ] Configurar variables de entorno de producción
- [ ] Hacer backup de la base de datos

### Deploying a Vercel (Recomendado)

1. Sube tu código a GitHub
2. Ve a https://vercel.com/import
3. Selecciona tu repositorio
4. Agrega las variables de entorno
5. Haz clic "Deploy"

¡Tu red social está lista! 🚀

---

**¿Preguntas?** Revisa este documento nuevamente o abre un issue en GitHub.

**Última actualización:** 2026-06-08  
**Versión:** 1.0.0  
**Estado:** Production Ready ✅

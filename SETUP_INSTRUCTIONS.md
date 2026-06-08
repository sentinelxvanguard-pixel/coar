# COAR - Red Social Moderna - Instrucciones de Configuración

## Estado actual

✅ **Autenticación**: Completamente funcional (email/password + Google OAuth)
✅ **Base de datos**: Schema relacional con RLS implementado
✅ **API Routes**: 15+ endpoints CRUD para todas las entidades
✅ **Componentes UI**: PostCard, PostComposer, CommentThread, ProfileHeader, etc.
✅ **Páginas**: Feed, Perfil, Mensajes, Notificaciones, Amigos, Explorar, Configuración
✅ **Chat**: Sistema de mensajes entre amigos
✅ **Notificaciones**: Panel de notificaciones con badge contador
✅ **Privacidad**: Sistema de configuración de privacidad por usuario

## Pasos finales de configuración

### 1. Ejecutar el script SQL en Supabase

1. Ve a tu dashboard de Supabase
2. Abre **SQL Editor**
3. Copia y ejecuta el contenido de `/SETUP_SOCIAL_FEATURES.sql`

Este script crea todas las tablas necesarias con RLS habilitado:
- `posts` - Publicaciones
- `comments` - Comentarios anidados
- `reactions` - Likes/emojis
- `friendships` - Sistema de amigos
- `followers` - Seguidores
- `messages` - Chat entre amigos
- `notifications` - Notificaciones
- `privacy_settings` - Configuración de privacidad

### 2. Instalar dependencias (si aún no lo hiciste)

```bash
npm install
```

### 3. Configurar variables de entorno

Asegúrate de que tu `.env.local` contenga:

```
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Ejecutar dev server

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## Flujos funcionales completos

### 🎯 Crear una publicación
1. Haz login/signup
2. Completa el onboarding
3. En el feed, usa el **PostComposer** para escribir contenido
4. Selecciona privacidad (Público o Solo amigos)
5. Opcionalmente sube una imagen
6. Clic "Publicar"

### 💬 Comentar y responder
1. En una publicación, haz clic en "Comentar"
2. Se abre el hilo de comentarios
3. Escribe tu comentario en el input inferior
4. Para responder a otro comentario, haz clic en "Responder"
5. Los comentarios se guardan automáticamente

### ❤️ Dar like/reaccionar
1. Haz clic en el icono de corazón en un post o comentario
2. Automáticamente se crea/elimina la reacción (toggle)
3. El contador se actualiza en tiempo real

### 👥 Sistema de amigos
1. Ve a **Explorar** para ver otros usuarios
2. Haz clic "Agregar amigo" para enviar solicitud
3. El usuario recibe notificación
4. Puede aceptar/rechazar en **Amigos > Solicitudes**
5. Una vez amigos, pueden chatear

### 💬 Chatear
1. Ve a **Mensajes**
2. Selecciona un amigo de la lista
3. Escribe y envía mensajes en tiempo real
4. Los mensajes se marcan como leído automáticamente

### 🔔 Notificaciones
1. Haz clic en la campana (esquina superior derecha)
2. Ve todas tus notificaciones
3. Tipos: solicitud amistad, likes, comentarios, mensajes
4. Haz clic para marcar como leído
5. Elimina notificaciones con X

### 🔐 Privacidad
1. Ve a **Configuración**
2. Ajusta:
   - **Visibilidad del perfil**: Público, Solo amigos, Privado
   - **Quién puede ver publicaciones**: Todos, Solo amigos
   - **Quién puede comentar**: Todos, Solo amigos, Nadie
   - **Visibilidad de amigos**: Todos, Solo amigos, Nadie

### 👤 Editar perfil
1. Ve a **Mi Perfil**
2. Haz clic "Editar perfil"
3. Actualiza nombre, bio, avatar, etc.
4. Los cambios se guardan automáticamente

## Estructura de carpetas

```
app/
├── (authenticated)/          # Grupo de rutas autenticadas
│   ├── layout.tsx           # Sidebar + navbar
│   ├── feed/page.tsx        # Feed principal
│   ├── profile/page.tsx     # Mi perfil
│   ├── messages/page.tsx    # Chat
│   ├── notifications/page.tsx
│   ├── friends/page.tsx
│   ├── explore/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── posts/
│   ├── comments/
│   ├── reactions/
│   ├── friends/
│   ├── messages/
│   ├── notifications/
│   └── followers/
├── auth/                    # Auth existente
├── login/
├── signup/
└── onboarding/

components/
├── posts/
│   ├── PostCard.tsx
│   ├── PostComposer.tsx
│   └── CommentThread.tsx
├── profile/
│   └── ProfileHeader.tsx
├── notifications/
│   └── NotificationBell.tsx
└── ui/                      # shadcn components

lib/
├── auth.ts                  # Server actions auth
├── types.ts                 # TypeScript interfaces
├── utils.ts                 # Utilidades (formatTimeAgo, etc)
├── supabase-client.ts       # Cliente Supabase con helpers
└── supabase/
    ├── client.ts
    └── server.ts
```

## Características implementadas

### Base de datos
- [x] 7 nuevas tablas con RLS
- [x] Índices para performance
- [x] Triggers para updated_at automático
- [x] Políticas de seguridad por tabla

### API
- [x] POST /api/posts - Crear publicación
- [x] GET /api/posts - Feed con paginación
- [x] PUT/DELETE /api/posts/[id] - Editar/eliminar
- [x] POST /api/comments - Comentarios anidados
- [x] PUT/DELETE /api/comments/[id]
- [x] POST /api/reactions - Likes/emojis
- [x] POST /api/friends - Solicitudes de amistad
- [x] PUT /api/friends/[id] - Aceptar/rechazar
- [x] POST /api/messages - Enviar mensaje
- [x] GET /api/messages - Cargar chat
- [x] GET/PUT /api/notifications
- [x] POST /api/followers/[id] - Seguir/dejar de seguir

### Componentes
- [x] PostCard con acciones
- [x] PostComposer con imagen
- [x] CommentThread anidado
- [x] ProfileHeader con stats
- [x] NotificationBell con panel
- [x] ChatWindow con scroll automático
- [x] FriendCard con acciones

### Páginas
- [x] /feed - Feed principal con posts
- [x] /profile - Perfil propio
- [x] /messages - Chat con amigos
- [x] /notifications - Panel notificaciones
- [x] /friends - Gestión de amigos
- [x] /explore - Descubrir personas
- [x] /settings - Privacidad y cuenta

## Próximas mejoras opcionales

1. **Cloudinary**: Implementar carga de imágenes a Cloudinary
   - Actualmente soporta URLs locales/externas
   - Agregar upload widget para imágenes

2. **Real-time**: Integrar Realtime de Supabase
   - Chat en tiempo real
   - Notificaciones push
   - Actualización automática de posts

3. **Búsqueda**: Implementar búsqueda de usuarios/posts
   - Full-text search en Supabase
   - Autocomplete de usuarios

4. **Paginación**: Mejorar carga de posts
   - Infinite scroll
   - Load more button

5. **Editar perfil modal**: Modal completo para editar perfil
   - Upload de avatar
   - Validaciones

6. **Tests**: Tests E2E y unitarios
   - Cypress o Playwright
   - Jest para funciones

## Troubleshooting

### Error de autenticación
- Verifica que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY están en .env.local
- Comprueba que el usuario está autenticado: `await getCurrentUserAction()`

### Posts no aparecen
- Verifica RLS: Va a Supabase > Policies y confirma que las políticas están activas
- Chequea que el usuario completó onboarding

### No recibo notificaciones
- Las notificaciones se crean en backend al reaccionar/comentar
- Carga notificaciones con GET /api/notifications

### El chat no funciona
- Verifica que son amigos: status='accepted' en friendships
- Los mensajes solo se envían entre amigos

## Contacto & Soporte

Para soporte o reportar bugs, abre un issue en el repositorio.

¡Disfruta usando COAR! 🚀

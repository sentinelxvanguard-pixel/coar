# COAR Social Network - API Reference

**Versión:** 1.0.0  
**Base URL:** `http://localhost:3000/api` (desarrollo) o tu dominio en producción

---

## 📌 Autenticación

Todos los endpoints requieren autenticación con Supabase JWT. El token se envía automáticamente via cookies.

**Headers requeridos:**
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

---

## 📝 POSTS (Publicaciones)

### Crear Publicación
```
POST /api/posts
Content-Type: application/json

{
  "content": "Mi primer post en COAR!",
  "image_url": "https://example.com/image.jpg",
  "privacy": "public"  // "public" o "friends_only"
}

Response (201):
{
  "id": "uuid",
  "user_id": "uuid",
  "content": "Mi primer post en COAR!",
  "image_url": "https://example.com/image.jpg",
  "privacy": "public",
  "created_at": "2026-06-08T10:30:00Z",
  "updated_at": "2026-06-08T10:30:00Z"
}
```

### Listar Posts (Feed)
```
GET /api/posts?page=1&limit=10&type=feed

Response (200):
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "content": "Post content",
    "image_url": "url",
    "privacy": "public",
    "created_at": "2026-06-08T10:30:00Z",
    "user": {
      "id": "uuid",
      "username": "juan",
      "full_name": "Juan Pérez",
      "avatar_url": "url"
    },
    "comments_count": 5,
    "reactions_count": 12,
    "user_reaction": "like"  // null si no has reaccionado
  },
  ...
]
```

### Obtener Post Individual
```
GET /api/posts/{id}

Response (200):
{
  "id": "uuid",
  "user_id": "uuid",
  "content": "Post content",
  "image_url": "url",
  "privacy": "public",
  "created_at": "2026-06-08T10:30:00Z",
  "user": {...},
  "comments": [
    {
      "id": "uuid",
      "content": "Comment",
      "user": {...},
      "reactions_count": 2
    },
    ...
  ]
}
```

### Actualizar Post
```
PATCH /api/posts/{id}
Content-Type: application/json

{
  "content": "Contenido actualizado",
  "privacy": "friends_only"
}

Response (200): Updated post object
```

### Eliminar Post
```
DELETE /api/posts/{id}

Response (200): { "success": true }
```

---

## 💬 COMMENTS (Comentarios)

### Crear Comentario
```
POST /api/comments
Content-Type: application/json

{
  "post_id": "uuid",
  "parent_comment_id": null,  // null si es comentario principal
  "content": "Excelente post!"
}

Response (201):
{
  "id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid",
  "parent_comment_id": null,
  "content": "Excelente post!",
  "created_at": "2026-06-08T10:30:00Z",
  "user": {
    "id": "uuid",
    "username": "maria",
    "full_name": "María García",
    "avatar_url": "url"
  }
}
```

### Listar Comentarios de un Post
```
GET /api/comments?post_id={post_id}&include_replies=true

Response (200):
[
  {
    "id": "uuid",
    "content": "Comentario principal",
    "user": {...},
    "replies": [
      {
        "id": "uuid",
        "content": "Respuesta al comentario",
        "user": {...}
      },
      ...
    ]
  },
  ...
]
```

### Actualizar Comentario
```
PATCH /api/comments/{id}
Content-Type: application/json

{
  "content": "Comentario actualizado"
}

Response (200): Updated comment object
```

### Eliminar Comentario
```
DELETE /api/comments/{id}

Response (200): { "success": true }
```

---

## 👍 REACTIONS (Likes/Emojis)

### Toggle Reacción en Post
```
POST /api/reactions
Content-Type: application/json

{
  "post_id": "uuid",
  "comment_id": null,
  "reaction_type": "like"  // like, love, haha, wow, sad, angry
}

Response (200):
{
  "id": "uuid",
  "reaction_type": "like",
  "created": true  // true si se creó, false si se eliminó
}
```

### Toggle Reacción en Comentario
```
POST /api/reactions
Content-Type: application/json

{
  "post_id": null,
  "comment_id": "uuid",
  "reaction_type": "love"
}

Response (200): { "id": "uuid", "reaction_type": "love", "created": true }
```

### Listar Reacciones
```
GET /api/reactions?post_id={post_id}

Response (200):
{
  "like": 45,
  "love": 12,
  "haha": 5,
  "wow": 3,
  "sad": 1,
  "angry": 0,
  "details": [
    {
      "reaction_type": "like",
      "users": ["usuario1", "usuario2", ...]
    }
  ]
}
```

---

## 👥 FRIENDSHIPS (Amigos)

### Enviar Solicitud de Amistad
```
POST /api/friends
Content-Type: application/json

{
  "receiver_id": "uuid"
}

Response (201):
{
  "id": "uuid",
  "requester_id": "uuid",
  "receiver_id": "uuid",
  "status": "pending",
  "created_at": "2026-06-08T10:30:00Z"
}
```

### Listar Amigos
```
GET /api/friends?status=accepted&page=1&limit=20

Response (200):
[
  {
    "id": "uuid",
    "requester_id": "uuid",
    "receiver_id": "uuid",
    "status": "accepted",
    "friend": {
      "id": "uuid",
      "username": "juan",
      "full_name": "Juan Pérez",
      "avatar_url": "url"
    }
  },
  ...
]
```

### Listar Solicitudes Pendientes
```
GET /api/friends?status=pending&type=incoming

Response (200):
[
  {
    "id": "uuid",
    "requester_id": "uuid",
    "requester": {
      "id": "uuid",
      "username": "maria",
      "full_name": "María García",
      "avatar_url": "url"
    },
    "status": "pending"
  },
  ...
]
```

### Aceptar Solicitud de Amistad
```
PATCH /api/friends/{friendship_id}
Content-Type: application/json

{
  "status": "accepted"
}

Response (200): Updated friendship object
```

### Rechazar Solicitud
```
DELETE /api/friends/{friendship_id}

Response (200): { "success": true }
```

### Eliminar Amigo
```
DELETE /api/friends/{friendship_id}

Response (200): { "success": true }
```

---

## 👤 FOLLOWERS (Seguidores)

### Seguir Usuario
```
POST /api/followers/{user_id}

Response (201):
{
  "id": "uuid",
  "follower_id": "uuid",
  "following_id": "{user_id}",
  "created_at": "2026-06-08T10:30:00Z"
}
```

### Dejar de Seguir
```
DELETE /api/followers/{user_id}

Response (200): { "success": true }
```

### Listar Followers de un Usuario
```
GET /api/followers/{user_id}?type=followers&page=1&limit=20

Response (200):
[
  {
    "follower_id": "uuid",
    "follower": {
      "id": "uuid",
      "username": "juan",
      "full_name": "Juan Pérez",
      "avatar_url": "url"
    }
  },
  ...
]
```

### Listar Following de un Usuario
```
GET /api/followers/{user_id}?type=following&page=1&limit=20

Response (200):
[
  {
    "following_id": "uuid",
    "following": {
      "id": "uuid",
      "username": "maria",
      "full_name": "María García",
      "avatar_url": "url"
    }
  },
  ...
]
```

---

## 💬 MESSAGES (Chat)

### Enviar Mensaje
```
POST /api/messages
Content-Type: application/json

{
  "receiver_id": "uuid",
  "content": "Hola, ¿cómo estás?",
  "image_url": null
}

Response (201):
{
  "id": "uuid",
  "sender_id": "uuid",
  "receiver_id": "uuid",
  "content": "Hola, ¿cómo estás?",
  "image_url": null,
  "is_read": false,
  "created_at": "2026-06-08T10:30:00Z"
}
```

### Obtener Conversación
```
GET /api/messages?conversation_id={user_id}&page=1&limit=50

Response (200):
[
  {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "content": "Mensaje",
    "is_read": true,
    "created_at": "2026-06-08T10:30:00Z",
    "sender": {
      "id": "uuid",
      "username": "juan",
      "avatar_url": "url"
    }
  },
  ...
]
```

### Marcar Mensaje como Leído
```
PATCH /api/messages/{message_id}
Content-Type: application/json

{
  "is_read": true
}

Response (200): Updated message object
```

### Listar Conversaciones
```
GET /api/messages?type=conversations&page=1&limit=20

Response (200):
[
  {
    "user_id": "uuid",
    "user": {
      "id": "uuid",
      "username": "juan",
      "full_name": "Juan Pérez",
      "avatar_url": "url"
    },
    "last_message": "Último mensaje...",
    "last_message_time": "2026-06-08T10:30:00Z",
    "unread_count": 3
  },
  ...
]
```

---

## 🔔 NOTIFICATIONS (Notificaciones)

### Listar Notificaciones
```
GET /api/notifications?page=1&limit=20&unread_only=false

Response (200):
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "actor_id": "uuid",
    "actor": {
      "id": "uuid",
      "username": "juan",
      "full_name": "Juan Pérez",
      "avatar_url": "url"
    },
    "type": "friend_request",  // friend_request, post_like, comment, etc.
    "related_id": "uuid",
    "is_read": false,
    "created_at": "2026-06-08T10:30:00Z"
  },
  ...
]
```

### Marcar Notificación como Leída
```
PATCH /api/notifications/{notification_id}
Content-Type: application/json

{
  "is_read": true
}

Response (200): Updated notification object
```

### Eliminar Notificación
```
DELETE /api/notifications/{notification_id}

Response (200): { "success": true }
```

### Marcar Todas como Leídas
```
PATCH /api/notifications/batch/read-all
Content-Type: application/json

{
  "read_all": true
}

Response (200): { "updated": 15 }
```

---

## 👤 PROFILE (Perfil)

### Obtener Mi Perfil
```
GET /api/profile

Response (200):
{
  "id": "uuid",
  "username": "juan",
  "full_name": "Juan Pérez",
  "bio": "Desarrollador full-stack",
  "avatar_url": "url",
  "birth_date": "1990-01-15",
  "gender": "masculino",
  "verified": false,
  "created_at": "2026-06-08T10:30:00Z",
  "updated_at": "2026-06-08T10:30:00Z",
  "stats": {
    "posts_count": 25,
    "followers_count": 150,
    "following_count": 87,
    "friends_count": 45
  }
}
```

### Obtener Perfil de Otro Usuario
```
GET /api/profile?user_id={user_id}

Response (200): Same structure as above
```

### Actualizar Perfil
```
PATCH /api/profile
Content-Type: application/json

{
  "full_name": "Juan Carlos Pérez",
  "bio": "Desarrollador full-stack | Open source",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "birth_date": "1990-01-15",
  "gender": "masculino"
}

Response (200): Updated profile object
```

### Eliminar Perfil
```
DELETE /api/profile

Response (200): { "success": true }
```

---

## 🔐 PRIVACY SETTINGS (Privacidad)

### Obtener Configuración de Privacidad
```
GET /api/privacy-settings

Response (200):
{
  "id": "uuid",
  "user_id": "uuid",
  "profile_visibility": "public",  // public, friends_only, private
  "comment_visibility": "everyone",  // everyone, friends_only, none
  "post_visibility": "everyone",  // everyone, friends_only
  "friends_visibility": "friends_only",  // everyone, friends_only, nobody
  "created_at": "2026-06-08T10:30:00Z",
  "updated_at": "2026-06-08T10:30:00Z"
}
```

### Actualizar Configuración de Privacidad
```
PATCH /api/privacy-settings
Content-Type: application/json

{
  "profile_visibility": "friends_only",
  "comment_visibility": "friends_only",
  "post_visibility": "friends_only",
  "friends_visibility": "nobody"
}

Response (200): Updated privacy settings object
```

---

## Status Codes

| Código | Significado |
|--------|------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Eliminado correctamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - No autorizado |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Recurso ya existe |
| 500 | Server Error - Error del servidor |

---

## Ejemplos de Uso

### Con JavaScript/Fetch
```javascript
// Crear un post
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Mi primer post en COAR!',
    image_url: null,
    privacy: 'public'
  })
});

const post = await response.json();
console.log(post);
```

### Con SWR
```javascript
import useSWR from 'swr';

function Feed() {
  const { data: posts, isLoading } = useSWR('/api/posts', fetch);
  
  if (isLoading) return <div>Cargando...</div>;
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.content}</div>
      ))}
    </div>
  );
}
```

### Con React Query
```javascript
import { useQuery } from '@tanstack/react-query';

function Feed() {
  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(r => r.json())
  });
  
  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.content}</div>
      ))}
    </div>
  );
}
```

---

**Última actualización:** 2026-06-08  
**Versión:** 1.0.0

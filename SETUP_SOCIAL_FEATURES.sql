-- ============================================================================
-- COAR Social Network - Extended Features Setup Script
-- Ejecuta este script en Supabase > SQL Editor después de SETUP_DATABASE.sql
-- 
-- Este script configura las tablas para:
-- ✅ Publicaciones (posts)
-- ✅ Comentarios (comments)
-- ✅ Reacciones (reactions - likes/emojis)
-- ✅ Amigos/Solicitudes (friendships)
-- ✅ Seguidores (followers)
-- ✅ Mensajes (messages)
-- ✅ Notificaciones (notifications)
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE PUBLICACIONES (POSTS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT, -- URL de Cloudinary
  privacy VARCHAR(20) DEFAULT 'public', -- 'public' o 'friends_only'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_privacy ON public.posts(privacy);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Todos pueden VER posts públicos
CREATE POLICY IF NOT EXISTS "Posts are viewable based on privacy"
ON public.posts
FOR SELECT
USING (
  privacy = 'public'
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (requester_id = auth.uid() AND receiver_id = user_id AND status = 'accepted')
    OR (requester_id = user_id AND receiver_id = auth.uid() AND status = 'accepted')
  )
);

-- Solo el autor puede INSERTAR
CREATE POLICY IF NOT EXISTS "Users can insert their own posts"
ON public.posts
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Solo el autor puede ACTUALIZAR
CREATE POLICY IF NOT EXISTS "Users can update their own posts"
ON public.posts
FOR UPDATE
USING (user_id = auth.uid());

-- Solo el autor puede ELIMINAR
CREATE POLICY IF NOT EXISTS "Users can delete their own posts"
ON public.posts
FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- 2. TABLA DE COMENTARIOS (COMMENTS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Ver comentarios si puedo ver el post
CREATE POLICY IF NOT EXISTS "Comments are viewable if post is viewable"
ON public.comments
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND 
    (privacy = 'public' OR user_id = auth.uid() OR
     EXISTS (SELECT 1 FROM public.friendships
       WHERE (requester_id = auth.uid() AND receiver_id = posts.user_id AND status = 'accepted')
       OR (requester_id = posts.user_id AND receiver_id = auth.uid() AND status = 'accepted')))
  )
);

CREATE POLICY IF NOT EXISTS "Users can insert comments"
ON public.comments
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update their own comments"
ON public.comments
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete their own comments"
ON public.comments
FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- 3. TABLA DE REACCIONES (REACTIONS - LIKES/EMOJIS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) DEFAULT 'like', -- 'like', 'love', 'haha', 'wow', 'sad', 'angry'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, post_id, comment_id, reaction_type),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_comment_id ON public.reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Reactions are viewable"
ON public.reactions
FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert reactions"
ON public.reactions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete their own reactions"
ON public.reactions
FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- 4. TABLA DE AMIGOS/SOLICITUDES (FRIENDSHIPS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver_id ON public.friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Ver amigos propios
CREATE POLICY IF NOT EXISTS "Users can view their own friendships"
ON public.friendships
FOR SELECT
USING (requester_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can insert friendship requests"
ON public.friendships
FOR INSERT
WITH CHECK (requester_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update friendship status"
ON public.friendships
FOR UPDATE
USING (requester_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete friendships"
ON public.friendships
FOR DELETE
USING (requester_id = auth.uid() OR receiver_id = auth.uid());

-- ============================================================================
-- 5. TABLA DE SEGUIDORES (FOLLOWERS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON public.followers(following_id);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Followers are viewable by everyone"
ON public.followers
FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Users can follow others"
ON public.followers
FOR INSERT
WITH CHECK (follower_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can unfollow others"
ON public.followers
FOR DELETE
USING (follower_id = auth.uid());

-- ============================================================================
-- 6. TABLA DE MENSAJES (MESSAGES/CHAT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Ver solo mensajes propios
CREATE POLICY IF NOT EXISTS "Users can view their messages"
ON public.messages
FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update read status"
ON public.messages
FOR UPDATE
USING (receiver_id = auth.uid());

-- ============================================================================
-- 7. TABLA DE NOTIFICACIONES (NOTIFICATIONS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'friend_request', 'post_like', 'comment', 'message', 'comment_reply', 'post_share'
  related_id UUID, -- ID del post, comentario, etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Ver solo notificaciones propias
CREATE POLICY IF NOT EXISTS "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update notification read status"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete their notifications"
ON public.notifications
FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- 8. TABLA DE PRIVACIDAD (PRIVACY_SETTINGS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'friends_only', 'private'
  comment_visibility VARCHAR(20) DEFAULT 'everyone', -- 'everyone', 'friends_only', 'none'
  post_visibility VARCHAR(20) DEFAULT 'everyone', -- 'everyone', 'friends_only'
  friends_visibility VARCHAR(20) DEFAULT 'friends_only', -- 'everyone', 'friends_only', 'nobody'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON public.privacy_settings(user_id);

ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own privacy settings"
ON public.privacy_settings
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can insert privacy settings"
ON public.privacy_settings
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update privacy settings"
ON public.privacy_settings
FOR UPDATE
USING (user_id = auth.uid());

-- ============================================================================
-- 9. FUNCIÓN PARA CREAR NOTIFICACIONES (TRIGGER)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type VARCHAR,
  p_related_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type, related_id)
  VALUES (p_user_id, p_actor_id, p_type, p_related_id);
END;
$$;

-- ============================================================================
-- 10. FUNCIÓN PARA AUTO-CREAR CONFIGURACIÓN DE PRIVACIDAD
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_privacy_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.privacy_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Trigger para crear privacy_settings automáticamente
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_privacy_settings();

-- ============================================================================
-- 11. PERMISOS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.comments TO authenticated;
GRANT ALL ON public.reactions TO authenticated;
GRANT ALL ON public.friendships TO authenticated;
GRANT ALL ON public.followers TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.privacy_settings TO authenticated;

GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.comments TO anon;
GRANT SELECT ON public.reactions TO anon;
GRANT SELECT ON public.followers TO anon;
GRANT SELECT ON public.profiles TO anon;

GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_privacy_settings TO authenticated;

-- ============================================================================
-- ¡LISTO!
-- ============================================================================
-- Tu base de datos está lista para todas las características de COAR
-- Próximos pasos:
-- 1. Ejecutar este script en Supabase > SQL Editor
-- 2. Crear las API routes en tu proyecto Next.js
-- 3. Crear los componentes React
-- 4. Configurar Cloudinary para subida de imágenes
-- ============================================================================

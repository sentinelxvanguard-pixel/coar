-- ============================================================================
-- COAR Social Network - Database Setup Script
-- Ejecuta este script en Supabase > SQL Editor
-- 
-- Este script configura:
-- ✅ Tabla profiles para datos de usuario
-- ✅ Row Level Security (RLS)
-- ✅ Trigger para auto-crear perfiles
-- ✅ Índices para performance
-- ============================================================================

-- ============================================================================
-- PASO 1: LIMPIAR (opcional - solo si necesitas resetear)
-- ============================================================================
-- Descomenta solo si quieres eliminar todo y empezar de cero
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================================
-- PASO 2: CREAR TABLA PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Llave primaria relacionada con auth.users
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos del perfil
  username TEXT UNIQUE NOT NULL,           -- Nombre de usuario único (obligatorio)
  full_name TEXT,                          -- Nombre completo del usuario
  bio TEXT DEFAULT '',                     -- Biografía del usuario
  avatar_url TEXT,                         -- URL de la foto de perfil
  
  -- Datos personales
  birth_date DATE,                         -- Fecha de nacimiento
  gender VARCHAR(50),                      -- Género (masculino, femenino, otro)
  
  -- Estado del usuario
  verified BOOLEAN DEFAULT FALSE,          -- ¿Email verificado?
  completed_onboarding BOOLEAN DEFAULT FALSE, -- ¿Completó onboarding?
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================================================
-- PASO 3: CREAR ÍNDICES (para consultas rápidas)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- ============================================================================
-- PASO 4: ACTIVAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 5: CREAR POLÍTICAS RLS
-- ============================================================================

-- POLÍTICA 1: Todos pueden VER todos los perfiles (datos públicos)
CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- POLÍTICA 2: Los usuarios pueden INSERTAR su propio perfil (solo via trigger)
CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id OR
  auth.role() = 'service_role'
);

-- POLÍTICA 3: Los usuarios pueden ACTUALIZAR su propio perfil
CREATE POLICY IF NOT EXISTS "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- POLÍTICA 4: Los usuarios pueden ELIMINAR su propio perfil
CREATE POLICY IF NOT EXISTS "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- ============================================================================
-- PASO 6: CREAR FUNCIÓN Y TRIGGER
-- ============================================================================
-- Esta función se ejecuta automáticamente cuando un usuario nuevo se registra
-- Crea automáticamente una fila en la tabla profiles

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insertar nuevo perfil para el usuario recién creado
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    completed_onboarding
  )
  VALUES (
    new.id,
    -- Usar username del metadata, o email como fallback
    COALESCE(new.raw_user_meta_data ->> 'username', new.email),
    -- Usar full_name del metadata, o vacío
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    -- Usar avatar_url del metadata
    COALESCE(new.raw_user_meta_data ->> 'avatar_url', null),
    -- El usuario no ha completado onboarding aún
    false
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PASO 7: PERMISOS PARA USUARIO ANON
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- ============================================================================
-- ¡LISTO! 
-- ============================================================================
-- Tu base de datos está configurada para COAR
--
-- Próximos pasos:
-- 1. Ir a Settings > Auth en Supabase Dashboard
-- 2. Configurar Google OAuth (Providers > Google)
-- 3. En tu .env.local:
--    NEXT_PUBLIC_SUPABASE_URL=tu-url
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
--    SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
-- 4. pnpm dev
--
-- ¡A construir COAR! 🚀
-- ============================================================================

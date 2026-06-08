-- ============================================================================
-- COAR Social Network - Database Schema
-- Using ONLY Supabase Auth (auth.users) for authentication
-- ============================================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================================
-- 1. PROFILES TABLE - Public user profile data
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  birth_date DATE,
  gender VARCHAR(50),
  verified BOOLEAN DEFAULT FALSE,
  completed_onboarding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view all profiles (public data)
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (TRUE);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own profile (via trigger)
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (
  auth.uid() = id OR
  auth.role() = 'service_role'
);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- ============================================================================
-- 3. TRIGGER - Auto-create profile on user signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = PUBLIC
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, completed_onboarding)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', new.email),
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'avatar_url', NULL),
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. FUTURE TABLES FOR SCALABILITY
-- ============================================================================
-- These tables are prepared for future features (posts, likes, follows, etc.)
-- Uncomment and customize as needed for your social network

-- POST TABLE (for future use)
-- CREATE TABLE IF NOT EXISTS public.posts (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   content TEXT NOT NULL,
--   image_url TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
-- );
-- ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (TRUE);
-- CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- FOLLOWS TABLE (for future use)
-- CREATE TABLE IF NOT EXISTS public.follows (
--   follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
--   PRIMARY KEY (follower_id, following_id),
--   CHECK (follower_id != following_id)
-- );
-- ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (TRUE);
-- CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
-- CREATE POLICY "Users can unfollow others" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- ============================================================================
-- 5. GRANTS FOR ANON USER
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

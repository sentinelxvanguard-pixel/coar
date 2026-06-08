'use server'

import { createClient } from '@/lib/supabase/server'


const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/\/+$/, '') ?? 'http://localhost:3000'
const callbackUrl = `${appUrl}/auth/callback`
const resetPasswordRedirect = `${appUrl}/auth/reset-password`

if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.warn(
    'NEXT_PUBLIC_APP_URL is not set. Using default http://localhost:3000 for Supabase callback redirects.',
  )
}

/**
 * Sign up with email and password using Supabase Auth
 * Automatically sends email confirmation link
 */
export async function signUpAction(email: string, password: string) {
  try {
    if (!email || !password) {
      return { error: 'Email and password are required' }
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
        data: {
          username: email.split('@')[0].toLowerCase(),
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return {
      success: true,
      data: {
        message: 'Check your email for the confirmation link',
      },
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : JSON.stringify(error)

    console.error('Sign up error:', message)
    return { error: message || 'An error occurred during sign up' }
  }
}

/**
 * Sign in with email and password using Supabase Auth
 */
export async function signInAction(email: string, password: string) {
  try {
    if (!email || !password) {
      return { error: 'Email and password are required' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      // Check if profile exists and onboarding is complete
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('completed_onboarding')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        return { error: profileError.message }
      }

      return {
        success: true,
        redirectTo: profile?.completed_onboarding ? '/home' : '/onboarding',
      }
    }

    return { error: 'Unable to sign in' }
  } catch (error) {
    console.error('Sign in error:', error)
    return { error: 'An error occurred during sign in' }
  }
}

/**
 * Sign in with Google using Supabase Auth
 */
export async function signInWithGoogleAction() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    return { success: true, redirectTo: data.url }
  }

  return { error: 'Failed to redirect to Google sign in' }
}

/**
 * Send a password reset email
 */
export async function resetPasswordAction(email: string, redirectTo?: string) {
  try {
    if (!email) {
      return { error: 'Email is required' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? resetPasswordRedirect,
    })

    if (error) {
      return { error: error.message }
    }

    return {
      success: true,
      message: 'Correo enviado. Revisa tu bandeja para resetear la contraseña.',
      data,
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : JSON.stringify(error)

    console.error('Reset password error:', message)
    return { error: message || 'An error occurred while sending reset email' }
  }
}

/**
 * Sign out the current user
 */
export async function signOutAction() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUserAction() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Update user profile during onboarding
 */
export async function updateProfileAction(
  userId: string,
  {
    username,
    full_name,
    birth_date,
    gender,
  }: {
    username: string
    full_name: string
    birth_date: string
    gender: string
  }
) {
  try {
    const supabase = await createClient()

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username,
        full_name,
        birth_date,
        gender,
        completed_onboarding: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) {
      return { error: profileError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to update profile' }
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Seguir usuario / dejar de seguir (toggle)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: followingId } = await params
    const supabase = await createClient()

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (followingId === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Verificar si ya está siguiendo
    const { data: existing } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single()

    if (existing) {
      // Dejar de seguir
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('id', existing.id)

      if (error) throw error

      return NextResponse.json({ message: 'Unfollowed', following: false }, { status: 200 })
    } else {
      // Seguir
      const { data: newFollower, error } = await supabase
        .from('followers')
        .insert([
          {
            follower_id: user.id,
            following_id: followingId,
          },
        ])
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ ...newFollower, following: true }, { status: 201 })
    }
  } catch (error) {
    console.error('Error updating follower status:', error)
    return NextResponse.json({ error: 'Failed to update follower status' }, { status: 500 })
  }
}

// GET - Verificar si estoy siguiendo a este usuario
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: followingId } = await params
    const supabase = await createClient()

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar si está siguiendo
    const { data: follower } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single()

    return NextResponse.json({ following: !!follower }, { status: 200 })
  } catch (error) {
    console.error('Error checking follower status:', error)
    return NextResponse.json({ error: 'Failed to check follower status' }, { status: 500 })
  }
}

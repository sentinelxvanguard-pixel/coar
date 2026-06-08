import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtener amigos o solicitudes pendientes
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const status = request.nextUrl.searchParams.get('status') || 'accepted'

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener amigos
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(
        `
        *,
        requester:requester_id(id, username, full_name, avatar_url),
        receiver:receiver_id(id, username, full_name, avatar_url)
        `
      )
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', status)

    if (error) throw error

    return NextResponse.json({ friendships }, { status: 200 })
  } catch (error) {
    console.error('Error fetching friendships:', error)
    return NextResponse.json({ error: 'Failed to fetch friendships' }, { status: 500 })
  }
}

// POST - Enviar solicitud de amistad
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiver_id } = body

    if (!receiver_id) {
      return NextResponse.json({ error: 'receiver_id is required' }, { status: 400 })
    }

    if (receiver_id === user.id) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })
    }

    // Verificar si ya existe solicitud
    const { data: existing, error: existingError } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(requester_id.eq.${user.id},receiver_id.eq.${receiver_id}),and(requester_id.eq.${receiver_id},receiver_id.eq.${user.id})`)
      .single()

    if (!existingError && existing) {
      return NextResponse.json({ error: 'Friendship request already exists' }, { status: 400 })
    }

    // Crear solicitud
    const { data: friendship, error } = await supabase
      .from('friendships')
      .insert([
        {
          requester_id: user.id,
          receiver_id,
          status: 'pending',
        },
      ])
      .select(
        `
        *,
        requester:requester_id(id, username, full_name, avatar_url),
        receiver:receiver_id(id, username, full_name, avatar_url)
        `
      )
      .single()

    if (error) throw error

    // Crear notificación
    await supabase
      .from('notifications')
      .insert([
        {
          user_id: receiver_id,
          actor_id: user.id,
          type: 'friend_request',
          related_id: friendship.id,
        },
      ])

    return NextResponse.json(friendship, { status: 201 })
  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
  }
}

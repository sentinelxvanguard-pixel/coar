import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PUT - Aceptar solicitud de amistad
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = body // 'accept' o 'reject'

    // Obtener friendship
    const { data: friendship } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', id)
      .single()

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })
    }

    // Verificar que es el receptor
    if (friendship.receiver_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (action === 'accept') {
      // Aceptar solicitud
      const { data: updated, error } = await supabase
        .from('friendships')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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
            user_id: friendship.requester_id,
            actor_id: user.id,
            type: 'friend_accepted',
            related_id: id,
          },
        ])

      return NextResponse.json(updated, { status: 200 })
    } else if (action === 'reject') {
      // Rechazar solicitud
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ message: 'Friend request rejected' }, { status: 200 })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating friendship:', error)
    return NextResponse.json({ error: 'Failed to update friendship' }, { status: 500 })
  }
}

// DELETE - Eliminar amigo
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener friendship
    const { data: friendship } = await supabase
      .from('friendships')
      .select('requester_id, receiver_id')
      .eq('id', id)
      .single()

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })
    }

    // Verificar que es uno de los amigos
    if (friendship.requester_id !== user.id && friendship.receiver_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Eliminar amistad
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Friendship deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting friendship:', error)
    return NextResponse.json({ error: 'Failed to delete friendship' }, { status: 500 })
  }
}

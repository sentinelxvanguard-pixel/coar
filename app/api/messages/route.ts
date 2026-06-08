import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtener mensajes con un usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const contactId = request.nextUrl.searchParams.get('contact_id')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '50')

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!contactId) {
      return NextResponse.json({ error: 'contact_id is required' }, { status: 400 })
    }

    // Obtener mensajes
    const { data: messages, error } = await supabase
      .from('messages')
      .select(
        `
        *,
        sender:sender_id(id, username, full_name, avatar_url),
        receiver:receiver_id(id, username, full_name, avatar_url)
        `
      )
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error

    // Marcar como leídos
    const { error: updateError } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', contactId)

    if (updateError) console.error('Error marking messages as read:', updateError)

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Enviar mensaje
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

    const { receiver_id, content, image_url } = body

    if (!receiver_id) {
      return NextResponse.json({ error: 'receiver_id is required' }, { status: 400 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (receiver_id === user.id) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 })
    }

    // Verificar que son amigos
    const { data: friendship } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(requester_id.eq.${user.id},receiver_id.eq.${receiver_id}),and(requester_id.eq.${receiver_id},receiver_id.eq.${user.id})`)
      .eq('status', 'accepted')
      .single()

    if (!friendship) {
      return NextResponse.json(
        { error: 'You can only message friends' },
        { status: 403 }
      )
    }

    // Crear mensaje
    const { data: message, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          receiver_id,
          content: content.trim(),
          image_url: image_url || null,
        },
      ])
      .select(
        `
        *,
        sender:sender_id(id, username, full_name, avatar_url),
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
          type: 'message',
          related_id: message.id,
        },
      ])

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

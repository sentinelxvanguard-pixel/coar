import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtener reacciones
export async function GET(request: NextRequest) {
  try {
    const postId = request.nextUrl.searchParams.get('post_id')
    const commentId = request.nextUrl.searchParams.get('comment_id')

    if (!postId && !commentId) {
      return NextResponse.json({ error: 'post_id or comment_id is required' }, { status: 400 })
    }

    const supabase = await createClient()

    let query = supabase
      .from('reactions')
      .select('*, user:user_id(id, username, avatar_url)')

    if (postId) {
      query = query.eq('post_id', postId)
    } else {
      query = query.eq('comment_id', commentId)
    }

    const { data: reactions, error } = await query

    if (error) throw error

    return NextResponse.json({ reactions }, { status: 200 })
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}

// POST - Crear o actualizar reacción
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

    const { post_id, comment_id, reaction_type = 'like' } = body

    if (!post_id && !comment_id) {
      return NextResponse.json({ error: 'post_id or comment_id is required' }, { status: 400 })
    }

    // Verificar si la reacción ya existe
    const query = supabase
      .from('reactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('reaction_type', reaction_type)

    if (post_id) {
      query.eq('post_id', post_id).is('comment_id', null)
    } else {
      query.eq('comment_id', comment_id).is('post_id', null)
    }

    const { data: existing } = await query.single()

    if (existing) {
      // Eliminar reacción existente (toggle)
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existing.id)

      if (error) throw error

      return NextResponse.json({ message: 'Reaction removed' }, { status: 200 })
    }

    // Crear nueva reacción
    const { data: reaction, error } = await supabase
      .from('reactions')
      .insert([
        {
          user_id: user.id,
          post_id: post_id || null,
          comment_id: comment_id || null,
          reaction_type,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Crear notificación
    if (post_id) {
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', post_id)
        .single()

      if (post && post.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: post.user_id,
              actor_id: user.id,
              type: 'post_like',
              related_id: post_id,
            },
          ])
      }
    } else if (comment_id) {
      const { data: comment } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', comment_id)
        .single()

      if (comment && comment.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: comment.user_id,
              actor_id: user.id,
              type: 'comment_like',
              related_id: comment_id,
            },
          ])
      }
    }

    return NextResponse.json(reaction, { status: 201 })
  } catch (error) {
    console.error('Error creating reaction:', error)
    return NextResponse.json({ error: 'Failed to create reaction' }, { status: 500 })
  }
}

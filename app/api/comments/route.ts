import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtener comentarios de un post
export async function GET(request: NextRequest) {
  try {
    const postId = request.nextUrl.searchParams.get('post_id')

    if (!postId) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: comments, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        user:user_id(id, username, full_name, avatar_url),
        reactions(count)
        `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ comments }, { status: 200 })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST - Crear comentario
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

    // Validar input
    const { post_id, content, parent_comment_id } = body

    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    // Crear comentario
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id,
          user_id: user.id,
          content: content.trim(),
          parent_comment_id: parent_comment_id || null,
        },
      ])
      .select(
        `
        *,
        user:user_id(id, username, full_name, avatar_url)
        `
      )
      .single()

    if (error) throw error

    // Crear notificación al autor del post
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
            type: 'comment',
            related_id: post_id,
          },
        ])
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

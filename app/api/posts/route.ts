import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtener feed de posts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const limit = 20
    const offset = parseInt(request.nextUrl.searchParams.get('offset') ?? '0')

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener posts visibles para el usuario
    const { data: posts, count, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        user:user_id(id, username, full_name, avatar_url),
        comments(count),
        reactions(count)
        `,
        { count: 'exact' }
      )
      .or(
        `privacy.eq.public,user_id.eq.${user.id},and(privacy.eq.friends_only,user_id.in(select receiver_id from friendships where requester_id='${user.id}' and status='accepted'),user_id.in(select requester_id from friendships where receiver_id='${user.id}' and status='accepted'))`
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json(
      {
        posts,
        total: count || 0,
        limit,
        offset,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST - Crear nuevo post
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
    const { content, image_url, privacy } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    // Crear post
    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: user.id,
          content: content.trim(),
          image_url: image_url || null,
          privacy: privacy || 'public',
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

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

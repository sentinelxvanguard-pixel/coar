import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtener feed de posts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const limit = 20
    const offset = parseInt(request.nextUrl.searchParams.get('offset') ?? '0')
    const tab = request.nextUrl.searchParams.get('tab') ?? 'for-you'

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('posts')
      .select(
        `
        *,
        user:user_id(id, username, full_name, avatar_url),
        _count:posts(count)
        `,
        { count: 'exact' }
      )

    // Aplicar filtros según tab
    if (tab === 'following') {
      // Posts de usuarios que sigo
      query = query.in(
        'user_id',
        supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', user.id)
      )
    } else if (tab === 'friends') {
      // Posts solo de amigos aceptados
      query = query.in(
        'user_id',
        supabase
          .from('friendships')
          .select('requester_id, receiver_id')
          .or(`and(requester_id.eq.${user.id},status.eq.accepted),and(receiver_id.eq.${user.id},status.eq.accepted)`)
      )
    } else if (tab === 'trending') {
      // Posts más populares (con más reacciones)
      query = query.order('reactions_count', { ascending: false })
    } else {
      // for-you: Mix de públicos y de amigos
      query = query.or(`privacy.eq.public,user_id.eq.${user.id}`)
    }

    const { data: posts, count, error } = await query
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

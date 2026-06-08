import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtener notificaciones
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '20')
    const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true'

    // Obtener usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('notifications')
      .select(
        `
        *,
        actor:actor_id(id, username, full_name, avatar_url)
        `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query

    if (error) throw error

    return NextResponse.json({ notifications }, { status: 200 })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

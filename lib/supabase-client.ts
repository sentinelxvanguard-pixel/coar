'use client'

import { createClient } from '@/lib/supabase/client'
import type { Post, Comment, Reaction, Friendship, Message, Notification, PrivacySettings } from '@/lib/types'

const supabase = createClient()

// ============================================================================
// POSTS
// ============================================================================

export async function createPost(userId: string, content: string, imageUrl: string | null, privacy: 'public' | 'friends_only' = 'public') {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        user_id: userId,
        content,
        image_url: imageUrl,
        privacy,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data as Post
}

export async function getPosts(userId: string, limit = 20, offset = 0) {
  const { data, error, count } = await supabase
    .from('posts')
    .select(
      `
      *,
      user:profiles(*),
      _count:comments(count),
      reactions(count)
      `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { posts: data as Post[], total: count || 0 }
}

export async function getPostById(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      user:profiles(*),
      comments(*),
      reactions(*)
      `
    )
    .eq('id', postId)
    .single()

  if (error) throw error
  return data as Post
}

export async function updatePost(postId: string, content: string) {
  const { data, error } = await supabase
    .from('posts')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select()
    .single()

  if (error) throw error
  return data as Post
}

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
}

// ============================================================================
// COMMENTS
// ============================================================================

export async function createComment(postId: string, userId: string, content: string, parentCommentId?: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        post_id: postId,
        user_id: userId,
        parent_comment_id: parentCommentId || null,
        content,
      },
    ])
    .select(
      `
      *,
      user:profiles(*)
      `
    )
    .single()

  if (error) throw error
  return data as Comment
}

export async function getCommentsByPost(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      *,
      user:profiles(*),
      reactions(count)
      `
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Comment[]
}

export async function updateComment(commentId: string, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .select()
    .single()

  if (error) throw error
  return data as Comment
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
}

// ============================================================================
// REACTIONS
// ============================================================================

export async function createReaction(userId: string, postId: string | null, commentId: string | null, reactionType = 'like') {
  const { data, error } = await supabase
    .from('reactions')
    .upsert([
      {
        user_id: userId,
        post_id: postId,
        comment_id: commentId,
        reaction_type: reactionType,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data as Reaction
}

export async function deleteReaction(userId: string, postId: string | null, commentId: string | null, reactionType = 'like') {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('user_id', userId)
    .eq('reaction_type', reactionType)
    .eq(postId ? 'post_id' : 'comment_id', postId || commentId)

  if (error) throw error
}

export async function getReactionCount(postId: string | null, commentId: string | null) {
  const query = supabase
    .from('reactions')
    .select('reaction_type', { count: 'exact' })

  if (postId) {
    query.eq('post_id', postId)
  } else if (commentId) {
    query.eq('comment_id', commentId)
  }

  const { data, count, error } = await query

  if (error) throw error
  return { reactions: data as Reaction[], total: count || 0 }
}

// ============================================================================
// FRIENDSHIPS
// ============================================================================

export async function sendFriendRequest(requesterId: string, receiverId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .insert([
      {
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'pending',
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data as Friendship
}

export async function acceptFriendRequest(friendshipId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', friendshipId)
    .select()
    .single()

  if (error) throw error
  return data as Friendship
}

export async function rejectFriendRequest(friendshipId: string) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)

  if (error) throw error
}

export async function getFriendships(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select(
      `
      *,
      requester:requester_id(id, username, full_name, avatar_url),
      receiver:receiver_id(id, username, full_name, avatar_url)
      `
    )
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('status', 'accepted')

  if (error) throw error
  return data as Friendship[]
}

export async function getPendingRequests(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select(
      `
      *,
      requester:requester_id(id, username, full_name, avatar_url)
      `
    )
    .eq('receiver_id', userId)
    .eq('status', 'pending')

  if (error) throw error
  return data as Friendship[]
}

export async function areFriends(userId1: string, userId2: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select('id')
    .or(`and(requester_id.eq.${userId1},receiver_id.eq.${userId2}),and(requester_id.eq.${userId2},receiver_id.eq.${userId1})`)
    .eq('status', 'accepted')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function sendMessage(senderId: string, receiverId: string, content: string, imageUrl?: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        image_url: imageUrl || null,
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
  return data as Message
}

export async function getMessages(userId: string, contactId: string, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select(
      `
      *,
      sender:sender_id(id, username, full_name, avatar_url),
      receiver:receiver_id(id, username, full_name, avatar_url)
      `
    )
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data as Message[]
}

export async function markMessageAsRead(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)

  if (error) throw error
}

export async function getUnreadMessageCount(userId: string) {
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('receiver_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count || 0
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function getNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select(
      `
      *,
      actor:actor_id(id, username, full_name, avatar_url)
      `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Notification[]
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) throw error
}

export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count || 0
}

// ============================================================================
// PRIVACY SETTINGS
// ============================================================================

export async function getPrivacySettings(userId: string) {
  const { data, error } = await supabase
    .from('privacy_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as PrivacySettings | null
}

export async function updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>) {
  const { data, error } = await supabase
    .from('privacy_settings')
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as PrivacySettings
}

// ============================================================================
// FOLLOWERS
// ============================================================================

export async function followUser(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('followers')
    .insert([
      {
        follower_id: followerId,
        following_id: followingId,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  if (error) throw error
}

export async function isFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

export async function getFollowerCount(userId: string) {
  const { count, error } = await supabase
    .from('followers')
    .select('id', { count: 'exact' })
    .eq('following_id', userId)

  if (error) throw error
  return count || 0
}

export async function getFollowingCount(userId: string) {
  const { count, error } = await supabase
    .from('followers')
    .select('id', { count: 'exact' })
    .eq('follower_id', userId)

  if (error) throw error
  return count || 0
}

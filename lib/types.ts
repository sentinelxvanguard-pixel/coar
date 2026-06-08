// Types para la red social COAR

export interface Profile {
  id: string
  username: string
  full_name: string
  bio: string
  avatar_url: string | null
  birth_date: string | null
  gender: string | null
  verified: boolean
  completed_onboarding: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_url: string | null
  privacy: 'public' | 'friends_only'
  created_at: string
  updated_at: string
  user?: Profile
  _count?: {
    comments: number
    reactions: number
  }
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_comment_id: string | null
  content: string
  created_at: string
  updated_at: string
  user?: Profile
  replies?: Comment[]
  _count?: {
    reactions: number
  }
}

export interface Reaction {
  id: string
  user_id: string
  post_id: string | null
  comment_id: string | null
  reaction_type: string
  created_at: string
}

export interface Friendship {
  id: string
  requester_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
  requester?: Profile
  receiver?: Profile
}

export interface Follower {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  image_url: string | null
  is_read: boolean
  created_at: string
  sender?: Profile
  receiver?: Profile
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string | null
  type: string
  related_id: string | null
  is_read: boolean
  created_at: string
  actor?: Profile
}

export interface PrivacySettings {
  id: string
  user_id: string
  profile_visibility: 'public' | 'friends_only' | 'private'
  comment_visibility: 'everyone' | 'friends_only' | 'none'
  post_visibility: 'everyone' | 'friends_only'
  friends_visibility: 'everyone' | 'friends_only' | 'nobody'
  created_at: string
  updated_at: string
}

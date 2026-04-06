export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  username: string
  email: string
  password?: string
  role: UserRole
  created_at?: string
  last_login?: string | null
}

export interface Product {
  id: number
  title: string
  description: string
  price: number
  image_url: string
  category: string
  offer_label: string
  stock?: number
  avg_rating?: number
  review_count?: number
  created_at: string
}

export interface Review {
  id: number
  product_id: number
  user_id: number
  username: string
  rating: number
  review_text: string
  created_at: string
}

export interface Order {
  id: number
  user_id: number
  username: string
  email: string
  product_id: number
  product_title: string
  quantity: number
  total_price: number
  status: string
  ordered_at: string
}

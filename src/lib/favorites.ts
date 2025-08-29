// src/lib/favorites.ts
import { supabase } from './supabase'

// نوع البيانات للكتاب المفضل
// Type definition for favorite book
export interface FavoriteBook {
  id: string
  user_id: string
  book_id: string
  book_title: string
  book_author: string
  book_image: string
  created_at: string
}

// إضافة كتاب إلى المفضلة
// Add book to favorites
export async function addToFavorites(bookData: {
  book_id: string
  book_title: string
  book_author: string
  book_image: string
}) {
  try {
    // التحقق من تسجيل دخول المستخدم
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً / Please login first')
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        book_id: bookData.book_id,
        book_title: bookData.book_title,
        book_author: bookData.book_author,
        book_image: bookData.book_image
      })
      .select()

    if (error) {
      // التحقق من الخطأ المكرر (الكتاب موجود بالفعل في المفضلة)
      // Check for duplicate error (book already in favorites)
      if (error.code === '23505') {
        throw new Error('الكتاب موجود بالفعل في المفضلة / Book already in favorites')
      }
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// إزالة كتاب من المفضلة
// Remove book from favorites
export async function removeFromFavorites(bookId: string) {
  try {
    // التحقق من تسجيل دخول المستخدم
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً / Please login first')
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('book_id', bookId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// الحصول على قائمة مفضلات المستخدم
// Get user's favorite books
export async function getUserFavorites(): Promise<{ success: boolean; data?: FavoriteBook[]; error?: string }> {
  try {
    // التحقق من تسجيل دخول المستخدم
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً / Please login first')
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error getting favorites:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// التحقق من كون الكتاب في المفضلة أم لا
// Check if book is in favorites
export async function isFavorite(bookId: string): Promise<boolean> {
  try {
    // التحقق من تسجيل دخول المستخدم
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return false
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected if not favorite
      console.error('Error checking favorite status:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking favorite status:', error)
    return false
  }
}

// الحصول على عدد المفضلات
// Get favorites count
export async function getFavoritesCount(): Promise<number> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return 0
    }

    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (error) throw error

    return count || 0
  } catch (error) {
    console.error('Error getting favorites count:', error)
    return 0
  }
}
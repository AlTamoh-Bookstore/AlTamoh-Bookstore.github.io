// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// استخدام متغيرات البيئة
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// التحقق من وجود المتغيرات
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'  // إضافة PKCE flow للأمان
  }
})

// دالة مساعدة للحصول على الـ redirect URL الصحيح
export const getRedirectUrl = () => {
  // في حالة التطوير المحلي
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${window.location.origin}`
  }
  
  // في حالة GitHub Pages
  return 'https://al0tamoh.github.io/Altamooh-book-store/'
}

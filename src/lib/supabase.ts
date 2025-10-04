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
    detectSessionInUrl: true, // تفعيل الكشف التلقائي عن الجلسة في الرابط
    flowType: 'pkce' // استخدام PKCE flow للأمان
  }
})

// دالة للحصول على الـ redirect URL المناسب
export const getRedirectUrl = () => {
  // في حالة التطوير المحلي
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${window.location.origin}`
  }
  
  // في حالة النطاق الفعلي
  return 'https://al-tomoh.com'
}

// دالة مساعدة لإرسال OTP
export const sendOTP = async (email: string, type: 'signup' | 'magiclink' | 'recovery' = 'signup') => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: type === 'signup' // إنشاء مستخدم جديد فقط في حالة التسجيل
    }
  })
  
  return { data, error }
}

// دالة مساعدة للتحقق من OTP
export const verifyOTP = async (email: string, token: string, type: 'signup' | 'magiclink' | 'recovery' = 'signup') => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type
  })
  
  return { data, error }
}

// دالة مساعدة لإعادة إرسال OTP
export const resendOTP = async (email: string, type: 'signup' | 'email_change' = 'signup') => {
  const { data, error } = await supabase.auth.resend({
    type: type,
    email: email
  })
  
  return { data, error }
}

// دالة جديدة لإعادة تعيين كلمة المرور
export const resetPasswordForEmail = async (email: string) => {
  const redirectUrl = getRedirectUrl() + '/reset-password'
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })
  
  return { data, error }
}

// دالة لتحديث كلمة المرور
export const updateUserPassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  return { data, error }
}
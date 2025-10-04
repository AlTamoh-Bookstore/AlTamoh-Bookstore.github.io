import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any | null;
  session: any | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session بدون معالجة URL parameters
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('خطأ في الحصول على الجلسة:', error);
        }
        
        setAuthState({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
        });
      } catch (error) {
        console.error('خطأ في الحصول على الجلسة:', error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setAuthState({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
        });

        // تنظيف الـ URL من parameters غير المرغوب بها
        if (window.location.search.includes('code=') || window.location.hash.includes('access_token=')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // تنظيف الحالة المحلية
      setAuthState({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      throw error;
    }
  };

  // دالة مساعدة لإرسال OTP
  const sendVerificationCode = async (email: string, type: 'signup' | 'signin' = 'signup') => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: type === 'signup'
        }
      });

      return { data, error };
    } catch (error) {
      console.error('خطأ في إرسال كود التحقق:', error);
      return { data: null, error };
    }
  };

  // دالة مساعدة للتحقق من OTP
  const verifyCode = async (email: string, token: string, type: 'signup' | 'magiclink' = 'signup') => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type
      });

      return { data, error };
    } catch (error) {
      console.error('خطأ في التحقق من الكود:', error);
      return { data: null, error };
    }
  };

  // دالة جديدة لإعادة تعيين كلمة المرور
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { data, error };
    } catch (error) {
      console.error('خطأ في إعادة تعيين كلمة المرور:', error);
      return { data: null, error };
    }
  };

  // دالة لتحديث كلمة المرور بعد استلام الرابط
  const updatePassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { data, error };
    } catch (error) {
      console.error('خطأ في تحديث كلمة المرور:', error);
      return { data: null, error };
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signOut,
    sendVerificationCode,
    verifyCode,
    resetPassword,
    updatePassword,
  };
};
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
    // معالجة الـ URL parameters عند تحميل الصفحة
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const urlParams = new URLSearchParams(window.location.search);
      
      // التحقق من وجود access_token في الـ hash أو query parameters
      const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          
          // مسح الـ URL parameters بعد المعالجة
          window.history.replaceState({}, document.title, window.location.pathname);
          
          return;
        } catch (error) {
          console.error('خطأ في معالجة callback:', error);
        }
      }
    };

    // Get initial session
    const getSession = async () => {
      try {
        // معالجة callback أولاً
        await handleAuthCallback();
        
        const { data: { session } } = await supabase.auth.getSession();
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
      (_event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      throw error;
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signOut,
  };
};

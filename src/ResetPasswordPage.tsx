import React from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Loader2, AlertCircle, Shield } from 'lucide-react';
import { supabase } from './lib/supabase';

interface ResetPasswordPageProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onBack, onSuccess }) => {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsLoaded(true);
    
    const initSession = async () => {
      console.log('=== Reset Password Page Loaded ===');
      console.log('Full URL:', window.location.href);
      
      try {
        // محاولة الحصول على access_token من hash
        const hash = window.location.hash;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');
          
          console.log('Tokens found:', { 
            hasAccess: !!accessToken, 
            hasRefresh: !!refreshToken,
            type 
          });
          
          if (accessToken && type === 'recovery') {
            // تعيين الجلسة يدوياً
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (error) {
              console.error('Error setting session:', error);
              setError('رابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد');
            } else {
              console.log('Session set successfully:', data);
              // تنظيف الـ URL
              window.history.replaceState({}, document.title, '/reset-password');
            }
            return;
          }
        }
        
        // التحقق من الجلسة الموجودة
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!session) {
          setError('رابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد');
        } else {
          console.log('Valid session found');
        }
        
      } catch (err) {
        console.error('Error initializing session:', err);
        setError('حدث خطأ في التحقق من الجلسة');
      }
    };
    
    initSession();
  }, []);

  const validatePassword = (): boolean => {
    if (!newPassword || !confirmPassword) {
      setError('يرجى ملء جميع الحقول');
      return false;
    }

    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccessMessage('تم تحديث كلمة المرور بنجاح!');
      
      // الانتظار قليلاً ثم إعادة التوجيه
      setTimeout(() => {
        onSuccess?.();
      }, 2000);

    } catch (err: any) {
      console.error('Password update error:', err);
      
      if (err.message.includes('Auth session missing')) {
        setError('انتهت صلاحية الرابط. يرجى طلب رابط جديد');
      } else if (err.message.includes('same as the old password')) {
        setError('كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة');
      } else {
        setError(err.message || 'حدث خطأ في تحديث كلمة المرور');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fb] via-[#f4f7fb] to-[#ffffff] dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 overflow-hidden relative">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 166, 0, 0.27) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 166, 0, 0.29) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-32 h-32 sm:w-72 sm:h-72 bg-gradient-to-br from-orange-400/15 to-orange-500/15 dark:from-orange-500/20 dark:to-orange-600/20 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-20 w-40 h-40 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400/8 to-blue-500/8 dark:from-blue-500/10 dark:to-slate-700/10 rounded-full blur-2xl sm:blur-3xl"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={onBack}
            className={`mb-6 flex items-center space-x-2 space-x-reverse text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">العودة للرئيسية</span>
          </button>

          <div className={`bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  إنشاء كلمة مرور جديدة
                </h1>
                <p className="text-orange-100">
                  اختر كلمة مرور قوية واحفظها في مكان آمن
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full px-4 py-4 pr-12 pl-12 bg-white/50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-right placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm"
                      placeholder="أدخل كلمة المرور الجديدة"
                      disabled={isLoading}
                      minLength={6}
                    />
                    <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full px-4 py-4 pr-12 pl-12 bg-white/50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-right placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm"
                      placeholder="أعد إدخال كلمة المرور"
                      disabled={isLoading}
                      minLength={6}
                    />
                    <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Warning */}
                <div className="flex items-start space-x-2 space-x-reverse bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                    <strong>تنبيه مهم:</strong> احفظ كلمة المرور الجديدة في مكان آمن أو استخدم مدير كلمات المرور
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm backdrop-blur-sm flex items-start space-x-3 space-x-reverse">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">خطأ في العملية</p>
                      <p>{error}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-green-700 dark:text-green-300 text-sm backdrop-blur-sm flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{successMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 disabled:from-orange-400 disabled:via-orange-400 disabled:to-orange-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 space-x-reverse shadow-lg hover:shadow-xl hover:shadow-orange-500/25 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                      <span className="relative z-10">جاري التحديث...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                      <span className="relative z-10">تحديث كلمة المرور</span>
                    </>
                  )}
                  <div className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
          }
        `
      }} />
    </div>
  );
};

export default ResetPasswordPage;
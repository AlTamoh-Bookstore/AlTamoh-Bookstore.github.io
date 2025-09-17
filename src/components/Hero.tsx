import React from 'react';
import { ArrowDown, X, Gift } from 'lucide-react';

declare global {
  interface Window {
    setHeroSplashHandlers?: (handlers: {
      showSplash: boolean;
      setShowSplash: React.Dispatch<React.SetStateAction<boolean>>;
      openSplash: () => void;
    }) => void;
  }
}

const Hero = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);

  // تمرير الدوال للمكون الأب
  React.useEffect(() => {
    if (window.setHeroSplashHandlers) {
      window.setHeroSplashHandlers({ showSplash, setShowSplash, openSplash });
    }
  }, [showSplash]);

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToBooks = () => {
    const element = document.getElementById('books');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const closeSplash = () => {
    setShowSplash(false);
  };

  const openSplash = () => {
    setShowSplash(true);
  };

  return (
    <>
      {/* صفحة التنبيه المنبثقة (Splash Screen) */}
      {showSplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-lg mx-4 bg-gradient-to-br from-red-600 via-red-500 to-red-700 p-10 rounded-2xl shadow-2xl text-white animate-pulse">
            {/* زر الإغلاق */}
            <button
              onClick={closeSplash}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
              aria-label="إغلاق"
            >
              <X className="h-6 w-6" />
            </button>

            {/* محتوى التنبيه */}
            <div className="text-center pt-4">
              <div className="text-5xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-yellow-300 mb-6">
                عرض خاص!
              </h2>
              <div className="text-xl font-semibold mb-4">
                خصومات عملاقة على كل الكتب
              </div>
              <div className="text-base opacity-90 mb-4 leading-relaxed">
                بمناسبة افتتاح الموقع
              </div>
              
              {/* جملة أن الكتب ليست جميعها هنا */}
              <div className="bg-yellow-100/20 border border-yellow-300/30 rounded-lg p-4 mb-6">
                <p className="text-yellow-200 text-sm leading-relaxed">
                  📚 الكتب الموجودة هنا جزء من مجموعتنا الكاملة<br/>
                  سيتم قريباً استكمال إضافة باقي الكتب، حرصاً منا على تقديم أفضل الخدمات لكم إن شاء الله.
                </p>
              </div>
              
              {/* أزرار العمل */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeSplash}
                  className="px-8 py-4 bg-yellow-400 text-red-800 font-bold text-lg rounded-xl hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                >
                  ابدأ التصفح الآن
                </button>
                <button
                  onClick={closeSplash}
                  className="px-8 py-4 border-2 border-white/50 text-white font-semibold text-lg rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* تأثيرات بصرية */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      )}

      <section id="home" className="relative min-h-screen flex items-center overflow-hidden transition-all duration-500 bg-gradient-to-b from-[#f7f9fb] via-[#f4f7fb] to-[#ffffff] dark:from-gray-900 dark:via-slate-900 dark:to-slate-800">

        {/* الشبكة المتحركة في الخلفية - أصغر على الجوال */}
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

        {/* الجسيمات العائمة - مقللة للجوال */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400/30 dark:bg-orange-400/30 bg-orange-500/40 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>

        {/* العناصر الزخرفية المحسنة - أصغر على الجوال */}
        <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-32 h-32 sm:w-72 sm:h-72 bg-gradient-to-br dark:from-orange-500/20 dark:to-orange-600/20 from-orange-400/15 to-orange-500/15 rounded-full blur-2xl sm:blur-3xl animate-pulse transition-all duration-500"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-20 w-40 h-40 sm:w-96 sm:h-96 bg-gradient-to-br dark:from-blue-500/10 dark:to-slate-700/10 from-blue-400/8 to-blue-500/8 rounded-full blur-2xl sm:blur-3xl transition-all duration-500"></div>
        <div className="absolute top-1/2 right-2 sm:right-10 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br dark:from-orange-400/10 from-orange-400/12 to-transparent rounded-full blur-xl sm:blur-2xl animate-bounce transition-all duration-500" style={{animationDuration: '3s'}}></div>

        <div className={`container mx-auto px-4 sm:px-6 text-center dark:text-white text-[#1d2d50] relative z-10 transition-all duration-1000 pt-8 sm:pt-20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-5xl mx-auto">
            {/* الشارة الأنيقة - أكثر إحكاماً على الجوال */}
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full dark:bg-slate-800/40 bg-white/60 backdrop-blur-sm dark:border-orange-400/20 border-orange-400/30 mb-6 sm:mb-8 group dark:hover:bg-slate-800/60 hover:bg-white/80 transition-all duration-500">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-400 rounded-full ml-2 sm:ml-4 animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium dark:text-orange-200 text-orange-600 dark:group-hover:text-white group-hover:text-orange-700 transition-colors duration-500">
                مكتبة رقمية شاملة
              </span>
            </div>

            {/* العنوان الرئيسي المتحرك - أحجام نص متجاوبة */}
            <h1 className={`text-5xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              كتب تصنع{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent animate-pulse">
                  طموحك
                </span>
                <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transform scale-x-0 animate-pulse" style={{animationDelay: '1s'}}></div>
              </span>
            </h1>

            {/* العنوان الفرعي المحسن - مساحات أفضل للجوال */}
            <p className={`text-base sm:text-xl md:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed dark:text-slate-300 text-[#6c7a89] font-light transition-all duration-1000 delay-400 px-4 sm:px-0 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              مكتبة شاملة توفر كتاباً لكل الأعمار، مع خدمة توصيل لكافة أنحاء تركيا
            </p>

            {/* زر الدعوة للعمل المحسن - محسن للجوال */}
            <div className={`transition-all duration-1000 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <button 
                onClick={scrollToBooks}
                className="group relative inline-flex items-center px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl transition-all duration-500 transform active:scale-95 sm:hover:scale-110 shadow-2xl hover:shadow-orange-500/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <span className="relative z-10 mr-2 sm:mr-3">تصفح الكتب</span>
                <ArrowDown className="relative z-10 h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 group-hover:translate-y-1 group-hover:scale-110" />
                <div className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
              </button>
            </div>

            {/* الإحصائيات الثابتة - متمركزة في صف واحد */}
            <div className={`flex justify-center items-center gap-8 sm:gap-16 mt-12 sm:mt-20 transition-all duration-1000 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-center group cursor-pointer" style={{animationDelay: '0s'}}>
                <div className="text-2xl sm:text-4xl font-bold dark:text-white text-[#1d2d50] mb-1 sm:mb-2 group-hover:text-orange-400 transition-colors duration-300 group-hover:scale-110 transform">
                  5000+
                </div>
                <div className="dark:text-slate-400 text-[#6c7a89] text-xs sm:text-sm font-medium dark:group-hover:text-slate-300 group-hover:text-[#1d2d50] transition-colors duration-500 whitespace-nowrap">
                  كتاب متاح
                </div>
              </div>

              <div className="w-px h-12 sm:h-16 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>

              <div className="text-center group cursor-pointer" style={{animationDelay: '0.2s'}}>
                <div className="text-2xl sm:text-4xl font-bold dark:text-white text-[#1d2d50] mb-1 sm:mb-2 group-hover:text-orange-400 transition-colors duration-300 group-hover:scale-110 transform">
                  10+
                </div>
                <div className="dark:text-slate-400 text-[#6c7a89] text-xs sm:text-sm font-medium dark:group-hover:text-slate-300 group-hover:text-[#1d2d50] transition-colors duration-500">
                  تصنيف
                </div>
              </div>

              <div className="w-px h-12 sm:h-16 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>

              <div className="text-center group cursor-pointer" style={{animationDelay: '0.4s'}}>
                <div className="text-2xl sm:text-4xl font-bold dark:text-white text-[#1d2d50] mb-1 sm:mb-2 group-hover:text-orange-400 transition-colors duration-300 group-hover:scale-110 transform">
                  24/7
                </div>
                <div className="dark:text-slate-400 text-[#6c7a89] text-xs sm:text-sm font-medium dark:group-hover:text-slate-300 group-hover:text-[#1d2d50] transition-colors duration-500 whitespace-nowrap">
                  خدمة العملاء
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* زر فتح الصفحة المنبثقة - مثبت داخل قسم الهيرو فقط */}
        {!showSplash && (
          <div className="absolute top-28 sm:top-32 left-4 z-30">
            <button
              onClick={openSplash}
              className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-full shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-110 active:scale-95"
              title="انقرني - عرض خاص!"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full"></div>
              <div className="relative z-10 text-xl sm:text-2xl font-bold">!</div>
              
              {/* تأثيرات بصرية للانتباه */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </button>
            
            {/* نص توضيحي */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded-lg whitespace-nowrap opacity-90 shadow-md">
              انقرني
            </div>
          </div>
        )}

        {/* التدرج الانتقالي السلس إلى قسم الكتب */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-32 bg-gradient-to-b dark:from-transparent dark:via-slate-800/50 dark:to-slate-800 from-transparent via-[#f4f7fb]/50 to-[#f4f7fb] pointer-events-none transition-all duration-500"></div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-10px) rotate(1deg); }
            }
            
            /* ضمان التفاعل الصديق للمس على الجوال */
            @media (max-width: 640px) {
              button {
                min-height: 44px;
                min-width: 44px;
              }
            }
          `
        }} />
      </section>
    </>
  );
};

export default Hero;

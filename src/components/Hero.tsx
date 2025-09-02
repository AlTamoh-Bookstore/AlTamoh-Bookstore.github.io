import React from 'react';
import { ArrowDown } from 'lucide-react';

const Hero = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToBooks = () => {
    const element = document.getElementById('books');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden transition-all duration-500 bg-gradient-to-b from-[#f7f9fb] via-[#f4f7fb] to-[#ffffff] dark:from-gray-900 dark:via-slate-900 dark:to-slate-800">
        
        {/* شريط العرض الترويجي */}
        <div className="absolute top-20 sm:top-24 left-0 right-0 z-40 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white py-2 px-2 text-center shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center justify-center space-x-1 space-x-reverse animate-pulse">
              <span className="text-yellow-300 text-sm">🎉</span>
              <p className="font-bold text-xs sm:text-base">
                خصومات <span className="text-yellow-300 text-sm sm:text-lg font-extrabold">25%</span> بمناسبة افتتاح الموقع
              </p>
              <span className="text-yellow-300 text-sm">🎉</span>
            </div>
          </div>
        </div>
        {/* Animated Background Grid - Smaller on mobile */}
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

        {/* Floating Particles - Reduced for mobile */}
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

        {/* Enhanced Decorative Elements - Smaller on mobile */}
        <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-32 h-32 sm:w-72 sm:h-72 bg-gradient-to-br dark:from-orange-500/20 dark:to-orange-600/20 from-orange-400/15 to-orange-500/15 rounded-full blur-2xl sm:blur-3xl animate-pulse transition-all duration-500"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-20 w-40 h-40 sm:w-96 sm:h-96 bg-gradient-to-br dark:from-blue-500/10 dark:to-slate-700/10 from-blue-400/8 to-blue-500/8 rounded-full blur-2xl sm:blur-3xl transition-all duration-500"></div>
        <div className="absolute top-1/2 right-2 sm:right-10 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br dark:from-orange-400/10 from-orange-400/12 to-transparent rounded-full blur-xl sm:blur-2xl animate-bounce transition-all duration-500" style={{animationDuration: '3s'}}></div>

        <div className={`container mx-auto px-4 sm:px-6 text-center dark:text-white text-[#1d2d50] relative z-10 transition-all duration-1000 pt-16 sm:pt-20 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-5xl mx-auto">
            {/* Elegant Badge - More compact on mobile */}
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full dark:bg-slate-800/40 bg-white/60 backdrop-blur-sm dark:border-orange-400/20 border-orange-400/30 mb-6 sm:mb-8 group dark:hover:bg-slate-800/60 hover:bg-white/80 transition-all duration-500">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-400 rounded-full ml-2 sm:ml-4 animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium dark:text-orange-200 text-orange-600 dark:group-hover:text-white group-hover:text-orange-700 transition-colors duration-500">
                مكتبة رقمية شاملة
              </span>
            </div>

            {/* Animated Main Heading - Responsive text sizes */}
            <h1 className={`text-5xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              كتب تصنع{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent animate-pulse">
                  طموحك
                </span>
                <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transform scale-x-0 animate-pulse" style={{animationDelay: '1s'}}></div>
              </span>
            </h1>

            {/* Enhanced Subtitle - Better mobile spacing */}
            <p className={`text-base sm:text-xl md:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed dark:text-slate-300 text-[#6c7a89] font-light transition-all duration-1000 delay-400 px-4 sm:px-0 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              مكتبة شاملة توفر كتباً لكل الأعمار، مع خدمة توصيل لكافة أنحاء تركيا
            </p>

            {/* Enhanced CTA Button - Mobile optimized */}
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

            {/* Fixed Stats - Centered in one row */}
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

        {/* Enhanced Scroll Indicator - Mobile optimized */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 group cursor-pointer" onClick={scrollToBooks}>
          <div className="w-6 h-10 sm:w-8 sm:h-14 border-2 dark:border-white/30 border-[#1d2d50]/30 rounded-full flex justify-center group-hover:border-orange-400/50 transition-colors duration-500">
            <div className="w-1 h-3 sm:w-1.5 sm:h-4 bg-gradient-to-b from-orange-400 to-transparent rounded-full mt-2 sm:mt-3 animate-bounce group-hover:from-orange-300"></div>
          </div>
          <div className="text-xs dark:text-slate-400 text-[#6c7a89] mt-1 sm:mt-2 group-hover:text-orange-400 transition-colors duration-500">تصفح</div>
        </div>

        {/* Seamless Transition Gradient to Books Section */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-32 bg-gradient-to-b dark:from-transparent dark:via-slate-800/50 dark:to-slate-800 from-transparent via-[#f4f7fb]/50 to-[#f4f7fb] pointer-events-none transition-all duration-500"></div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-10px) rotate(1deg); }
            }
            
            /* Ensure touch-friendly interactions on mobile */
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

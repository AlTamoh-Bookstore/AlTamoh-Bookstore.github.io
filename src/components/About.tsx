import React, { useState, useEffect } from 'react';
import { Heart, Star, MessageCircle, Book, Clock, Truck, Award } from 'lucide-react';

const About = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      id: 1,
      title: "شغف بالمعرفة",
      description: "نختار كتبنا بعناية فائقة",
      icon: Heart,
      gradientFrom: "from-[#0d0e2a]",
      gradientTo: "to-[#1e1f4a]"
    },
    {
      id: 2,
      title: "جودة عالية",
      description: "كتب أصلية ومطبوعة بأفضل المعايير",
      icon: Star,
      gradientFrom: "from-orange-500",
      gradientTo: "to-orange-600"
    },
    {
      id: 3,
      title: "دعم مباشر",
      description: "فريق متخصّص لخدمتك على مدار الساعة",
      icon: MessageCircle,
      gradientFrom: "from-[#0d0e2a]",
      gradientTo: "to-[#1e1f4a]"
    }
  ];

  const stats = [
    { icon: Book, text: "أكثر من 5000 كتاب متاح" },
    { icon: Clock, text: "خدمة 24/7" },
    { icon: Truck, text: "توصيل إلى كافة تركيا" }
  ];

  const openWhatsApp = () => {
    window.open('https://wa.me/905376791661?text=السلام عليكم، أحتاج للاستفسار عن خدماتكم', '_blank');
  };

  return (
    <section id="about" className="relative py-20 min-h-screen overflow-hidden bg-gradient-to-b dark:from-slate-800 dark:via-slate-900 dark:to-gray-900 from-[#f4f7fb] via-[#f7f9fb] to-[#ffffff] transition-all duration-500">
      
      {/* Animated Background Grid - Same as Delivery */}
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
            className="absolute w-2 h-2 dark:bg-orange-400/30 bg-orange-500/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Enhanced Decorative Elements - Same as Delivery */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br dark:from-orange-400/30 dark:via-orange-500/30 dark:to-yellow-400/20 from-orange-400/20 via-orange-500/20 to-yellow-400/15 rounded-full blur-2xl animate-pulse transition-all duration-500"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br dark:from-gray-300/10 dark:to-gray-500/10 from-blue-200/8 to-blue-400/8 rounded-full blur-3xl transition-all duration-500"></div>
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br dark:from-orange-500/25 dark:via-orange-400/25 from-orange-500/18 via-orange-400/18 to-transparent rounded-full blur-xl animate-bounce transition-all duration-500" style={{animationDuration: '3s'}}></div>
      
      {/* Additional Orange and Light-Gray Blobs */}
      <div className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-br dark:from-gray-200/12 dark:to-gray-400/12 from-blue-200/10 to-blue-300/10 rounded-full blur-3xl animate-pulse transition-all duration-500" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br dark:from-orange-400/25 dark:via-orange-500/25 dark:to-orange-600/20 from-orange-400/18 via-orange-500/18 to-orange-600/15 rounded-full blur-3xl animate-bounce transition-all duration-500" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
      <div className="absolute top-3/4 left-1/3 w-56 h-56 bg-gradient-to-br dark:from-gray-300/10 dark:to-gray-500/10 from-blue-200/8 to-blue-400/8 rounded-full blur-2xl animate-pulse transition-all duration-500" style={{animationDelay: '3s'}}></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          
          {/* Left Side - Main Content */}
          <div className={`transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            {/* Badge */}
            <div className="inline-flex items-center px-5 py-3 rounded-full dark:bg-slate-800/40 bg-white/60 backdrop-blur-sm dark:border-orange-400/20 border-orange-400/30 mb-8 gap-2 transition-all duration-500">
              <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-base dark:text-orange-200 text-orange-600 transition-colors duration-500">قصتنا</span>
            </div>

            {/* Main Title */}
            <h2 className="text-5xl md:text-6xl font-bold dark:text-white text-[#1d2d50] mb-8 leading-tight transition-colors duration-500">
              من <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">نحن</span>
            </h2>

            {/* Description */}
            <p className="text-xl dark:text-slate-300 text-[#6c7a89] leading-relaxed mb-8 transition-colors duration-500">
              <strong className="dark:text-white text-[#1d2d50] transition-colors duration-500">مكتبة الطموح</strong> تهدف إلى جعل المعرفة متاحة لكل الأعمار، من خلال كتب مختارة بعناية وتوصيل موثوق وخدمة عملاء مميزة.
            </p>

            {/* Statistics */}
            <div className="flex flex-wrap gap-4 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-2 dark:bg-slate-800/30 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full dark:border-slate-700/40 border-blue-200/40 transition-all duration-500"
                  >
                    <IconComponent className="h-4 w-4 text-orange-400" />
                    <span className="text-sm dark:text-slate-300 text-[#6c7a89] transition-colors duration-500">{stat.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-orange-400/30 transition-all duration-500">
              <Award className="h-6 w-6 text-orange-400" />
              <div>
                <div className="text-lg font-bold dark:text-white text-[#1d2d50] transition-colors duration-500">ثقة أكثر من 40K قارئ</div>
                <div className="text-sm dark:text-orange-200 text-orange-600 transition-colors duration-500">تقييم ممتاز على جميع المنصات</div>
              </div>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className={`transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="space-y-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={feature.id}
                    className="dark:bg-slate-800/50 bg-white/80 backdrop-blur-sm rounded-xl p-6 dark:border-slate-700/40 border-blue-200/40 hover:border-orange-400/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-500 group hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                        <IconComponent className="h-8 w-8 text-white" strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold dark:text-white text-[#1d2d50] mb-2 transition-colors duration-500">
                          {feature.title}
                        </h3>
                        <p className="dark:text-slate-300 text-[#6c7a89] leading-relaxed transition-colors duration-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Element */}
        <div className="text-center mt-20 pt-8 dark:border-slate-700/30 border-blue-200/30 border-t transition-colors duration-500">
          <div className="inline-flex items-center gap-3 dark:text-slate-500 text-[#6c7a89] transition-colors duration-500">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-sm">نحن هنا لنساعدك في رحلتك نحو المعرفة</span>
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Seamless continuation to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b dark:from-transparent dark:via-gray-900/50 dark:to-gray-900 from-transparent via-[#f7f9fb]/50 to-[#f7f9fb] pointer-events-none transition-all duration-500"></div>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
          }
          
          @keyframes gentlePulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.4;
            }
            50% { 
              transform: scale(1.15);
              opacity: 0.8;
            }
          }
        `
      }} />
    </section>
  );
};

export default About;

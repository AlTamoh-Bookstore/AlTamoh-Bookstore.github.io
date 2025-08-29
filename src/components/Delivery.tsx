import React, { useState, useEffect } from 'react';
import { Truck, CreditCard, MapPin, Shield, MessageCircle } from 'lucide-react';

const Delivery = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const services = [
    {
      id: 1,
      title: "توصيل سريع",
      description: "خدمة توصيل سريعة وموثوقة خلال 2-3 أيام إلى جميع المدن التركية",
      icon: Truck,
      gradientFrom: "from-[#0d0e2a]",
      gradientTo: "to-[#1e1f4a]"
    },
    {
      id: 2,
      title: "دفع آمن",
      description: "دفع آمن عبر التحويل البنكي IBAN",
      icon: CreditCard,
      gradientFrom: "from-orange-500",
      gradientTo: "to-orange-600"
    },
    {
      id: 3,
      title: "تغطية شاملة",
      description: "نصل إليك في جميع المدن والمناطق التركية بلا استثناء",
      icon: MapPin,
      gradientFrom: "from-[#0d0e2a]",
      gradientTo: "to-[#1e1f4a]"
    },
    {
      id: 4,
      title: "ضمان الجودة",
      description: "كل الكتب مختارة بعناية وبتقييم جودة عالٍ من مصادر موثوقة",
      icon: Shield,
      gradientFrom: "from-orange-500",
      gradientTo: "to-orange-600"
    },
    {
      id: 5,
      title: "دعم عملاء مباشر",
      description: "تواصل معنا عبر الواتساب في أي وقت خلال اليوم للمساعدة",
      icon: MessageCircle,
      gradientFrom: "from-[#0d0e2a]",
      gradientTo: "to-[#1e1f4a]"
    }
  ];

  const openWhatsApp = () => {
    window.open('https://wa.me/905376791661?text=السلام عليكم، أحتاج للاستفسار عن خدماتكم', '_blank');
  };

  return (
    <section id="delivery" className="relative py-20 min-h-screen overflow-hidden bg-gradient-to-b dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 from-[#f7f9fb] via-[#f4f7fb] to-[#ffffff] transition-all duration-500">
      
      {/* Animated Background Grid - Same as Books */}
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

      {/* Enhanced Decorative Elements - Same as Books */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br dark:from-orange-400/30 dark:via-orange-500/30 dark:to-yellow-400/20 from-orange-400/20 via-orange-500/20 to-yellow-400/15 rounded-full blur-2xl animate-pulse transition-all duration-500"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br dark:from-gray-300/10 dark:to-gray-500/10 from-blue-200/8 to-blue-400/8 rounded-full blur-3xl transition-all duration-500"></div>
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br dark:from-orange-500/25 dark:via-orange-400/25 from-orange-500/18 via-orange-400/18 to-transparent rounded-full blur-xl animate-bounce transition-all duration-500" style={{animationDuration: '3s'}}></div>
      
      {/* Additional Orange and Light-Gray Blobs */}
      <div className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-br dark:from-gray-200/12 dark:to-gray-400/12 from-blue-200/10 to-blue-300/10 rounded-full blur-3xl animate-pulse transition-all duration-500" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br dark:from-orange-400/25 dark:via-orange-500/25 dark:to-orange-600/20 from-orange-400/18 via-orange-500/18 to-orange-600/15 rounded-full blur-3xl animate-bounce transition-all duration-500" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
      <div className="absolute top-3/4 left-1/3 w-56 h-56 bg-gradient-to-br dark:from-gray-300/10 dark:to-gray-500/10 from-blue-200/8 to-blue-400/8 rounded-full blur-2xl animate-pulse transition-all duration-500" style={{animationDelay: '3s'}}></div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Header - Same style as Books */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Badge */}
          <div className="inline-flex items-center px-5 py-3 rounded-full dark:bg-slate-800/40 bg-white/60 backdrop-blur-sm dark:border-orange-400/20 border-orange-400/30 mb-5 gap-2 transition-all duration-500">
            <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-base dark:text-orange-200 text-orange-600 transition-colors duration-500">خدمات متميزة</span>
          </div>

          {/* Title */}
          <h2 className="text-5xl md:text-6xl font-bold dark:text-white text-[#1d2d50] mb-5 transition-colors duration-500">
            خدماتنا <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">المتكاملة</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl dark:text-slate-300 text-[#6c7a89] max-w-2xl mx-auto transition-colors duration-500">
            نقدم لك تجربة شراء مميزة مع خدمات شاملة وموثوقة في كل خطوة
          </p>
        </div>

        {/* Services Grid - 5 Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={service.id}
                className="dark:bg-slate-800/50 bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:-translate-y-1 transition-all duration-500 dark:border-slate-700/40 border-blue-200/40 hover:border-orange-400/30 hover:shadow-lg hover:shadow-orange-500/10 text-center group"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Icon Circle */}
                <div className={`bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <IconComponent className="h-10 w-10 text-white" strokeWidth={2} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold dark:text-white text-[#1d2d50] mb-4 transition-colors duration-500">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="dark:text-slate-300 text-[#6c7a89] leading-relaxed text-sm transition-colors duration-500">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className={`text-center transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="dark:bg-slate-800/30 bg-white/70 backdrop-blur-sm rounded-2xl p-8 dark:border-slate-700/30 border-blue-200/40 max-w-2xl mx-auto transition-all duration-500">
            <h3 className="text-2xl font-bold dark:text-white text-[#1d2d50] mb-4 transition-colors duration-500">
              هل لديك استفسار؟
            </h3>
            <p className="dark:text-slate-300 text-[#6c7a89] mb-6 text-lg transition-colors duration-500">
              فريقنا جاهز للإجابة على جميع أسئلتك ومساعدتك في اختيار الكتب المناسبة
            </p>
            <button 
              onClick={openWhatsApp}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-500 shadow-lg hover:shadow-green-500/30 hover:scale-105"
            >
              <MessageCircle className="h-6 w-6" />
              تواصل معنا عبر الواتساب
            </button>
          </div>
        </div>

        {/* Bottom Element */}
        <div className="text-center mt-16 pt-8 dark:border-slate-700/30 border-blue-200/30 border-t transition-colors duration-500">
          <div className="inline-flex items-center gap-3 dark:text-slate-500 text-[#6c7a89] transition-colors duration-500">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-sm">خدمة عملاء متاحة 24/7</span>
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Seamless continuation to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b dark:from-transparent dark:via-slate-800/50 dark:to-slate-800 from-transparent via-[#f4f7fb]/50 to-[#f4f7fb] pointer-events-none transition-all duration-500"></div>

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

export default Delivery;
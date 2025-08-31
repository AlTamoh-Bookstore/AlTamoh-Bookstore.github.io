import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, ChevronUp, MessageCircle, Send, Instagram, Star, Book, Compass, Lightbulb, Shield, Brain, Plus, Trophy, Users, Target } from 'lucide-react';

const Footer = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/905376791661?text=السلام عليكم، أرغب في الاستفسار عن إصدارات مكتبة الطموح', '_blank');
  };

  const openTelegram = () => {
    window.open('https://t.me/tamouh_book_store', '_blank');
  };

  const openInstagram = () => {
    window.open('https://www.instagram.com/tomouh.bookstore/', '_blank');
  };

  // Function to scroll to books section and potentially filter by category
  const scrollToCategoryBooks = (category: string) => {
    // Just scroll to books section - let the user manually select the category
    const booksElement = document.getElementById('books');
    if (booksElement) {
      booksElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Optional: Show a brief notification about which category the user wanted
    console.log(`User wants to see: ${category}`);
  };

  const quickLinks = [
    { name: 'الرئيسية', id: 'home' },
    { name: 'إصداراتنا', id: 'books' },
    { name: 'من نحن', id: 'about' },
    { name: 'خدماتنا', id: 'delivery' },
    { name: 'تواصل معنا', id: 'contact' }
  ];

  // Get category icon function - matching the Books component
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      "دين": Book,
      "تاريخ": Compass,
      "علوم": Lightbulb,
      "تحقيق و جريمة": Shield,
      "فلسفة و علم نفس": Brain,
      "أدب": BookOpen,
      "اقتصاد": Trophy,
      "إصدارات دار الطموح": Star,
      "سياسة": Target,
      "تطوير الذات": Star,
      "الأكثر مبيعاً": Trophy,
      "الفلسفة وعلم النفس": Brain,
      "التحقيق والجريمة": Shield,
      "التنمية الذاتية": Target
    };
    return iconMap[category] || BookOpen;
  };

  // Categories extracted from the Books component - these are the actual categories used
  const categories = [
    { name: 'إصدارات دار الطموح', icon: Star, color: 'text-green-400', special: true },
    { name: 'الأكثر مبيعاً', icon: Trophy, color: 'text-yellow-400', special: true },
    { name: 'دين', icon: Book, color: 'text-slate-300', special: false },
    { name: 'تاريخ', icon: Compass, color: 'text-slate-300', special: false },
    { name: 'علوم', icon: Lightbulb, color: 'text-slate-300', special: false },
    { name: 'تحقيق و جريمة', icon: Shield, color: 'text-slate-300', special: false },
    { name: 'فلسفة و علم نفس', icon: Brain, color: 'text-slate-300', special: false },
    { name: 'أدب', icon: BookOpen, color: 'text-slate-300', special: false },
    { name: 'طب', icon: Plus, color: 'text-slate-300', special: false },
    { name: 'اقتصاد', icon: Trophy, color: 'text-slate-300', special: false },
    { name: 'قانون', icon: Users, color: 'text-slate-300', special: false },
    { name: 'سياسة', icon: Target, color: 'text-slate-300', special: false },
    { name: 'تطوير الذات', icon: Target, color: 'text-slate-300', special: false },
    { name: 'الأدب العربي', icon: BookOpen, color: 'text-slate-300', special: false },
    { name: 'الفلسفة وعلم النفس', icon: Brain, color: 'text-slate-300', special: false },
    { name: 'التحقيق والجريمة', icon: Shield, color: 'text-slate-300', special: false },
    { name: 'المقالات الأدبية', icon: BookOpen, color: 'text-slate-300', special: false },
    { name: 'التنمية الذاتية', icon: Target, color: 'text-slate-300', special: false }
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-slate-800 via-gray-900 to-black">
      
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'float 25s ease-in-out infinite'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-orange-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-orange-400/20 via-orange-500/20 to-yellow-400/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-gray-300/8 to-gray-500/8 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-orange-500/15 via-orange-400/15 to-transparent rounded-full blur-2xl" style={{animation: 'gentlePulse 4s ease-in-out infinite'}}></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Top Section */}
        <div className={`pt-16 pb-12 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Logo and Description */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                  <BookOpen className="h-7 w-7 text-white" strokeWidth={2} />
                </div>
                <span className="text-3xl font-bold text-white">مكتبة الطموح</span>
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-8 max-w-md text-lg">
                مكتبة الطموح - نقدم لك أفضل الإصدارات الأدبية والثقافية العربية 
                المتميزة لتغذية عقلك وتنمية معارفك مع إصدارات حصرية ومتنوعة.
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={openWhatsApp}
                  className="bg-gradient-to-br from-green-500 to-green-600 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-green-500/30"
                >
                  <MessageCircle className="h-5 w-5 text-white" />
                </button>
                <button 
                  onClick={openTelegram}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-blue-500/30"
                >
                  <Send className="h-5 w-5 text-white" />
                </button>
                <button 
                  onClick={openInstagram}
                  className="bg-gradient-to-br from-pink-500 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-purple-500/30"
                >
                  <Instagram className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-orange-400">
                <Heart className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">صُنع بحب لعشاق الأدب والثقافة</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                روابط سريعة
              </h3>
              <ul className="space-y-4">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <button 
                      onClick={() => scrollToSection(link.id)} 
                      className="text-slate-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <div className="w-1.5 h-1.5 bg-orange-400/50 rounded-full group-hover:bg-orange-400 transition-colors"></div>
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                تصنيفات إصداراتنا
              </h3>
              <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400/30 scrollbar-track-transparent">
                <ul className="space-y-4">
                  {categories.map((category, index) => {
                    const IconComponent = category.icon;
                    return (
                      <li key={index}>
                        <button 
                          onClick={() => scrollToCategoryBooks(category.name)}
                          className={`${category.color} hover:text-orange-400 transition-colors duration-300 flex items-center gap-2 group w-full text-right`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full group-hover:bg-orange-400 transition-colors ${
                            category.special 
                              ? 'bg-green-400/50 group-hover:bg-green-400'
                              : 'bg-orange-400/50'
                          }`}></div>
                          
                          <div className="flex items-center gap-1.5">
                            {IconComponent && (
                              <IconComponent className={`h-3.5 w-3.5 ${
                                category.special ? 'animate-pulse' : ''
                              }`} />
                            )}
                            <span className={`${category.special ? 'font-medium' : ''} text-sm`}>{category.name}</span>
                          </div>

                          {/* Special badges for priority categories */}
                          {category.name === 'إصدارات دار الطموح' && (
                            <div className="mr-auto">
                              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                إصدارات حصرية
                              </span>
                            </div>
                          )}
                          
                          {category.name === 'الأكثر مبيعاً' && (
                            <div className="mr-auto">
                              <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                                الأكثر طلباً
                              </span>
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Publications Notice */}
              <div className="mt-6 p-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
                <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mb-1">
                  <Star className="h-3.5 w-3.5 animate-spin" style={{animationDuration: '3s'}} />
                  <span>إصدارات متميزة</span>
                </div>
                <p className="text-xs text-slate-400">
                  تصفح مجموعة إصداراتنا الحصرية والمتنوعة في {categories.length} فئة مختلفة
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent"></div>
        </div>

        {/* Bottom Section */}
        <div className={`py-8 transition-all duration-1000 delay-300 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-slate-400 text-sm mb-2">
                جميع الحقوق محفوظة © 2025 مكتبة الطموح والتوزيع
              </p>
              <p className="text-orange-400 font-medium text-sm">
              مكتبة الطموح – حيث تبدأ رحلتك الأدبية من أول صفحة
              </p>
            </div>

            {/* Back to Top Button */}
            <button 
              onClick={scrollToTop}
              className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-orange-500/30 hover:scale-110 transition-all duration-300 group"
            >
              <ChevronUp className="h-6 w-6 text-white group-hover:animate-bounce" />
            </button>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="text-center pb-6">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-xs">شكراً لاختياركم مكتبة الطموح والتوزيع</span>
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(0.5deg); }
          }
          
          @keyframes gentlePulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.3;
            }
            50% { 
              transform: scale(1.1);
              opacity: 0.7;
            }
          }
          
          .scrollbar-thin {
            scrollbar-width: thin;
          }
          
          .scrollbar-thumb-orange-400\/30::-webkit-scrollbar-thumb {
            background-color: rgba(251, 146, 60, 0.3);
            border-radius: 3px;
          }
          
          .scrollbar-track-transparent::-webkit-scrollbar-track {
            background-color: transparent;
          }
          
          ::-webkit-scrollbar {
            width: 4px;
          }
        `
      }} />
    </footer>
  );
};

export default Footer;

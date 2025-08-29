import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, Clock, Star } from 'lucide-react';

const Contact = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const contactInfo = [
    {
      id: 1,
      title: "الهاتف",
      value: "+90 537 679 1661",
      icon: Phone,
      action: () => window.open('tel:+905376791661', '_self'),
      gradientFrom: "from-[#0d0e2a]",
      gradientTo: "to-[#1e1f4a]"
    },
    {
      id: 2,
      title: "الواتساب",
      value: "تواصل مباشر",
      icon: MessageCircle,
      action: () => window.open('https://wa.me/905376791661?text=السلام عليكم، أحتاج للاستفسار', '_blank'),
      gradientFrom: "from-green-500",
      gradientTo: "to-green-600"
    },
    {
      id: 3,
      title: "الموقع",
      value: "تركيا - جميع المدن",
      icon: MapPin,
      action: () => {},
      gradientFrom: "from-orange-500",
      gradientTo: "to-orange-600"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `السلام عليكم، اسمي ${formData.name}%0A%0Aالإيميل: ${formData.email}%0A%0Aالرسالة: ${formData.message}`;
    window.open(`https://wa.me/905376791661?text=${message}`, '_blank');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <section id="contact" className="relative py-20 min-h-screen overflow-hidden bg-gradient-to-b dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 from-[#f7f9fb] via-[#f4f7fb] to-[#ffffff] transition-all duration-500">
      
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

      {/* Enhanced Decorative Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br dark:from-orange-400/30 dark:via-orange-500/30 dark:to-yellow-400/20 from-orange-400/20 via-orange-500/20 to-yellow-400/15 rounded-full blur-2xl animate-pulse transition-all duration-500"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br dark:from-gray-300/10 dark:to-gray-500/10 from-blue-200/8 to-blue-400/8 rounded-full blur-3xl transition-all duration-500"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br dark:from-orange-500/25 dark:via-orange-400/25 from-orange-500/18 via-orange-400/18 to-transparent rounded-full blur-xl animate-bounce transition-all duration-500" style={{animationDuration: '3s'}}></div>
      
      {/* Additional Orange and Light-Gray Blobs */}
      <div className="absolute bottom-32 left-32 w-48 h-48 bg-gradient-to-br dark:from-gray-200/12 dark:to-gray-400/12 from-blue-200/10 to-blue-300/10 rounded-full blur-3xl animate-pulse transition-all duration-500" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
      <div className="absolute top-1/2 right-1/2 w-64 h-64 bg-gradient-to-br dark:from-orange-400/25 dark:via-orange-500/25 dark:to-orange-600/20 from-orange-400/18 via-orange-500/18 to-orange-600/15 rounded-full blur-3xl animate-bounce transition-all duration-500" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
      <div className="absolute top-3/4 right-1/3 w-56 h-56 bg-gradient-to-br dark:from-gray-300/10 dark:to-gray-500/10 from-blue-300/20 to-blue-400/20 rounded-full blur-2xl animate-pulse"></div>


      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Badge */}
          <div className="inline-flex items-center px-5 py-3 rounded-full dark:bg-slate-800/40 bg-white/60 backdrop-blur-sm dark:border-orange-400/20 border-orange-400/30 mb-5 gap-2 transition-all duration-500">
            <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-base dark:text-orange-200 text-orange-600 transition-colors duration-500">تواصل معنا</span>
          </div>

          {/* Title */}
          <h2 className="text-5xl md:text-6xl font-bold dark:text-white text-[#1d2d50] mb-5 transition-colors duration-500">
            نحن في <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">خدمتك</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl dark:text-slate-300 text-[#6c7a89] max-w-2xl mx-auto transition-colors duration-500">
            فريقنا جاهز للإجابة على استفساراتك ومساعدتك في اختيار الكتب المناسبة
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          
          {/* Left Side - Contact Info */}
          <div className={`transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div 
                    key={info.id}
                    className="bg-white shadow-xl rounded-xl p-6 border border-slate-200 hover:border-orange-400/60 hover:shadow-orange-400/30 transition-all duration-500 group hover:-translate-y-1 cursor-pointer dark:bg-slate-800/50 dark:border-slate-700/40"
                    onClick={info.action}
                    style={{
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`bg-gradient-to-br ${info.gradientFrom} ${info.gradientTo} w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                        <IconComponent className="h-8 w-8 text-white" strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                      <h3 className="text-xl font-bold dark:text-white text-[#0c1832] mb-2">
                          {info.title}
                        </h3>
                        <p className="dark:text-slate-300 text-[#475569]">
                          {info.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Working Hours */}
            <div className="mt-8 dark:bg-slate-800/30 bg-white/70 backdrop-blur-sm rounded-xl p-6 dark:border-slate-700/30 border-blue-200/40 transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-orange-400" />
                <h3 className="text-lg font-bold dark:text-white text-[#1d2d50] transition-colors duration-500">ساعات العمل</h3>
              </div>
              <div className="space-y-2 dark:text-slate-300 text-[#6c7a89] transition-colors duration-500">
              <h3>نحن نعمل 7 / 24</h3>
              
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white shadow-xl border border-slate-200 rounded-xl p-8 dark:bg-slate-800/50 dark:border-slate-700/40 transition-all duration-500">
            <div className="dark:bg-slate-800/50 bg-white/80 backdrop-blur-sm rounded-xl p-8 dark:border-slate-700/40 border-blue-200/40 transition-all duration-500">
              <h3 className="text-2xl font-bold dark:text-white text-[#1d2d50] mb-6 transition-colors duration-500">
                أرسل لنا رسالة
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 text-[#6c7a89] mb-2 transition-colors duration-500">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600/50 rounded-lg dark:text-white text-[#1e293b] placeholder-[#475569] dark:placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all duration-500"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 text-[#6c7a89] mb-2 transition-colors duration-500">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600/50 rounded-lg dark:text-white text-[#1e293b] placeholder-[#475569] dark:placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all duration-500"
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </div>

                {/* Message Textarea */}
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 text-[#6c7a89] mb-2 transition-colors duration-500">
                    الرسالة
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600/50 rounded-lg dark:text-white text-[#1e293b] placeholder-[#475569] dark:placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all duration-500"
                    placeholder="اكتب رسالتك هنا..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-500 shadow-lg hover:shadow-orange-500/30 hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Send className="h-5 w-5" />
                  إرسال الرسالة
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Element */}
        <div className="text-center mt-20 pt-8 dark:border-slate-700/30 border-blue-200/30 border-t transition-colors duration-500">
          <div className="inline-flex items-center gap-3 dark:text-slate-500 text-[#6c7a89] transition-colors duration-500">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-sm">نحن هنا لخدمتك على مدار الساعة</span>
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

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

export default Contact;
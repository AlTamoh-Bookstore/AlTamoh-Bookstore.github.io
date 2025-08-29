import React from 'react';
import { Phone, Home, Book, Users, Mail, ChevronDown, Truck, Sun, Moon, LogIn, LogOut } from 'lucide-react';

interface HeaderProps {
  onNavigateToLogin: () => void;
  user: any | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateToLogin, user, onLogout }) => {
  const [activeSection, setActiveSection] = React.useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isScrollingDown, setIsScrollingDown] = React.useState(false);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 50);
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/905376791661?text=السلام عليكم، أرغب في الاستفسار عن الكتب المتاحة', '_blank');
  };

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="h-4 w-4" /> },
    { id: 'books', label: 'الكتب', icon: <Book className="h-4 w-4" /> },
    { id: 'delivery', label: 'خدماتنا', icon: <Truck className="h-4 w-4" /> },
    { id: 'about', label: 'من نحن', icon: <Users className="h-4 w-4" /> },
    { id: 'contact', label: 'تواصل معنا', icon: <Mail className="h-4 w-4" /> }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrollingDown ? '-translate-y-full' : 'translate-y-0'
      } ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/30 dark:bg-slate-900/95 dark:border-slate-700/30' 
          : 'bg-white/90 backdrop-blur-sm shadow-sm dark:bg-slate-900/90'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-16' : 'h-20'
        }`}>
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3 space-x-reverse group cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className={`flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
              isScrolled ? 'w-7 h-7' : 'w-9 h-9'
            }`}>
              <img 
                src="/assets/logo14.png" 
                alt="مكتبة الطموح" 
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
            <div>
              <span className={`font-bold text-slate-800 dark:text-slate-200 transition-all duration-300 ${
                isScrolled ? 'text-base' : 'text-lg'
              }`}>
                مكتبة <span className="text-orange-600">الطموح</span>
              </span>
              <div className={`font-medium text-slate-500 dark:text-slate-400 -mt-1 transition-all duration-300 hidden sm:block ${
                isScrolled ? 'text-xs' : 'text-sm'
              }`}>
                كتب • معرفة • طموح
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)} 
                className={`relative px-3 py-2 font-medium transition-all duration-300 flex items-center space-x-2 space-x-reverse group ${
                  activeSection === item.id 
                    ? 'text-orange-600' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-orange-600'
                } ${isScrolled ? 'text-sm' : 'text-base'}`}
              >
                <span className="group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                )}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            
            {/* User Info or Login Button */}
            {user ? (
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    مرحبا {user.user_metadata?.name || user.user_metadata?.full_name || 'صديق'}
                  </p>
                </div>
                <button 
                  onClick={onLogout}
                  className={`group relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/25 hover:scale-105 active:scale-95 ${
                    isScrolled ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs lg:px-5 lg:py-2.5 lg:text-sm'
                  }`}
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                  <div className="relative flex items-center space-x-2 space-x-reverse">
                    <LogOut className="h-3 w-3 lg:h-3.5 lg:w-3.5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>تسجيل الخروج</span>
                  </div>
                </button>
              </div>
            ) : (
              <button 
                onClick={onNavigateToLogin}
                className={`group relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-500/25 hover:scale-105 active:scale-95 ${
                  isScrolled ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs lg:px-5 lg:py-2.5 lg:text-sm'
                }`}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                <div className="relative flex items-center space-x-2 space-x-reverse">
                  <LogIn className="h-3 w-3 lg:h-3.5 lg:w-3.5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>تسجيل الدخول</span>
                </div>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 transition-all duration-300 hover:scale-110 hidden sm:flex"
              title={isDarkMode ? 'التبديل إلى الوضع المضيء' : 'التبديل إلى الوضع المظلم'}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-90" />
              ) : (
                <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* WhatsApp Button */}
            <button 
              onClick={openWhatsApp}
              className={`hidden md:flex group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/25 hover:scale-105 active:scale-95 ${
                isScrolled ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs lg:px-5 lg:py-2.5 lg:text-sm'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
              <div className="relative flex items-center space-x-2 space-x-reverse">
                <Phone className="h-3 w-3 lg:h-3.5 lg:w-3.5 group-hover:rotate-12 transition-transform duration-300" />
                <span>طلب كتاب</span>
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200/30 dark:border-slate-700/30 py-4 px-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                    activeSection === item.id
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              
              {/* Mobile Auth Button */}
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                    مرحبا يا {user.user_metadata?.name || user.user_metadata?.full_name || 'صديق'}
                  </div>
                  <button 
                    onClick={onLogout}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2.5 py-2 rounded-xl flex items-center justify-center space-x-1.5 space-x-reverse font-medium transition-all duration-300 shadow-lg text-xs w-full"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onNavigateToLogin}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-2.5 py-2 rounded-xl flex items-center justify-center space-x-1.5 space-x-reverse font-medium transition-all duration-300 shadow-lg text-xs"
                >
                  <LogIn className="h-3 w-3" />
                  <span>تسجيل الدخول</span>
                </button>
              )}
              
              {/* Mobile WhatsApp Button */}
              <button 
                onClick={openWhatsApp}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-2.5 py-2 rounded-xl flex items-center justify-center space-x-1.5 space-x-reverse font-medium transition-all duration-300 shadow-lg text-xs"
              >
                <Phone className="h-3 w-3" />
                <span>طلب كتاب</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
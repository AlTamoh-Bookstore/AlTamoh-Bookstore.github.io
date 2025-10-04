import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Hero from './components/Hero';
import Books from './components/Books';
import Delivery from './components/Delivery';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LoginPage from './LoginPage';
import ResetPasswordPage from './ResetPasswordPage';
import { useAuth } from './hooks/useAuth';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const { user, loading, signOut } = useAuth();

  // التحقق من وجود hash في الرابط (لصفحة إعادة تعيين كلمة المرور)
  React.useEffect(() => {
    const handleAuthCallback = () => {
      const hash = window.location.hash;
      
      // التحقق من وجود recovery link
      if (hash && hash.includes('type=recovery')) {
        console.log('Recovery link detected');
        setCurrentPage('reset-password');
        return;
      }
      
      // التحقق من المسار
      if (window.location.pathname === '/reset-password') {
        setCurrentPage('reset-password');
      }
    };
    
    handleAuthCallback();
  }, []);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7f9fb] via-[#f4f7fb] to-[#ffffff] dark:from-gray-900 dark:via-slate-900 dark:to-slate-800">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <div className="animate-ping absolute top-0 left-1/2 transform -translate-x-1/2 h-16 w-16 border-4 border-orange-300 rounded-full opacity-20"></div>
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-medium">جاري التحميل...</p>
      </div>
    </div>
  );

  // Handle successful login/signup
  const handleAuthSuccess = (userData: any) => {
    console.log('User authenticated:', userData);
    setCurrentPage('home');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      console.log('User signed out successfully');
      setCurrentPage('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle reset password success
  const handleResetPasswordSuccess = () => {
    setCurrentPage('login');
  };

  // Show loading spinner while checking authentication state
  if (loading) {
    return <LoadingSpinner />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <HelmetProvider>
            <LoginPage 
              onBack={() => setCurrentPage('home')} 
              onSuccess={handleAuthSuccess}
            />
          </HelmetProvider>
        );
      case 'reset-password':
        return (
          <HelmetProvider>
            <ResetPasswordPage 
              onBack={() => setCurrentPage('home')}
              onSuccess={handleResetPasswordSuccess}
            />
          </HelmetProvider>
        );
      default:
        return (
          <HelmetProvider>
            <div className="font-cairo" dir="rtl">
              <div className="relative overflow-hidden">
                <Header 
                  onNavigateToLogin={() => setCurrentPage('login')}
                  user={user}
                  onLogout={handleLogout}
                />
                <Hero />
                <Books />
                <Delivery />
                <About />
                <Contact />
                <Footer />
              </div>
            </div>
          </HelmetProvider>
        );
    }
  };

  return (
    <div>
      {renderPage()}
    </div>
  );
}

export default App;
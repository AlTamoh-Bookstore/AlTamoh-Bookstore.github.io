import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Books from './components/Books';
import Delivery from './components/Delivery';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LoginPage from './LoginPage';
import { useAuth } from './hooks/useAuth';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const { user, loading, signOut } = useAuth();

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
    
    // Optional: Show success notification
    // You can add a toast notification here if you have a notification system
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

  // Show loading spinner while checking authentication state
  if (loading) {
    return <LoadingSpinner />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginPage 
            onBack={() => setCurrentPage('home')} 
            onSuccess={handleAuthSuccess}
          />
        );
      default:
        return (
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
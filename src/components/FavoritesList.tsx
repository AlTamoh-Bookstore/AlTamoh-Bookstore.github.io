// src/components/FavoritesList.tsx
import { useState, useEffect } from 'react'
import { Heart, Trash2, Book, ArrowLeft, Star, ShoppingCart, X, Plus, Minus, MessageCircle, Send } from 'lucide-react'
import { getUserFavorites, removeFromFavorites, type FavoriteBook } from '../lib/favorites'
import { supabase } from '../lib/supabase'

interface CartItem {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  author?: string;
  discount?: number;
  quantity: number;
}

interface FavoritesListProps {
  onBack?: () => void;
}

export default function FavoritesList({ onBack }: FavoritesListProps) {
  const [favorites, setFavorites] = useState<FavoriteBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Load favorites when component mounts
  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setLoading(true)
    const result = await getUserFavorites()
    
    if (result.success) {
      setFavorites(result.data || [])
      setError(null)
    } else {
      setError(result.error || 'فشل في تحميل المفضلات')
    }
    
    setLoading(false)
  }

  const handleRemoveFavorite = async (bookId: string) => {
    const result = await removeFromFavorites(bookId)
    
    if (result.success) {
      // Remove book from local list
      setFavorites(prev => prev.filter(book => book.book_id !== bookId))
    } else {
      alert('فشل في إزالة الكتاب من المفضلة')
    }
  }

  const openBookDetails = (favorite: FavoriteBook) => {
    // Convert FavoriteBook to Book format for consistency
    const book = {
      id: parseInt(favorite.book_id),
      title: favorite.book_title,
      author: favorite.book_author,
      image: favorite.book_image,
      category: 'المفضلة',
      description: 'كتاب من مفضلتك',
      price: 350 // Default price since favorites don't store price
    }
    setSelectedBook(book)
  }

  const goBackToFavorites = () => {
    setSelectedBook(null)
  }

  // Cart Functions
  const addToCart = (book: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === book.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...book, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (bookId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== bookId));
  };

  const updateQuantity = (bookId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(bookId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === bookId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const generateOrderMessage = () => {
    let message = "السلام عليكم، أرغب في طلب الكتب التالية:\n\n";
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.title}\n`;
      message += `   - المؤلف: ${item.author || 'غير محدد'}\n`;
      message += `   - السعر: ${item.price} ₺\n`;
      message += `   - الكمية: ${item.quantity}\n`;
      message += `   - المجموع: ${item.price * item.quantity} ₺\n\n`;
    });
    
    message += `إجمالي الطلب: ${getTotalPrice()} ₺\n`;
    message += `عدد الكتب: ${getTotalItems()} كتاب\n\n`;
    message += "أرجو تأكيد الطلب وإعلامي بتفاصيل التوصيل والدفع.";
    
    return message;
  };

  const sendToWhatsApp = () => {
    const message = generateOrderMessage();
    window.open(`https://wa.me/905376791661?text=${encodeURIComponent(message)}`, '_blank');
  };

  const sendToTelegram = () => {
    const message = generateOrderMessage();
    window.open(`https://t.me/tamouh_book_store?text=${encodeURIComponent(message)}`, '_blank');
  };

  const generateBookOrderMessage = (book: any) => {
    let message = "السلام عليكم، أرغب في طلب الكتاب التالي:\n\n";
    message += `الكتاب: ${book.title}\n`;
    message += `المؤلف: ${book.author || 'غير محدد'}\n`;
    message += `الفئة: ${book.category}\n`;
    message += `السعر: ${book.price} ₺\n\n`;
    message += "أرجو تأكيد الطلب وإعلامي بتفاصيل التوصيل والدفع.";
    return message;
  };

  const sendBookToWhatsApp = (book: any) => {
    const message = generateBookOrderMessage(book);
    window.open(`https://wa.me/905376791661?text=${encodeURIComponent(message)}`, '_blank');
  };

  const sendBookToTelegram = (book: any) => {
    const message = generateBookOrderMessage(book);
    window.open(`https://t.me/tamouh_book_store?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Book Details View
  if (selectedBook) {
    return (
      <section className="relative py-12 sm:py-16 lg:py-20 min-h-screen overflow-hidden bg-gradient-to-b dark:from-slate-800 dark:via-slate-900 dark:to-gray-900 from-[#f4f7fb] via-[#f7f9fb] to-[#ffffff] transition-all duration-500">
        
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255, 166, 0, 0.27) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 166, 0, 0.29) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
            animation: 'float 20s ease-in-out infinite'
          }}></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-32 h-32 sm:w-72 sm:h-72 bg-gradient-to-br dark:from-red-400/30 dark:via-red-500/30 dark:to-red-400/20 from-red-400/20 via-red-500/20 to-red-400/15 rounded-full blur-2xl animate-pulse transition-all duration-500"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br dark:from-gray-300/10 dark:to-gray-500/10 from-blue-200/8 to-blue-400/8 rounded-full blur-3xl transition-all duration-500"></div>

        {/* Cart Button */}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-110"
          >
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            {getTotalItems() > 0 && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-bold animate-pulse">
                {getTotalItems()}
              </div>
            )}
          </button>
        </div>

        {/* Cart Sidebar */}
        <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-gradient-to-b dark:from-slate-800 dark:via-slate-900 dark:to-gray-900 from-[#f4f7fb] via-[#f7f9fb] to-[#ffffff] shadow-2xl transform transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-slate-700/50 border-red-200/30">
              <h3 className="text-lg sm:text-xl font-bold dark:text-white text-[#1d2d50] flex items-center gap-3">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                سلة التسوق
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-red-100 dark:hover:bg-slate-700/50 rounded-full">
                <X className="h-5 w-5 dark:text-slate-400 text-[#6c7a89]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 dark:text-slate-500 text-red-400" />
                  <p className="dark:text-slate-300 text-[#1d2d50]">سلة التسوق فارغة</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 dark:bg-slate-800/60 bg-white/90 rounded-2xl shadow-lg">
                      <img src={item.image} alt={item.title} className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded-lg"
                        onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/200x300/f97316/ffffff?text=${encodeURIComponent(item.title)}`; }} />
                      <div className="flex-1">
                        <h4 className="font-semibold dark:text-white text-[#1d2d50] text-xs sm:text-sm line-clamp-2">{item.title}</h4>
                        <p className="text-red-600 font-bold text-sm">{item.price} ₺</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-200 rounded">
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <span className="px-1 text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-200 rounded">
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-100 rounded ml-2">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t dark:border-slate-700/50 border-red-200/30 p-4 sm:p-6 space-y-4">
                <div className="flex justify-between text-lg sm:text-xl font-bold">
                  <span className="dark:text-white text-[#1d2d50]">المجموع:</span>
                  <span className="text-red-600">{getTotalPrice()} ₺</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button onClick={sendToWhatsApp} className="bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base">
                    واتساب
                  </button>
                  <button onClick={sendToTelegram} className="bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base">
                    تيليجرام
                  </button>
                </div>
                <button onClick={clearCart} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base">
                  إفراغ السلة
                </button>
              </div>
            )}
          </div>
        </div>

        {isCartOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsCartOpen(false)}></div>}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back Button */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={goBackToFavorites}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              العودة للمفضلة
            </button>
          </div>

          {/* Book Details */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Book Image */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <img
                    src={selectedBook.image}
                    alt={selectedBook.title}
                    className="w-72 h-96 sm:w-80 sm:h-[420px] lg:w-96 lg:h-[500px] object-contain rounded-2xl shadow-2xl"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/400x600/f97316/ffffff?text=${encodeURIComponent(selectedBook.title)}`;
                    }}
                  />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                    {selectedBook.price} ₺
                  </div>
                </div>
              </div>

              {/* Book Information */}
              <div className="space-y-6 sm:space-y-8">
                
                {/* Title and Author */}
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold dark:text-white text-[#1d2d50] leading-tight">
                    {selectedBook.title}
                  </h1>
                  
                  {selectedBook.author && (
                    <p className="text-lg sm:text-xl dark:text-slate-300 text-[#6c7a89] font-medium">
                      بقلم: {selectedBook.author}
                    </p>
                  )}

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 fill-current" />
                    <span className="text-sm sm:text-base font-medium dark:text-red-200 text-red-600">
                      من مفضلتك
                    </span>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold dark:text-white text-[#1d2d50] mb-4">
                    تواصل معنا لطلب الكتاب
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button 
                      onClick={() => sendBookToWhatsApp(selectedBook)}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:scale-105"
                    >
                      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                      طلب عبر واتساب
                    </button>
                    
                    <button 
                      onClick={() => sendBookToTelegram(selectedBook)}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:scale-105"
                    >
                      <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                      طلب عبر تيليجرام
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    onClick={() => addToCart(selectedBook)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:scale-105"
                  >
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                    أضف إلى السلة
                  </button>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold dark:text-white text-[#1d2d50]">
                    نبذة عن الكتاب
                  </h3>
                  
                  <div className="p-4 sm:p-6 dark:bg-slate-800/60 bg-white/90 backdrop-blur-sm rounded-2xl border dark:border-slate-700/30 border-red-200/30 shadow-lg">
                    <p className="text-base sm:text-lg dark:text-slate-300 text-[#6c7a89] leading-relaxed">
                      {selectedBook.description}
                    </p>
                  </div>
                </div>

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
      </section>
    );
  }

  // Main Favorites Page
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 min-h-screen overflow-hidden bg-gradient-to-b dark:from-slate-800 dark:via-slate-900 dark:to-gray-900 from-[#f4f7fb] via-[#f7f9fb] to-[#ffffff] transition-all duration-500">
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255, 166, 0, 0.27) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 166, 0, 0.29) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
      </div>

      {/* Decorative Elements with red theme */}
      <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-32 h-32 sm:w-72 sm:h-72 bg-gradient-to-br dark:from-red-400/30 dark:via-red-500/30 dark:to-red-400/20 from-red-400/20 via-red-500/20 to-red-400/15 rounded-full blur-2xl animate-pulse transition-all duration-500"></div>
      <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br dark:from-gray-300/10 dark:to-gray-500/10 from-blue-200/8 to-blue-400/8 rounded-full blur-3xl transition-all duration-500"></div>

      {/* Cart Button */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-110"
        >
          <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
          {getTotalItems() > 0 && (
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-bold animate-pulse">
              {getTotalItems()}
            </div>
          )}
        </button>
      </div>

      {/* Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-gradient-to-b dark:from-slate-800 dark:via-slate-900 dark:to-gray-900 from-[#f4f7fb] via-[#f7f9fb] to-[#ffffff] shadow-2xl transform transition-transform duration-300 ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-slate-700/50 border-red-200/30">
            <h3 className="text-lg sm:text-xl font-bold dark:text-white text-[#1d2d50] flex items-center gap-3">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              سلة التسوق
            </h3>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-red-100 dark:hover:bg-slate-700/50 rounded-full">
              <X className="h-5 w-5 dark:text-slate-400 text-[#6c7a89]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 dark:text-slate-500 text-red-400" />
                <p className="dark:text-slate-300 text-[#1d2d50]">سلة التسوق فارغة</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 dark:bg-slate-800/60 bg-white/90 rounded-2xl shadow-lg">
                    <img src={item.image} alt={item.title} className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded-lg"
                      onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/200x300/f97316/ffffff?text=${encodeURIComponent(item.title)}`; }} />
                    <div className="flex-1">
                      <h4 className="font-semibold dark:text-white text-[#1d2d50] text-xs sm:text-sm line-clamp-2">{item.title}</h4>
                      <p className="text-red-600 font-bold text-sm">{item.price} ₺</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-200 rounded">
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="px-1 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-200 rounded">
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-100 rounded ml-2">
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t dark:border-slate-700/50 border-red-200/30 p-4 sm:p-6 space-y-4">
              <div className="flex justify-between text-lg sm:text-xl font-bold">
                <span className="dark:text-white text-[#1d2d50]">المجموع:</span>
                <span className="text-red-600">{getTotalPrice()} ₺</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button onClick={sendToWhatsApp} className="bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base">
                  واتساب
                </button>
                <button onClick={sendToTelegram} className="bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base">
                  تيليجرام
                </button>
              </div>
              <button onClick={clearCart} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base">
                إفراغ السلة
              </button>
            </div>
          )}
        </div>
      </div>

      {isCartOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsCartOpen(false)}></div>}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Button */}
        {onBack && (
          <div className="mb-6 sm:mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              العودة للفئات
            </button>
          </div>
        )}

        {/* Header */}
        <div className={`text-center mb-8 sm:mb-12 lg:mb-16 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-3 rounded-full dark:bg-slate-800/40 bg-white/60 backdrop-blur-sm mb-4 sm:mb-6 gap-2">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-400 rounded-full animate-pulse" />
            <span className="text-sm sm:text-base dark:text-red-200 text-red-600">كتبك المفضلة الخاصة</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold dark:text-white text-[#1d2d50] mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">كتبي</span> المفضلة
          </h2>

          <p className="text-base sm:text-lg lg:text-xl dark:text-slate-300 text-[#6c7a89] max-w-2xl mx-auto leading-relaxed px-4">
            مجموعة الكتب التي أضفتها إلى قائمة مفضلتك الشخصية
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={loadFavorites}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              إعادة المحاولة / Try Again
            </button>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className={`text-center py-16 sm:py-24 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <Heart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 dark:text-slate-500 text-red-400" />
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold dark:text-slate-300 text-[#6c7a89] mb-3 sm:mb-4">
              لا توجد كتب مفضلة
            </h3>
            <p className="dark:text-slate-500 text-[#6c7a89] mb-6 sm:mb-8 text-sm sm:text-base px-4">
              ابدأ بإضافة بعض الكتب إلى مفضلتك من صفحة الكتب!
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 text-sm sm:text-base"
              >
                استكشاف الكتب
              </button>
            )}
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className={`transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            
            {/* Favorites Count */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r dark:from-slate-700/60 dark:to-slate-600/60 from-red-50/80 to-red-100/60 rounded-xl sm:rounded-2xl">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 fill-current" />
                <span className="text-sm sm:text-base lg:text-lg font-semibold dark:text-white text-[#1d2d50]">
                  مفضلتي
                </span>
                <span className="text-xs sm:text-sm dark:text-slate-300 text-[#6c7a89] bg-red-500/20 px-2 sm:px-3 py-1 rounded-lg">
                  {favorites.length} كتاب
                </span>
              </div>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="group relative transition-all duration-500 hover:scale-105 w-full max-w-sm cursor-pointer"
                     onClick={() => openBookDetails(favorite)}>
                  <div className="relative dark:bg-slate-800/60 bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl">
                    
                    <div className="absolute left-0 top-0 w-1.5 sm:w-2 h-full bg-gradient-to-b from-red-400 to-red-600 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative h-48 sm:h-64 lg:h-80 dark:bg-slate-700/20 bg-red-50/30 p-2 sm:p-3 lg:p-4 flex items-center justify-center">
                      <img 
                        src={favorite.book_image} 
                        alt={favorite.book_title}
                        className="h-40 sm:h-56 lg:h-72 w-28 sm:w-40 lg:w-52 object-contain rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/200x300/f97316/ffffff?text=${encodeURIComponent(favorite.book_title)}`;
                        }}
                      />
                      
                      <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4 bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold shadow-lg">
                        مفضل
                      </div>

                      {/* Remove from Favorites Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening book details
                          handleRemoveFavorite(favorite.book_id);
                        }}
                        className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 p-1.5 sm:p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                        title="إزالة من المفضلة"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      </button>
                    </div>
                    
                    <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
                      <span className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg text-red-400 dark:bg-red-400/10 bg-red-400/15">
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                        <span>مفضل</span>
                      </span>
                      
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold dark:text-white text-[#1d2d50] line-clamp-2 leading-relaxed">
                        {favorite.book_title}
                      </h3>
                      
                      <p className="dark:text-slate-400 text-[#6c7a89] text-xs sm:text-sm font-medium line-clamp-1">
                        بقلم: {favorite.book_author}
                      </p>

                      <div className="text-xs dark:text-slate-500 text-[#6c7a89]">
                        أُضيف في: {new Date(favorite.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center mt-8 sm:mt-12">
              <p className="dark:text-slate-400 text-[#6c7a89] text-sm sm:text-base">
                عرض {favorites.length} كتاب من مفضلتك
              </p>
            </div>
          </div>
        )}

        {/* Footer Brand */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-5 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-xl sm:rounded-2xl">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-red-400 animate-pulse fill-current" />
            <span className="text-red-400 font-bold text-base sm:text-lg lg:text-xl">مكتبة دار الطموح</span>
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-red-400 animate-pulse fill-current" />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
          }
          
          .group:hover img {
            filter: brightness(1.1) contrast(1.05);
          }
          
          button, .group, input {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          ::-webkit-scrollbar {
            width: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(239, 68, 68, 0.3);
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(239, 68, 68, 0.5);
          }
          
          @media (max-width: 640px) {
            .container {
              padding-left: 1rem;
              padding-right: 1rem;
            }
          }
        `
      }} />
    </section>
  );
}
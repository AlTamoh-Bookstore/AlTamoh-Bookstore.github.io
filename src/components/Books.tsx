import { useState, useEffect, useRef } from 'react';
import { Tag, ShoppingCart, Search, Filter, Star, X, Percent, BookOpen, Bookmark, Award, Sparkles, Plus, Minus, MessageCircle, Send, Trash2, ChevronDown, ChevronUp, ArrowLeft, Grid3x3, List, Eye, Heart, Compass, Lightbulb, Users, Briefcase, Shield, Globe, Book, Trophy, Target, Brain, Palette, Feather, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { addToFavorites, removeFromFavorites, isFavorite, getUserFavorites } from '../lib/favorites';
import FavoritesList from './FavoritesList';

interface Book {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  priceUSD?: number;
  originalPrice?: number;
  originalPriceUSD?: number;
  image: string;
  images?: string[];
  author?: string;
  discount?: number;
}

interface CartItem extends Book {
  quantity: number;
}

interface User {
  id: string;
  email?: string;
}

const Books = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategorySelection, setShowCategorySelection] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'TL' | 'USD'>('TL'); // Add currency selector
  
  // Search and categories state
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Pagination state
  const [visibleBooksCount, setVisibleBooksCount] = useState(0);
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  
  // User and favorites state
  const [user, setUser] = useState<User | null>(null);
  const [favoriteBooks, setFavoriteBooks] = useState<Set<string>>(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState<Set<string>>(new Set());
  const [keepCategoriesOpen, setKeepCategoriesOpen] = useState(false);

  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Refs for scroll control
  const sectionRef = useRef<HTMLElement>(null);
  const categoryGridRef = useRef<HTMLDivElement>(null);
  const booksGridRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  // Check if device is small
  useEffect(() => {
    const checkDeviceSize = () => {
      setIsSmallDevice(window.innerWidth < 768);
    };

    checkDeviceSize();
    window.addEventListener('resize', checkDeviceSize);

    return () => window.removeEventListener('resize', checkDeviceSize);
  }, []);

  // Set initial visible books count based on device size
  useEffect(() => {
    const initialCount = isSmallDevice ? 6 : 12;
    setVisibleBooksCount(initialCount);
  }, [isSmallDevice, selectedCategory, showCategorySelection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Search functionality with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchTerm]);

  const performSearch = (query: string) => {
    setIsSearching(true);
    
    const lowerQuery = query.toLowerCase().trim();
    const results = books.filter(book => {
      const titleMatch = book.title.toLowerCase().includes(lowerQuery);
      const authorMatch = book.author?.toLowerCase().includes(lowerQuery) || false;
      const categoryMatch = book.category.toLowerCase().includes(lowerQuery);
      const descriptionMatch = book.description.toLowerCase().includes(lowerQuery);
      
      return titleMatch || authorMatch || categoryMatch || descriptionMatch;
    });

    setSearchResults(results);
    setIsSearching(false);
  };

  // Initialize from URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    const searchFromUrl = urlParams.get('search');
    
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
      setShowCategorySelection(false);
    }
    
    if (searchFromUrl) {
      const searchValue = decodeURIComponent(searchFromUrl);
      setSearchTerm(searchValue);
      if (!categoryFromUrl) {
        setShowCategorySelection(false);
        setSelectedCategory(null);
      }
    }
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      
      if (state) {
        // Restore state from history
        setSelectedCategory(state.category);
        setShowCategorySelection(state.showCategorySelection);
        setSearchTerm(state.searchTerm || '');
        setVisibleBooksCount(state.visibleBooksCount || (isSmallDevice ? 6 : 12));
      } else {
        // No state, go back to category selection
        setShowCategorySelection(true);
        setSelectedCategory(null);
        setSearchTerm('');
        setVisibleBooksCount(0);
      }
      
      // Scroll to top smoothly
      scrollToTop();
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSmallDevice]);

  // Function to scroll to top smoothly
  const scrollToTop = () => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  };

  // Function to update URL and history
  const updateHistoryState = (category: string | null, showCategories: boolean, search: string = '') => {
    const params = new URLSearchParams();
    
    if (category && !showCategories) {
      params.set('category', encodeURIComponent(category));
    }
    
    if (search) {
      params.set('search', encodeURIComponent(search));
    }
    
    const url = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    
    const state = {
      category,
      showCategorySelection: showCategories,
      searchTerm: search,
      visibleBooksCount: isSmallDevice ? 6 : 12
    };
    
    if (showCategories && !category && !search) {
      // Going back to main categories view
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.history.pushState(state, '', url);
    }
  };

  // Check user authentication and load favorites
  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserFavorites();
      } else {
        setUser(null);
        setFavoriteBooks(new Set());
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        setUser(user);
        loadUserFavorites();
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const loadUserFavorites = async () => {
    if (!user) return;
    
    try {
      const favoritePromises = books.map(async (book) => {
        const isBookFavorite = await isFavorite(book.id.toString());
        return { bookId: book.id.toString(), isFavorite: isBookFavorite };
      });

      const favoriteResults = await Promise.all(favoritePromises);
      const favoriteSet = new Set<string>();
      
      favoriteResults.forEach(({ bookId, isFavorite }) => {
        if (isFavorite) {
          favoriteSet.add(bookId);
        }
      });

      setFavoriteBooks(favoriteSet);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleToggleFavorite = async (book: Book) => {
    if (!user) {
      alert('يجب تسجيل الدخول أولاً لإضافة الكتب للمفضلة');
      return;
    }

    const bookId = book.id.toString();
    setLoadingFavorites(prev => new Set(prev).add(bookId));

    try {
      const isCurrentlyFavorite = favoriteBooks.has(bookId);
      
      if (isCurrentlyFavorite) {
        const result = await removeFromFavorites(bookId);
        if (result.success) {
          setFavoriteBooks(prev => {
            const newSet = new Set(prev);
            newSet.delete(bookId);
            return newSet;
          });
        } else {
          alert(result.error || 'فشل في إزالة الكتاب من المفضلة');
        }
      } else {
        const result = await addToFavorites({
          book_id: bookId,
          book_title: book.title,
          book_author: book.author || 'غير محدد',
          book_image: book.image
        });
        
        if (result.success) {
          setFavoriteBooks(prev => new Set(prev).add(bookId));
        } else {
          alert(result.error || 'فشل في إضافة الكتاب للمفضلة');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('حدث خطأ أثناء تحديث المفضلة');
    } finally {
      setLoadingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  // Helper function to get price in selected currency
  const getPrice = (book: Book) => {
    if (selectedCurrency === 'USD' && book.priceUSD) {
      return book.priceUSD;
    }
    return book.price;
  };

  // Helper function to get original price in selected currency
  const getOriginalPrice = (book: Book) => {
    if (selectedCurrency === 'USD' && book.originalPriceUSD) {
      return book.originalPriceUSD;
    }
    return book.originalPrice;
  };

  // Helper function to get currency symbol
  const getCurrencySymbol = () => {
    return selectedCurrency === 'USD' ? '$' : '₺';
  };

  const books: Book[] = [
      // إصدارات دار الطموح

      // الكتب الأكثر مبيعاً

      // الدين


      // الروايات
      {
        id: 1,
        title: "ألف ليلة وليلة",
        category: "روايات",
        description: "عمل أدبي تراثي يضم مئات القصص الشعبية والأسطورية، تدور في إطار حكايات شهرزاد للملك شهريار. يجمع بين المغامرات مثل رحلات السندباد، والأساطير مثل علاء الدين والمصباح السحري، وقصص الحب والخيانة والملوك والجن. يعد من أبرز روائع الأدب العالمي وأحد أكثر الكتب تأثيرًا في المخيلة الإنسانية.",
        price: 1080,
        priceUSD: 26.25,
        originalPrice: 1440,
        originalPriceUSD: 35,
        discount: 25,
        image: "/altamoh.bookstore/book-images/Novels/alftot.jpg",
        images: [
          "/altamoh.bookstore/book-images/Novels/alftot1.jpg",
          "/altamoh.bookstore/book-images/Novels/alftot2.jpg",
          "/altamoh.bookstore/book-images/Novels/alftot3.jpg",
          "/altamoh.bookstore/book-images/Novels/alftot4.jpg"
        ],
        author: "كاتب مجهول"
      },
      {
      id: 2,
      title: "عقيدة الحشاشين",
      category: "روايات",
      description: "كتاب يستعرض تاريخ طائفة الحشاشين الذين عاشوا في العصور الوسطى، والتي ألهمت سلسلة الألعاب الشهيرة Assassin’s Creed. يتناول نشأة الجماعة بقيادة الحسن الصباح في قلعة آلموت، وأفكارهم السرية، وأساليبهم في تنفيذ الاغتيالات السياسية. يقدم مزيجًا من السرد التاريخي والتحليل الذي يوضح كيف تحولت هذه الطائفة الغامضة إلى أسطورة أثرت في الأدب والفنون والثقافة الشعبية الحديثة.",
      price: 1358.25,
      priceUSD: 33,
      originalPrice: 1811,
      originalPriceUSD: 44,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/assen1.jpg",
      images: [
          "/altamoh.bookstore/book-images/Novels/assen1.jpg",
          "/altamoh.bookstore/book-images/Novels/assen2.jpg",
          "/altamoh.bookstore/book-images/Novels/assen3.jpg"
      ],
      author: "أوليفر بودين"
      },
      {
      id: 3,
      title: "الحرب والسلام",
      category: "روايات",
      description: "رواية ملحمية للكاتب الروسي ليو تولستوي، تُعد من أعظم الأعمال الأدبية في التاريخ. تجمع بين السرد التاريخي والفلسفي والدرامي، حيث تصور الغزو النابليوني لروسيا وتأثيره العميق على المجتمع الروسي. من خلال شخصيات مثل بيير، أندريه، و ناتاشا، يستعرض تولستوي قضايا الحرب، الحب، القدر، والبحث عن المعنى. تعد الرواية لوحة إنسانية واسعة تكشف صراعات البشر بين الواقع والمثل العليا.",
      price: 1534.5,
      priceUSD: 37.5,
      originalPrice: 2058,
      originalPriceUSD: 50,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/war&peace.jpg",
      images: [
          "/altamoh.bookstore/book-images/Novels/war&peace1.jpg",
          "/altamoh.bookstore/book-images/Novels/war&peace2.jpg",
          "/altamoh.bookstore/book-images/Novels/war&peace3.jpg",
          "/altamoh.bookstore/book-images/Novels/war&peace4.jpg"
      ],
      author: "ليف تولستوي"
      },

      {
      id: 4,
      title: "ويتشر",
      category: "روايات",
      description: "سلسلة فانتازيا شهيرة للكاتب البولندي أندجي سابكوفسكي، تدور حول جيرالت من ريفيا، صائد الوحوش المعروف بالويتشر. يتميز جيرالت بقدرات خارقة اكتسبها من تجارب سحرية، ويخوض مغامرات مليئة بالوحوش والسحر والسياسة المعقدة. تمتزج الرواية بين الفانتازيا الداكنة والدراما الإنسانية، حيث تتناول قضايا الأخلاق، المصير، والاختيارات الصعبة. أصبحت السلسلة أساسًا لألعاب الفيديو الشهيرة ومسلسل عالمي ناجح.",
      price: 1605,
      priceUSD: 39,
      originalPrice: 2140,
      originalPriceUSD: 52,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/witcher1.jpg",
      images: [
          "/altamoh.bookstore/book-images/Novels/witcher1.jpg",
          "/altamoh.bookstore/book-images/Novels/witcher2.jpg",
          "/altamoh.bookstore/book-images/Novels/witcher3.jpg",
          "/altamoh.bookstore/book-images/Novels/withcer4.jpg"
      ],
      author: "أندجي سابكوفسكي"
      },

    {
      id: 5,
      title: "أبادول",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 402,
      priceUSD: 9.75,
      originalPrice: 535,
      originalPriceUSD: 13,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook1.jpg",
      author: "د. حنان لاشين"
    },
    {
      id: 6,
      title: "أرض السافلين",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 340,
      priceUSD: 8.25,
      originalPrice: 453,
      originalPriceUSD: 11,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook2.jpg",
      author: "د. أحمد خالد مصطفى"
    },
    {
      id: 7,
      title: "ألا يمكنني الرحيل؟",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 494.25,
      priceUSD: 12,
      originalPrice: 659,
      originalPriceUSD: 16,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook3.jpg",
      author: "لي جيوم لي"
    },
    {
      id: 8,
      title: "أماريتا",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook4.jpg",
      author: "عمرو عبدالحميد"
    },
    {
      id: 9,
      title: "أمانوس",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook5.jpg",
      author: "د. حنان لاشين"
    },
    {
      id: 10,
      title: "أمواج أكما",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook6.jpg",
      author: "عمرو عبدالحميد"
    },
    {
      id: 11,
      title: "أوبال",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook7.jpg",
      author: "د. حنان لاشين"
    },
    {
      id: 12,
      title: "إيكادولي",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook8.jpg",
      author: "د. حنان لاشين"
    },
    {
      id: 13,
      title: "الشيطان يحكي",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 370.5,
      priceUSD: 9,
      originalPrice: 449,
      originalPriceUSD: 12,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook9.jpg",
      author: "د. أحمد خالد مصطفى"
    },
    {
      id: 14,
      title: "القصر الأحمر",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 401.25,
      priceUSD: 9.75,
      originalPrice: 535,
      originalPriceUSD: 13,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook10.jpg",
      author: "جون هون"
    },
    {
      id: 15,
      title: "الهلكوت",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook11.jpg",
      author: "د. أحمد خالد مصطفى"
    },
    {
      id: 16,
      title: "بيت خالتي",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 432,
      priceUSD: 10.5,
      originalPrice: 576,
      originalPriceUSD: 14,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook12.jpg",
      author: "أحمد خيري العمري"
    },
    {
      id: 17,
      title: "دقات الشامو",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook13.jpg",
      author: "عمرو عبدالحميد"
    },
    {
      id: 18,
      title: "ربيع الأندلس",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 370.5,
      priceUSD: 9,
      originalPrice: 494,
      originalPriceUSD: 12,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook14.jpg",
      author: "د. محمود ماهر"
    },
    {
      id: 19,
      title: "سُقُطرى",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 370.5,
      priceUSD: 9,
      originalPrice: 494,
      originalPriceUSD: 12,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook15.jpg",
      author: "د. حنان لاشين"
    },
    {
      id: 20,
      title: "سيرٌّوش",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook16.jpg",
      author: "د. حنان لاشين"
    },
    {
      id: 21,
      title: "شيرلوك هولمز - الأعمال الكاملة",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 2961.75,
      priceUSD: 72,
      originalPrice: 3949,
      originalPriceUSD: 96,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook17.jpg",
      author: "آرثر كونان"
    },
    {
      id: 22,
      title: "شيفرة بلال",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 339.75,
      priceUSD: 8.25,
      originalPrice: 453,
      originalPriceUSD: 11,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook18.jpg",
      author: "د. أحمد خيري العمري"
    },
    {
      id: 23,
      title: "فتى الأندلس",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 339.75,
      priceUSD: 8.25,
      originalPrice: 453,
      originalPriceUSD: 11,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook19.jpg",
      author: "محمود ماهر"
    },
    {
      id: 24,
      title: "قربان آل يونس",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 401.25,
      priceUSD: 9.75,
      originalPrice: 535,
      originalPriceUSD: 13,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook20.jpg",
      author: "أحمد خيري العمري"
    },
    {
      id: 25,
      title: "قواعد جارتين",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook21.jpg",
      author: "عمرو عبدالحميد"
    },
    {
      id: 26,
      title: "كُوِيكُول",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook22.jpg",
      author: "د. حنان لاشين"
    },
    {
      id: 27,
      title: "متجر دالجوت للأحلام 2",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 239.75,
      priceUSD: 8.25,
      originalPrice: 453,
      originalPriceUSD: 11,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook23.jpg",
      author: "لي مي ييه"
    },
    {
      id: 28,
      title: "متجر دالجوت للأحلام",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook24.jpg",
      author: "لي مي ييه"
    },
    {
      id: 29,
      title: "ملائك نصيبين",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 370.5,
      priceUSD: 9,
      originalPrice: 494,
      originalPriceUSD: 12,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook25.jpg",
      author: "د. أحمد خالد مصطفى"
    },
    {
      id: 30,
      title: "واحة اليعقوب",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook26.jpg",
      author: "عمرو عبدالحميد"
    },
    {
      id: 31,
      title: "أرض زيكولا",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook27.jpg",
      author: "عمرو عبدالحميد"
    },
    {
      id: 32,
      title: "وادي الذئاب المنسية",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook28.jpg",
      author: "عمرو عبدالحميد"
    },
    {
      id: 33,
      title: "شوجن",
      category: "روايات",
      description: "رواية ممتعة تأخذ القارئ في رحلة مشوقة بين الشخصيات والأحداث المثيرة.",
      price: 1080.75,
      priceUSD: 26.25,
      originalPrice: 1441,
      originalPriceUSD: 35,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Novels/Nbook29.jpg",
      author: "جيمس كالفين"
    },
    {
      id: 34,
      title: "خوف 1",
      category: "روايات",
      description: "0",
      price: 403,
      priceUSD: 9.8,
      originalPrice: 576,
      originalPriceUSD: 14,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook30.png",
      author: "أسامة مسلم"
    },
    {
      id: 35,
      title: "خوف 2",
      category: "روايات",
      description: "0",
      price: 403,
      priceUSD: 9.8,
      originalPrice: 576,
      originalPriceUSD: 14,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook31.jpg",
      author: "أسامة مسلم"
    },
    {
      id: 36,
      title: "خوف 3",
      category: "روايات",
      description: "0",
      price: 403,
      priceUSD: 9.8,
      originalPrice: 576,
      originalPriceUSD: 14,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook32.jpg",
      author: "أسامة مسلم"
    },
    {
      id: 37,
      title: "بساتين عربستان 1",
      category: "روايات",
      description: "0",
      price: 445,
      priceUSD: 10.8,
      originalPrice: 741,
      originalPriceUSD: 18,
      discount: 40,
      image: "/altamoh.bookstore/book-images/Novels/Nbook33.jpg",
      author: "أسامة مسلم"
    },
    {
      id: 38,
      title: "عصبة الشياطين 2",
      category: "روايات",
      description: "0",
      price: 445,
      priceUSD: 10.8,
      originalPrice: 741,
      originalPriceUSD: 18,
      discount: 40,
      image: "/altamoh.bookstore/book-images/Novels/Nbook34.png",
      author: "أسامة مسلم"
    },
    {
      id: 39,
      title: "لُجّ 1",
      category: "روايات",
      description: "0",
      price: 445,
      priceUSD: 10.8,
      originalPrice: 741,
      originalPriceUSD: 18,
      discount: 40,
      image: "/altamoh.bookstore/book-images/Novels/Nbook35.jpg",
      author: "أسامة مسلم"
    },
    {
      id: 40,
      title: "هذا ما حدث معي",
      category: "روايات",
      description: "0",
      price: 445,
      priceUSD: 10.8,
      originalPrice: 741,
      originalPriceUSD: 18,
      discount: 40,
      image: "/altamoh.bookstore/book-images/Novels/Nbook36.png",
      author: "أسامة مسلم"
    },
    {
      id: 41,
      title: "هذا ما حدث معها (أزرق)",
      category: "روايات",
      description: "0",
      price: 445,
      priceUSD: 10.8,
      originalPrice: 741,
      originalPriceUSD: 18,
      discount: 40,
      image: "/altamoh.bookstore/book-images/Novels/Nbook37.jpg",
      author: "أسامة مسلم"
    },
    {
      id: 42,
      title: "هذا ما حدث معها (أصفر)",
      category: "روايات",
      description: "0",
      price: 445,
      priceUSD: 10.8,
      originalPrice: 741,
      originalPriceUSD: 18,
      discount: 40,
      image: "/altamoh.bookstore/book-images/Novels/Nbook38.jpg",
      author: "أسامة مسلم"
    },
    {
      id: 43,
      title: "هذا ما حدث معها (أسود)",
      category: "روايات",
      description: "0",
      price: 519,
      priceUSD: 12.6,
      originalPrice: 741,
      originalPriceUSD: 18,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook39.jpg",
      author: "أسامة مسلم"
    },
    {
      id: 44,
      title: "مدينة الحب لا يسكنها العقلاء ج1",
      category: "روايات",
      description: "0",
      price: 346,
      priceUSD: 8.4,
      originalPrice: 494,
      originalPriceUSD: 12,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook40.jpg",
      author: "أحمد آل حمدان"
    },
    {
      id: 45,
      title: "أنت كل أشيائي الجميلة ج2",
      category: "روايات",
      description: "0",
      price: 346,
      priceUSD: 8.4,
      originalPrice: 494,
      originalPriceUSD: 12,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook41.jpg",
      author: "أحمد آل حمدان"
    },
    {
      id: 46,
      title: "أبابيل 1",
      category: "روايات",
      description: "0",
      price: 416,
      priceUSD: 11.2,
      originalPrice: 659,
      originalPriceUSD: 16,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook42.jpg",
      author: "أحمد آل حمدان"
    },
    {
      id: 47,
      title: "الجساسة 2",
      category: "روايات",
      description: "0",
      price: 416,
      priceUSD: 11.2,
      originalPrice: 659,
      originalPriceUSD: 16,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook43.png",
      author: "أحمد آل حمدان"
    },
    {
      id: 48,
      title: "جومانا",
      category: "روايات",
      description: "0",
      price: 416,
      priceUSD: 11.2,
      originalPrice: 659,
      originalPriceUSD: 16,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook44.png",
      author: "أحمد آل حمدان"
    },
    {
      id: 49,
      title: "آرسس 1",
      category: "روايات",
      description: "0",
      price: 403,
      priceUSD: 9.8,
      originalPrice: 576,
      originalPriceUSD: 14,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook45.jpg",
      author: "أحمد آل حمدان"
    },
    {
      id: 50,
      title: "آرسس 2",
      category: "روايات",
      description: "0",
      price: 403,
      priceUSD: 9.8,
      originalPrice: 576,
      originalPriceUSD: 14,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook46.jpg",
      author: "أحمد آل حمدان"
    },
    {
      id: 51,
      title: "آزر",
      category: "روايات",
      description: "0",
      price: 416,
      priceUSD: 11.2,
      originalPrice: 659,
      originalPriceUSD: 16,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook47.jpg",
      author: "أحمد آل حمدان"
    },
    {
      id: 52,
      title: "ايكارا",
      category: "روايات",
      description: "0",
      price: 403,
      priceUSD: 9.8,
      originalPrice: 576,
      originalPriceUSD: 14,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook48.jpg",
      author: "يحى خان"
    },
    {
      id: 53,
      title: "وجبة العشاء الأخيرة",
      category: "روايات",
      description: "0",
      price: 346,
      priceUSD: 8.4,
      originalPrice: 494,
      originalPriceUSD: 12,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook49.jpg",
      author: "معن هلال الهنائي"
    },
    {
      id: 54,
      title: "بيت الخناس",
      category: "روايات",
      description: "0",
      price: 432,
      priceUSD: 10.5,
      originalPrice: 617,
      originalPriceUSD: 15,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook50.png",
      author: "معن هلال الهنائي"
    },
    {
      id: 55,
      title: "بيت الخناس ج2",
      category: "روايات",
      description: "0",
      price: 432,
      priceUSD: 10.5,
      originalPrice: 617,
      originalPriceUSD: 15,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook51.jpg",
      author: "معن هلال الهنائي"
    },
    {
      id: 56,
      title: "005",
      category: "روايات",
      description: "0",
      price: 432,
      priceUSD: 10.5,
      originalPrice: 617,
      originalPriceUSD: 15,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook52.jpg",
      author: "شهد قربان"
    },
    {
      id: 57,
      title: "ستوكهولم",
      category: "روايات",
      description: "0",
      price: 432,
      priceUSD: 10.5,
      originalPrice: 617,
      originalPriceUSD: 15,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook53.jpg",
      author: "شهد قربان"
    },
    {
      id: 58,
      title: "البارون",
      category: "روايات",
      description: "0",
      price: 432,
      priceUSD: 10.5,
      originalPrice: 617,
      originalPriceUSD: 15,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook54.jpg",
      author: "شهد قربان"
    },
    {
      id: 59,
      title: "إنني أتعفن رعبا",
      category: "روايات",
      description: "0",
      price: 461,
      priceUSD: 11.2,
      originalPrice: 659,
      originalPriceUSD: 16,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook55.png",
      author: "مريم الحيسي"
    },
    {
      id: 60,
      title: "أكتب حتى لا يأكلني الشيطان",
      category: "روايات",
      description: "0",
      price: 432,
      priceUSD: 10.5,
      originalPrice: 617,
      originalPriceUSD: 15,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook56.jpg",
      author: "مريم الحيسي"
    },
    {
      id: 61,
      title: "بيتشيني",
      category: "روايات",
      description: "0",
      price: 432,
      priceUSD: 10.5,
      originalPrice: 617,
      originalPriceUSD: 15,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook57.jpg",
      author: "مريم الحيسي"
    },
    {
      id: 62,
      title: "لأنها كيارا",
      category: "روايات",
      description: "0",
      price: 432,
      priceUSD: 10.5,
      originalPrice: 617,
      originalPriceUSD: 15,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook58.png",
      author: "سما سامي"
    },
    {
      id: 63,
      title: "مملكة الكوابيس والضباب",
      category: "روايات",
      description: "0",
      price: 432,
      priceUSD: 10.5,
      originalPrice: 617,
      originalPriceUSD: 15,
      discount: 30,
      image: "/altamoh.bookstore/book-images/Novels/Nbook59.jpg",
      author: "سما سامي"
    },

    // =========================================================================================== //

    // التربية
    {
      id: 1,
      title: "8  لتربية أبناء ناجحين",
      category: "التربية",
      description: "أتريد أطفالًا صبورين ولطيفين ومتواضعين وشاكرين يحترمونك ويحترمون أنفسهم والآخرين؟ لديهم أخلاقيات العمل الجاد لا يستسلمون حتى ينجزوا المَهمَّة التي يقول عنها الآخرون إنها مستحيلة؟ مَن ينجحون في ميادين الحياة كافَّة –شخصيًّا ومهنيًّا وفيما يخص العلاقات- بفعل أفضل ما بوسعهم؟ لا يمكنك إجبار أطفالك على الامتنان لكل ما تفعله، بينما يمكنك تربية أطفال ناجحين يتمتعون بصورة ذاتية سليمة وجرعات كافية من المسؤولية وتحمُّل نتيجة أفعالهم. سيكبر هؤلاء الأطفال ليصبحوا راشدين يمكنك أن تفخر بهم ويظلون متزنين في بحار الحياة العاصفة. بل ويتصرفون كما لو أنهم قباطنة لسفن الآخرين. ثق بي، فأنا أعرف ذلك. فلديَّ خمسة أطفال وأربعة أحفاد ينتشرون داخل بيتي وخارجه أنا وحبيبتي ساندي بأريزونا وينعشون الأجواء.",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Education/Edbook1.jpg",
      author: "د. كيفين ليمان"
    },
        {
      id: 1,
      title: "سيرة ازاد المهنية",
      category: "التربية",
      description: "قصة ازاد عبدالرحمن المهنية الرائعة",
      price: 00,
      priceUSD: 00,
      originalPrice: 1400000,
      originalPriceUSD: 10000,
      discount: 100%,
      image: "/altamoh.bookstore/book-images/Education/Edbook1.jpg",
      author: "المهندس: ازاد عبدالحمن"
    },
    {
      id: 2,
      title: "فكر بعقل طفلك",
      category: "التربية",
      description: "تصحبنا غزل البغدادي الاستشارية التربوية في رحلة لطيفة خلال أبرز الاستشارات التربوية التي أجرتها مع عملائها، مُقدِّمة لنا خلاصة خبرتها التي امتدت أعوامًا، فتأتي نصائحها التربوية التي تحل مشكلات كثيرة لدى المربين مثل قناديل مضيئة على طول الطريق الوالديِّ، إذ يفهم من خلالها المربون كيف يفكر صغارهم، وما هي تحدياتهم، وما الأسباب التي دفعتهم نحو سلوكياتٍ دون غيرها، كما تخبرهم بأسلوب بسيط وواضح كيف عليهم أن يفكروا في المشكلة وكيف عليهم أن يتصرفوا وكيف يحاورون أولادهم على النحو الصحيح. كتاب خفيف في عدد صفحاته، ثقيل في نصائحه وغني في محتواه، يرافقك ويرشدك طوال رحلتك مع ابنك، إذ يعطيك أفكارًا وأمثلة لتستوضح مقاصده، ونصائح تربوية ثمينة، كما يمدُّك بأنشطة تفاعلية تقوِّي علاقتك بطفلك",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Education/Edbook2.jpg",
      author: "غزل البغدادي"
    },
    {
      id: 3,
      title: "الفارق الذي تصنعه الأم",
      category: "التربية",
      description: "سيظلُّ الصبيانُ صبيانًا، دائمًا. وما من أحدٍ له تأثير أقوى عليهم منكِ، الأم. مفاجأة! يريد ابنك أن يرضيكِ ويهتم بشدة برأيك. سيُرافقه هذا النوع من الاحتياجات طوال حياته، مما يمنحك الكثير من التأثير على ابنك، ويُمكِّنك من تجهيزه للنجاح في الحياة. في كتابه «الفارق الذي تصنعه الأم»، يكشف المؤلف الأكثر مبيعًا في نيويورك تايمز الدكتور كيفن ليمان كيف يمكنك ترك بصمة إيجابية في حياة ابنك، منذ اللحظة الأولى التي تَضُمِّينه فيها بين ذراعيك حتى اللحظة التي يغادر فيها للالتحاق بالجامعة. وإليكِ الخبر السار: لم يفت الأوان للبدء بعد، بغض النظر عن عمر ابنك الآن. عزيزتي الأم: هـــل تريديــــــــن الأفضــــل لابنك؟ هـــل تأمليـــــن نجاحه في الحياة؟ هـــل تحـدوكِ أمنية أن تفهـمي أولادك فَهمًا أفضـــــــــل؟ هل تشعرين أن ابنك يفكر أحيانًا بطريقة مختلفة؟ (بالدرجة التي لا تستطيعين فيها معرفة قصده أو حتى الرد عليه). هل ترغبين أن يكــــــوِّن صداقات صحيَّــة، أو أن تحتفظــــي بعـــلاقة قويـــة معـــه عندمـــا يحين وقت مغادرته للمنزل؟ هل تتمنين أن يكون لديك زوجة ابن عظيمة يومًا ما؟ أو أن تصبح هي ذاتهـــــــا صديقـــة مقرَّبة لكِ فيما بعد؟ هل تأملين أن يكون ابنك أبًا صالحًا؟ إذا كانـــــــــــت هذه هي أحلامك وأمنياتك لنفسك ولابنك، فهذا الكتاب هو كل ما تحتاجين إليه.. أضمن لكِ هذا! ",
      price: 277.5,
      priceUSD: 6.75,
      originalPrice: 370,
      originalPriceUSD: 9,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Education/Edbook3.jpg",
      author: "د. كيفين ليمان"
    },
    {
      id: 4,
      title: "دليل الحياة الزوجية",
      category: "التربية",
      description: "'كتاب مُهم لكل المُقبلين على الزواج'. إن الاستمرار في زواج سعيد مدى الحياة لا يتعلق بالتوافق الجسدي فحسب، بل يتعلق أيضًا بأسلوب حياة يعتمد على الحميمية على مدار 24 ساعة طوال أيام الأسبوع ويربط بين الزوجين بعلاقة مُرضية للطرفين. في كتابه «دليل الحياة الزوجية»، يكشف خبير الزواج دكتور كيفن ليمان، صاحب أكثر الكتب مبيعًا في مجال العلاقات الزوجية، الأسرار الرئيسية للحياة العاطفية التي يتوق إليها الأزواج. إنه يساعد القرَّاء على: - فَهم كلٍّ منهما لاحتياجات الآخر وخلفيته وشخصيته (وكيف تؤثر هذه العوامل على كل تفاعل في العلاقة الزوجية). - التحدث بطريقة تجعل الشريك يستمع حقًّا. - تحويل ممارسة الألعاب النفسية السلبية إلى سلوكيات إيجابية تساعد الأزواج على التقارب. - تكوين علاقة حميمية عميقة وطويلة الأمد ومقاومة للطلاق. سواء كان الأزواج حديثي الزواج أو كانوا متزوجين منذ فترة طويلة، فإن استراتيجيات دكتور ليمان المختبرة عبر الزمن ستُنشئ نوعًا من العلاقة الحميمية المثيرة، والاحترام المتبادل، والتواصل المُرضي الذي من شأنه أن يُبقي الأزواج متقاربين مدى الحياة. ",
      price: 339.75,
      priceUSD: 8.25,
      originalPrice: 453,
      originalPriceUSD: 11,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Education/Edbook4.jpg",
      author: "د. كيفين ليمان"
    },
    {
      id: 5,
      title: "في عالم الأشباح الجائعة",
      category: "التربية",
      description: "الإدمان بكل أنواعه سواء إدمان المخدرات أو الإدمان السلوكي مثل المقامرة، والأكل -أو إدمان أي شيء آخر في الحقيقة-، متجذر في الألم الناجم في كثير من الحالات عن معاناة في الطفولة. يكون غير متوقع من العديد من هؤلاء الآباء والأمهات الذين فقدوا أبناءهم بسبب الإدمان أن يعبروا عن تقديرهم لأبنائهم أو تفهُّمهم لهم، بل تجد أنهم غالبًا ما يشعرون بالألم أو الغضب أو يشعرون أن اللوم دائمًا مُلقى عليهم. هذا الكتاب لا يهدف إلى إلقاء اللوم على أي أحد بل يهدف إلى احتضان الإنسانية المعذبة، يهدف إلى إظهار أن الإدمان هو أحد مظاهر العذاب الإنساني الأكثر شيوعًا. ليس هناك أي اتهام، فقط إقرار لحقيقة أن المعاناة تورث عبر الأجيال، وأننا نمررها عن غير قصد حتى نفهمها ونكسر تسلسل انتقالها داخل كل أسرة أو جماعة بشرية أو مجتمع. لوم الوالدين ليس فعلًا طيبًا عاطفيًّا ولا صحيحًا علميًّا. يبذل جميع الآباء قصارى جهدهم، لكن أفضل ما لدينا مُقيد بصدماتنا التي لم تُحَل أو ما ترسَّبَ منها دون وعي. هذا هو ما نورثه لأطفالنا عن غير قصد، كما فعلت أنا. الجانب المشرق في هذا الكتاب، هو أن تلك الصدمة وهذا التفكك الأسري يمكن معالجتهما. إذا توفرت الظروف المناسبة، نعلم الآن أن المخ يستطيع أن يعالج نفسه. ",
      price: 494.25,
      priceUSD: 12,
      originalPrice: 659,
      originalPriceUSD: 16,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Education/Edbook5.jpg",
      author: "د. جابور ماتيه"
    },

    // =========================================================================================== //

    // التاريخ

    // =========================================================================================== //

    // التحقيق والجريمة
    

    // =========================================================================================== //

    // الفلسفة وعلم النفس
    {
    id: 1,
    title: "اعرف وجهك الآخر",
    category: "فلسفة و علم نفس",
    description: "تحــذيـــر هذا الكتاب سيحطِّم كلَّ ما كنتَ تعتقد أنه الحقيقة. ستُصدم بكونك لا تعرف شيئًا عن العالم السري للعلاقات الخاصة، وأن كلَّ ما ورثته فيه محضُّ هراء، ستشعر بأنك تعيش في مجتمع كل ممنوع فيه يُمارَس بهوسٍ في الخفاء. ستعرف أسسًا لم تكن يومًا تعتقد أنها موجودة في الإغواء، العلاج الحقيقي للتعلُّق العاطفي الذي ربما كنت ضحيَّته بلا وعي منك. إن كنت مهتمًّا بأن يعود مَن كان يعني لك الحياة، إن كان هذا الحلم منطقيًّا أو إدمانًا في الحبِّ. سترى أبويك بعين الواقع. بلا قدسيَّة وهذا قد يقطع قلبك إربًا وقد يجعلك تندم على اقتناء الكتاب أو تكرهني لأنني أريتُكَ واقعًا لم تكن يومًا تودُّ رؤيته. إذا كنت مستعدًّا لنوبة الوعي التي يصحبُها وجعٌ للروح، إذا كنت شجاعًا على أهُبة الاستعداد للتعرُّف على وجهك الآخر، فأنا معك وهذا الكتاب لك، لكن إن كنت تريد حياة هادئة وكتابًا فقط يُشعركَ بالراحة ويلقِّنك مفاهيم مستهلكة تعطيك وعودًا سريعة بالتغيير، فهذا الكتاب خطرٌ عليك.",
    price: 370.50,
    priceUSD: 9,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook1.jpg",
    author: "د. يوسف الحسني",
    },
    {
    id: 2,
    title: "الغباء العاطفي",
    category: "فلسفة و علم نفس",
    description: "لماذا نعجز عن التفكير في حال الجوع؟ ولماذا نرى الكوابيس؟ ولماذا لا ننسى الذكريات المحرجة؟ قد نشعر بالألم بسبب العواطف. وهذا ما شعر به دين بعد أن فقد والده بسبب فيروس كوفيد-19. ووسط ألمه وجد نفسه يتساءل: كيف ستكون الحياة دون عواطف؟ ومن ثمَّة، قرر وضع مشاعره تحت المجهر من أجل العلم. في كتاب الغباء العاطفي، يأخذنا دين في رحلة استكشافية مذهلة تبحث في أصول الحياة ونهاية الكون. وخلال رحلته يجيب عن أسئلة لطالما حيرتنا: - لماذا نتبع الحدس؟ - هل كانت الأيام الخوالي فعلًا هي 'الزمن الجميل'؟ - لماذا ندمن تصفح الأخبار السلبية؟ - وكيف تجعلنا الموسيقى الحزينة أكثر سعادة؟ من خلال الجمع بين تحليل الخبراء وحس الفكاهة الرائع والحقائق الثاقبة عن حياتنا الداخلية، يكتشف دين أن العواطف ليست عقبات تعوق الإنسان بل هي ما تُشكِّل ذواتنا وأفعالنا وإنجازاتنا البشرية.",
    price: 462.75,
    priceUSD: 11.25,
    originalPrice: 617,
    originalPriceUSD: 15,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook2.jpg",
    author: "دين برنيت",
    },
    {
    id: 3,
    title: "المخ الأبله",
    category: "فلسفة و علم نفس",
    description: "دُوَارُ الحَرَكَةِ. الكَوَابِيس. عَدَمُ تَذَكُّرِ أسمَاءِ النَاسِ. لِمَاذَا دَخلتُ هَذهِ الغُرفَةَ؟ بالنسبة إلى شيءٍ يُفتَرض أنه مذهلٌ ومتطورٌ وسامٍ للغاية، المخ البشري به قدر لا بأس به من الفوضى ولا يخلو من عدم النظام وعرضة بشكل كبير للأخطاء. في المخ الأبله عالم الأعصاب دين برنيت يحتفي بكل ما يعتري المخ البشري من عيوب ونقائص بكامل بهائها، ويعرض لنا تأثير تلك النزوات على حياتنا اليومية. مبني على خبرة بحثية أصيلة ومكتوب بأسلوب مُمتع ومُسلٍّ، هذا الكتاب لأي شخص تعجَّب من قدرة مخنا الشخصي على أن ينغص علينا حياتنا ويخربها، وتساءل بحق الإله ما الذي يدور حقًّا داخل رأسه. نزهة علمية ممتعة مع العمليات العقلية غير العقلانية التي نقوم بها. جايا فينيس، مؤلفة مغامرات في الأنثروبوسين. مقدمة رائعة لعلم الأعصاب. لايل ساناي، صحيفة الإندبندنت. يطرح الكتابُ نقاشاتٍ مُنِيرةً عن طريقة عمل الذاكرة، وعن الخوف ونوبات الهلع، وعن مدى عرضتنا لأن يخدعنا الآخرون أو يصيبنا الاكتئاب، وعن أعاجيب وبدائع الحواس البشرية. وال ستريت جورنال",
    price: 494.25,
    priceUSD: 12,
    originalPrice: 659,
    originalPriceUSD: 16,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook3.jpg",
    author: "سيجموند فرويد",
    },
    {
    id: 4,
    title: "المخ السعيد",
    category: "فلسفة و علم نفس",
    description: "هل تود أن تصبح سعيدًا؟ ‏يستطرد عالم الأعصاب دين برينت خلال هذا الكتاب في شرح خبايا عقولنا من اكتشاف ‏إجابات لبعض الأسئلة الجوهرية فيما يتعلق بالسعادة. ما المعنى الفعلي لكوننا سعداء؟ وما ‏مصادر السعادة؟ وما المغزى من وراءها حقًّا؟ كُف عن البحث عن سر السعادة في ‏الصيحات المختلفة لأساليب الحياة والفلسفات الزائفة؛ فبرينت يكشف الحقيقة –المثيرة للدهشة ‏في كثير من الأحيان- الكامنة وراء سلوكياتنا.‏",
    price: 494.25,
    priceUSD: 12,
    originalPrice: 659,
    originalPriceUSD: 16,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook4.jpg",
    author: "دين برنيت",
    },
    {
    id: 5,
    title: "الهشاشة النفسية",
    category: "فلسفة و علم نفس",
    description: "الهشاشة النفسية تجعلنا نضخّم المشكلات ونراها كوارث تفوق قدرتنا على التحمل، فنشعر بالعجز والانهيار فيما يسمى بـ Pain catastrophizing. هذا التضخيم يزيد الألم ويقود إلى الإحباط والاستسلام. كما تظهر الهشاشة في حياتنا اليومية عبر تعظيم مشاعرنا، رفض النقد، اللجوء السريع للأطباء النفسيين، وعدم تقبل النصائح أو الأحكام. الكتاب يناقش هذه الظاهرة لدى بعض الشباب والفتيات ويطرح حلولًا عملية لتقوية النفس وتدريبها على الصبر وتحمل المسؤولية.",
    price: 309,
    priceUSD: 7.5,
    originalPrice: 412,
    originalPriceUSD: 10,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook5.jpg",
    author: "د. إسماعيل عرفة",
    },
    {
    id: 6,
    title: "الوحش الذي يسكنك يمكن أن يكون لطيفًا",
    category: "فلسفة و علم نفس",
    description: "إنَّ الحقيقة الأكثر رعبًا التي نكتشفها ونختبرها بينما نكبر أنَّ جميع الوحوش التي كُنَّا نخشاها كأطفال وصدَّقنا أنَّها تسكن تحت أسِرَّتنا، لم تختفِ؛ بل تسكن الآن رؤوسنا، وتختبئ في زواياها بدلًا من زوايا الغرفة، وتعبّر عن نفسها في أشكالٍ لا حصر لها من مخاوفنا الشخصيَّة. الخوف ليس قوة خارجيَّة تغزو عقلك لتجعلك بائسًا، الخوف جزء منك لا يمكنك التخلُّص منه حقًا، ومحاولة تجنبه أو استبعاده لن تجعله يختفي. إذا لم تسمح لوحشك بالتعبير عن نفسه، فسوف يستمر في محاولة لفت انتباهك بأي وسيلة ممكنة. أحيانًا يكون وحشك مثل طفلٍ صغيرٍ يحاول إخبارك بشيءٍ يعتقد أنَّه مهم جدًّا، إذا اعتقد أنَّك لا تنصت إليه، فسوف يرفع صوته أكثر ويهاجمك؛ إنَّه في الواقع يحاول حمايتك. فقط إذا اتبعت الطريقة الصحيحة لترويضه، الوحش الذي يسكنك يمكن أن يكون لطيفًا!",
    price: 309,
    priceUSD: 7.5,
    originalPrice: 412,
    originalPriceUSD: 10,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook6.jpg",
    author: "إيناس سمير",
    },
    {
    id: 7,
    title: "جلسات نفسيه",
    category: "فلسفة و علم نفس",
    description: "كتاب جلسات نفسية للدكتور محمد إبراهيم هو مرشد عملي يساعد القارئ على فهم ذاته والتعامل الصحيح مع مشاعره حتى يصل إلى السكينة النفسية. يركز الكتاب على كشف الأخطاء في تعاملنا مع النفس مثل إصدار الأحكام القاسية أو تجاهل ما يؤلمنا، مما يؤثر سلبًا على مختلف جوانب حياتنا. يتناول عدة موضوعات مثل التعامل مع القلق والتفكير المفرط، تقدير الذات، بناء علاقات صحية، والتغلب على الضغوط النفسية. بأسلوب بسيط وقريب من القارئ، يقدم الكتاب جلسات ونصائح عملية لتطوير الذات وتحسين جودة الحياة النفسية والاجتماعية، ويعد من أفضل كتب علم النفس الموجهة للشباب والباحثين عن التوازن النفسي.",
    price: 309,
    priceUSD: 7.5,
    originalPrice: 412,
    originalPriceUSD: 10,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook7.jpg",
    author: "د. محمد إبراهيم",
    },
    {
    id: 8,
    title: "عندما يقول الجسد 'لا'",
    category: "فلسفة و علم نفس",
    description: "هل يمكن أن يموت المرء -حرفيًّا- من فرط الوحدة؟ هل يوجد رابط بين القدرة على التعبير عن العواطف ومرض ألزهايمر؟ هل ثمة ما يُدعى بـ «الشخصية السرطانية»؟ يجيب كتاب «عندما يقول الجسد لا» عن أسئلة شائكة حول الرابط بين العقل والجسد، وعن الدور الذي يلعبه الضغط النفسي والتركيبة العاطفية للمرء في مختلف الأمراض الشائعة مثل التهاب المفاصل والسرطان والسكري وأمراض القلب ومتلازمة القولون العصبي والتصلب المتعدد. وهي إجابات مستمدة من بحوث علمية مستفيضة ومن العمل السريري المشهود الذي مارسه د. جابور ماتيه. ",
    price: 462.75,
    priceUSD: 11.25,
    originalPrice: 617,
    originalPriceUSD: 15,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook8.jpg",
    author: "جابور ماتيه",
    },
    {
    id: 9,
    title: "محاط بالمرضى النفسيين",
    category: "فلسفة و علم نفس",
    description: "كتاب مُحاط بالمرضى النفسيين لتوماس إريكسون يكشف استراتيجيات عملية للتعامل مع الأشخاص الخطيرين، خصوصًا ذوي الاضطراب النفسي الذين يشكلون نحو 2% من البشر. هؤلاء يفتقرون إلى التعاطف، يتقنون التلاعب، ولا يترددون في استغلال أو تدمير الآخرين لتحقيق مصالحهم. يوضح الكتاب السمات المشتركة للاختلال النفسي، طرق تصرفهم في العمل والحياة الشخصية، وأساليب التلاعب التي يستخدمونها. كما يقدم أدوات لحماية النفس من الاستغلال، وكيفية مواجهة هؤلاء الأشخاص بوعي وحزم. يتضمن الكتاب أيضًا اختبارًا للتعرف على سمات الاختلال النفسي، مما يجعله دليلاً عمليًا للتعامل مع أخطر أنماط الشخصيات في محيطنا.",
    price: 432,
    priceUSD: 10.5,
    originalPrice: 576,
    originalPriceUSD: 14,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook9.jpg",
    author: "توماس إريكسون",
    },
    {
    id: 10,
    title: "عقدك النفسية سجنك الأبدي",
    category: "فلسفة و علم نفس",
    description: "كتاب عقدك النفسية سجنك الأبدي للدكتور يوسف الحسني يسلّط الضوء على العقد النفسية والصراعات الداخلية التي تعيق الفرد عن تحقيق السعادة والنجاح. يكشف كيف نصبح أسرى لموروثات فكرية وعاطفية لا تخصنا، مما يجعلنا نعيش باستحقاق زائف. يساعد الكتاب القارئ على تشخيص حالته النفسية، فهم جذور مشكلاته، وتأثيرها على سلوكه وعلاقاته، كما يقدم رؤى وأساليب عملية للتغلب على هذه العقد والتحرر منها لبناء حياة أكثر صحة وتوازنًا نفسيًا.",
    price: 462.75,
    priceUSD: 11.25,
    originalPrice: 617,
    originalPriceUSD: 15,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook10.jpg",
    author: "د. يوسف الحسني",
    },

    // =========================================================================================== //

    // الأدب
    {
    id: 1,
    title: "نبوءات الجائعين",
    category: "الأدب",
    description: "..",
    price: 132,
    priceUSD: 3.2,
    originalPrice: 165,
    originalPriceUSD: 4,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook1.jpg",
    author: "أيمن العتوم"
    },
    {
    id: 2,
    title: "قلبي عليك حبيبتي",
    category: "الأدب",
    description: "..",
    price: 132,
    priceUSD: 3.2,
    originalPrice: 165,
    originalPriceUSD: 4,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook2.jpg",
    author: "أيمن العتوم"
    },
    {
    id: 3,
    title: "طيور القدس",
    category: "الأدب",
    description: "..",
    price: 132,
    priceUSD: 3.2,
    originalPrice: 165,
    originalPriceUSD: 4,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook3.jpg",
    author: "أيمن العتوم"
    },
    {
    id: 4,
    title: "خذني الى المسجد الأقصى",
    category: "الأدب",
    description: "..",
    price: 132,
    priceUSD: 3.2,
    originalPrice: 165,
    originalPriceUSD: 4,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook4.jpg",
    author: "أيمن العتوم"
    },
    {
    id: 5,
    title: "الزنابق",
    category: "الأدب",
    description: "..",
    price: 132,
    priceUSD: 3.2,
    originalPrice: 165,
    originalPriceUSD: 4,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook5.jpg",
    author: "أيمن العتوم"
    },
    {
    id: 6,
    title: "وتلك الأيام",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook6.jpg",
    author: "أدهم الشرقاوي"
    },
    {
    id: 7,
    title: "خمسون قانونا للحب",
    category: "الأدب",
    description: "..",
    price: 428,
    priceUSD: 10.4,
    originalPrice: 535,
    originalPriceUSD: 13,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook7.jpg",
    author: "أدهم الشرقاوي"
    },
    {
    id: 8,
    title: "رسائل من النبي",
    category: "الأدب",
    description: "..",
    price: 461,
    priceUSD: 11.2,
    originalPrice: 576.25,
    originalPriceUSD: 14,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook8.jpg",
    author: "أدهم الشرقاوي"
    },
    {
    id: 9,
    title: "رسائل من الصحابة",
    category: "الأدب",
    description: "..",
    price: 461,
    priceUSD: 11.2,
    originalPrice: 576.25,
    originalPriceUSD: 14,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook9.jpg",
    author: "أدهم الشرقاوي"
    },
    {
    id: 10,
    title: "رسائل من القرآن",
    category: "الأدب",
    description: "..",
    price: 428,
    priceUSD: 10.4,
    originalPrice: 535,
    originalPriceUSD: 13,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook10.jpg",
    author: "أدهم الشرقاوي"
    },
    {
    id: 11,
    title: "على خظى الرسول",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook11.jpg",
    author: ""
    },
    {
    id: 12,
    title: "مع النبي",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook12.jpg",
    author: ""
    },
    {
    id: 13,
    title: "تأملات قصيرة جدًا",
    category: "الأدب",
    description: "..",
    price: 230,
    priceUSD: 5.5,
    originalPrice: 288,
    originalPriceUSD: 7,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook13.jpg",
    author: ""
    },
    {
    id: 14,
    title: "أضغاث أقلام",
    category: "الأدب",
    description: "..",
    price: 230,
    priceUSD: 5.5,
    originalPrice: 288,
    originalPriceUSD: 7,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook14.png",
    author: ""
    },
    {
    id: 15,
    title: "يُحكي أن",
    category: "الأدب",
    description: "..",
    price: 230,
    priceUSD: 5.5,
    originalPrice: 288,
    originalPriceUSD: 7,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook15.jpg",
    author: ""
    },
    {
    id: 16,
    title: "للرجال فقط",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook16.jpg",
    author: ""
    },
    {
    id: 17,
    title: "وإذا الصحف نشرت",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook17.jpg",
    author: ""
    },
    {
    id: 18,
    title: "أنت ايضًا صحابية",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook18.jpg",
    author: ""
    },
    {
    id: 19,
    title: "حديث المساء",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook19.jpg",
    author: ""
    },
    {
    id: 20,
    title: "حديث الصباح",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook20.jpg",
    author: ""
    },
    {
    id: 21,
    title: "عن وطن من لحم ودم",
    category: "الأدب",
    description: "..",
    price: 230,
    priceUSD: 5.5,
    originalPrice: 288,
    originalPriceUSD: 7,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook21.jpg",
    author: ""
    },
    {
    id: 22,
    title: "عن شيء اسمه الحب",
    category: "الأدب",
    description: "..",
    price: 230,
    priceUSD: 5.5,
    originalPrice: 288,
    originalPriceUSD: 7,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook22.jpg",
    author: ""
    },
    {
    id: 23,
    title: "نبأ يقين",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook23.jpg",
    author: ""
    },
    {
    id: 24,
    title: "نحن نقص عليك",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook24.jpg",
    author: ""
    },
    {
      id: 25,
      title: "طرائف العرب 1/2/3",
      category: "الأدب",
      description: "",
      price: 1481,
      priceUSD: 36,
      originalPrice: 1852,
      originalPriceUSD: 45,
      discount: 20,
      image: "/altamoh.bookstore/book-images/Literature/Lbook25.jpg",
      images: [
        "/altamoh.bookstore/book-images/Literature/Lbook25.jpg",
        "/altamoh.bookstore/book-images/Literature/Lbook26.jpg",
        "/altamoh.bookstore/book-images/Literature/Lbook27.jpg"
      ],
      author: "كاتب مجهول"
    },
    {
    id: 26,
    title: "السلام عليك يا صاحبي",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook28.jpg",
    author: ""
    },
    {
    id: 27,
    title: "وبالحق أنزلناه",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook29.jpg",
    author: ""
    },
    {
    id: 28,
    title: "إلى المنكسرة قلوبهم",
    category: "الأدب",
    description: "..",
    price: 395,
    priceUSD: 9.6,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/altamoh.bookstore/book-images/Literature/Lbook30.png",
    author: ""
    },

    // =========================================================================================== //

    // الاقتصاد

    // =========================================================================================== //

    // السياسة
    {
    id: 701,
    title: "فن الحرب",
    category: "سياسة",
    description: "..",
    price: 217,
    priceUSD: 5.25,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Policy/Pbook1.jpg",
    author: "نيكولو مكيافيلي"
    },

    // =========================================================================================== //

    // التطوير الذاتي
  ];
  const displayBooks = books;

  const allCategories = [...new Set(books.map(book => book.category))];
  const priorityCategories = ["الأكثر مبيعاً", "إصدارات دار الطموح"];
  const otherCategories = allCategories.filter(cat => !priorityCategories.includes(cat));
  
  // Add Favorites category only if user is logged in
  const categories = user 
    ? ["المفضلة", ...priorityCategories.filter(cat => allCategories.includes(cat)), ...otherCategories]
    : [...priorityCategories.filter(cat => allCategories.includes(cat)), ...otherCategories];

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      "المفضلة": Heart,
      "الأكثر مبيعاً": Trophy,
      "دين": Book,
      "تاريخ": Compass,
      "علوم": Lightbulb,
      "تحقيق و جريمة": Shield,
      "فلسفة و علم نفس": Brain,
      "أدب": BookOpen,
      "روايات": Feather,
      "طب": Plus,
      "اقتصاد": Trophy,
      "قانون": Users,
      "إصدارات دار الطموح": Award,
      "سياسة": Target,
      "تطوير الذات": Star,
      "التربية": Users
    };
    return iconMap[category] || BookOpen;
  };

  // Enhanced filtering logic
  const filteredBooks = searchTerm && !showCategorySelection 
    ? searchResults
    : books.filter(book => {
        const matchesCategory = !selectedCategory || book.category === selectedCategory;
        return matchesCategory;
      });

  const getBooksByCategory = (category: string) => {
    if (category === "المفضلة") {
      return Array.from(favoriteBooks).slice(0, favoriteBooks.size);
    }
    return books.filter(book => book.category === category);
  };

  const displayedBooks = showCategorySelection ? [] : filteredBooks.slice(0, visibleBooksCount);
  const hasMoreBooks = !showCategorySelection && filteredBooks.length > visibleBooksCount;

  const handleShowMore = () => {
    const increment = isSmallDevice ? 6 : 12;
    setVisibleBooksCount(prev => prev + increment);
  };

  // Cart Functions
  const addToCart = (book: Book) => {
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
    return cart.reduce((total, item) => total + (getPrice(item) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const generateOrderMessage = () => {
    let message = "السلام عليكم، أرغب في طلب الكتب التالية:\n\n";
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.title}\n`;
      message += `   - المؤلف: ${item.author || 'غير محدد'}\n`;
      message += `   - السعر: ${getPrice(item)} ${getCurrencySymbol()}\n`;
      message += `   - الكمية: ${item.quantity}\n`;
      message += `   - المجموع: ${getPrice(item) * item.quantity} ${getCurrencySymbol()}\n\n`;
    });
    
    message += `إجمالي الطلب: ${getTotalPrice()} ${getCurrencySymbol()}\n`;
    message += `عدد الكتب: ${getTotalItems()} كتاب\n\n`;
    message += "أرجو تأكيد الطلب وإعلامي بتفاصيل التوصيل والدفع.";
    
    return message;
  };

  const sendToWhatsApp = () => {
    const message = generateOrderMessage();
    window.open(`https://wa.me/905376791661?text=${encodeURIComponent(message)}`, '_blank');
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    setShowCategorySelection(false);
    setSearchTerm('');
    setIsSearchFocused(false);
    setSearchResults([]);
    // Reset visible books count when selecting a category
    const initialCount = isSmallDevice ? 6 : 12;
    setVisibleBooksCount(initialCount);
    
    // Update history state
    updateHistoryState(category, false, '');
    
    // Scroll to top smoothly after a short delay to ensure state updates
    setTimeout(scrollToTop, 100);
  };

  const goBackToCategories = () => {
    setShowCategorySelection(true);
    setSelectedCategory(null);
    setSearchTerm('');
    setSelectedBook(null);
    setVisibleBooksCount(0);
    setIsSearchFocused(false);
    setSearchResults([]);
    
    // Update history state
    updateHistoryState(null, true, '');
    
    // Scroll to top smoothly
    setTimeout(scrollToTop, 100);
  };

  const openBookDetails = (book: Book) => {
    setSelectedBook(book);
    setCurrentImageIndex(0); // إعادة تعيين فهرس الصورة
    setIsBookModalOpen(true);
  };

  const closeBookModal = () => {
    setIsBookModalOpen(false);
    setSelectedBook(null);
  };

  const generateBookOrderMessage = (book: Book) => {
    let message = "السلام عليكم، أرغب في طلب الكتاب التالي:\n\n";
    message += `الكتاب: ${book.title}\n`;
    message += `المؤلف: ${book.author || 'غير محدد'}\n`;
    message += `الفئة: ${book.category}\n`;
    message += `السعر: ${getPrice(book)} ${getCurrencySymbol()}\n\n`;
    message += "أرجو تأكيد الطلب وإعلامي بتفاصيل التوصيل والدفع.";
    return message;
  };

  const sendBookToWhatsApp = (book: Book) => {
    const message = generateBookOrderMessage(book);
    window.open(`https://wa.me/905376791661?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Enhanced search handler
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    
    if (newSearchTerm.trim()) {
      if (showCategorySelection) {
        setShowCategorySelection(false);
        setSelectedCategory(null);
        setVisibleBooksCount(isSmallDevice ? 6 : 12);
      }
      updateHistoryState(null, false, newSearchTerm);
    } else {
      if (!selectedCategory) {
        setShowCategorySelection(true);
      }
      updateHistoryState(selectedCategory, !selectedCategory, '');
    }
  };

  // Handle search focus
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Simple timeout to hide categories, no scroll interference
    setTimeout(() => {
      if (!keepCategoriesOpen) {
        setIsSearchFocused(false);
      }
    }, 200);
  };

  // Category scroll functions
  const scrollCategoriesLeft = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollCategoriesRight = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Currency Toggle Component
  const CurrencyToggle = () => (
    <div className="relative">
      <div className="w-14 sm:w-16 h-7 sm:h-8 bg-gradient-to-r dark:from-slate-700 dark:to-slate-600 from-gray-200 to-gray-300 rounded-full shadow-inner border dark:border-slate-500/30 border-gray-400/50 transition-colors duration-200">
        
        {/* Moving Toggle Circle */}
        <div 
          className={`absolute top-0.5 left-0.5 w-6 sm:w-7 h-6 sm:h-7 bg-gradient-to-br from-white to-gray-50 dark:from-slate-100 dark:to-slate-200 rounded-full shadow-lg transform transition-transform duration-200 ease-out flex items-center justify-center ${
            selectedCurrency === 'USD' 
              ? 'translate-x-7 sm:translate-x-8' 
              : 'translate-x-0'
          }`}
        >
          {/* Active Currency Symbol */}
          <span className="text-orange-600 font-bold text-xs">
            {selectedCurrency === 'TL' ? '₺' : '$'}
          </span>
        </div>
        
        {/* Background Currency Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-2.5 pointer-events-none">
          <span className={`text-xs font-bold transition-opacity duration-200 ${
            selectedCurrency === 'TL' 
              ? 'opacity-0' 
              : 'opacity-60 text-slate-600 dark:text-slate-300'
          }`}>
          </span>
          <span className={`text-xs font-bold transition-opacity duration-200 ${
            selectedCurrency === 'USD' 
              ? 'opacity-0' 
              : 'opacity-60 text-slate-600 dark:text-slate-300'
          }`}>
          </span>
        </div>
      </div>
      
      {/* Single clickable overlay */}
      <button
        onClick={() => setSelectedCurrency(selectedCurrency === 'TL' ? 'USD' : 'TL')}
        className="absolute inset-0 w-full h-full rounded-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
        aria-label={`تغيير إلى ${selectedCurrency === 'TL' ? 'الدولار' : 'الليرة التركية'}`}
      />
    </div>
  );

  // Categories Scroll Bar Component
  const CategoriesScrollBar = () => (
    <div className={`relative mb-6 transition-all duration-300 ${
      isSearchFocused || keepCategoriesOpen ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
    }`}>
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Left scroll arrow - Better positioned outside */}
        <button
          onClick={scrollCategoriesLeft}
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => setKeepCategoriesOpen(true)}
          className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
        </button>
  
        {/* Categories container - No mouse interference */}
        <div
          ref={categoryScrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-2 py-2 flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setKeepCategoriesOpen(true)}
        >
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category);
            return (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                onMouseDown={(e) => e.preventDefault()}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  category === "المفضلة"
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    : "bg-gradient-to-r from-orange-500/10 to-orange-600/10 hover:from-orange-500/20 hover:to-orange-600/20 dark:bg-slate-700/50 text-orange-600 dark:text-orange-400 hover:scale-105"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="whitespace-nowrap text-sm">{category}</span>
              </button>
            );
          })}
        </div>
  
        {/* Right scroll arrow - Better positioned outside */}
        <button
          onClick={scrollCategoriesRight}
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => setKeepCategoriesOpen(true)}
          className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
        </button>
      </div>
    </div>
  );

  // If Favorites category is selected, show the FavoritesList component with go back functionality
  if (selectedCategory === "المفضلة" && !showCategorySelection) {
    return <FavoritesList onBack={goBackToCategories} />;
  }

  // Book Details Modal Component - Improved mobile responsiveness
  const BookModal = ({ book, isOpen, onClose }: { book: Book | null, isOpen: boolean, onClose: () => void }) => {
    if (!book || !isOpen) return null;

    const isBookFavorite = favoriteBooks.has(book.id.toString());
    const isLoadingFavorite = loadingFavorites.has(book.id.toString());

    // Get all images for the book
  const bookImages = book.images && book.images.length > 0 ? book.images : [book.image];
  const hasMultipleImages = bookImages.length > 1;

  // Navigation functions
  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? bookImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === bookImages.length - 1 ? 0 : prev + 1));
  };

    return (
      <>
        {/* Modal Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={onClose}
        ></div>
        
        {/* Modal Content - Better mobile responsiveness */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div 
            className="relative bg-gradient-to-b dark:from-slate-800 dark:via-slate-900 dark:to-gray-900 from-[#f4f7fb] via-[#f7f9fb] to-[#ffffff] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[98vh] sm:max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100 mx-2 sm:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Hidden on small screens, visible on larger screens */}
            <button
              onClick={onClose}
              className="hidden sm:block absolute top-6 left-6 z-10 p-3 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <X className="h-6 w-6 dark:text-slate-300 text-gray-600" />
            </button>

            {/* Mobile Header - Only visible on small screens */}
            <div className="sm:hidden flex items-center justify-between p-3 border-b dark:border-slate-700/50 border-orange-200/30">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">رجوع</span>
              </button>
              <div className="flex flex-col items-center gap-1">
                {book.discount ? (
                  // Discounted Price with strikethrough original price
                  <>
                    <div className="px-2 py-1 bg-gray-500/80 text-white rounded-lg text-xs line-through">
                      {getOriginalPrice(book)} {getCurrencySymbol()}
                    </div>
                    <div className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg">
                      <span className="text-base font-bold">{getPrice(book)}</span>
                      <span className="text-xs">{getCurrencySymbol()}</span>
                    </div>
                  </>
                ) : (
                  // Regular Price
                  <div className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg">
                    <span className="text-base font-bold">{getPrice(book)}</span>
                    <span className="text-xs">{getCurrencySymbol()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 sm:p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                
                {/* Book Image */}
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={bookImages[currentImageIndex]}
                      alt={`${book.title} - الصورة ${currentImageIndex + 1}`}
                      className="w-48 h-60 sm:w-64 sm:h-80 lg:w-96 lg:h-[600px] object-contain rounded-2xl shadow-2xl"
                    />
                    
                    {/* Navigation Arrows - Only show if there are multiple images */}
                    {hasMultipleImages && (
                      <>
                        {/* Previous Image Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToPreviousImage();
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 lg:w-12 lg:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                        >
                          <ChevronLeft className="h-4 w-4 lg:h-6 lg:w-6" />
                        </button>
                        
                        {/* Next Image Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToNextImage();
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 lg:w-12 lg:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                        >
                          <ChevronRight className="h-4 w-4 lg:h-6 lg:w-6" />
                        </button>
                        </>
                        )}

                      {/* Image Dots Indicator - Only show if there are multiple images */}
                      {hasMultipleImages && (
                        <div className="flex justify-center mt-6 sm:mt-8 md:mt-12 gap-2">
                          {bookImages.map((_, index) => (
                            <span
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                      setCurrentImageIndex(index);
                                    }}
                                    className={`cursor-pointer text-lg font-bold transition-all duration-300 ${
                                      currentImageIndex === index
                                        ? 'text-orange-500'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    •
                              </span>
                            ))}
                        </div>
                      )}
                    {/* Price Badge - Only visible on larger screens */}
                    <div className="hidden sm:block absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-2xl font-bold text-lg lg:text-xl shadow-2xl border-4 border-white dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{getPrice(book)}</span>
                        <span className="text-sm lg:text-lg">{getCurrencySymbol()}</span>
                      </div>
                    </div>
                    
                    {/* Favorite Button - Only show if user is logged in */}
                    {user && (
                      <button
                        onClick={() => handleToggleFavorite(book)}
                        disabled={isLoadingFavorite}
                        className={`absolute top-3 left-3 w-8 h-8 lg:w-12 lg:h-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                          isBookFavorite 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500'
                        } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                      >
                        <Heart 
                          className={`h-4 w-4 lg:h-6 lg:w-6 transition-all duration-300 ${
                            isBookFavorite ? 'fill-current' : ''
                          }`} 
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Book Information */}
                <div className="space-y-4 lg:space-y-8">
                  
                  {/* Title and Author */}
                  <div className="space-y-3">
                    <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold dark:text-white text-[#1d2d50] leading-tight">
                      {book.title}
                    </h1>
                    
                    {book.author && (
                      <p className="text-base sm:text-xl dark:text-slate-300 text-[#6c7a89] font-medium">
                        بقلم: {book.author}
                      </p>
                    )}

                    {/* Discount Banner - Only show if there's a discount */}
                    {book.discount && (
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold text-center shadow-lg animate-pulse">
                        <Percent className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        عرض {book.discount}% - وفر {(getOriginalPrice(book) || 0) - getPrice(book)} {getCurrencySymbol()}
                      </div>
                    )}

                    <div className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30">
                      <Star className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />
                      <span className="text-sm sm:text-base font-medium dark:text-orange-200 text-orange-600">
                        {book.category}
                      </span>
                    </div>
                  </div>

                  {/* Add to Favorites Button for logged in users */}
                  {user && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleFavorite(book)}
                        disabled={isLoadingFavorite}
                        className={`flex items-center gap-2 px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                          isBookFavorite
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gray-200 hover:bg-red-100 text-gray-700 hover:text-red-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                        } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                      >
                        <Heart 
                          className={`h-4 w-4 transition-all duration-300 ${isBookFavorite ? 'fill-current' : ''}`} 
                        />
                        {isLoadingFavorite ? 'جاري التحديث...' : isBookFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                      </button>
                    </div>
                  )}

                  {/* Contact Buttons - Only WhatsApp */}
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-bold dark:text-white text-[#1d2d50]">
                      تواصل معنا لطلب الكتاب
                    </h3>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={() => sendBookToWhatsApp(book)}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:scale-105"
                      >
                        <MessageCircle className="h-5 w-5" />
                        طلب عبر واتساب
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      onClick={() => {
                        addToCart(book);
                        onClose();
                      }}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:scale-105"
                    >
                      <Plus className="h-5 w-5" />
                      أضف إلى السلة
                    </button>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-2xl font-bold dark:text-white text-[#1d2d50]">
                      نبذة عن الكتاب
                    </h3>
                    
                    <div className="p-4 sm:p-6 dark:bg-slate-800/60 bg-white/90 backdrop-blur-sm rounded-2xl border dark:border-slate-700/30 border-orange-200/30 shadow-lg">
                      <p className="text-sm sm:text-lg dark:text-slate-300 text-[#6c7a89] leading-relaxed">
                        {book.description}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <section 
      ref={sectionRef}
      id="books" 
      className="relative py-8 sm:py-16 lg:py-20 min-h-screen overflow-hidden bg-gradient-to-b dark:from-slate-800 dark:via-slate-900 dark:to-gray-900 from-[#f4f7fb] via-[#f7f9fb] to-[#ffffff] transition-all duration-500"
    >
      
      {/* Background Effects */}
      <div className="absolute bottom-5 sm:bottom-20 left-5 sm:left-20 w-32 h-32 sm:w-96 sm:h-96 bg-gradient-to-br dark:from-gray-300/10 dark:to-gray-500/10 from-blue-200/8 to-blue-400/8 rounded-full blur-3xl transition-all duration-500"></div>

      {/* Cart Button - Fixed positioning and proper cart icon */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-3 rounded-full shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-110"
        >
          <ShoppingCart className="h-6 w-6" />
          {getTotalItems() > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
              {getTotalItems()}
            </div>
          )}
        </button>
      </div>

      {/* Cart Sidebar - Improved mobile responsiveness */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-gradient-to-b dark:from-slate-800 dark:via-slate-900 dark:to-gray-900 from-[#f4f7fb] via-[#f7f9fb] to-[#ffffff] shadow-2xl transform transition-transform duration-300 ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-700/50 border-orange-200/30">
            <h3 className="text-lg font-bold dark:text-white text-[#1d2d50] flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
              سلة التسوق
            </h3>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-orange-100 dark:hover:bg-slate-700/50 rounded-full">
              <X className="h-5 w-5 dark:text-slate-400 text-[#6c7a89]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 dark:text-slate-500 text-orange-400" />
                <p className="dark:text-slate-300 text-[#1d2d50]">سلة التسوق فارغة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 dark:bg-slate-800/60 bg-white/90 rounded-2xl shadow-lg">
                    <img src={item.image} alt={item.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold dark:text-white text-[#1d2d50] text-sm line-clamp-2">{item.title}</h4>
                      <p className="text-orange-600 font-bold text-sm">{getPrice(item)} {getCurrencySymbol()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-1 text-sm min-w-[20px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded">
                          <Plus className="h-4 w-4" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded ml-2">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t dark:border-slate-700/50 border-orange-200/30 p-4 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span className="dark:text-white text-[#1d2d50]">المجموع:</span>
                <span className="text-orange-600">{getTotalPrice()} {getCurrencySymbol()}</span>
              </div>
              <div className="space-y-3">
                <button onClick={sendToWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  واتساب
                </button>
              </div>
              <button onClick={clearCart} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold text-sm">
                إفراغ السلة
              </button>
            </div>
          )}
        </div>
      </div>

      {isCartOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsCartOpen(false)}></div>}

      {/* Book Details Modal */}
      <BookModal book={selectedBook} isOpen={isBookModalOpen} onClose={closeBookModal} />

      <div className="container mx-auto px-3 sm:px-6 lg:px-4 relative z-10">
        <div className={`text-center mb-8 sm:mb-12 lg:mb-16 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center px-3 sm:px-5 py-2 sm:py-3 rounded-full dark:bg-slate-800/40 bg-white/60 backdrop-blur-sm mb-4 sm:mb-6 gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-sm sm:text-base dark:text-orange-200 text-orange-600">إصدارات حصرية ومتميزة</span>
          </div>

          <h2 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold dark:text-white text-[#1d2d50] mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">مكتبة</span> الطموح
          </h2>

          <p className="text-base sm:text-lg lg:text-xl dark:text-slate-300 text-[#6c7a89] max-w-2xl mx-auto leading-relaxed px-2">
            مجموعة متنوعة من الإصدارات الحصرية والمتميزة من دار الطموح للنشر والتوزيع
          </p>

          {/* Enhanced Search Bar with Currency Toggle */}
          <div className="max-w-2xl mx-auto mt-8 sm:mt-12">
            <div className="flex gap-3 items-center">
              {/* Currency Toggle - Now on the left */}
              <CurrencyToggle />
              
              {/* Search Input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 dark:text-slate-400 text-[#6c7a89]" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={showCategorySelection ? "البحث في جميع الكتب والفئات..." : selectedCategory ? `البحث في ${selectedCategory}...` : "البحث في جميع الكتب..."}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-4 dark:bg-slate-800/60 bg-white/90 backdrop-blur-sm border dark:border-slate-700/30 border-orange-200/30 rounded-xl sm:rounded-2xl dark:text-white text-[#1d2d50] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm sm:text-base lg:text-lg shadow-lg"
                />
              </div>
            </div>

            {/* Categories Scroll Bar - Shows when search is focused */}
            <CategoriesScrollBar />
          </div>

          {!showCategorySelection && (
            <button
              onClick={goBackToCategories}
              className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              العودة للفئات
            </button>
          )}
        </div>

        {showCategorySelection && (
          <div 
            ref={categoryGridRef}
            className={`transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-6 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold dark:text-white text-[#1d2d50] mb-3 sm:mb-4">
                اختر فئة من الكتب
              </h3>
              <p className="text-sm sm:text-base lg:text-lg dark:text-slate-300 text-[#6c7a89] px-2">
                استكشف مجموعتنا المتنوعة من الكتب في مختلف المجالات
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-12 sm:mb-16">
              {categories.map((category) => {
                const categoryBooks = getBooksByCategory(category);
                const IconComponent = getCategoryIcon(category);
                
                return (
                  <div key={category} className="group">
                    <div className={`${
                      category === "المفضلة" 
                        ? "dark:bg-gradient-to-br dark:from-red-900/30 dark:via-red-800/30 dark:to-red-700/30 bg-gradient-to-br from-red-50/80 to-red-100/60 border-red-500/30"
                        : "dark:bg-slate-800/60 bg-white/90 border-orange-200/30 dark:border-slate-700/30"
                    } backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-105 border h-full`}>
                      
                      <div className={`relative p-3 sm:p-4 lg:p-6 ${
                        category === "المفضلة"
                          ? "bg-gradient-to-r dark:from-red-800/60 dark:to-red-700/60 from-red-100/80 to-red-200/60"
                          : "bg-gradient-to-r dark:from-slate-700/60 dark:to-slate-600/60 from-orange-50/80 to-orange-100/60"
                      } text-center`}>
                        <div className={`absolute top-2 sm:top-4 right-2 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 ${
                          category === "المفضلة" ? "bg-red-400" : "bg-orange-400"
                        } rounded-full animate-pulse`}></div>
                        
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 ${
                          category === "المفضلة"
                            ? "bg-gradient-to-br from-red-500/20 to-red-600/20"
                            : "bg-gradient-to-br from-orange-500/20 to-orange-600/20"
                        } rounded-lg sm:rounded-xl flex items-center justify-center`}>
                          <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${
                            category === "المفضلة" ? "text-red-500" : "text-orange-500"
                          }`} />
                        </div>
                        
                        <h4 className="text-xl sm:text-base lg:text-lg font-bold dark:text-white text-[#1d2d50] mb-1 sm:mb-2 line-clamp-2">
                          {category}
                        </h4>
                      </div>

                      <div className="p-2 sm:p-3 lg:p-4 flex-1 flex flex-col justify-between">
                        <div className="mb-3 sm:mb-4">
                        </div>

                        <button
                          onClick={() => selectCategory(category)}
                          className={`w-full py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-2 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm hover:scale-105 ${
                            category === "المفضلة"
                              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                              : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                          }`}
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          تصفح {category}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!showCategorySelection && selectedCategory !== "المفضلة" && (
          <div className={`transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            
            {selectedCategory && (
              <div className="text-center mb-6 sm:mb-12">
                <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r dark:from-slate-700/60 dark:to-slate-600/60 from-orange-50/80 to-orange-100/60 rounded-xl sm:rounded-2xl">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  <span className="text-sm sm:text-base lg:text-lg font-semibold dark:text-white text-[#1d2d50]">
                    فئة: {selectedCategory}
                  </span>
                  <span className="text-xs sm:text-sm dark:text-slate-300 text-[#6c7a89] bg-orange-500/20 px-2 sm:px-3 py-1 rounded-lg">
                    {filteredBooks.length} كتاب
                  </span>
                </div>
              </div>
            )}

            {/* Search Results Info */}
            {searchTerm && !selectedCategory && (
              <div className="text-center mb-6 sm:mb-12">
                <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r dark:from-slate-700/60 dark:to-slate-600/60 from-orange-50/80 to-orange-100/60 rounded-xl sm:rounded-2xl">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  <span className="text-sm sm:text-base lg:text-lg font-semibold dark:text-white text-[#1d2d50]">
                    نتائج البحث: "{searchTerm}"
                  </span>
                  <span className="text-xs sm:text-sm dark:text-slate-300 text-[#6c7a89] bg-orange-500/20 px-2 sm:px-3 py-1 rounded-lg">
                    {filteredBooks.length} كتاب
                  </span>
                  {isSearching && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  )}
                </div>
              </div>
            )}

            <div 
              ref={booksGridRef}
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 justify-items-center"
            >
              {displayedBooks.map((book) => {
                const isBookFavorite = favoriteBooks.has(book.id.toString());
                const isLoadingFavorite = loadingFavorites.has(book.id.toString());

                return (
                  <div key={book.id} className="group relative transition-all duration-500 hover:scale-105 w-full max-w-[260px] sm:max-w-sm cursor-pointer"
                       onClick={() => openBookDetails(book)}>
                    <div className="relative dark:bg-slate-800/60 bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl">
                      
                      <div className="absolute left-0 top-0 w-1 sm:w-2 h-full bg-gradient-to-b from-green-400 to-green-600 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative h-48 sm:h-64 lg:h-80 dark:bg-slate-700/20 bg-green-50/30 p-2 sm:p-3 lg:p-4 flex items-center justify-center">
                        <img 
                          src={book.image} 
                          alt={book.title}
                          className="h-44 sm:h-56 lg:h-72 w-28 sm:w-40 lg:w-52 object-contain rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105"/>

                        {/* Price Badge */}
                        <div className="absolute top-1 sm:top-3 lg:top-4 left-1 sm:left-3 lg:left-4">
                          {book.discount ? (
                            // Discounted Price with strikethrough original price
                            <div className="flex flex-col items-center gap-1">
                              <div className="bg-gray-500/80 text-white px-1.5 sm:px-2 py-0.5 rounded text-xs line-through">
                                {getOriginalPrice(book)} {getCurrencySymbol()}
                              </div>
                              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded text-xs sm:text-sm font-bold shadow-lg">
                                {getPrice(book)} {getCurrencySymbol()}
                              </div>
                            </div>
                          ) : (
                            // Regular Price
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded text-xs sm:text-sm font-bold shadow-lg">
                              {getPrice(book)} {getCurrencySymbol()}
                            </div>
                          )}
                        </div>

                        {/* Favorite Button - Only show if user is logged in */}
                        {user && (
                          <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(book);
                          }}
                          disabled={isLoadingFavorite}
                          className={`absolute top-1 sm:top-3 lg:top-4 right-1 sm:right-3 lg:right-4 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                            isBookFavorite 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500'
                          } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                        >
                          <Heart 
                            className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 transition-all duration-300 ${
                              isBookFavorite ? 'fill-current' : ''
                            }`} 
                          />
                        </button>
                        )}
                      </div>
                      
                      <div className="p-2 sm:p-4 lg:p-6 space-y-1 sm:space-y-3 lg:space-y-4">
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1.5 lg:py-2 rounded-lg text-orange-400 dark:bg-orange-400/10 bg-orange-400/15">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="line-clamp-1 text-xs sm:text-sm">{book.category.length > 8 ? book.category.substring(0, 8) + '...' : book.category}</span>
                        </span>
                        
                        <h3 className="text-xs sm:text-base lg:text-lg font-bold dark:text-white text-[#1d2d50] line-clamp-2 leading-relaxed">
                          {book.title}
                        </h3>
                        
                        {book.author && (
                          <p className="dark:text-slate-400 text-[#6c7a89] text-xs sm:text-sm font-medium line-clamp-1">
                            بقلم: {book.author}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More Button */}
            {hasMoreBooks && (
              <div className="text-center mt-8 sm:mt-12">
                <button
                  onClick={handleShowMore}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  عرض المزيد من الكتب
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <p className="text-xs sm:text-sm dark:text-slate-400 text-[#6c7a89] mt-2">
                  عرض {displayedBooks.length} من أصل {filteredBooks.length} كتاب
                </p>
              </div>
            )}

            {filteredBooks.length > 0 && selectedCategory !== "المفضلة" && !hasMoreBooks && (
              <div className="text-center mt-8 sm:mt-12">
                <p className="dark:text-slate-400 text-[#6c7a89] text-sm sm:text-base">
                  {selectedCategory 
                    ? `تم عرض جميع الكتب في فئة ${selectedCategory}`
                    : searchTerm 
                    ? `تم عرض جميع نتائج البحث عن "${searchTerm}"`
                    : `تم عرض جميع الكتب من إصدارات دار الطموح`
                  }
                </p>
              </div>
            )}

            {filteredBooks.length === 0 && selectedCategory !== "المفضلة" && (
              <div className="text-center py-12 sm:py-24">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 dark:text-slate-500 text-[#6c7a89]" />
                <h3 className="dark:text-slate-300 text-[#6c7a89] text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
                  لم يتم العثور على نتائج
                </h3>
                <p className="dark:text-slate-500 text-[#6c7a89] mb-6 sm:mb-8 text-sm sm:text-base px-4">
                  {searchTerm 
                    ? `لم يتم العثور على كتب تحتوي على "${searchTerm}"`
                    : `لا توجد كتب في فئة ${selectedCategory} حالياً`
                  }
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                    setShowCategorySelection(true);
                    setSearchResults([]);
                    updateHistoryState(null, true, '');
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 text-sm sm:text-base"
                >
                  مسح البحث والعودة للفئات
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-3 sm:py-5 bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm border border-orange-500/30 rounded-xl sm:rounded-2xl">
            <Star className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-orange-400 animate-pulse" />
            <span className="text-orange-400 font-bold text-sm sm:text-lg lg:text-xl">مكتبة دار الطموح</span>
            <Star className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-orange-400 animate-pulse" />
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
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
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
            background: rgba(255, 166, 0, 0.3);
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 166, 0, 0.5);
          }
          
          @media (max-width: 640px) {
            .container {
              padding-left: 0.75rem;
              padding-right: 0.75rem;
            }
          }
          
          html {
            scroll-behavior: smooth;
          }

          /* Smooth transitions for search states */
          .search-transition {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Enhanced focus styles */
          input:focus {
            transform: translateY(-1px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 3px rgba(255, 166, 0, 0.1);
          }

          /* Smooth category scroll */
          .category-scroll {
            scroll-behavior: smooth;
            transition: transform 0.3s ease;
          }

          /* Loading animation */
          @keyframes pulse-search {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }

          .animate-pulse-search {
            animation: pulse-search 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `
      }} />
    </section>
  );
};

export default Books;



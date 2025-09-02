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
  const [shuffledBooks, setShuffledBooks] = useState<Book[]>([]);
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

  useEffect(() => {
    setShuffledBooks(shuffleArray([...books]));
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
  }, [searchTerm, shuffledBooks]);

  const performSearch = (query: string) => {
    setIsSearching(true);
    
    const lowerQuery = query.toLowerCase().trim();
    const results = shuffledBooks.filter(book => {
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
      {
      id: 3,
      title: "TEST",
      category: "إصدارات دار الطموح",
      description: "TEST",
      price: 1000,
      priceUSD: 1000,
      image: "/altamoh.bookstore/assets/test.jpg",
      },
      {
      id: 6,
      title: "TEST",
      category: "إصدارات دار الطموح",
      description: "TEST",
      price: 1000,
      priceUSD: 1000,
      image: "/altamoh.bookstore/assets/test.jpg",
      },
      {
      id: 8,
      title: "TEST",
      category: "إصدارات دار الطموح",
      description: "TEST",
      price: 1000,
      priceUSD: 1000,
      image: "/altamoh.bookstore/assets/test.jpg",
      },
      {
      id: 7,
      title: "TEST",
      category: "إصدارات دار الطموح",
      description: "TEST",
      price: 1000,
      priceUSD: 1000,
      image: "/altamoh.bookstore/assets/test.jpg",
      },

      // الكتب الأكثر مبيعاً
      {
      id: 3,
      title: "TEST",
      category: "الكتب الأكثر مبيعاً",
      description: "TEST",
      price: 800,
      priceUSD: 800,
      originalPrice: 1000,
      originalPriceUSD: 1000,
      discount: 25,
      image: "/altamoh.bookstore/assets/test.jpg",
      },
      {
      id: 8,
      title: "TEST",
      category: "الكتب الأكثر مبيعاً",
      description: "TEST",
      price: 1000,
      priceUSD: 1000,
      image: "/altamoh.bookstore/assets/test.jpg",
      },
      {
      id: 12,
      title: "TEST",
      category: "الكتب الأكثر مبيعاً",
      description: "TEST",
      price: 750,
      priceUSD: 750,
      originalPrice: 1000,
      originalPriceUSD: 1000,
      discount: 25,
      image: "/altamoh.bookstore/assets/test.jpg",
      },
      {
      id: 36,
      title: "TEST",
      category: "الكتب الأكثر مبيعاً",
      description: "TEST",
      price: 1000,
      priceUSD: 1000,
      image: "/altamoh.bookstore/assets/test.jpg",
      },
      {
      id: 74,
      title: "TEST",
      category: "الكتب الأكثر مبيعاً",
      description: "TEST",
      price: 850,
      priceUSD: 850,
      originalPrice: 1000,
      originalPriceUSD: 1000,
      discount: 15,
      image: "/altamoh.bookstore/assets/test.jpg",
      },
      {
      id: 34,
      title: "TEST",
      category: "الكتب الأكثر مبيعاً",
      description: "TEST",
      price: 1000,
      priceUSD: 1000,
      image: "/altamoh.bookstore/assets/test.jpg",
      },

      // الدين
      {
      id: 3,
      title: "القرآن الكريم",
      category: "دين",
      description: "القرآن الكريم",
      price: 360,
      priceUSD: 96,
      originalPrice: 450,
      originalPriceUSD: 120,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Din/Dinbook1.png",
      },
      {
      id: 101,
      title: "صحيح البخاري",
      category: "دين",
      description: "أصح كتب الحديث بعد القرآن الكريم، جمع فيه الإمام البخاري الأحاديث الصحيحة",
      price: 520,
      priceUSD: 139,
      image: "/altamoh.bookstore/book-images/Din/Dinbook2.jpg",
      author: "الإمام البخاري"
      },
      {
      id: 102,
      title: "صحيح مسلم",
      category: "دين",
      description: "ثاني أصح كتاب في الحديث",
      price: 416,
      priceUSD: 111,
      originalPrice: 520,
      originalPriceUSD: 139,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Din/Dinbook3.jpg",
      author: "الإمام البخاري"
      },
      {
      id: 103,
      title: "رياض الصالحين من كلام سيد المرسلين",
      category: "دين",
      description: "مجموعة من الأحاديث النبوية الشريفة في مختلف أبواب الدين والأخلاق",
      price: 320,
      priceUSD: 85,
      image: "/altamoh.bookstore/book-images/Din/Dinbook4.jpg",
      author: "الإمام النووي"
      },
      {
      id: 104,
      title: "إحياء علوم الدين",
      category: "دين",
      description: "موسوعة في العلوم الإسلامية تجمع بين الفقه والتصوف والأخلاق",
      price: 544,
      priceUSD: 145,
      originalPrice: 680,
      originalPriceUSD: 181,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Din/Dinbook5.jpg",
      author: "الإمام الغزالي"
      },
      {
      id: 105,
      title: "زاد المعاد في هدي خير العباد",
      category: "دين",
      description: "كتاب شامل في السيرة النبوية والفقه والأخلاق الإسلامية",
      price: 450,
      priceUSD: 120,
      image: "/altamoh.bookstore/book-images/Din/Dinbook6.jpg",
      author: "ابن قيم الجوزية"
      },
      {
      id: 106,
      title: "الرحيق المختوم",
      category: "دين",
      description: "سيرة الرسول صلى الله عليه وسلم مكتوبة بأسلوب معاصر وشامل",
      price: 304,
      priceUSD: 81,
      originalPrice: 380,
      originalPriceUSD: 101,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Din/Dinbook7.jpeg",
      author: "صفي الرحمن المباركفوري"
      },

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
          "/altamoh.bookstore/book-images/Novels/war&peace4.jpg",
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
          "/altamoh.bookstore/book-images/Novels/witcher4.jpg"
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

    // التربية
    {
      id: 1,
      title: "8  لتربية أبناء ناجحين",
      category: "التربية",
      description: "..",
      price: 309,
      priceUSD: 7.5,
      originalPrice: 412,
      originalPriceUSD: 10,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Education/Edbook1.jpg",
      author: "د. كيفين ليمان"
    },
    {
      id: 2,
      title: "فكر بعقل طفلك",
      category: "التربية",
      description: "..",
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
      description: "..",
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
      description: "..",
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
      description: "..",
      price: 494.25,
      priceUSD: 12,
      originalPrice: 659,
      originalPriceUSD: 16,
      discount: 25,
      image: "/altamoh.bookstore/book-images/Education/Edbook5.jpg",
      author: "د. جابور ماتيه"
    },

    // التاريخ
    {
    id: 201,
    title: "البداية والنهاية",
    category: "تاريخ",
    description: "موسوعة تاريخية شاملة من بداية الخلق حتى نهاية الزمان",
    price: 850,
    priceUSD: 227,
    image: "/altamoh.bookstore/book-images/History/Hbook1.jpg",
    author: "ابن كثير",
    },
    {
    id: 202,
    title: "تاريخ الطبري",
    category: "تاريخ",
    description: "تاريخ الرسل والملوك، من أهم المراجع التاريخية الإسلامية",
    price: 576,
    priceUSD: 154,
    originalPrice: 720,
    originalPriceUSD: 192,
    discount: 25,
    image: "/altamoh.bookstore/book-images/History/Hbook2.jpg",
    author: "الطبري",
    },
    {
    id: 203,
    title: "الكامل في التاريخ",
    category: "تاريخ",
    description: "موسوعة تاريخية شاملة تغطي تاريخ العالم الإسلامي",
    price: 680,
    priceUSD: 181,
    image: "/altamoh.bookstore/book-images/History/Hbook3.jpg",
    author: "ابن الأثير",
    },
    {
    id: 204,
    title: "السيرة النبوية",
    category: "تاريخ",
    description: "سيرة الرسول صلى الله عليه وسلم مفصلة ومدققة",
    price: 357,
    priceUSD: 95,
    originalPrice: 420,
    originalPriceUSD: 112,
    discount: 15,
    image: "/altamoh.bookstore/book-images/History/Hbook4.jpg",
    author: "ابن هشام",
    },
    {
    id: 205,
    title: "الحرب البيلوبونيزية",
    category: "تاريخ",
    description: "تاريخ الحرب الشهيرة بين أثينا وإسبرطة في اليونان القديمة",
    price: 380,
    priceUSD: 101,
    image: "/altamoh.bookstore/book-images/History/Hbook5.png",
    author: "ثوكيديدس",
    },
    {
    id: 206,
    title: "قصة الحضارة",
    category: "تاريخ",
    description: "موسوعة شاملة لتاريخ الحضارات الإنسانية عبر العصور",
    price: 712.5,
    priceUSD: 189.75,
    originalPrice: 950,
    originalPriceUSD: 253,
    discount: 25,
    image: "/altamoh.bookstore/book-images/History/Hbook6.jpeg",
    author: "ول ديورانت",
    },

    // التحقيق والجريمة
    {
    id: 301,
    title: "دراسة في اللون القرمزي",
    category: "تحقيق و جريمة",
    description: "أول مغامرات شيرلوك هولمز مع الدكتور واتسون في حل الجرائم الغامضة",
    price: 272,
    priceUSD: 72.25,
    originalPrice: 320,
    originalPriceUSD: 85,
    discount: 15,
    image: "/altamoh.bookstore/book-images/Crime/Cbook1.jpg",
    author: "آرثر كونان دويل",
    },
    {
    id: 302,
    title: "كلب آل باسكرفيل",
    category: "تحقيق و جريمة",
    description: "من أشهر قصص شيرلوك هولمز، قصة مليئة بالغموض والإثارة",
    price: 340,
    priceUSD: 91,
    image: "/altamoh.bookstore/book-images/Crime/Cbook2.png",
    author: "آرثر كونان دويل",
    },
    {
    id: 303,
    title: "جريمة في قطار الشرق السريع",
    category: "تحقيق و جريمة",
    description: "رواية بوليسية كلاسيكية من أعمال أجاثا كريستي الشهيرة",
    price: 288,
    priceUSD: 76.8,
    originalPrice: 360,
    originalPriceUSD: 96,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Crime/Cbook3.png",
    author: "أجاثا كريستي",
    },
    {
    id: 304,
    title: "ثم لم يبقى أحد",
    category: "تحقيق و جريمة",
    description: "رواية إثارة وتشويق من روائع أجاثا كريستي",
    price: 350,
    priceUSD: 93,
    image: "/altamoh.bookstore/book-images/Crime/Cbook4.jpg",
    author: "أجاثا كريستي",
    },
    {
    id: 305,
    title: "البيت المائل",
    category: "تحقيق و جريمة",
    description: "قصة جريمة معقدة تكشف أسرار عائلة غامضة",
    price: 247.5,
    priceUSD: 66,
    originalPrice: 330,
    originalPriceUSD: 88,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Crime/Cbook5.jpg",
    author: "أجاثا كريستي",
    },
    {
    id: 306,
    title: "دور علم البصمات",
    category: "تحقيق و جريمة",
    description: "كتاب علمي يشرح استخدام البصمات في التحقيقات الجنائية",
    price: 280,
    priceUSD: 75,
    image: "/altamoh.bookstore/book-images/Crime/Cbook6.jpg",
    author: "د. عالم التحقيق",
    },
    {
    id: 307,
    title: "شيتلر",
    category: "تحقيق و جريمة",
    description: "رواية بوليسية مثيرة تدور أحداثها حول جرائم غامضة",
    price: 279,
    priceUSD: 74.7,
    originalPrice: 310,
    originalPriceUSD: 83,
    discount: 10,
    image: "/altamoh.bookstore/book-images/Crime/Cbook7.jpg",
    author: "كاتب مجهول",
    },
    {
    id: 308,
    title: "بدم بارد",
    category: "تحقيق و جريمة",
    description: "قصة حقيقية مروعة عن جريمة قتل هزت أمريكا",
    price: 380,
    priceUSD: 101,
    image: "/altamoh.bookstore/book-images/Crime/Cbook8.jpg",
    author: "ترومان كابوتي",
    },

    // الفلسفة وعلم النفس
    {
    id: 1,
    title: "اعرف وجهك الآخر",
    category: "فلسفة و علم نفس",
    description: "عمل رائد في علم النفس التحليلي يكشف أسرار اللاوعي",
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
    description: "عمل رائد في علم النفس التحليلي يكشف أسرار اللاوعي",
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
    description: "عمل رائد في علم النفس التحليلي يكشف أسرار اللاوعي",
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
    description: "عمل رائد في علم النفس التحليلي يكشف أسرار اللاوعي",
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
    description: "عمل رائد في علم النفس التحليلي يكشف أسرار اللاوعي",
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
    description: "عمل رائد في علم النفس التحليلي يكشف أسرار اللاوعي",
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
    description: "عمل رائد في علم النفس التحليلي يكشف أسرار اللاوعي",
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
    description: "عمل رائد في علم النفس التحليلي يكشف أسرار اللاوعي",
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
    description: "عمل رائد في علم النفس التحليلي يكشف أسرار اللاوعي",
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
    description: "عمل رائد في علم النفس التحليلي يكشف أسرار اللاوعي",
    price: 462.75,
    priceUSD: 11.25,
    originalPrice: 617,
    originalPriceUSD: 15,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Philosophy & Psychology/Ppbook10.jpg",
    author: "د. يوسف الحسني",
    },

    // الأدب
    {
    id: 501,
    title: "الأبله",
    category: "أدب",
    description: "رواية نفسية عميقة تتناول صراع الخير والشر في النفس البشرية",
    price: 336,
    priceUSD: 89.6,
    originalPrice: 420,
    originalPriceUSD: 112,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Literature/Lbook1.jpg",
    author: "فيودور دوستويفسكي",
    },
    {
    id: 502,
    title: "الجريمة والعقاب",
    category: "أدب",
    description: "رواية فلسفية عظيمة تستكشف طبيعة الإنسان والأخلاق",
    price: 450,
    priceUSD: 120,
    image: "/altamoh.bookstore/book-images/Literature/Lbook2.jpg",
    author: "فيودور دوستويفسكي",
    },
    {
    id: 503,
    title: "الإخوة كارامازوف",
    category: "أدب",
    description: "آخر روايات دوستويفسكي وأعمقها فلسفياً ونفسياً",
    price: 416,
    priceUSD: 111.2,
    originalPrice: 520,
    originalPriceUSD: 139,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Literature/Lbook3.jpg",
    author: "فيودور دوستويفسكي",
    },
    {
    id: 504,
    title: "الحرب والسلام",
    category: "أدب",
    description: "ملحمة أدبية عظيمة تصور روسيا في عهد نابليون",
    price: 680,
    priceUSD: 181,
    image: "/altamoh.bookstore/book-images/Literature/Lbook4.jpg",
    author: "ليو تولستوي",
    },
    {
    id: 505,
    title: "آنا كارنينا",
    category: "أدب",
    description: "رواية عاطفية عميقة تصور المجتمع الروسي في القرن التاسع عشر",
    price: 384,
    priceUSD: 102.4,
    originalPrice: 480,
    originalPriceUSD: 128,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Literature/Lbook5.jpg",
    author: "ليو تولستوي",
    },
    {
    id: 506,
    title: "البؤساء",
    category: "أدب",
    description: "ملحمة أدبية اجتماعية تصور معاناة الطبقات الفقيرة في فرنسا",
    price: 650,
    priceUSD: 173,
    image: "/altamoh.bookstore/book-images/Literature/Lbook6.jpg",
    author: "فيكتور هوغو",
    },
    {
    id: 507,
    title: "أحدب نوتردام",
    category: "أدب",
    description: "رواية رومانسية تراجيدية تدور حول كاتدرائية نوتردام",
    price: 357,
    priceUSD: 95.2,
    originalPrice: 420,
    originalPriceUSD: 112,
    discount: 15,
    image: "/altamoh.bookstore/book-images/Literature/Lbook7.jpg",
    author: "فيكتور هوغو",
    },
    {
    id: 508,
    title: "مئة عام من العزلة",
    category: "أدب",
    description: "رواية الواقعية السحرية الأشهر في الأدب اللاتيني",
    price: 480,
    priceUSD: 128,
    image: "/altamoh.bookstore/book-images/Literature/Lbook8.jpg",
    author: "غابرييل غارسيا ماركيز",
    },
    {
    id: 509,
    title: "الأيام",
    category: "أدب",
    description: "سيرة ذاتية لعميد الأدب العربي طه حسين",
    price: 297.5,
    priceUSD: 79.05,
    originalPrice: 350,
    originalPriceUSD: 93,
    discount: 15,
    image: "/altamoh.bookstore/book-images/Literature/Lbook9.jpeg",
    author: "طه حسين",
    },
    {
    id: 510,
    title: "مدام بوفاري",
    category: "أدب",
    description: "رواية واقعية تحليلية تصور المجتمع البرجوازي الفرنسي",
    price: 380,
    priceUSD: 101,
    image: "/altamoh.bookstore/book-images/Literature/Lbook10.jpeg",
    author: "غوستاف فلوبير",
    },
    {
    id: 511,
    title: "الغريب",
    category: "أدب",
    description: "رواية وجودية تستكشف معنى الحياة واللامعنى",
    price: 256,
    priceUSD: 68,
    originalPrice: 320,
    originalPriceUSD: 85,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Literature/Lbook11.jpeg",
    author: "ألبير كامو",
    },
    {
    id: 512,
    title: "اللص والكلاب",
    category: "أدب",
    description: "رواية واقعية نقدية من أعمال نوبل الأدب نجيب محفوظ",
    price: 280,
    priceUSD: 75,
    image: "/altamoh.bookstore/book-images/Literature/Lbook12.jpg",
    author: "نجيب محفوظ"
    },
    {
    id: 513,
    title: "بين القصرين",
    category: "أدب",
    description: "الجزء الأول من الثلاثية الشهيرة لنجيب محفوظ",
    price: 297.5,
    priceUSD: 79.05,
    originalPrice: 350,
    originalPriceUSD: 93,
    discount: 15,
    image: "/altamoh.bookstore/book-images/Literature/Lbook13.jpg",
    author: "نجيب محفوظ"
    },
    {
    id: 514,
    title: "قصر الشوق",
    category: "أدب",
    description: "الجزء الثاني من ثلاثية نجيب محفوظ الشهيرة",
    price: 350,
    priceUSD: 93,
    image: "/altamoh.bookstore/book-images/Literature/Lbook14.jpg",
    author: "نجيب محفوظ"
    },
    {
    id: 515,
    title: "السكرية",
    category: "أدب",
    description: "الجزء الثالث والأخير من ثلاثية نجيب محفوظ",
    price: 280,
    priceUSD: 74.4,
    originalPrice: 350,
    originalPriceUSD: 93,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Literature/Lbook15.jpg",
    author: "نجيب محفوظ"
    },
    {
    id: 516,
    title: "موسم الهجرة إلى الشمال",
    category: "أدب",
    description: "رواية سودانية مهمة تتناول قضايا الهوية والاستعمار",
    price: 320,
    priceUSD: 85,
    image: "/altamoh.bookstore/book-images/Literature/Lbook16.jpg",
    author: "الطيب صالح"
    },
    {
    id: 517,
    title: "الخبز الحافي",
    category: "أدب",
    description: "رواية مغربية تصور الحياة في الأحياء الشعبية",
    price: 255,
    priceUSD: 68,
    originalPrice: 300,
    originalPriceUSD: 80,
    discount: 15,
    image: "/altamoh.bookstore/book-images/Literature/Lbook17.jpg",
    author: "محمد شكري"
    },
    {
    id: 518,
    title: "رجال في الشمس",
    category: "أدب",
    description: "رواية فلسطينية تصور معاناة اللاجئين الفلسطينيين",
    price: 280,
    priceUSD: 75,
    image: "/altamoh.bookstore/book-images/Literature/Lbook18.jpg",
    author: "غسان كنفاني"
    },
    {
    id: 519,
    title: "عائد إلى حيفا",
    category: "أدب",
    description: "رواية فلسطينية مؤثرة عن النكبة وتأثيرها على الأسر",
    price: 232,
    priceUSD: 61.6,
    originalPrice: 290,
    originalPriceUSD: 77,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Literature/Lbook19.jpg",
    author: "غسان كنفاني"
    },

    // الاقتصاد
    {
    id: 601,
    title: "ثورة الأمم",
    category: "اقتصاد",
    description: "كتاب كلاسيكي في الاقتصاد يؤسس لنظريات الاقتصاد الحديث",
    price: 382.5,
    priceUSD: 102,
    originalPrice: 450,
    originalPriceUSD: 120,
    discount: 15,
    image: "/altamoh.bookstore/book-images/Economy/Ebook1.jpeg",
    author: "آدم سميث"
    },
    {
    id: 602,
    title: "رأس المال",
    category: "اقتصاد",
    description: "تحليل نقدي للنظام الرأسمالي وآليات الإنتاج والتوزيع",
    price: 520,
    priceUSD: 139,
    image: "/altamoh.bookstore/book-images/Economy/Ebook2.jpg",
    author: "كارل ماركس"
    },
    {
    id: 603,
    title: "أخلاقيات الرأسمالية",
    category: "اقتصاد",
    description: "دراسة للجوانب الأخلاقية في النظام الاقتصادي الرأسمالي",
    price: 304,
    priceUSD: 80.8,
    originalPrice: 380,
    originalPriceUSD: 101,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Economy/Ebook3.jpg",
    author: "د. اقتصادي أخلاقي"
    },
    {
    id: 604,
    title: "الاقتصاد العاري",
    category: "اقتصاد",
    description: "شرح مبسط للمفاهيم الاقتصادية المعقدة للقارئ العام",
    price: 320,
    priceUSD: 85,
    image: "/altamoh.bookstore/book-images/Economy/Ebook4.jpg",
    author: "تشارلز ويلان"
    },

    // السياسة
    {
    id: 701,
    title: "الأمير",
    category: "سياسة",
    description: "كتاب كلاسيكي في الفكر السياسي حول فن الحكم والسلطة",
    price: 297.5,
    priceUSD: 79.05,
    originalPrice: 350,
    originalPriceUSD: 93,
    discount: 15,
    image: "/altamoh.bookstore/book-images/Policy/Pbook1.jpg",
    author: "نيكولو مكيافيلي"
    },

    // التطوير الذاتي
    {
    id: 801,
    title: "الذكاء العاطفي",
    category: "تطوير الذات",
    description: "كتاب رائد في تطوير المهارات العاطفية والاجتماعية للنجاح في الحياة",
    price: 280,
    priceUSD: 74.4,
    originalPrice: 350,
    originalPriceUSD: 93,
    discount: 25,
    image: "/altamoh.bookstore/book-images/Self-dev/Sdbook1.jpg",
    author: "دانييل جولمان"
    },
    {
    id: 802,
    title: "فن اللامبالاة",
    category: "تطوير الذات",
    description: "منهج عملي للتركيز على ما يهم حقاً في الحياة",
    price: 320,
    priceUSD: 85,
    image: "/altamoh.bookstore/book-images/Self-dev/Sdbook2.jpeg",
    author: "مارك مانسون"
    }
  ];

  const shuffleArray = (array: Book[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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
    : shuffledBooks.filter(book => {
        const matchesCategory = !selectedCategory || book.category === selectedCategory;
        return matchesCategory;
      });

  const getBooksByCategory = (category: string) => {
    if (category === "المفضلة") {
      return Array.from(favoriteBooks).slice(0, favoriteBooks.size);
    }
    return shuffledBooks.filter(book => book.category === category);
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
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {bookImages.length}
                        </div>
                      </>
                    )}

                    {/* Image Dots Indicator - Only show if there are multiple images */}
                    {hasMultipleImages && (
                      <div className="flex justify-center mt-4 gap-2">
                        {bookImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(index);
                            }}
                            className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
                              currentImageIndex === index 
                                ? 'bg-orange-500 scale-125' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
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

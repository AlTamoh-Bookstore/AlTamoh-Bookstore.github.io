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
  const bestSellersScrollRef = useRef<HTMLDivElement>(null);
  
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
    {
      id: 1,
      title: "دليل استخدام الإنسان",
      category: "إصدارات دار الطموح",
      description: "كتاب فكري يقدم رؤية فلسفية وعملية لفهم الذات الإنسانية وتحسين أدائها في الحياة.",
      price: 439,
      priceUSD: 10.50,
      originalPrice: 439,
      originalPriceUSD: 10.50,
      image: "/book-images/Altomoh/Tbook1.jpg",
      author: "إيهاب القواسمة"
    },
    {
      id: 2,
      title: "بحر المحابر",
      category: "إصدارات دار الطموح",
      description: "مجموعة أدبية تسبح في عوالم الكتابة والإبداع، تقدم تجارب متنوعة في الأدب والفن.",
      price: 335,
      priceUSD: 8.00,
      originalPrice: 335,
      originalPriceUSD: 8.00,
      image: "/book-images/Altomoh/Tbook2.jpg",
      author: "مزنة باكيرو"
    },
    {
      id: 3,
      title: "الأمير",
      category: "إصدارات دار الطموح",
      description: "ترجمة عربية مميزة للكتاب الكلاسيكي في علم السياسة والفلسفة السلطوية.",
      price: 268,
      priceUSD: 6.40,
      originalPrice: 268,
      originalPriceUSD: 6.40,
      image: "/book-images/Altomoh/Tbook3.jpg",
      author: "محمد لطفي جمعة"
    },
    {
      id: 4,
      title: "فلسفة اللذة والألم",
      category: "إصدارات دار الطموح",
      description: "دراسة فلسفية عميقة تبحث في طبيعة اللذة والألم وتأثيرهما على التجربة الإنسانية.",
      price: 368,
      priceUSD: 8.80,
      originalPrice: 368,
      originalPriceUSD: 8.80,
      image: "/book-images/Altomoh/Tbook4.jpg",
      author: "إسماعيل مظهر"
    },
    {
      id: 5,
      title: "دليلك للنجاح في حياتك الشخصية والمهنية",
      category: "إصدارات دار الطموح",
      description: "مرشد عملي يقدم نصائح قيمة لتحقيق النجاح والتوازن في الحياة الشخصية والمهنية.",
      price: 293,
      priceUSD: 7.00,
      originalPrice: 293,
      originalPriceUSD: 7.00,
      image: "/book-images/Altomoh/Tbook5.jpg",
      author: "سلامة موسى"
    },
    {
      id: 6,
      title: "الحب والكراهية",
      category: "إصدارات دار الطموح",
      description: "تحليل نفسي واجتماعي للعاطفتين المتقابلتين وتأثيرهما على العلاقات الإنسانية.",
      price: 167,
      priceUSD: 4.00,
      originalPrice: 167,
      originalPriceUSD: 4.00,
      image: "/book-images/Altomoh/Tbook6.jpg",
      author: "د. أحمد فؤاد الأهواني"
    },
    {
      id: 7,
      title: "ماجدولين",
      category: "إصدارات دار الطموح",
      description: "رواية عاطفية خالدة تروي قصة حب تراجيدية بأسلوب المنفلوطي الشاعري المميز.",
      price: 335,
      priceUSD: 8.00,
      originalPrice: 335,
      originalPriceUSD: 8.00,
      image: "/book-images/Altomoh/Tbook7.jpg",
      author: "مصطفى لطفي المنفلوطي"
    },
    {
      id: 8,
      title: "حديث القمر",
      category: "إصدارات دار الطموح",
      description: "مجموعة مقالات أدبية رفيعة المستوى تعبر عن مشاعر وأفكار الكاتب بلغة شعرية.",
      price: 209,
      priceUSD: 5.00,
      originalPrice: 209,
      originalPriceUSD: 5.00,
      image: "/book-images/Altomoh/Tbook8.jpg",
      author: "مصطفى صادق الرافعي"
    },
    {
      id: 9,
      title: "السحاب الأحمر",
      category: "إصدارات دار الطموح",
      description: "عمل أدبي يجمع بين البلاغة والفلسفة، يقدم رؤى عميقة عن الحياة والمجتمع.",
      price: 251,
      priceUSD: 6.00,
      originalPrice: 251,
      originalPriceUSD: 6.00,
      image: "/book-images/Altomoh/Tbook9.jpg",
      author: "مصطفى صادق الرافعي"
    },
    {
      id: 10,
      title: "رسائل الأحزان",
      category: "إصدارات دار الطموح",
      description: "مجموعة رسائل أدبية تعبر عن مشاعر الحزن والفراق بأسلوب راقٍ ومؤثر.",
      price: 218,
      priceUSD: 5.20,
      originalPrice: 218,
      originalPriceUSD: 5.20,
      image: "/book-images/Altomoh/Tbook10.jpg",
      author: "مصطفى صادق الرافعي"
    },
    //================================//
    // الكتب الأكثر مبيعاً
    //================================//
      {
      id: 1,
      title: "ماجدولين",
      category: "الأكثر مبيعاً",
      description: "رواية عاطفية خالدة تروي قصة حب تراجيدية بأسلوب المنفلوطي الشاعري المميز.",
      price: 335,
      priceUSD: 8.00,
      originalPrice: 335,
      originalPriceUSD: 8.00,
      image: "/book-images/Altomoh/Tbook7.jpg",
      author: "مصطفى لطفي المنفلوطي"
      },
      {
      id: 2,
      title: "بحر المحابر",
      category: "الأكثر مبيعاً",
      description: "مجموعة أدبية تسبح في عوالم الكتابة والإبداع، تقدم تجارب متنوعة في الأدب والفن.",
      price: 335,
      priceUSD: 8.00,
      originalPrice: 335,
      originalPriceUSD: 8.00,
      image: "/book-images/Altomoh/Tbook2.jpg",
      author: "مزنة باكيرو"
      },
      {
      id: 3,
      title: "رسائل من القرآن",
      category: "الأكثر مبيعاً",
      description: "..",
      price: 428,
      priceUSD: 10.4,
      originalPrice: 535,
      originalPriceUSD: 13,
      discount: 20,
      image: "/book-images/Literature/Lbook10.jpg",
      author: "أدهم الشرقاوي"
      },
      {
      id: 4,
      title: "صحيح البخاري",
      category: "الأكثر مبيعاً",
      description: "أصح كتاب بعد كتاب الله تعالى، ويحتوي على الأحاديث النبوية الصحيحة.",
      price: 592,
      priceUSD: 14.40,
      originalPrice: 740,
      originalPriceUSD: 18,
      discount: 20,
      image: "/book-images/Din/Dinbook1.jpg",
      author: "للإمام ابي عبد الله محمد بن اسماعيل البخاري"
      },
      {
      id: 5,
      title: "مدينة الحب لا يسكنها العقلاء ج1",
      category: "الأكثر مبيعاً",
      description: "0",
      price: 346,
      priceUSD: 8.4,
      originalPrice: 494,
      originalPriceUSD: 12,
      discount: 30,
      image: "/book-images/Novels/Nbook40.jpg",
      author: "أحمد آل حمدان"
      },
      {
      id: 6,
      title: "خوف 1",
      category: "الأكثر مبيعاً",
      description: "0",
      price: 403,
      priceUSD: 9.8,
      originalPrice: 576,
      originalPriceUSD: 14,
      discount: 30,
      image: "/book-images/Novels/Nbook30.png",
      author: "أسامة مسلم"
      },
      {
      id: 7,
      title: "الحفظ الميسر",
      category: "الأكثر مبيعاً",
      description: "دليل عملي يقدم استراتيجيات وطرق فعالة تساعد في حفظ القرآن الكريم.",
      price: 561,
      priceUSD: 13.50,
      originalPrice: 748,
      originalPriceUSD: 18,
      discount: 25,
      image: "/book-images/Din/Dinbook28.jpg",
      author: "محمد السيد ماضي"
      },
      {
      id: 8,
      title: "الأمير",
      category: "الأكثر مبيعاً",
      description: "ترجمة عربية مميزة للكتاب الكلاسيكي في علم السياسة والفلسفة السلطوية.",
      price: 268,
      priceUSD: 6.40,
      originalPrice: 268,
      originalPriceUSD: 6.40,
      image: "/book-images/Altomoh/Tbook3.jpg",
      author: "محمد لطفي جمعة"
      },
      {
      id: 9,
      title: "دليل استخدام الإنسان",
      category: "الأكثر مبيعاً",
      description: "كتاب فكري يقدم رؤية فلسفية وعملية لفهم الذات الإنسانية وتحسين أدائها في الحياة.",
      price: 439,
      priceUSD: 10.50,
      originalPrice: 439,
      originalPriceUSD: 10.50,
      image: "/book-images/Altomoh/Tbook1.jpg",
      author: "إيهاب القواسمة"
      },

    // ============================ //
    // الدين
    // ============================ //
    
    {
      id: 1,
      title: "صحيح البخاري",
      category: "دين",
      description: "أصح كتاب بعد كتاب الله تعالى، ويحتوي على الأحاديث النبوية الصحيحة.",
      price: 592,
      priceUSD: 14.40,
      originalPrice: 740,
      originalPriceUSD: 18,
      discount: 20,
      image: "/book-images/Din/Dinbook1.jpg",
      author: "للإمام ابي عبد الله محمد بن اسماعيل البخاري"
    },
    {
      id: 2,
      title: "صحيح مسلم",
      category: "دين",
      description: "ثاني أصح الكتب بعد صحيح البخاري، ويجمع الأحاديث النبوية المتقنة.",
      price: 526,
      priceUSD: 12.80,
      originalPrice: 658,
      originalPriceUSD: 16,
      discount: 20,
      image: "/book-images/Din/Dinbook2.jpg",
      author: "ابي الحسين مسلم بن الحجاج القشيري النيسابوري"
    },
    {
      id: 3,
      title: "أول مرة أتدبر القرآن",
      category: "دين",
      description: "دليل عملي يساعد القارئ على تدبر معاني القرآن الكريم وفهمه.",
      price: 263,
      priceUSD: 6.40,
      originalPrice: 329,
      originalPriceUSD: 8,
      discount: 20,
      image: "/book-images/Din/Dinbook3.jpg",
      author: "عادل محمد خليل"
    },
    {
      id: 4,
      title: "قَصَصُ الأنبياء",
      category: "دين",
      description: "كتاب يروي قصص الأنبياء عليهم السلام مستندة إلى القرآن والسنة.",
      price: 395,
      priceUSD: 9.60,
      originalPrice: 494,
      originalPriceUSD: 12,
      discount: 20,
      image: "/book-images/Din/Dinbook4.jpg",
      author: "ابن كثير"
    },
    {
      id: 5,
      title: "الرحيق المختوم",
      category: "دين",
      description: "بحث في السيرة النبوية، حاز على الجائزة الأولى في مسابقة السيرة.",
      price: 296,
      priceUSD: 7.20,
      originalPrice: 370,
      originalPriceUSD: 9,
      discount: 20,
      image: "/book-images/Din/Dinbook5.jpeg",
      author: "صفي الرحمن المباركفوري"
    },
    {
      id: 6,
      title: "تيسير الرحمن في تجويد القرآن",
      category: "دين",
      description: "كتاب يعلم أحكام تلاوة القرآن الكريم وتجويده بشكل مبسط.",
      price: 395,
      priceUSD: 9.60,
      originalPrice: 494,
      originalPriceUSD: 12,
      discount: 20,
      image: "/book-images/Din/Dinbook6.jpg",
      author: "د. سعاد عبدالحميد"
    },
    {
      id: 7,
      title: "مدرسة محمد",
      category: "دين",
      description: "كتاب عن السيرة النبوية وأخلاق النبي صلى الله عليه وسلم.",
      price: 329,
      priceUSD: 8.00,
      originalPrice: 411,
      originalPriceUSD: 10,
      discount: 20,
      image: "/book-images/Din/Dinbook7.jpg",
      author: "جهاد التُّرباني"
    },
    {
      id: 8,
      title: "مدرسة الأنبياء",
      category: "دين",
      description: "كتاب يستعرض حياة ودروس وعبر من سير الأنبياء عليهم السلام.",
      price: 329,
      priceUSD: 8.00,
      originalPrice: 411,
      originalPriceUSD: 10,
      discount: 20,
      image: "/book-images/Din/Dinbook8.jpg",
      author: "جهاد التُّرباني"
    },
    {
      id: 9,
      title: "تفسير القرآن العظيم",
      category: "دين",
      description: "أشهر كتب التفسير بالمأثور، يعتمد على تفسير القرآن بالقرآن والسنة.",
      price: 1317,
      priceUSD: 32.00,
      originalPrice: 1646,
      originalPriceUSD: 40,
      discount: 20,
      image: "/book-images/Din/Dinbook9.jpg",
      author: "ابن كثير"
    },
    {
      id: 10,
      title: "الفقه الميسر",
      category: "دين",
      description: "كتاب يقدم الأحكام الفقهية بأسلوب مبسط وسهل适合 للمبتدئين和非المتخصصين.",
      price: 374,
      priceUSD: 9.00,
      originalPrice: 498,
      originalPriceUSD: 12,
      discount: 25,
      image: "/book-images/Din/Dinbook10.webp",
      author: "نخبة من العلماء"
    },
    {
      id: 11,
      title: "القرآن الكريم || التفسير الميسر",
      category: "دين",
      description: "مصحف شامل مع تفسير ميسر يمكن القارئ من فهم معاني القرآن الكريم بسهولة.",
      price: 467,
      priceUSD: 11.25,
      originalPrice: 623,
      originalPriceUSD: 15,
      discount: 25,
      image: "/book-images/Din/Dinbook11.jpg",
      author: "نخبة من العلماء"
    },
    {
      id: 12,
      title: "أصول الإيمان في ضوء الكتاب والسنة",
      category: "دين",
      description: "كتاب يؤصل أركان الإيمان الستة مستندًا إلى نصوص القرآن الكريم والسنة النبوية.",
      price: 312,
      priceUSD: 7.50,
      originalPrice: 416,
      originalPriceUSD: 10,
      discount: 25,
      image: "/book-images/Din/Dinbook12.jpeg",
      author: "نخبة من العلماء"
    },
    {
      id: 13,
      title: "الشمائل المحمدية",
      category: "دين",
      description: "كتاب يجمع أوصاف النبي صلى الله عليه وسلم الخَلقية والخُلقية كما رويت في الأحاديث.",
      price: 374,
      priceUSD: 9.00,
      originalPrice: 498,
      originalPriceUSD: 12,
      discount: 25,
      image: "/book-images/Din/Dinbook13.jpg",
      author: "الإمام الترمذي"
    },
    {
      id: 14,
      title: "رياض الصالحين",
      category: "دين",
      description: "من أشهر كتب الحديث يجمع الأحاديث النبوية في الترغيب والترهيب والأخلاق والآداب.",
      price: 374,
      priceUSD: 9.00,
      originalPrice: 498,
      originalPriceUSD: 12,
      discount: 25,
      image: "/book-images/Din/Dinbook14.jpg",
      author: "الإمام النووي"
    },
    {
      id: 15,
      title: "تيسير الكريم الرحمن في تفسير كلام المنان",
      category: "دين",
      description: "تفسير سهل العبارة، مركز على المعنى الإجمالي للآيات مع بيان ما فيها من هدايات.",
      price: 561,
      priceUSD: 13.50,
      originalPrice: 748,
      originalPriceUSD: 18,
      discount: 25,
      image: "/book-images/Din/Dinbook15.jpg",
      author: "الشيخ عبدالرحمن بن ناصر السعدي"
    },
    {
      id: 16,
      title: "الأذكار",
      category: "دين",
      description: "كتاب يضم مجموعة منتقاة من الأذكار النبوية الثابتة لأوقات وأحوال مختلفة.",
      price: 374,
      priceUSD: 9.00,
      originalPrice: 498,
      originalPriceUSD: 12,
      discount: 25,
      image: "/book-images/Din/Dinbook16.jpg",
      author: "الإمام النووي"
    },
    {
      id: 17,
      title: "المنتخب من أحاديث الآداب و الأخلاق",
      category: "دين",
      description: "مجموعة مختارة من الأحاديث النبوية التي تركز على بناء الأداب والأخلاق الكريمة.",
      price: 374,
      priceUSD: 9.00,
      originalPrice: 498,
      originalPriceUSD: 12,
      discount: 25,
      image: "/book-images/Din/Dinbook17.webp",
      author: "نخبة من العلماء"
    },
    {
      id: 18,
      title: "قصص القرآن",
      category: "دين",
      description: "سرد لقصص الأنبياء والأمم السابقة كما وردت في القرآن مع استخلاص العبر والمواعظ.",
      price: 343,
      priceUSD: 8.25,
      originalPrice: 457,
      originalPriceUSD: 11,
      discount: 25,
      image: "/book-images/Din/Dinbook18.jpg",
      author: "سعد يوسف ابو عزيز"
    },
    {
      id: 19,
      title: "الملخص في شرح كتاب التوحيد",
      category: "دين",
      description: "شرح ميسر لكتاب التوحيد للإمام محمد بن عبد الوهاب، يبين أصول العقيدة الصحيحة.",
      price: 374,
      priceUSD: 9.00,
      originalPrice: 498,
      originalPriceUSD: 12,
      discount: 25,
      image: "/book-images/Din/Dinbook19.jpg",
      author: "صالح بن فوزان الفوزان"
    },
    {
      id: 20,
      title: "الدروس النحوية",
      category: "دين",
      description: "سلسلة شاملة لتعليم قواعد النحو العربي بشكل مبسط ومنظم适合 لطلاب العلم.",
      price: 312,
      priceUSD: 7.50,
      originalPrice: 416,
      originalPriceUSD: 10,
      discount: 25,
      image: "/book-images/Din/Dinbook20.jpg",
      author: "نخبة من العلماء"
    },
    {
      id: 21,
      title: "تفسير الجلالين",
      category: "دين",
      description: "تفسير موجز واضح للقرآن الكريم، اشترك في تأليفه جلال الدين المحلي والسيوطي.",
      price: 406,
      priceUSD: 9.75,
      originalPrice: 541,
      originalPriceUSD: 13,
      discount: 25,
      image: "/book-images/Din/Dinbook21.png",
      author: "الإمامين : جلال الدين محمد || جلال الدين عبدالرحمن"
    },
    {
      id: 22,
      title: "التحفة السنية بشرح المقدمة الاجرمية",
      category: "دين",
      description: "شرح واضح لمتن الآجرومية في النحو، يعتبر من أفضل الشروح للمبتدئين.",
      price: 312,
      priceUSD: 7.50,
      originalPrice: 416,
      originalPriceUSD: 10,
      discount: 25,
      image: "/book-images/Din/Dinbook22.jpg",
      author: "محمد محي الدين عبدالحميد"
    },
    {
      id: 23,
      title: "متون النحو والصرف ومعه قواعد الإملاء",
      category: "دين",
      description: "مجموعة من المتون العلمية في النحو والصرف والإملاء تغطي احتياجات دارس اللغة.",
      price: 406,
      priceUSD: 9.75,
      originalPrice: 541,
      originalPriceUSD: 13,
      discount: 25,
      image: "/book-images/Din/Dinbook23.jpg",
      author: "نخبة من العلماء"
    },
    {
      id: 24,
      title: "النحو الواضح في قواعد اللغة العربية(للمبتدئين)",
      category: "دين",
      description: "كتاب مصمم خصيصًا للمبتدئين لتعلم قواعد النحو العربي بأسلوب سهل ومبسط.",
      price: 374,
      priceUSD: 9.00,
      originalPrice: 498,
      originalPriceUSD: 12,
      discount: 25,
      image: "/book-images/Din/Dinbook24.jpeg",
      author: "نخبة من العلماء"
    },
    {
      id: 25,
      title: "الشرح الميسر على المقدمة الجزرية",
      category: "دين",
      description: "شرح مبسط لمتن الجزرية في علم التجويد، يساعد في إتقان أحكام تلاوة القرآن.",
      price: 406,
      priceUSD: 9.75,
      originalPrice: 541,
      originalPriceUSD: 13,
      discount: 25,
      image: "/book-images/Din/Dinbook25.jpg",
      author: "حسام حسين الحمد"
    },
    {
      id: 26,
      title: "متن تحفة الأطفال ومتن المقدمة الجزرية",
      category: "دين",
      description: "متنان في علم التجويد، الأول للمبتدئين (تحفة الأطفال) والثاني للمتقدمين (الجزرية).",
      price: 156,
      priceUSD: 3.75,
      originalPrice: 208,
      originalPriceUSD: 5,
      discount: 25,
      image: "/book-images/Din/Dinbook26.jpg",
      author: "نخبة من العلماء"
    },
    {
      id: 27,
      title: "البلاغة الواضحة",
      category: "دين",
      description: "مدخل مبسط لعلوم البلاغة العربية (المعاني، البيان، البديع) مع أمثلة تطبيقية.",
      price: 467,
      priceUSD: 11.25,
      originalPrice: 623,
      originalPriceUSD: 15,
      discount: 25,
      image: "/book-images/Din/Dinbook27.jpg",
      author: "قاسم محمد النوري"
    },
    {
      id: 28,
      title: "الحفظ الميسر",
      category: "دين",
      description: "دليل عملي يقدم استراتيجيات وطرق فعالة تساعد في حفظ القرآن الكريم.",
      price: 561,
      priceUSD: 13.50,
      originalPrice: 748,
      originalPriceUSD: 18,
      discount: 25,
      image: "/book-images/Din/Dinbook28.jpg",
      author: "محمد السيد ماضي"
    },
    {
      id: 29,
      title: "النحو الواضح في قواعد اللغة العربية (المرحلة الثانوية)",
      category: "دين",
      description: "جزء متقدم من سلسلة النحو الواضح، معد خصيصًا لطلاب المرحلة الثانوية.",
      price: 467,
      priceUSD: 11.25,
      originalPrice: 623,
      originalPriceUSD: 15,
      discount: 25,
      image: "/book-images/Din/Dinbook29.jpeg",
      author: "نخبة من العلماء"
    },
    {
      id: 30,
      title: "شرح شذور الذهب في معرفة كلام العرب",
      category: "دين",
      description: "شرح لكتاب شذور الذهب لابن هشام، وهو من الكتب المهمة في النحو العربي.",
      price: 467,
      priceUSD: 11.25,
      originalPrice: 623,
      originalPriceUSD: 15,
      discount: 25,
      image: "/book-images/Din/Dinbook30.webp",
      author: "نخبة من العلماء"
    },
    {
      id: 31,
      title: "نحو ثقافة قرآنية",
      category: "دين",
      description: "كتاب يهدف إلى بناء ثقافة قرآنية شاملة لدى القارئ المسلم في العصر الحديث.",
      price: 406,
      priceUSD: 9.75,
      originalPrice: 541,
      originalPriceUSD: 13,
      discount: 25,
      image: "/book-images/Din/Dinbook31.jpg",
      author: "الدكتور أيمن عبدالرزاق الشَّؤا"
    },
    {
      id: 32,
      title: "مختصر القدوري",
      category: "دين",
      description: "متن فقهي على المذهب الحنفي، يعتبر من أهم المتون للمبتدئين في الفقه الحنفي.",
      price: 374,
      priceUSD: 9.00,
      originalPrice: 498,
      originalPriceUSD: 12,
      discount: 25,
      image: "/book-images/Din/Dinbook32.jpeg",
      author: "الإمام القدوري الحنفي"
    },
    {
      id: 33,
      title: "جوامع الأدب في أخلاق الأنجاب",
      category: "دين",
      description: "كتاب في الآداب الإسلامية والأخلاق الحميدة التي يجب أن يتحلى بها الإنسان.",
      price: 406,
      priceUSD: 9.75,
      originalPrice: 541,
      originalPriceUSD: 13,
      discount: 25,
      image: "/book-images/Din/Dinbook33.jpg",
      author: "العلامة جمال الدين القاسي الدمشقي"
    },
    {
      id: 34,
      title: "المختصر اللطيف",
      category: "دين",
      description: "متن فقهي مختصر يشمل أبواب الفقه المختلفة بأسلوب سهل وميسر.",
      price: 281,
      priceUSD: 6.75,
      originalPrice: 374,
      originalPriceUSD: 9,
      discount: 25,
      image: "/book-images/Din/Dinbook34.jpg",
      author: "العلامة الشيخ بافضل الحضرمي"
    },
    {
      id: 35,
      title: "تحرير تنقيح اللباب",
      category: "دين",
      description: "كتاب في الفقه الشافعي، يعتبر من الكتب المهمة في المذهب.",
      price: 343,
      priceUSD: 8.25,
      originalPrice: 457,
      originalPriceUSD: 11,
      discount: 25,
      image: "/book-images/Din/Dinbook35.jpg",
      author: "أبي يحيى زكريا بن محمد الأنصاري"
    },
    {
      id: 36,
      title: "سفينة النجاة",
      category: "دين",
      description: "متن فقهي على المذهب الشافعي، مختصر وجامع لأهم أحكام العبادات.",
      price: 281,
      priceUSD: 6.75,
      originalPrice: 374,
      originalPriceUSD: 9,
      discount: 25,
      image: "/book-images/Din/Dinbook36.jpeg",
      author: "العلامة عبدالله بن عمر الحضرمي"
    },
    {
      id: 37,
      title: "فتح القريب المجيب شرح ابن قاسم الغزي",
      category: "دين",
      description: "شرح لمتن الغاية والتقريب في الفقه الشافعي، مناسب لطلاب العلم المبتدئين.",
      price: 374,
      priceUSD: 9.00,
      originalPrice: 498,
      originalPriceUSD: 12,
      discount: 25,
      image: "/book-images/Din/Dinbook37.webp",
      author: "نخبة من العلماء"
    },
    {
      id: 38,
      title: "الكبائر",
      category: "دين",
      description: "كتاب يجمع الذنوب والخطايا الكبرى التي حذر منها الإسلام كما وردت في النصوص.",
      price: 312,
      priceUSD: 7.50,
      originalPrice: 416,
      originalPriceUSD: 10,
      discount: 25,
      image: "/book-images/Din/Dinbook38.jpg",
      author: "محمد بن أحمد بن قايماز الذهبي"
    },
    {
      id: 39,
      title: "فتح الإله المالك على عمدة السالك",
      category: "دين",
      description: "شرح لمتن عمدة السالك في الفقه الشافعي، موجه لطلاب العلم.",
      price: 530,
      priceUSD: 12.75,
      originalPrice: 707,
      originalPriceUSD: 17,
      discount: 25,
      image: "/book-images/Din/Dinbook39.jpg",
      author: "ابن النقيب المصري"
    },
    {
      id: 40,
      title: "اللُّباب بتيسير متشابهات الكتاب",
      category: "دين",
      description: "كتاب يسهل فهم الآيات المتشابهة في القرآن الكريم ويبين وجوه ارتباطها.",
      price: 530,
      priceUSD: 12.75,
      originalPrice: 707,
      originalPriceUSD: 17,
      discount: 25,
      image: "/book-images/Din/Dinbook40.jpg",
      author: "عماد قرري العياضي"
    },
    {
      id: 41,
      title: "المنح العليَّة في بيان السنن اليومية",
      category: "دين",
      description: "كتاب يجمع السنن النبوية التي يمكن للمسلم المداومة عليها في يومه وليلته.",
      price: 187,
      priceUSD: 4.50,
      originalPrice: 249,
      originalPriceUSD: 6,
      discount: 25,
      image: "/book-images/Din/Dinbook41.jpg",
      author: "عبدالله بن حمود الفريح"
    },
    {
      id: 42,
      title: "قاعدة جليلة في التوسل والوسيلة",
      category: "دين",
      description: "رسالة في بيان حقيقة التوسل المشروع والتوسل الممنوع في الإسلام.",
      price: 374,
      priceUSD: 9.00,
      originalPrice: 498,
      originalPriceUSD: 12,
      discount: 25,
      image: "/book-images/Din/Dinbook42.jpg",
      author: "شيخ الإسلام ابن تيمية"
    },
    {
      id: 43,
      title: "القرآن تدبر وعمل",
      category: "دين",
      description: "مصحف شريف يهدف إلى ربط تلاوة القرآن بالتدبر في معانيه والعمل بأحكامه.",
      price: 523,
      priceUSD: 12.60,
      originalPrice: 748,
      originalPriceUSD: 18,
      discount: 30,
      image: "/book-images/Din/Dinbook43.png",
      author: "نخبة من العلماء"
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
      image: "/book-images/Novels/alftot.jpg",
      images: [
        "/book-images/Novels/alftot1.jpg",
        "/book-images/Novels/alftot2.jpg",
        "/book-images/Novels/alftot3.jpg",
        "/book-images/Novels/alftot4.jpg"
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
    image: "/book-images/Novels/assen1.jpg",
    images: [
        "/book-images/Novels/assen1.jpg",
        "/book-images/Novels/assen2.jpg",
        "/book-images/Novels/assen3.jpg"
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
    image: "/book-images/Novels/war&peace.jpg",
    images: [
        "/book-images/Novels/war&peace1.jpg",
        "/book-images/Novels/war&peace2.jpg",
        "/book-images/Novels/war&peace3.jpg",
        "/book-images/Novels/war&peace4.jpg"
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
    image: "/book-images/Novels/witcher1.jpg",
    images: [
        "/book-images/Novels/witcher1.jpg",
        "/book-images/Novels/witcher2.jpg",
        "/book-images/Novels/witcher3.jpg",
        "/book-images/Novels/withcer4.jpg"
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
    image: "/book-images/Novels/Nbook1.jpg",
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
    image: "/book-images/Novels/Nbook2.jpg",
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
    image: "/book-images/Novels/Nbook3.jpg",
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
    image: "/book-images/Novels/Nbook4.jpg",
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
    image: "/book-images/Novels/Nbook5.jpg",
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
    image: "/book-images/Novels/Nbook6.jpg",
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
    image: "/book-images/Novels/Nbook7.jpg",
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
    image: "/book-images/Novels/Nbook8.jpg",
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
    image: "/book-images/Novels/Nbook9.jpg",
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
    image: "/book-images/Novels/Nbook10.jpg",
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
    image: "/book-images/Novels/Nbook11.jpg",
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
    image: "/book-images/Novels/Nbook12.jpg",
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
    image: "/book-images/Novels/Nbook13.jpg",
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
    image: "/book-images/Novels/Nbook14.jpg",
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
    image: "/book-images/Novels/Nbook15.jpg",
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
    image: "/book-images/Novels/Nbook16.jpg",
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
    image: "/book-images/Novels/Nbook17.jpg",
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
    image: "/book-images/Novels/Nbook18.jpg",
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
    image: "/book-images/Novels/Nbook19.jpg",
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
    image: "/book-images/Novels/Nbook20.jpg",
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
    image: "/book-images/Novels/Nbook21.jpg",
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
    image: "/book-images/Novels/Nbook22.jpg",
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
    image: "/book-images/Novels/Nbook23.jpg",
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
    image: "/book-images/Novels/Nbook24.jpg",
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
    image: "/book-images/Novels/Nbook25.jpg",
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
    image: "/book-images/Novels/Nbook26.jpg",
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
    image: "/book-images/Novels/Nbook27.jpg",
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
    image: "/book-images/Novels/Nbook28.jpg",
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
    image: "/book-images/Novels/Nbook29.jpg",
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
    image: "/book-images/Novels/Nbook30.png",
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
    image: "/book-images/Novels/Nbook31.jpg",
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
    image: "/book-images/Novels/Nbook32.jpg",
    author: "أسامة مسلم"
  },
  {
    id: 37,
    title: "بساتين عربستان 1",
    category: "روايات",
    description: "0",
    price: 519,
    priceUSD: 12.6,
    originalPrice: 741,
    originalPriceUSD: 18,
    discount: 30,
    image: "/book-images/Novels/Nbook33.jpg",
    author: "أسامة مسلم"
  },
  {
    id: 38,
    title: "عصبة الشياطين 2",
    category: "روايات",
    description: "0",
    price: 519,
    priceUSD: 12.6,
    originalPrice: 741,
    originalPriceUSD: 18,
    discount: 30,
    image: "/book-images/Novels/Nbook34.png",
    author: "أسامة مسلم"
  },
  {
    id: 39,
    title: "لُجّ 1",
    category: "روايات",
    description: "0",
    price: 519,
    priceUSD: 12.6,
    originalPrice: 741,
    originalPriceUSD: 18,
    discount: 30,
    image: "/book-images/Novels/Nbook35.jpg",
    author: "أسامة مسلم"
  },
  {
    id: 40,
    title: "هذا ما حدث معي",
    category: "روايات",
    description: "0",
    price: 519,
    priceUSD: 12.6,
    originalPrice: 741,
    originalPriceUSD: 18,
    discount: 30,
    image: "/book-images/Novels/Nbook36.png",
    author: "أسامة مسلم"
  },
  {
    id: 41,
    title: "هذا ما حدث معها (أزرق)",
    category: "روايات",
    description: "0",
    price: 519,
    priceUSD: 12.6,
    originalPrice: 741,
    originalPriceUSD: 18,
    discount: 30,
    image: "/book-images/Novels/Nbook37.jpg",
    author: "أسامة مسلم"
  },
  {
    id: 42,
    title: "هذا ما حدث معها (أصفر)",
    category: "روايات",
    description: "0",
    price: 519,
    priceUSD: 12.6,
    originalPrice: 741,
    originalPriceUSD: 18,
    discount: 30,
    image: "/book-images/Novels/Nbook38.jpg",
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
    image: "/book-images/Novels/Nbook39.jpg",
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
    image: "/book-images/Novels/Nbook40.jpg",
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
    image: "/book-images/Novels/Nbook41.jpg",
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
    image: "/book-images/Novels/Nbook42.jpg",
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
    image: "/book-images/Novels/Nbook43.png",
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
    image: "/book-images/Novels/Nbook44.png",
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
    image: "/book-images/Novels/Nbook45.jpg",
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
    image: "/book-images/Novels/Nbook46.jpg",
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
    image: "/book-images/Novels/Nbook47.jpg",
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
    image: "/book-images/Novels/Nbook48.jpg",
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
    image: "/book-images/Novels/Nbook49.jpg",
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
    image: "/book-images/Novels/Nbook50.png",
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
    image: "/book-images/Novels/Nbook51.jpg",
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
    image: "/book-images/Novels/Nbook52.jpg",
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
    image: "/book-images/Novels/Nbook53.jpg",
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
    image: "/book-images/Novels/Nbook54.jpg",
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
    image: "/book-images/Novels/Nbook55.png",
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
    image: "/book-images/Novels/Nbook56.jpg",
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
    image: "/book-images/Novels/Nbook57.jpg",
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
    image: "/book-images/Novels/Nbook58.png",
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
    image: "/book-images/Novels/Nbook59.jpg",
    author: "سما سامي"
  },
  {
    id: 64,
    title: "ساحر أو مجنون",
    category: "روايات",
    description: "رواية تحكي قصة صراع بين السحر والعقل.",
    price: 395,
    priceUSD: 9.60,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/book-images/Novels/Nbook60.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 65,
    title: "أنا يوسف",
    category: "روايات",
    description: "قصة مستوحاة من حياة النبي يوسف عليه السلام.",
    price: 263,
    priceUSD: 6.40,
    originalPrice: 329,
    originalPriceUSD: 8,
    discount: 20,
    image: "/book-images/Novels/Nbook61.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 66,
    title: "حديث الجنود",
    category: "روايات",
    description: "رواية تتناول حكايات من واقع الحياة العسكرية.",
    price: 263,
    priceUSD: 6.40,
    originalPrice: 329,
    originalPriceUSD: 8,
    discount: 20,
    image: "/book-images/Novels/Nbook62.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 67,
    title: "اسمه أحمد",
    category: "روايات",
    description: "رواية تروي سيرة ذاتية مستوحاة من الواقع.",
    price: 296,
    priceUSD: 7.20,
    originalPrice: 370,
    originalPriceUSD: 9,
    discount: 20,
    image: "/book-images/Novels/Nbook63.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 68,
    title: "نفر من الجن",
    category: "روايات",
    description: "قصة غامضة تتعلق بعالم ما وراء الطبيعة.",
    price: 263,
    priceUSD: 6.40,
    originalPrice: 329,
    originalPriceUSD: 8,
    discount: 20,
    image: "/book-images/Novels/Nbook64.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 69,
    title: "رؤوس الشياطين",
    category: "روايات",
    description: "رواية تشتبك مع أفكار الشر والصراع الداخلي.",
    price: 230,
    priceUSD: 5.60,
    originalPrice: 288,
    originalPriceUSD: 7,
    discount: 20,
    image: "/book-images/Novels/Nbook65.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 70,
    title: "طريق جهنم",
    category: "روايات",
    description: "رحلة خطيرة نحو مصير مجهول.",
    price: 296,
    priceUSD: 7.20,
    originalPrice: 370,
    originalPriceUSD: 9,
    discount: 20,
    image: "/book-images/Novels/Nbook66.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 71,
    title: "يا صاحبي السجن",
    category: "روايات",
    description: "قصة عن الصداقة والأمل داخل أسوار السجن.",
    price: 263,
    priceUSD: 6.40,
    originalPrice: 329,
    originalPriceUSD: 8,
    discount: 20,
    image: "/book-images/Novels/Nbook67.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 72,
    title: "مسغبة",
    category: "روايات",
    description: "رواية تعبر عن حالات من الشغب والفوضى الداخلية.",
    price: 296,
    priceUSD: 7.20,
    originalPrice: 370,
    originalPriceUSD: 9,
    discount: 20,
    image: "/book-images/Novels/Nbook68.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 73,
    title: "تسعة عشر",
    category: "روايات",
    description: "قصة تحيط بها هالة من الغموض والأسرار.",
    price: 263,
    priceUSD: 6.40,
    originalPrice: 329,
    originalPriceUSD: 8,
    discount: 20,
    image: "/book-images/Novels/Nbook69.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 74,
    title: "خاوية",
    category: "روايات",
    description: "رواية عن الفراغ الداخلي والبحث عن المعنى.",
    price: 263,
    priceUSD: 6.40,
    originalPrice: 329,
    originalPriceUSD: 8,
    discount: 20,
    image: "/book-images/Novels/Nbook70.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 75,
    title: "كلمة الله",
    category: "روايات",
    description: "قصة تبحث عن الحقيقة المطلقة.",
    price: 230,
    priceUSD: 5.60,
    originalPrice: 288,
    originalPriceUSD: 7,
    discount: 20,
    image: "/book-images/Novels/Nbook71.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 76,
    title: "يوم مشهود",
    category: "روايات",
    description: "رواية عن يوم سيغير كل شيء.",
    price: 263,
    priceUSD: 6.40,
    originalPrice: 329,
    originalPriceUSD: 8,
    discount: 20,
    image: "/book-images/Novels/Nbook72.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 77,
    title: "يسمعون حسيسها",
    category: "روايات",
    description: "قصة مستوحاة من نصوص دينية عن يوم القيامة.",
    price: 263,
    priceUSD: 6.40,
    originalPrice: 329,
    originalPriceUSD: 8,
    discount: 20,
    image: "/book-images/Novels/Nbook73.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 78,
    title: "ذائقة الموت",
    category: "روايات",
    description: "رواية عن تجارب الاقتراب من الموت.",
    price: 263,
    priceUSD: 6.40,
    originalPrice: 329,
    originalPriceUSD: 8,
    discount: 20,
    image: "/book-images/Novels/Nbook74.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 79,
    title: "ليطمئن قلبي",
    category: "روايات",
    description: "قصة عن البحث عن الطمأنينة والإيمان.",
    price: 395,
    priceUSD: 9.60,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/book-images/Novels/Nbook75.jpg",
    author: "أدهم شرقاوي"
  },
  {
    id: 80,
    title: "نطفة",
    category: "روايات",
    description: "رواية عن أصل الحياة والخلق.",
    price: 395,
    priceUSD: 9.60,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/book-images/Novels/Nbook76.jpg",
    author: "أدهم شرقاوي"
  },
  {
    id: 81,
    title: "نبض",
    category: "روايات",
    description: "قصة عن مشاعر الحب والإنسانية.",
    price: 395,
    priceUSD: 9.60,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/book-images/Novels/Nbook77.jpg",
    author: "أدهم شرقاوي"
  },
  {
    id: 82,
    title: "عندما التقيت عمر بن الخطاب",
    category: "روايات",
    description: "رحلة خيالية للقاء أحد أشهر الشخصيات في التاريخ الإسلامي.",
    price: 395,
    priceUSD: 9.60,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/book-images/Novels/Nbook78.jpg",
    author: "أدهم شرقاوي"
  },
  {
    id: 83,
    title: "ثاني اثنين",
    category: "روايات",
    description: "قصة عن الصحابي الجليل أبو بكر الصديق رضي الله عنه.",
    price: 370,
    priceUSD: 9.00,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 25,
    image: "/book-images/Novels/Nbook79.jpg",
    author: "أدهم شرقاوي"
  },
  {
    id: 84,
    title: "حطمني",
    category: "روايات",
    description: "رواية عن تجربة قاسية أدت إلى تحطم داخلي.",
    price: 370,
    priceUSD: 9.00,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 25,
    image: "/book-images/Novels/Nbook80.jpg",
    author: "طاهرة مافي"
  },
  {
    id: 85,
    title: "فسرني",
    category: "روايات",
    description: "قصة تبحث عن تفسير للحب والحياة.",
    price: 462,
    priceUSD: 11.25,
    originalPrice: 617,
    originalPriceUSD: 15,
    discount: 25,
    image: "/book-images/Novels/Nbook81.jpg",
    author: "طاهرة مافي"
  },
  {
    id: 86,
    title: "أشعلني",
    category: "روايات",
    description: "رواية عن شغف وحب يلهب المشاعر.",
    price: 432,
    priceUSD: 10.50,
    originalPrice: 576,
    originalPriceUSD: 14,
    discount: 25,
    image: "/book-images/Novels/Nbook82.jpg",
    author: "طاهرة مافي"
  },
  {
    id: 87,
    title: "أن تبقى",
    category: "روايات",
    description: "قصة عن التحدي والإصرار على البقاء.",
    price: 370,
    priceUSD: 9.00,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 25,
    image: "/book-images/Novels/Nbook83.jpg",
    author: "د. خولة حمدي"
  },
  {
    id: 88,
    title: "أفراح المقبرة",
    category: "روايات",
    description: "رواية من أدب الرعب والفانتازيا.",
    price: 308,
    priceUSD: 7.50,
    originalPrice: 411,
    originalPriceUSD: 10,
    discount: 25,
    image: "/book-images/Novels/Nbook84.jpg",
    author: "أحمد خالد توفيق"
  },
  {
    id: 89,
    title: "رفقاء الليل",
    category: "روايات",
    description: "حكايات غامضة تدور في ظلام الليل.",
    price: 308,
    priceUSD: 7.50,
    originalPrice: 411,
    originalPriceUSD: 10,
    discount: 25,
    image: "/book-images/Novels/Nbook85.jpg",
    author: "أحمد خالد توفيق"
  },
  {
    id: 90,
    title: "ياسمين العودة",
    category: "روايات",
    description: "قصة عن العودة إلى الجذور والذات.",
    price: 493,
    priceUSD: 12.00,
    originalPrice: 658,
    originalPriceUSD: 16,
    discount: 25,
    image: "/book-images/Novels/Nbook86.jpg",
    author: "د. خولة حمدي"
  },
  {
    id: 91,
    title: "فتاة بحر الزمرد",
    category: "روايات",
    description: "مغامرة خيالية في عالم سحري تحت الماء.",
    price: 740,
    priceUSD: 18.00,
    originalPrice: 987,
    originalPriceUSD: 24,
    discount: 25,
    image: "/book-images/Novels/Nbook87.jpg",
    author: "براندون ساندرسن"
  },
  {
    id: 92,
    title: "سماء بلا ضياء",
    category: "روايات",
    description: "رواية عن اليأس والأمل في ظلام الأوقات.",
    price: 493,
    priceUSD: 12.00,
    originalPrice: 658,
    originalPriceUSD: 16,
    discount: 25,
    image: "/book-images/Novels/Nbook88.jpg",
    author: "د. خولة حمدي"
  },
  {
    id: 93,
    title: "لغز بربروسا",
    category: "روايات",
    description: "مغامرة تاريخية للكشف عن لغز قرصان بحري legend.",
    price: 308,
    priceUSD: 7.50,
    originalPrice: 411,
    originalPriceUSD: 10,
    discount: 25,
    image: "/book-images/Novels/Nbook89.jpg",
    author: "جهاد التُّرباني"
  },
  {
    id: 94,
    title: "حرب الفاندال",
    category: "روايات",
    description: "رواية تاريخية عن صراع إمبراطوريات قديمة.",
    price: 308,
    priceUSD: 7.50,
    originalPrice: 411,
    originalPriceUSD: 10,
    discount: 25,
    image: "/book-images/Novels/Nbook90.jpg",
    author: "جهاد التُّرباني"
  },
  {
    id: 95,
    title: "سر آريوس",
    category: "روايات",
    description: "قصة تشويق للكشف عن سر عقيدة قديمة.",
    price: 308,
    priceUSD: 7.50,
    originalPrice: 411,
    originalPriceUSD: 10,
    discount: 25,
    image: "/book-images/Novels/Nbook91.jpg",
    author: "جهاد التُّرباني"
  },
  {
    id: 96,
    title: "المعركة الأخيرة",
    category: "روايات",
    description: "رواية عن الصراع المصيري والفصل الأخير.",
    price: 308,
    priceUSD: 7.50,
    originalPrice: 411,
    originalPriceUSD: 10,
    discount: 25,
    image: "/book-images/Novels/Nbook92.jpg",
    author: "جهاد التُّرباني"
  },
  {
    id: 97,
    title: "العملية 101",
    category: "روايات",
    description: "قصة تشويق عن مهمة سرية وخطيرة.",
    price: 308,
    priceUSD: 7.50,
    originalPrice: 411,
    originalPriceUSD: 10,
    discount: 25,
    image: "/book-images/Novels/Nbook93.jpg",
    author: "جهاد التُّرباني"
  },
  {
    id: 98,
    title: "ألف ليلة وليلة",
    category: "روايات",
    description: "عمل أدبي تراثي يضم مئات القصص الشعبية والأسطورية، تدور في إطار حكايات شهرزاد للملك شهريار. يجمع بين المغامرات مثل رحلات السندباد، والأساطير مثل علاء الدين والمصباح السحري، وقصص الحب والخيانة والملوك والجن. يعد من أبرز روائع الأدب العالمي وأحد أكثر الكتب تأثيرًا في المخيلة الإنسانية",
    price: 1605,
    priceUSD: 39,
    originalPrice: 2140,
    originalPriceUSD: 52,
    discount: 25,
    image: "/book-images/Novels/alflila1.jpg",
    images: [
        "/book-images/Novels/alflila2.jpg",
        "/book-images/Novels/alflila3.jpg"
    ],
    author: "أندجي سابكوفسكي"
    },
    {
      id: 99,
      title: "نمر الليل",
      category: "روايات",
      description: "رواية مليئة بالإثارة والتشويق في عالم الجريمة والظلام.",
      price: 376,
      priceUSD: 9.10,
      originalPrice: 537,
      originalPriceUSD: 13,
      discount: 30,
      image: "/book-images/Novels/Nbook94.jpg",
      author: "يانغسي شو"
    },
    {
      id: 100,
      title: "فوق جطر الجمهورية",
      category: "روايات",
      description: "قصة إنسانية تجمع بين الحلم والواقع على جسر الجمهورية.",
      price: 347,
      priceUSD: 8.40,
      originalPrice: 496,
      originalPriceUSD: 12,
      discount: 30,
      image: "/book-images/Novels/Nbook95.jpg",
      author: "شهد الراوي"
    },
    {
      id: 101,
      title: "المثيرون للاهتمام",
      category: "روايات",
      description: "رواية تتناول حياة مجموعة من الشخصيات المثيرة للاهتمام.",
      price: 521,
      priceUSD: 12.60,
      originalPrice: 744,
      originalPriceUSD: 18,
      discount: 30,
      image: "/book-images/Novels/Nbook96.jpg",
      author: "ميغ ووليتزر"
    },
    {
      id: 102,
      title: "من قتل والدي",
      category: "روايات",
      description: "رحلة بحث محفوفة بالمخاطر للكشف عن حقيقة مقتل الأب.",
      price: 173,
      priceUSD: 4.20,
      originalPrice: 248,
      originalPriceUSD: 6,
      discount: 30,
      image: "/book-images/Novels/Nbook97.jpg",
      author: "ادوارد لوي"
    },
    {
      id: 103,
      title: "جاك وساق الفاصوليا",
      category: "روايات",
      description: "قصة خيالية كلاسيكية عن جاك ومغامرته مع ساق الفاصوليا السحرية.",
      price: 173,
      priceUSD: 4.20,
      originalPrice: 248,
      originalPriceUSD: 6,
      discount: 30,
      image: "/book-images/Novels/Nbook98.jpg",
      author: "ترجمة هادي عبد الرزاق الخزرجي"
    },
    {
      id: 104,
      title: "قبل أدم",
      category: "روايات",
      description: "رواية تستكشف عوالم ما قبل الخليقة والإنسان.",
      price: 231,
      priceUSD: 5.60,
      originalPrice: 330,
      originalPriceUSD: 8,
      discount: 30,
      image: "/book-images/Novels/Nbook99.jpg",
      author: "جاك لندن"
    },
    {
      id: 105,
      title: "عين الجمل",
      category: "روايات",
      description: "قصة تراثية عميقة تحمل معاني إنسانية وقيمًا اجتماعية.",
      price: 173,
      priceUSD: 4.20,
      originalPrice: 248,
      originalPriceUSD: 6,
      discount: 30,
      image: "/book-images/Novels/Nbook100.jpg",
      author: "جنكيز أيتماتوف"
    },
    {
      id: 106,
      title: "استيلا تسمع أصواتًا في الخزانة",
      category: "روايات",
      description: "قصة غامضة عن فتاة تسمع أصواتًا غريبة تأتي من الخزانة.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook101.jpg",
      author: "ترجمة طلعت شاهين"
    },
    {
      id: 107,
      title: "النوم في حقل الكرز",
      category: "روايات",
      description: "رواية شعرية عن الحلم والهروب إلى عالم الطبيعة.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook102.jpg",
      author: "ازهر جرجيس"
    },
    {
      id: 108,
      title: "حجر السعادة",
      category: "روايات",
      description: "قصة عن البحث عن السعادة عبر حجر سحري يجلب الحظ.",
      price: 347,
      priceUSD: 8.40,
      originalPrice: 496,
      originalPriceUSD: 12,
      discount: 30,
      image: "/book-images/Novels/Nbook103.jpg",
      author: "ازهر جرجيس"
    },
    {
      id: 109,
      title: "اخف من الحلم",
      category: "روايات",
      description: "رواية عن العلاقات الإنسانية والخيالات التي تكون أخف من الحلم.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook104.jpg",
      author: "جمانة ممتاز"
    },
    {
      id: 110,
      title: "الابله الرائع",
      category: "روايات",
      description: "قصة عن شخصية بسيطة تحمل في طياتها حكمة غير متوقعة.",
      price: 347,
      priceUSD: 8.40,
      originalPrice: 496,
      originalPriceUSD: 12,
      discount: 30,
      image: "/book-images/Novels/Nbook105.jpg",
      author: "شوساكو"
    },
    {
      id: 111,
      title: "سدهارتا",
      category: "روايات",
      description: "رواية فلسفية عن رحلة البحث عن الذات والمعنى الروحي.",
      price: 202,
      priceUSD: 4.90,
      originalPrice: 289,
      originalPriceUSD: 7,
      discount: 30,
      image: "/book-images/Novels/Nbook106.jpg",
      author: "هيرمان هسة"
    },
    {
      id: 112,
      title: "الريح في أشجار الصفصاف",
      category: "روايات",
      description: "مغامرات حيوانات في عالم طبيعي ساحر ومليء بالمفاجآت.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook107.jpg",
      author: "كينيث غراهام"
    },
    {
      id: 113,
      title: "عين زجاجية",
      category: "روايات",
      description: "قصة غامضة تدور حول عين زجاجية تحمل أسرارًا خطيرة.",
      price: 202,
      priceUSD: 4.90,
      originalPrice: 289,
      originalPriceUSD: 7,
      discount: 30,
      image: "/book-images/Novels/Nbook108.jpg",
      author: "ميرين اغور ميابي"
    },
    {
      id: 114,
      title: "لسان بورخيس",
      category: "روايات",
      description: "رواية تستلهم عالم الكاتب بورخيس بأسلوب سردي متميز.",
      price: 231,
      priceUSD: 5.60,
      originalPrice: 330,
      originalPriceUSD: 8,
      discount: 30,
      image: "/book-images/Novels/Nbook109.jpg",
      author: "محمد العمراني"
    },
    {
      id: 115,
      title: "أميرة صغيرة",
      category: "روايات",
      description: "قصة كلاسيكية عن فتاة غنية تفقد كل شيء ولكنها تحافظ على كبريائها.",
      price: 376,
      priceUSD: 9.10,
      originalPrice: 537,
      originalPriceUSD: 13,
      discount: 30,
      image: "/book-images/Novels/Nbook110.jpg",
      author: "فرانسيس برينت"
    },
    {
      id: 116,
      title: "الدب ويني بووه",
      category: "روايات",
      description: "مغامرات الدب المحبوب ويني بووه وأصدقائه في الغابة.",
      price: 260,
      priceUSD: 6.30,
      originalPrice: 372,
      originalPriceUSD: 9,
      discount: 30,
      image: "/book-images/Novels/Nbook111.jpg",
      author: "أ.أ.ميلن"
    },
    {
      id: 117,
      title: "نهاية المطاف",
      category: "روايات",
      description: "رحلة عاطفية تنتهي عند نقطة مصيرية تغير حياة الشخصيات.",
      price: 347,
      priceUSD: 8.40,
      originalPrice: 496,
      originalPriceUSD: 12,
      discount: 30,
      image: "/book-images/Novels/Nbook112.jpg",
      author: "آن غريفين"
    },
    {
      id: 118,
      title: "رحلات غلفر",
      category: "روايات",
      description: "رواية خيالية عن رحلات غلفر إلى بلاد العمالقة والأقزام.",
      price: 376,
      priceUSD: 9.10,
      originalPrice: 537,
      originalPriceUSD: 13,
      discount: 30,
      image: "/book-images/Novels/Nbook113.jpg",
      author: "جوناثان سويفت"
    },
    {
      id: 119,
      title: "مخطوطة ابن بطوطة السرية",
      category: "روايات",
      description: "مغامرة للكشف عن مخطوطة سرية للرحالة الشهير ابن بطوطة.",
      price: 405,
      priceUSD: 9.80,
      originalPrice: 578,
      originalPriceUSD: 14,
      discount: 30,
      image: "/book-images/Novels/Nbook114.jpg",
      author: "جاسم سلمان"
    },
    {
      id: 120,
      title: "ذو الناب الأبيض",
      category: "روايات",
      description: "قصة كلاسيكية عن ذئب هجين يتعلم البقاء في البرية.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook115.jpg",
      author: "جاك لندن"
    },
    {
      id: 121,
      title: "الشرطي الثالث",
      category: "روايات",
      description: "قصة بوليسية غامضة مع وجود شرطي ثالث يحمل مفاجآت غير متوقعة.",
      price: 318,
      priceUSD: 7.70,
      originalPrice: 454,
      originalPriceUSD: 11,
      discount: 30,
      image: "/book-images/Novels/Nbook116.jpg",
      author: "فلان اوبراين"
    },
    {
      id: 122,
      title: "غريزة الطير",
      category: "روايات",
      description: "رواية عن الحرية والهجرة مستوحاة من غريزة الطيور.",
      price: 347,
      priceUSD: 8.40,
      originalPrice: 496,
      originalPriceUSD: 12,
      discount: 30,
      image: "/book-images/Novels/Nbook117.jpg",
      author: "عبد الزهرة زكي"
    },
    {
      id: 123,
      title: "الأمير احتجاب",
      category: "روايات",
      description: "قصة عن أمير يعيش في عزلة واحتجاب عن العالم الخارجي.",
      price: 260,
      priceUSD: 6.30,
      originalPrice: 372,
      originalPriceUSD: 9,
      discount: 30,
      image: "/book-images/Novels/Nbook118.jpg",
      author: "هوشنك كلشيري"
    },
    {
      id: 124,
      title: "رجل وحيد",
      category: "روايات",
      description: "قصة عن عزلة الإنسان وصراعه مع وحدته في العالم الحديث.",
      price: 231,
      priceUSD: 5.60,
      originalPrice: 330,
      originalPriceUSD: 8,
      discount: 30,
      image: "/book-images/Novels/Nbook119.jpg",
      author: "وليد صالح الخليفة"
    },
    {
      id: 125,
      title: "صوفيا بتروفنا",
      category: "روايات",
      description: "قصة إنسانية مؤثرة عن أم تحاول إنقاذ ابنها في ظل ظروف صعبة.",
      price: 231,
      priceUSD: 5.60,
      originalPrice: 330,
      originalPriceUSD: 8,
      discount: 30,
      image: "/book-images/Novels/Nbook120.jpg",
      author: "ليديا تشوكوفسكايا"
    },
    {
      id: 126,
      title: "دراما في الصيد",
      category: "روايات",
      description: "قصة قصيرة عن رحلة صيد تتحول إلى دراما إنسانية غير متوقعة.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook121.jpg",
      author: "انطون تشيخوف"
    },
    {
      id: 127,
      title: "فوق بلاد السواد",
      category: "روايات",
      description: "رواية تستكشف الحياة فوق أراضي مملكة السواد الأسطورية.",
      price: 202,
      priceUSD: 4.90,
      originalPrice: 289,
      originalPriceUSD: 7,
      discount: 30,
      image: "/book-images/Novels/Nbook122.jpg",
      author: "ازهر جرجيس"
    },
    {
      id: 128,
      title: "كبرت مع الأشباح",
      category: "روايات",
      description: "مذكرات طفولة غير عادية مليئة بحكايات الأشباح والأسرار.",
      price: 202,
      priceUSD: 4.90,
      originalPrice: 289,
      originalPriceUSD: 7,
      discount: 30,
      image: "/book-images/Novels/Nbook123.jpg",
      author: "برنس تشولي"
    },
    {
      id: 129,
      title: "أنت لي 1/2",
      category: "روايات",
      description: "قصة حب عاطفية عن اكتمال النصفين في علاقة واحدة.",
      price: 867,
      priceUSD: 21.00,
      originalPrice: 1239,
      originalPriceUSD: 30,
      discount: 30,
      image: "/book-images/Novels/Nbook124.webp",
      author: "د. منى المرشود"
    },
    {
      id: 130,
      title: "دروب السرتاو",
      category: "روايات",
      description: "ملحمة أدبية عن رحلة عبر دروب منطقة السرتاو البرازيلية.",
      price: 626,
      priceUSD: 15.05,
      originalPrice: 888,
      originalPriceUSD: 21.5,
      discount: 30,
      image: "/book-images/Novels/Nbook125.jpg",
      author: "جواو غيمارايس روزا"
    },
    {
      id: 131,
      title: "بينية",
      category: "روايات",
      description: "قصة عن فتاة تدعى بينية وحياتها في عالم سحري.",
      price: 202,
      priceUSD: 4.90,
      originalPrice: 289,
      originalPriceUSD: 7,
      discount: 30,
      image: "/book-images/Novels/Nbook126.webp",
      author: "آديلايدا غارثيا موراليس"
    },
    {
      id: 132,
      title: "البيوض القاتلة",
      category: "روايات",
      description: "رواية خيال علمي عن بيوض غامضة تحمل تهديدًا قاتلًا للبشرية.",
      price: 231,
      priceUSD: 5.60,
      originalPrice: 330,
      originalPriceUSD: 8,
      discount: 30,
      image: "/book-images/Novels/Nbook127.jpg",
      author: "ميخائيل بولغاكوف"
    },
    {
      id: 133,
      title: "مغامرات توم سوير",
      category: "روايات",
      description: "مغامرات طفل شقي ومليء بالخيال في بلدة صغيرة على نهر المسيسيبي.",
      price: 347,
      priceUSD: 8.40,
      originalPrice: 496,
      originalPriceUSD: 12,
      discount: 30,
      image: "/book-images/Novels/Nbook128.jpg",
      author: "مارك توين"
    },
    {
      id: 134,
      title: "أكاذيب الليل",
      category: "روايات",
      description: "قصة غامضة حيث تختلط الحقيقة بالأكاذيب في ظلام الليل.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook129.jpg",
      author: "جزوالدو بوفالينو"
    },
    {
      id: 135,
      title: "أوديب || السر الهائل",
      category: "روايات",
      description: "إعادة سردية لأسطورة أوديب مع كشف سر هائل يغير مصيره.",
      price: 173,
      priceUSD: 4.20,
      originalPrice: 248,
      originalPriceUSD: 6,
      discount: 30,
      image: "/book-images/Novels/Nbook130.jpg",
      author: "فولتير"
    },
    {
      id: 136,
      title: "رغبة",
      category: "روايات",
      description: "رواية عن القوة المدمرة والخلاقة للرغبة الإنسانية.",
      price: 231,
      priceUSD: 5.60,
      originalPrice: 330,
      originalPriceUSD: 8,
      discount: 30,
      image: "/book-images/Novels/Nbook131.jpg",
      author: "فيليب سولرس"
    },
    {
      id: 137,
      title: "الخادمة الشهيرة",
      category: "روايات",
      description: "قصة عن خادمة تصبح شخصية شهيرة وتغير مجرى الأحداث.",
      price: 202,
      priceUSD: 4.90,
      originalPrice: 289,
      originalPriceUSD: 7,
      discount: 30,
      image: "/book-images/Novels/Nbook132.jpg",
      author: "ثربانتس"
    },
    {
      id: 138,
      title: "كأس الدنيا",
      category: "روايات",
      description: "رواية استعارية عن كأس يمنح حامليه تجربة فريدة من حكمة الدنيا.",
      price: 231,
      priceUSD: 5.60,
      originalPrice: 330,
      originalPriceUSD: 8,
      discount: 30,
      image: "/book-images/Novels/Nbook133.jpg",
      author: "ميخائيل برشفين"
    },
    {
      id: 139,
      title: "حياة ومغامرات روبنسون كروزو",
      category: "روايات",
      description: "الرواية الكلاسيكية عن الناجي الوحيد على جزيرة مهجورة.",
      price: 477,
      priceUSD: 11.55,
      originalPrice: 682,
      originalPriceUSD: 16.5,
      discount: 30,
      image: "/book-images/Novels/Nbook134.jpg",
      author: "دانيال ديفو"
    },
    {
      id: 140,
      title: "الجدار",
      category: "روايات",
      description: "قصة ديستوبية عن مجتمع يعيش خلف جدار عظيم يفصله عن العالم.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook135.jpg",
      author: "جون لانكستر"
    },
    {
      id: 141,
      title: "نزيلة قصر وايلدفيل",
      category: "روايات",
      description: "قصة غامضة عن امرأة شابة تقيم في قصر وايلدفيل المليء بالأسرار.",
      price: 405,
      priceUSD: 9.80,
      originalPrice: 578,
      originalPriceUSD: 14,
      discount: 30,
      image: "/book-images/Novels/Nbook136.jpg",
      author: "آن برونته"
    },
    {
      id: 142,
      title: "عالم جديد وشجاع",
      category: "روايات",
      description: "رواية ديستوبية كلاسيكية عن مستقبل مجتمع خاضع للسيطرة التكنولوجية.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook137.jpg",
      author: "الدوس هكسلي"
    },
    {
      id: 143,
      title: "الرجل الزجاجي",
      category: "روايات",
      description: "قصة عن رجل شفاف يمكن للجميع رؤية ما بداخله من مشاعر وأفكار.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook138.jpg",
      author: "ثربانتس"
    },
    {
      id: 144,
      title: "جزيرة الكنز",
      category: "روايات",
      description: "مغامرة بحرية مثيرة للبحث عن كنز مدفون على جزيرة نائية.",
      price: 376,
      priceUSD: 9.10,
      originalPrice: 537,
      originalPriceUSD: 13,
      discount: 30,
      image: "/book-images/Novels/Nbook139.jpg",
      author: "روبرت ستيفنسون"
    },
    {
      id: 145,
      title: "في بلاد الرافدين جنة عدن",
      category: "روايات",
      description: "رحلة إلى أرض الرافدين، مهد الحضارات، بحثًا عن جنة عدن المفقودة.",
      price: 202,
      priceUSD: 4.90,
      originalPrice: 289,
      originalPriceUSD: 7,
      discount: 30,
      image: "/book-images/Novels/Nbook140.jpg",
      author: "مارتن سواين"
    },
    {
      id: 146,
      title: "شرقيّ عدن 1/2",
      category: "روايات",
      description: "ملحمة عائلية تدور حول صراع الخير والشر في وادي ساليناس بكاليفورنيا.",
      price: 867,
      priceUSD: 21.00,
      originalPrice: 1239,
      originalPriceUSD: 30,
      discount: 30,
      image: "/book-images/Novels/Nbook141.jpg",
      author: "جون شتاينبك"
    },
    {
      id: 147,
      title: "صورة يوسف",
      category: "روايات",
      description: "قصة عن يوسف وصورة تثير ذكريات الماضي وتكشف أسرار الحاضر.",
      price: 318,
      priceUSD: 7.70,
      originalPrice: 454,
      originalPriceUSD: 11,
      discount: 30,
      image: "/book-images/Novels/Nbook142.jpg",
      author: "نجم والي"
    },
    {
      id: 148,
      title: "ليل ينسى ودائعه",
      category: "روايات",
      description: "رواية عن ذاكرة الليل والأشياء التي ينساها مع بزوغ الفجر.",
      price: 202,
      priceUSD: 4.90,
      originalPrice: 289,
      originalPriceUSD: 7,
      discount: 30,
      image: "/book-images/Novels/Nbook143.jpg",
      author: "جوخة الحارثي"
    },
    {
      id: 149,
      title: "فتاة تائهة في القرن العشرين",
      category: "روايات",
      description: "قصة عن فتاة تحاول العثور على مكانها في عالم سريع التغير.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook144.jpg",
      author: "غونزالوم"
    },
    {
      id: 150,
      title: "كل رجال الملك",
      category: "روايات",
      description: "رواية سياسية عن صعود وسقوط سياسي فاسد في الجنوب الأمريكي.",
      price: 463,
      priceUSD: 11.20,
      originalPrice: 661,
      originalPriceUSD: 16,
      discount: 30,
      image: "/book-images/Novels/Nbook145.jpg",
      author: "روبرت بين وارن"
    },
    {
      id: 151,
      title: "ادم بعد عدن",
      category: "روايات",
      description: "قصة فلسفية عن حياة آدم البشرية بعد خروجه من جنة عدن.",
      price: 347,
      priceUSD: 8.40,
      originalPrice: 496,
      originalPriceUSD: 12,
      discount: 30,
      image: "/book-images/Novels/Nbook146.jpg",
      author: "فولتير"
    },
    {
      id: 152,
      title: "الثعبان والزنبقة",
      category: "روايات",
      description: "قصة استعارية عن الصراع الأبدي بين الشر (الثعبان) والجمال (الزنبقة).",
      price: 173,
      priceUSD: 4.20,
      originalPrice: 248,
      originalPriceUSD: 6,
      discount: 30,
      image: "/book-images/Novels/Nbook147.jpg",
      author: "نيكوس كازنتزاكيس"
    },
    {
      id: 153,
      title: "حياتي خلف القضبان",
      category: "روايات",
      description: "مذكرات صادقة عن تجربة السجن والبقاء على قيد الحياة خلف القضبان.",
      price: 405,
      priceUSD: 9.80,
      originalPrice: 578,
      originalPriceUSD: 14,
      discount: 30,
      image: "/book-images/Novels/Nbook148.jpg",
      author: "دونالد لاوري"
    },
    {
      id: 154,
      title: "ارث بيريت",
      category: "روايات",
      description: "قصة غامضة عن إرث عائلة بيريت الذي يحمل ثروة ولعنة في نفس الوقت.",
      price: 260,
      priceUSD: 6.30,
      originalPrice: 372,
      originalPriceUSD: 9,
      discount: 30,
      image: "/book-images/Novels/Nbook149.jpg",
      author: "فاتن المر"
    },
    {
      id: 155,
      title: "رينكونيته و كورتارديو",
      category: "روايات",
      description: "قصة عن صديقين من عالم المشردين والمهمشين في المجتمع.",
      price: 202,
      priceUSD: 4.90,
      originalPrice: 289,
      originalPriceUSD: 7,
      discount: 30,
      image: "/book-images/Novels/Nbook150.jpg",
      author: "ثربانتس"
    },
    {
      id: 156,
      title: "الخيمة الحمراء",
      category: "روايات",
      description: "قصة عن التقاء النساء في الخيمة الحمراء ومشاركة أسرار حياتهن.",
      price: 318,
      priceUSD: 7.70,
      originalPrice: 454,
      originalPriceUSD: 11,
      discount: 30,
      image: "/book-images/Novels/Nbook151.jpg",
      author: "انيتا ديامنت"
    },
    {
      id: 157,
      title: "جزيرة المرجان",
      category: "روايات",
      description: "مغامرة للبقاء على قيد الحياة على جزيرة مرجانية استوائية.",
      price: 289,
      priceUSD: 7.00,
      originalPrice: 413,
      originalPriceUSD: 10,
      discount: 30,
      image: "/book-images/Novels/Nbook152.jpg",
      author: "روبرت م.بالانتاين"
    },
    {
      id: 158,
      title: "الحياة الخالدة لهنريتا لاكس",
      category: "روايات",
      description: "قصة حقيقية عن المرأة التي خلاياها غيرت الطب مع تجاهل هويتها.",
      price: 578,
      priceUSD: 14.00,
      originalPrice: 826,
      originalPriceUSD: 20,
      discount: 30,
      image: "/book-images/Novels/Nbook153.png",
      author: "ريبيكا سكلوت"
    },
    {
      id: 159,
      title: "النصري",
      category: "روايات",
      description: "قصة عن النصر الشخصي على الصعوبات والتحديات الكبيرة.",
      price: 521,
      priceUSD: 12.60,
      originalPrice: 744,
      originalPriceUSD: 18,
      discount: 30,
      image: "/book-images/Novels/Nbook154.jpg",
      author: "ماريو بجين لوثينا"
    },
    {
      id: 160,
      title: "يوميات طائر الزنبرك 1/2",
      category: "روايات",
      description: "رواية عميقة تغوص في أعماق النفس البشرية عبر قصة رجل في الثلاثين من عمره يحاول فهم اختفاء زوجته فجأة، في رحلة وجودية تبحث عن معنى الحياة والموت والحب.",
      price: 642,
      priceUSD: 15.40,
      originalPrice: 917,
      originalPriceUSD: 22,
      discount: 30,
      image: "/book-images/Novels/Nbook155.jpg",
      author: "هاروكي موراكامي"
    },
    {
      id: 161,
      title: "يوميات طائر الزنبرك 3",
      category: "روايات",
      description: "استكمال للرواية الأسطورية التي تنسج خيوطاً سحرية بين الواقع والخيال، تتعمق في مصير الشخصيات وتكشف الألغاز التي حيرت القراء في الأجزاء السابقة.",
      price: 642,
      priceUSD: 15.40,
      originalPrice: 917,
      originalPriceUSD: 22,
      discount: 30,
      image: "/book-images/Novels/Nbook156.jpeg",
      author: "هاروكي موراكامي"
    },
    {
      id: 162,
      title: "عداء الطائرة الورقية",
      category: "روايات",
      description: "رواية مؤثرة تروي قصة صداقة طفلين في كابول خلال فترات الاضطراب في أفغانستان، تبحث في مواضيع الخيانة والندم والخلاص عبر أجيال متعاقبة.",
      price: 525,
      priceUSD: 12.60,
      originalPrice: 750,
      originalPriceUSD: 18,
      discount: 30,
      image: "/book-images/Novels/Nbook157.jpg",
      author: "خالد حسيني"
    },
    {
      id: 163,
      title: "1Q84 الأزرق",
      category: "روايات",
      description: "بداية الملحمة السحرية التي تنقل القارئ إلى عالم موازٍ غامض، حيث تتداخل الأقدار بين مدربة رياضية وكاتب طموح في رواية تجمع بين التشويق والفلسفة.",
      price: 642,
      priceUSD: 15.40,
      originalPrice: 917,
      originalPriceUSD: 22,
      discount: 30,
      image: "/book-images/Novels/Nbook158.png",
      author: "هاروكي موراكامي"
    },
    {
      id: 164,
      title: "1Q84 الأخضر",
      category: "روايات",
      description: "استكمال للعالم الموازي في 1Q84، تتعمق الأحداث وتتشابك مصائر الشخصيات في نسيج روائي مذهل يبحث في طبيعة الواقع والزمن والمصير.",
      price: 642,
      priceUSD: 15.40,
      originalPrice: 917,
      originalPriceUSD: 22,
      discount: 30,
      image: "/book-images/Novels/Nbook159.webp",
      author: "هاروكي موراكامي"
    },
    {
      id: 165,
      title: "مقتل الكومنداتور 1",
      category: "روايات",
      description: "لوحة غامضة تقود فناناً إلى عالم من الأسرار والظواهر الخارقة في رواية تجمع بين التشويق البوليسي والعمق الفلسفي المميز لموراكامي.",
      price: 642,
      priceUSD: 15.40,
      originalPrice: 917,
      originalPriceUSD: 22,
      discount: 30,
      image: "/book-images/Novels/Nbook160.jpg",
      author: "هاروكي موراكامي"
    },
    {
      id: 166,
      title: "مقتل الكومنداتور 2",
      category: "روايات",
      description: "ختام الملحمة الفنية التي تبحث في طبيعة الإبداع والذاكرة، حيث تتصاعد الأحداث لتكشف الحقيقة المروعة خلف اللوحة الغامضة وشخصية الكومنداتور.",
      price: 642,
      priceUSD: 15.40,
      originalPrice: 917,
      originalPriceUSD: 22,
      discount: 30,
      image: "/book-images/Novels/Nbook161.jpg",
      author: "هاروكي موراكامي"
    },
    {
      id: 167,
      title: "سجين السماء",
      category: "روايات",
      description: "عودة إلى مقبرة الكتب المنسية في برشلونة، حيث تتداخل الأزمنة وتتكشف الأقدار في قصة مليئة بالغموض والشعرية المميزة لزافون.",
      price: 467,
      priceUSD: 11.20,
      originalPrice: 667,
      originalPriceUSD: 16,
      discount: 30,
      image: "/book-images/Novels/Nbook162.webp",
      author: "كارلوس زافون"
    },
    {
      id: 168,
      title: "لعبة الملاك",
      category: "روايات",
      description: "رحلة إلى برشلونة الأربعينيات حيث يبحث كاتب شاب عن الحقيقة خلف قصة مأساوية، في رواية تجمع بين الغموض والتاريخ والحب الخالد.",
      price: 642,
      priceUSD: 15.40,
      originalPrice: 917,
      originalPriceUSD: 22,
      discount: 30,
      image: "/book-images/Novels/Nbook163.jpeg",
      author: "كارلوس زافون"
    },
    {
      id: 169,
      title: "ظل الريح",
      category: "روايات",
      description: "رواية أسطورية تبدأ في مقبرة الكتب المنسية وتنطلق في رحلة عبر الزمن والذاكرة، تبحث عن كاتب غامض ورواية ملعونة في برشلونة ما بعد الحرب.",
      price: 584,
      priceUSD: 14.00,
      originalPrice: 834,
      originalPriceUSD: 20,
      discount: 30,
      image: "/book-images/Novels/Nbook164.jpg",
      author: "كارلوس زافون"
    },
    {
      id: 170,
      title: "حفلة التيس",
      category: "روايات",
      description: "تحفة أدبية تنتقد الديكتاتورية والفساد السياسي عبر قصة انقلاب في جمهورية الكاريبي، تجمع بين الواقعية السحرية والنقد الاجتماعي الحاد.",
      price: 467,
      priceUSD: 11.20,
      originalPrice: 667,
      originalPriceUSD: 16,
      discount: 30,
      image: "/book-images/Novels/Nbook165.jpg",
      author: "ماريو بارغاس يوسا"
    },
    {
      id: 171,
      title: "متاحة الأرواح",
      category: "روايات",
      description: "ختام رباعية مقبرة الكتب المنسية، تنسج خيوطاً أخيرة بين شخصيات السلسلة في لوحة روائية كبيرة تخلد عالم زافون السحري.",
      price: 817,
      priceUSD: 19.60,
      originalPrice: 1167,
      originalPriceUSD: 28,
      discount: 30,
      image: "/book-images/Novels/Nbook166.jpg",
      author: "كارلوس زافون"
    },
    {
      id: 172,
      title: "مئة عام من العزلة",
      category: "روايات",
      description: "تحفة ماركيز الخالدة التي تروي قصة عائلة بوينديا عبر سبعة أجيال في ماكوندو، تمزج بين الواقعية السحرية والتاريخ والتراجيديا الإنسانية.",
      price: 350,
      priceUSD: 8.40,
      originalPrice: 500,
      originalPriceUSD: 12,
      discount: 30,
      image: "/book-images/Novels/Nbook167.jpg",
      author: "غابرييل غارسيا ماركيز"
    },
    {
      id: 173,
      title: "القوقعة",
      category: "روايات",
      description: "رواية سيرية مؤلمة تروي قصة سجين سياسي في سجون النظام السوري، تصف بقسوة وحشية التعذيب وقوة الإرادة البشرية في مواجهة الموت.",
      price: 409,
      priceUSD: 9.80,
      originalPrice: 584,
      originalPriceUSD: 14,
      discount: 30,
      image: "/book-images/Novels/Nbook168.jpg",
      author: "مصطفى خليفة"
    },
    {
      id: 174,
      title: "البؤساء",
      category: "روايات",
      description: "ملحمة إنسانية عظيمة تتبع حياة جان فالجان من السجن إلى الخلاص، تنتقد الظلم الاجتماعي في فرنسا القرن التاسع عشر وتبحث في طبيعة العدالة والرحمة.",
      price: 350,
      priceUSD: 8.40,
      originalPrice: 500,
      originalPriceUSD: 12,
      discount: 30,
      image: "/book-images/Novels/Nbook169.jpg",
      author: "فيكتور هيجو"
    },
    {
      id: 175,
      title: "فتاة من ورق",
      category: "روايات",
      description: "قصة غامضة عن كاتب يخلق شخصية من ورق لتفاجئه بالظهور في الواقع، في رواية تجمع بين التشويق والعواطف الجياشة والبحث عن الهوية.",
      price: 467,
      priceUSD: 11.20,
      originalPrice: 667,
      originalPriceUSD: 16,
      discount: 30,
      image: "/book-images/Novels/Nbook170.jpg",
      author: "غيو ميسو"
    },
    {
      id: 176,
      title: "شقة في باريس",
      category: "روايات",
      description: "مبنى سحري في باريس يربط بين سكانه عبر الزمن، في قصة عن الحب والصداقة والمصادفات التي تغير الحياة إلى الأبد.",
      price: 467,
      priceUSD: 11.20,
      originalPrice: 667,
      originalPriceUSD: 16,
      discount: 30,
      image: "/book-images/Novels/Nbook171.jpg",
      author: "غيوم ميسو"
    },
    {
      id: 177,
      title: "نسيان",
      category: "روايات",
      description: "رواية عن ذاكرة الوطن والمنفى، تروي قصة حب مستحيل بين فلسطيني وفرنسية في باريس، تبحث في هوية الشتات وجروح الوطن المفقود.",
      price: 467,
      priceUSD: 11.20,
      originalPrice: 667,
      originalPriceUSD: 16,
      discount: 30,
      image: "/book-images/Novels/Nbook172.jpg",
      author: "أحلام مستغانمي"
    },
    {
      id: 178,
      title: "قبل أن تبرد القهوة 1",
      category: "روايات",
      description: "مقهى سحري في طوكيو يمنح الزبائن فرصة للسفر إلى الماضي، في قصص مؤثرة عن الندم والفرص الضائعة وإمكانية تغيير المصير.",
      price: 379,
      priceUSD: 9.10,
      originalPrice: 542,
      originalPriceUSD: 13,
      discount: 30,
      image: "/book-images/Novels/Nbook173.jpg",
      author: "توشيكازو كواغوشي"
    },
    {
      id: 179,
      title: "قبل أن تبرد القهوة 2",
      category: "روايات",
      description: "استكمال لسحر المقهى الغامض، مع قصص جديدة عن أشخاص يبحثون عن فرصة ثانية لتصحيح أخطاء الماضي قبل فوات الأوان.",
      price: 379,
      priceUSD: 9.10,
      originalPrice: 542,
      originalPriceUSD: 13,
      discount: 30,
      image: "/book-images/Novels/Nbook174.jpg",
      author: "توشيكازو كواغوشي"
    },
    {
      id: 180,
      title: "قبل أن تبرد القهوة 3",
      category: "روايات",
      description: "ختام الثلاثية الساحرة التي تبحث في علاقة الإنسان بالزمن والذاكرة، تقدم دروساً مؤثرة عن تقبل الماضي والعيش في الحاضر.",
      price: 379,
      priceUSD: 9.10,
      originalPrice: 542,
      originalPriceUSD: 13,
      discount: 30,
      image: "/book-images/Novels/Nbook175.jpeg",
      author: "توشيكازو كواغوشي"
    },
    {
      id: 181,
      title: "لماذا يتزوج الرجال العاهرات",
      category: "روايات",
      description: "تحليل اجتماعي جريء يبحث في العلاقات الزوجية المعقدة والتناقضات بين الحب والمنفعة، يقدم نظرة ثاقبة لديناميكيات القوة في الزواج.",
      price: 467,
      priceUSD: 11.20,
      originalPrice: 667,
      originalPriceUSD: 16,
      discount: 30,
      image: "/book-images/Novels/Nbook176.jpg",
      author: "شيري اجوف"
    },
    {
      id: 182,
      title: "عالم صوفي",
      category: "روايات",
      description: "رحلة شيقة عبر تاريخ الفلسفة في قصة فتاة تتلقى رسائل غامضة تطرح أسئلة وجودية، مقدمة ممتعة للفلسفة للصغار والكبار.",
      price: 467,
      priceUSD: 11.20,
      originalPrice: 667,
      originalPriceUSD: 16,
      discount: 30,
      image: "/book-images/Novels/Nbook177.jpg",
      author: "جوستاين غاردر"
    },
    {
      id: 183,
      title: "الأخوة كارامازوف 1/4",
      category: "روايات",
      description: "الجزء الأول من التحفة الفلسفية التي تبحث في الصراع بين الإيمان والإلحاد عبر قصة عائلة كارامازوف الممزقة بالجريمة والشهوة والصراع الأبوي.",
      price: 1226,
      priceUSD: 29.40,
      originalPrice: 1751,
      originalPriceUSD: 42,
      discount: 30,
      image: "/book-images/Novels/Nbook178.jpg",
      author: "دوستويفسكي"
    },
    {
      id: 184,
      title: "الأبله",
      category: "روايات",
      description: "رواية عن الخير المطلق في عالم فاسد، تتبع الأمير ميشكين وهو يحاول نشر الطيبة في مجتمع روسي مادي، تبحث في طبيعة البراءة والجنون.",
      price: 876,
      priceUSD: 21.00,
      originalPrice: 1251,
      originalPriceUSD: 30,
      discount: 30,
      image: "/book-images/Novels/Nbook179.png",
      author: "دوستويفسكي"
    },

  // ====================================================== //
  // التربية
  // ====================================================== //

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
    image: "/book-images/Education/Edbook1.jpg",
    author: "د. كيفين ليمان"
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
    image: "/book-images/Education/Edbook2.jpg",
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
    image: "/book-images/Education/Edbook3.jpg",
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
    image: "/book-images/Education/Edbook4.jpg",
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
    image: "/book-images/Education/Edbook5.jpg",
    author: "د. جابور ماتيه"
  },
  {
    id: 6,
    title: "كيف تتحدث فيستمع الأطفال إليك",
    category: "التربية",
    description: "دليل عملي ثوري في فن التواصل الفعال مع الأطفال، يقدم استراتيجيات ملموسة لتحويل الصراعات اليومية إلى فرص للتفاهم المتبادل وبناء علاقات قائمة على الاحترام والثقة بين الآباء والأبناء.",
    price: 436,
    priceUSD: 10.50,
    originalPrice: 624,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/Education/Edbook6.jpg",
    author: "جوانا فابر || جولي كينغ"
  },
  {
    id: 7,
    title: "تربية الطفل الخجول",
    category: "التربية",
    description: "مرشد شامل ومتعاطف لفهم عالم الطفل الخجول، يقدم أدوات عملية لتعزيز ثقته بنفسه وتطوير مهاراته الاجتماعية دون إجباره على تغيير طبيعته، مع الحفاظ على احترام شخصيته الفريدة.",
    price: 436,
    priceUSD: 10.50,
    originalPrice: 624,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/Education/Edbook7.jpg",
    author: "د. باربرا جي. ماركواي"
  },
  {
    id: 8,
    title: "المخ الإيجابي",
    category: "التربية",
    description: "رحلة علمية شيقة داخل عالم دماغ الطفل، تكشف كيف يمكن للتربية الواعية أن تشكل دوائر عصبية إيجابية تدعم السعادة والمرونة النفسية والتفكير الإبداعي لدى الأطفال throughout حياتهم.",
    price: 436,
    priceUSD: 10.50,
    originalPrice: 624,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/Education/Edbook8.jpg",
    author: "د. دانيال جيه. سيجيل"
  },
  {
    id: 9,
    title: "التهذيب الإيجابي للمراهقين",
    category: "التربية",
    description: "خريطة طريق لا غنى عنها للتعامل مع تحديات مرحلة المراهقة، تقدم منهجية متوازنة تجمع بين وضع الحدود الواضحة واحترام استقلالية المراهق، وتحويل فترة التمرد إلى فرصة للنمو المشترك.",
    price: 436,
    priceUSD: 10.50,
    originalPrice: 624,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/Education/Edbook9.jpg",
    author: "د. جين تيتسن"
  },
  {
    id: 10,
    title: "التهذيب الإيجابي من الألف إلى الياء",
    category: "التربية",
    description: "موسوعة شاملة تحوي حلولاً عملية لمئات التحديات التربوية اليومية، من نوبات الغضب في الطفولة المبكرة إلى مشاكل الواجبات المدرسية، مع التركيز على تعزيز الانضباط الذاتي بدلاً من العقاب.",
    price: 436,
    priceUSD: 10.50,
    originalPrice: 624,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/Education/Edbook10.jpg",
    author: "جان نيلسن"
  },
  {
    id: 11,
    title: "أريد أطفال أصحاء",
    category: "التربية",
    description: "رؤية متكاملة لصحة الطفل تشمل الجوانب الجسدية والنفسية والعقلية، تقدم نصائح عملية حول التغذية المتوازنة، النوم الصحي، إدارة الشاشات، وبناء نظام مناعي قوي في عالم مليء بالتحديات.",
    price: 407,
    priceUSD: 9.80,
    originalPrice: 582,
    originalPriceUSD: 14,
    discount: 30,
    image: "/book-images/Education/Edbook11.jpg",
    author: "علياء المؤيد"
  },
  {
    id: 12,
    title: "التربية بذكاء",
    category: "التربية",
    description: "مزيج مبدع بين الحكمة التربوية التقليدية وأحدث الأبحاث العلمية، يقدم استراتيجيات ذكية لتنمية التفكير النقدي والذكاء العاطفي والمهارات الحياتية في الأطفال، مع التركيز على التربية المرنة التي تتكيف مع متغيرات العصر.",
    price: 320,
    priceUSD: 7.70,
    originalPrice: 457,
    originalPriceUSD: 11,
    discount: 30,
    image: "/book-images/Education/Edbook12.jpg",
    author: "كريم الشاذلي"
  },
  {
    id: 13,
    title: "اتخاذ القرار عند الأطفال",
    category: "التربية",
    description: "دليل عمري لتنمية مهارة اتخاذ القرار لدى الأطفال منذ سنواتهم الأولى حتى المراهقة، يوضح كيف يمكن للوالدين تدريب أبنائهم على تحليل الخيارات وتحمل المسؤولية وبناء الثقة في قدراتهم التحليلية عبر مواقف حياتية متنوعة.",
    price: 291,
    priceUSD: 7.00,
    originalPrice: 416,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Education/Edbook13.webp",
    author: "وفاء اليمني"
  },

  // =================================================== //
  // التاريخ
  // =================================================== //

  {
    id: 1,
    title: "مائة من عظماء أمة الإسلام غيروا مجرى التاريخ",
    category: "تاريخ",
    description: "مائة عظيم غيروا مجرى التاريخ",
    price: 496,
    priceUSD: 12,
    originalPrice: 620,
    originalPriceUSD: 15,
    discount: 20,
    image: "/book-images/History/Hbook1.jpg",
    author: "جهاد الترباني"
  },
  {
    id: 2,
    title: "البداية والنهاية || السبع مجلدات",
    category: "تاريخ",
    description: "",
    price: 2180,
    priceUSD: 52.8,
    originalPrice: 2724.5,
    originalPriceUSD: 66,
    discount: 20,
    image: "/book-images/History/stendo2.jpg",
    images: [
        "/book-images/History/stendo2.jpg",
        "/book-images/History/stendo1.jpg"
    ],
    author: "ابن كثير"
  },
  {
    id: 3,
    title: "التاريخ الإسلامي المجلد الأول والثاني",
    category: "تاريخ",
    description: "",
    price: 660,
    priceUSD: 16,
    originalPrice: 826,
    originalPriceUSD: 20,
    discount: 20,
    image: "/book-images/History/islami1.jpg",
    images: [
        "/book-images/History/islami1.jpg",
        "/book-images/History/islami2.jpg"
    ],
    author: "ابن كثير"
  },
  {
    id: 4,
    title: "حقيقة السبي البابلي",
    category: "تاريخ",
    description: "كتاب يبحث في الأحداث التاريخية المحيطة بالسبي البابلي لليهود.",
    price: 260,
    priceUSD: 6.30,
    originalPrice: 372,
    originalPriceUSD: 9,
    discount: 30,
    image: "/book-images/History/Hbook2.jpg",
    author: "فاضل الربيعي"
  },
  {
    id: 5,
    title: "جبريل والنبي",
    category: "تاريخ",
    description: "دراسة تاريخية حول العلاقة بين الوحي والنبوة في التاريخ الإسلامي.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/History/Hbook3.jpg",
    author: "فاضل الربيعي"
  },
  {
    id: 6,
    title: "عرب العراق والجزيرة",
    category: "تاريخ",
    description: "بحث تاريخي عن أصول وانتشار القبائل العربية في العراق والجزيرة العربية.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/History/Hbook4.jpg",
    author: "غيرتورد لوثيان بل واخرون"
  },
  {
    id: 7,
    title: "حضارة بابل وآشور",
    category: "تاريخ",
    description: "استعراض شامل لإنجازات وتراث حضارتي بابل وآشور القديمتين.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/History/Hbook5.jpg",
    author: "غوستاف لوبون"
  },
  {
    id: 8,
    title: "حضارات حطمتها الآلهة",
    category: "تاريخ",
    description: "تحليل لانهيار حضارات قديمة من خلال الأساطير والمعتقدات الدينية.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/History/Hbook6.jpg",
    author: "خزعل الماجدي"
  },
  {
    id: 9,
    title: "حضارة العرب",
    category: "تاريخ",
    description: "إرث الحضارة العربية وإسهاماتها في العلوم والفنون والثقافة العالمية.",
    price: 376,
    priceUSD: 9.10,
    originalPrice: 537,
    originalPriceUSD: 13,
    discount: 30,
    image: "/book-images/History/Hbook7.jpg",
    author: "غوستاف لوبون"
  },
  {
    id: 10,
    title: "جبل الزيتون",
    category: "تاريخ",
    description: "تاريخ وأهمية جبل الزيتون في القدس عبر العصور المختلفة.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 30,
    image: "/book-images/History/Hbook8.jpg",
    author: "فالح رفق اطاي"
  },
  {
    id: 11,
    title: "في مهب العراق",
    category: "تاريخ",
    description: "تحليل للأحداث والتحولات السياسية الكبرى التي مر بها العراق الحديث.",
    price: 521,
    priceUSD: 12.60,
    originalPrice: 744,
    originalPriceUSD: 18,
    discount: 30,
    image: "/book-images/History/Hbook9.jpg",
    author: "علي عبد الأمير عجام"
  },
  {
    id: 12,
    title: "تاريخ القدس القديم",
    category: "تاريخ",
    description: "رحلة عبر التاريخ القديم لمدينة القدس منذ أقدم العصور.",
    price: 463,
    priceUSD: 11.20,
    originalPrice: 661,
    originalPriceUSD: 16,
    discount: 30,
    image: "/book-images/History/Hbook10.jpeg",
    author: "خزعل الماجدي"
  },
  {
    id: 13,
    title: "شقيقات قريش",
    category: "تاريخ",
    description: "دراسة تاريخية عن دور النساء في قبيلة قريش وفي صدر الإسلام.",
    price: 434,
    priceUSD: 10.50,
    originalPrice: 620,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/History/Hbook11.webp",
    author: "فاضل الربيعي"
  },
  {
    id: 14,
    title: "من مأرب إلى مكة",
    category: "تاريخ",
    description: "تتبع للهجرات والتحركات السكانية من مملكة سبأ في مأرب نحو مكة.",
    price: 521,
    priceUSD: 12.60,
    originalPrice: 744,
    originalPriceUSD: 18,
    discount: 30,
    image: "/book-images/History/Hbook12.jpg",
    author: "فريق من الباحثين"
  },
  {
    id: 15,
    title: "من بابل الى بغداد",
    category: "تاريخ",
    description: "رحلة عبر التاريخ تربط بين أمجاد بابل القديمة وتاريخ بغداد الحديث.",
    price: 434,
    priceUSD: 10.50,
    originalPrice: 620,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/History/Hbook13.jpg",
    author: "سعيد الغانمي"
  },
  {
    id: 16,
    title: "صدى السنين الحاكي",
    category: "تاريخ",
    description: "توثيق لتاريخ منطقة ظفار العمانية وأحداثها عبر السنين.",
    price: 434,
    priceUSD: 10.50,
    originalPrice: 620,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/History/Hbook14.jpg",
    author: "صالح الشحري"
  },
  {
    id: 17,
    title: "تقرير من الداخل",
    category: "تاريخ",
    description: "شهادة وتحليل من داخل أحداث تاريخية معاصرة وشخصية.",
    price: 376,
    priceUSD: 9.10,
    originalPrice: 537,
    originalPriceUSD: 13,
    discount: 30,
    image: "/book-images/History/Hbook15.jpg",
    author: "بول أوستر"
  },

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
  image: "/book-images/Philosophy & Psychology/Ppbook1.jpg",
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
  image: "/book-images/Philosophy & Psychology/Ppbook2.jpg",
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
  image: "/book-images/Philosophy & Psychology/Ppbook3.jpg",
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
  image: "/book-images/Philosophy & Psychology/Ppbook4.jpg",
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
  image: "/book-images/Philosophy & Psychology/Ppbook5.jpg",
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
  image: "/book-images/Philosophy & Psychology/Ppbook6.jpg",
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
  image: "/book-images/Philosophy & Psychology/Ppbook7.jpg",
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
  image: "/book-images/Philosophy & Psychology/Ppbook8.jpg",
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
  image: "/book-images/Philosophy & Psychology/Ppbook9.jpg",
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
  image: "/book-images/Philosophy & Psychology/Ppbook10.jpg",
  author: "د. يوسف الحسني",
  },
  {
  id: 11,
  title: "مقدمة ابن خلدون",
  category: "فلسفة و علم نفس",
  description: "من أشهر كتب الفلسفة",
  price: 428,
  priceUSD: 10.4,
  originalPrice: 535,
  originalPriceUSD: 13,
  discount: 25,
  image: "/book-images/Philosophy & Psychology/Ppbook11.jpg",
  author: "د. يوسف الحسني",
  },
  {
    id: 12,
    title: "فن الإغواء",
    category: "فلسفة و علم نفس",
    description: "تحليل لاستراتيجيات الإغواء والتأثير على الآخرين عبر التاريخ.",
    price: 578,
    priceUSD: 14.00,
    originalPrice: 826,
    originalPriceUSD: 20,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook12.jpg",
    author: "روبرت غرين"
  },
  {
    id: 13,
    title: "عند حدود العقل",
    category: "فلسفة و علم نفس",
    description: "تأملات فلسفية حول قدرات العقل البشري وحدود إدراكه.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook13.jpg",
    author: "جان امري"
  },
  {
    id: 14,
    title: "مقال عن المنهج",
    category: "فلسفة و علم نفس",
    description: "أساسيات المنهج الفلسفي والعلمي كما وضعها الفيلسوف ديكارت.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook14.jpg",
    author: "ديكارت"
  },
  {
    id: 15,
    title: "من العدم الى الولادة",
    category: "فلسفة و علم نفس",
    description: "دراسة فلسفية ونفسية لأصل الوجود والوعي الإنساني.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook15.jpg",
    author: "دابليو آي هاريس"
  },
  {
    id: 16,
    title: "فلسفة التاريخ",
    category: "فلسفة و علم نفس",
    description: "تحليل فلسفي لمسيرة التاريخ البشري وقوانين تطوره.",
    price: 260,
    priceUSD: 6.30,
    originalPrice: 372,
    originalPriceUSD: 9,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook16.jpg",
    author: "غوستاف لوبون"
  },
  {
    id: 17,
    title: "الدماغ الخلَّاق",
    category: "فلسفة و علم نفس",
    description: "استكشاف للعمليات العصبية والنفسية وراء الإبداع البشري.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook17.jpg",
    author: "نانسي اندرياسن"
  },
  {
    id: 18,
    title: "ارتيابات الوقت الراهن",
    category: "فلسفة و علم نفس",
    description: "قراءة نقدية للتحولات الاجتماعية والفكرية في العصر الحديث.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook18.jpg",
    author: "غوستاف لوبон"
  },
  {
    id: 19,
    title: "سلامة الروح وراحة الجسد",
    category: "فلسفة و علم نفس",
    description: "تأملات في تحقيق التوازن والسلام الداخلي بين الجسد والروح.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook19.jpg",
    author: "المهاتما غاندي"
  },
  {
    id: 20,
    title: "فِتِغِنشتاين والمعنى في الحياة",
    category: "فلسفة و علم نفس",
    description: "دراسة لفلسفة فتغنشتاين وتطبيقاتها على بحث الإنسان عن المعنى.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook20.jpeg",
    author: "رضا حسيني"
  },
  {
    id: 21,
    title: "مقدمات",
    category: "فلسفة و علم نفس",
    description: "مقدمات فلسفية أساسية لفهم الوجود والإيمان والمعاناة الإنسانية.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook21.jpg",
    author: "سورن كيرككورد"
  },
  {
    id: 22,
    title: "موجز تاريخ الدماغ والروح",
    category: "فلسفة و علم نفس",
    description: "رحلة عبر تطور المفاهيم حول العلاقة بين العقل المادي والروح.",
    price: 289,
    priceUSD: 7.00,
    originalPrice: 413,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook22.jpg",
    author: "ماتياس ايكولد"
  },
  {
    id: 23,
    title: "طرق التفكير",
    category: "فلسفة و علم نفس",
    description: "تحليل لأنماط العقلية الثابتة versus النامية وتأثيرها على النجاح.",
    price: 405,
    priceUSD: 9.80,
    originalPrice: 578,
    originalPriceUSD: 14,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook23.webp",
    author: "كارول أس دويك"
  },
  {
    id: 24,
    title: "أحفاد سقراط",
    category: "فلسفة و علم نفس",
    description: "تأملات في استمرارية التراث السقراطي وتأثيره على الفكر الحديث.",
    price: 289,
    priceUSD: 7.00,
    originalPrice: 413,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook24.jpg",
    author: "علي حسين"
  },
  {
    id: 25,
    title: "الحاضر والمستقبل",
    category: "فلسفة و علم نفس",
    description: "تحليل نفسي للعلاقة بين إدراك الزمن والتخطيط للمستقبل.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook25.jpg",
    author: "كارل غوستاف"
  },
  {
    id: 26,
    title: "التكرار",
    category: "فلسفة و علم نفس",
    description: "دراسة فلسفية لمفهوم التكرار وأهميته في التجربة الإنسانية والذاكرة.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook26.jpg",
    author: "سورن كيرككورد"
  },
  {
    id: 27,
    title: "ما الأمة",
    category: "فلسفة و علم نفس",
    description: "بحث في الأسس الفلسفية والسيكولوجية لتشكيل الهوية الوطنية والأمة.",
    price: 434,
    priceUSD: 10.50,
    originalPrice: 620,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook27.jpg",
    author: "د. نادر كاظم"
  },
  {
    id: 28,
    title: "الديني والتحليل والنفسي",
    category: "فلسفة و علم نفس",
    description: "تقاطعات بين المعتقد الديني ومنهج التحليل النفسي في فهم الذات.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook28.jpg",
    author: "فيليب جوليان"
  },
  {
    id: 29,
    title: "اللغة والإنسان",
    category: "فلسفة و علم نفس",
    description: "استكشاف للعلاقة الجوهرية بين تطور اللغة وتشكيل الوعي الإنساني.",
    price: 289,
    priceUSD: 7.00,
    originalPrice: 413,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook29.jpg",
    author: "ماكس بيكارد"
  },
  {
    id: 30,
    title: "ثناء على الجيل الجديد",
    category: "فلسفة و علم نفس",
    description: "نظرة تفاؤلية وتحليلية لخصائص وإمكانيات الأجيال المعاصرة.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook30.jpg",
    author: "د. عبدالجبار الرفاعي"
  },
  {
    id: 31,
    title: "إدوارد سعيد 'المثقف الراديكالي'",
    category: "فلسفة و علم نفس",
    description: "دراسة لفكر إدوارد سعيد ودور المثقف النقدي في مواجهة السلطة.",
    price: 173,
    priceUSD: 4.20,
    originalPrice: 248,
    originalPriceUSD: 6,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook31.jpg",
    author: "د. رسول محمد روسل"
  },
  {
    id: 32,
    title: "حول الشعر والفلسفة",
    category: "فلسفة و علم نفس",
    description: "حوار بين الشعر كتعبير جمالي والفلسفة كبحث عقلي عن الحقيقة.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook32.jpg",
    author: "جون ستيوارت مل"
  },
  {
    id: 33,
    title: "القوانين النفسية لتطور الشعوب",
    category: "فلسفة و علم نفس",
    description: "تحليل للعوامل النفسية الجماعية التي تحكم تقدم أو تدهور الأمم.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook33.jpg",
    author: "غوستاف لوبون"
  },
  {
    id: 34,
    title: "دروس سيكولوجية من الحرب الأوربية (1915)",
    category: "فلسفة و علم نفس",
    description: "تحليل نفسي لسلوكيات الأفراد والجماعات أثناء الصراعات الكبرى.",
    price: 405,
    priceUSD: 9.80,
    originalPrice: 578,
    originalPriceUSD: 14,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook34.jpg",
    author: "غوستاف لوبون"
  },
  {
    id: 35,
    title: "الوعي والعدم",
    category: "فلسفة و علم نفس",
    description: "تأملات في طبيعة الوعي البشري وعلاقته بمفهوم العدم والوجود.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook35.jpg",
    author: "منذر جلوب"
  },
  {
    id: 36,
    title: "أخلاقيات عالمنا الواقعي",
    category: "فلسفة و علم نفس",
    description: "نظرة عملية للفلسفة الأخلاقية وتطبيقاتها على مشاكل العالم المعاصر.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook36.jpg",
    author: "بيتسر سينغر"
  },
  {
    id: 37,
    title: "محادثة مع بورمان",
    category: "فلسفة و علم نفس",
    description: "حوار فلسفي يشرح أفكار ديكارت الأساسية حول الوجود والمعرفة.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook37.jpg",
    author: "رينه ديكارت"
  },
  {
    id: 38,
    title: "إشكالات الفلسفة السياسية",
    category: "فلسفة و علم نفس",
    description: "مناقشة للإشكاليات الأساسية في الفلسفة السياسية كالسلطة والعدالة.",
    price: 289,
    priceUSD: 7.00,
    originalPrice: 413,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook38.jpg",
    author: "ديفيد د.رفائيل"
  },
  {
    id: 39,
    title: "تحول الشعوب الذهني",
    category: "فلسفة و علم نفس",
    description: "دراسة للتحولات في العقليات الجماعية والوعي الجمعي عبر التاريخ.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook39.jpg",
    author: "غوستاف لوبون"
  },
  {
    id: 40,
    title: "فاغنر في بايرويت",
    category: "فلسفة و علم نفس",
    description: "نقد وتحليل لفن ريشارد فاغنر وتأثيره على الثقافة من منظور نيتشه.",
    price: 173,
    priceUSD: 4.20,
    originalPrice: 248,
    originalPriceUSD: 6,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook40.jpg",
    author: "نيتشه"
  },
  {
    id: 41,
    title: "ديفيد شتراوس",
    category: "فلسفة و علم نفس",
    description: "نقد نيتشه اللاذع للفكر اللاهوتي والتاريخي لديفيد شتراوس.",
    price: 173,
    priceUSD: 4.20,
    originalPrice: 248,
    originalPriceUSD: 6,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook41.jpg",
    author: "نيتشه"
  },
  {
    id: 42,
    title: "شوبنهاور مربيًا",
    category: "فلسفة و علم نفس",
    description: "تأملات نيتشه حول فلسفة شوبنهاور وتأثيرها التربوي على الفرد.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook42.jpg",
    author: "نيتشه"
  },
  {
    id: 43,
    title: "مراحل على طريق الحياة",
    category: "فلسفة و علم نفس",
    description: "تحليل للرحلة الوجودية للإنسان عبر مراحل الحياة المختلفة.",
    price: 405,
    priceUSD: 9.80,
    originalPrice: 578,
    originalPriceUSD: 14,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook43.jpg",
    author: "سون كيرككورد"
  },
  {
    id: 44,
    title: "لماذا الحرب ؟",
    category: "فلسفة و علم نفس",
    description: "تحليل نفسي للدوافع الغريزية واللاواعية الكامنة وراء نشوب الحروب.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook44.jpg",
    author: "سيغموند فرويد"
  },
  {
    id: 45,
    title: "الرواد النفسيون",
    category: "فلسفة و علم نفس",
    description: "لمحة عن حياة وأفكار الرواد المؤسسين لعلم النفس الحديث.",
    price: 434,
    priceUSD: 10.50,
    originalPrice: 620,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook45.webp",
    author: "مايك جاي"
  },
  {
    id: 46,
    title: "اعترافات قاتل اقتصادي",
    category: "فلسفة و علم نفس",
    description: "كشف الآليات النفسية والاقتصادية لاستغلال الدول النامية.",
    price: 521,
    priceUSD: 12.60,
    originalPrice: 744,
    originalPriceUSD: 18,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook46.jpg",
    author: "جون بيركنز"
  },
  {
    id: 47,
    title: "انفعالات النفس",
    category: "فلسفة و علم نفس",
    description: "دراسة فلسفية للانفعالات البشرية وتأثيرها على العقل والقرارات.",
    price: 289,
    priceUSD: 7.00,
    originalPrice: 413,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook47.jpg",
    author: "رينه ديكارت"
  },
  {
    id: 48,
    title: "في اليقين",
    category: "فلسفة و علم نفس",
    description: "بحث في أسس المعرفة اليقينية وحدودها من منظور فتغنشتاين المتأخر.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 7,
    discount: 30,
    image: "/book-images/Philosophy & Psychology/Ppbook48.jpg",
    author: "لودفيغ فتغنشتاين"
  },
  

  // ================================================= //
  // الأدب
  // ================================================= //

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
  image: "/book-images/Literature/Lbook1.jpg",
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
  image: "/book-images/Literature/Lbook2.jpg",
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
  image: "/book-images/Literature/Lbook3.jpg",
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
  image: "/book-images/Literature/Lbook4.jpg",
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
  image: "/book-images/Literature/Lbook5.jpg",
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
  image: "/book-images/Literature/Lbook6.jpg",
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
  image: "/book-images/Literature/Lbook7.jpg",
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
  image: "/book-images/Literature/Lbook8.jpg",
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
  image: "/book-images/Literature/Lbook9.jpg",
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
  image: "/book-images/Literature/Lbook10.jpg",
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
  image: "/book-images/Literature/Lbook11.jpg",
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
  image: "/book-images/Literature/Lbook12.jpg",
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
  image: "/book-images/Literature/Lbook13.jpg",
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
  image: "/book-images/Literature/Lbook14.png",
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
  image: "/book-images/Literature/Lbook15.jpg",
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
  image: "/book-images/Literature/Lbook16.jpg",
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
  image: "/book-images/Literature/Lbook17.jpg",
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
  image: "/book-images/Literature/Lbook18.jpg",
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
  image: "/book-images/Literature/Lbook19.jpg",
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
  image: "/book-images/Literature/Lbook20.jpg",
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
  image: "/book-images/Literature/Lbook21.jpg",
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
  image: "/book-images/Literature/Lbook22.jpg",
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
  image: "/book-images/Literature/Lbook23.jpg",
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
  image: "/book-images/Literature/Lbook24.jpg",
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
    image: "/book-images/Literature/Lbook25.jpg",
    images: [
      "/book-images/Literature/Lbook25.jpg",
      "/book-images/Literature/Lbook26.jpg",
      "/book-images/Literature/Lbook27.jpg"
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
  image: "/book-images/Literature/Lbook28.jpg",
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
  image: "/book-images/Literature/Lbook29.jpg",
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
  image: "/book-images/Literature/Lbook30.png",
  author: ""
  },
  {
    id: 29,
    title: "ديوان المتنبي",
    category: "الأدب",
    description: "أشهر دواوين الشعر العربي، يضم قصائد أبو الطيب المتنبي في الفخر والحكمة والمدح.",
    price: 460,
    priceUSD: 11.20,
    originalPrice: 575,
    originalPriceUSD: 14,
    discount: 20,
    image: "/book-images/Literature/Lbook31.jpg",
    author: "ابو الطيب أحمد ابن الحسين المتنبي"
  },
  {
    id: 30,
    title: "الشوقيات",
    category: "الأدب",
    description: "ديوان أمير الشعراء أحمد شوقي، ويشمل روائعه في الشعر الوطني والغزلي والاجتماعي.",
    price: 427,
    priceUSD: 10.40,
    originalPrice: 534,
    originalPriceUSD: 13,
    discount: 20,
    image: "/book-images/Literature/Lbook32.jpg",
    author: "أحمد شوقي"
  },
  {
    id: 31,
    title: "فاطمئن",
    category: "الأدب",
    description: "كتاب أدبي يقدم رسائل تطمئن القلب وتزيد من الثقة بالنفس والإيمان.",
    price: 329,
    priceUSD: 8.00,
    originalPrice: 411,
    originalPriceUSD: 10,
    discount: 20,
    image: "/book-images/Literature/Lbook33.jpg",
    author: "عمر آل عوضة"
  },
  {
    id: 32,
    title: "لأعني عبدك",
    category: "الأدب",
    description: "مجموعة من الخواطر والأدعية التي تعبر عن مناجاة العبد لربه.",
    price: 329,
    priceUSD: 8.00,
    originalPrice: 411,
    originalPriceUSD: 10,
    discount: 20,
    image: "/book-images/Literature/Lbook34.jpg",
    author: "عمر آل عوضة"
  },
  {
    id: 33,
    title: "فوضى العودة",
    category: "الأدب",
    description: "رواية أو مجموعة قصصية تعكس حالة من الفوضى العاطفية أو الاجتماعية المرتبطة بالعودة.",
    price: 460,
    priceUSD: 11.20,
    originalPrice: 575,
    originalPriceUSD: 14,
    discount: 20,
    image: "/book-images/Literature/Lbook35.jpg",
    author: "أثير عبدالله النشمي"
  },
  {
    id: 34,
    title: "مختصر كلامي",
    category: "الأدب",
    description: "مجموعة من الخواطر والكلمات المكثفة ذات المعاني العميقة.",
    price: 460,
    priceUSD: 11.20,
    originalPrice: 575,
    originalPriceUSD: 14,
    discount: 20,
    image: "/book-images/Literature/Lbook36.jpg",
    author: "رغدان بن حسن"
  },
  {
    id: 35,
    title: "آخر قهوة",
    category: "الأدب",
    description: "مجموعة نثرية أو قصصية تستخدم القهوة كاستعارة للوداع أو الختام.",
    price: 463,
    priceUSD: 11.2,
    originalPrice: 662,
    originalPriceUSD: 16,
    discount: 30,
    image: "/book-images/Literature/Lbook37.jpg",
    author: "فواز محمد باقر"
  },
  {
    id: 36,
    title: "غلاف جميل",
    category: "الأدب",
    description: "عمل أدبي يتناول فكرة الحقيقة المخبأة وراء المظاهر الجميلة.",
    price: 405,
    priceUSD: 9.8,
    originalPrice: 575,
    originalPriceUSD: 14,
    discount: 30,
    image: "/book-images/Literature/Lbook38.jpg",
    author: "فواز محمد باقر"
  },
  {
    id: 37,
    title: "كتاب جميل",
    category: "الأدب",
    description: "مجموعة نثرية أو قصصية تبحث عن الجمال في التفاصيل والكلمات.",
    price: 490,
    priceUSD: 11.9,
    originalPrice: 703,
    originalPriceUSD: 17,
    discount: 30,
    image: "/book-images/Literature/Lbook39.jpg",
    author: "فواز محمد باقر"
  },
  {
    id: 38,
    title: "نزار قباني",
    category: "الأدب",
    description: "مجموعة مختارة من أشهر قصائد الشاعر السوري نزار قباني في الحب والمرأة والقضايا الاجتماعية.",
    price: 427,
    priceUSD: 10.40,
    originalPrice: 534,
    originalPriceUSD: 13,
    discount: 20,
    image: "/book-images/Literature/Lbook40.jpeg",
    author: "نزار قباني"
  },
  {
    id: 39,
    title: "واقع مستجد",
    category: "الأدب",
    description: "نصوص أدبية تعبر عن تفاعل الإنسان مع مستجدات ووقائع الحياة المعاصرة.",
    price: 405,
    priceUSD: 9.8,
    originalPrice: 578,
    originalPriceUSD: 14,
    discount: 30,
    image: "/book-images/Literature/Lbook41.jpeg",
    author: "رغدان بن حسن"
  },
  {
    id: 40,
    title: "ظل الظل",
    category: "الأدب",
    description: "نصوص أدبية تستكشف طبقات الظل والمعنى في التجربة الإنسانية.",
    price: 173,
    priceUSD: 4.20,
    originalPrice: 248,
    originalPriceUSD: 6,
    discount: 30,
    image: "/book-images/Literature/Lbook42.jpg",
    author: "حسن عبدالله"
  },
  {
    id: 41,
    title: "القرية التي كنا فيها",
    category: "الأدب",
    description: "ذكريات وحكايات عن القرية التي نشأ فيها الكاتب وتأثيرها على حياته.",
    price: 289,
    priceUSD: 7.00,
    originalPrice: 413,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Literature/Lbook43.jpg",
    author: "محمد ياسين صالح"
  },
  {
    id: 42,
    title: "حرب أهلية",
    category: "الأدب",
    description: "رواية أو مجموعة قصصية تعكس تداعيات الحرب على النسيج الاجتماعي.",
    price: 173,
    priceUSD: 4.20,
    originalPrice: 248,
    originalPriceUSD: 6,
    discount: 30,
    image: "/book-images/Literature/Lbook44.jpg",
    author: "خوسي سانشيس سنيسترا"
  },
  {
    id: 43,
    title: "المرأة الدينية و المرأة النسوية",
    category: "الأدب",
    description: "مقارنة أدبية وفكرية بين نموذجي المرأة في الخطاب الديني والنسوي.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Literature/Lbook45.jpg",
    author: "موج يوسف"
  },
  {
    id: 44,
    title: "مجرد وقت وسيمضي",
    category: "الأدب",
    description: "تأملات في طبيعة الزمن ومروره وتأثيره على المشاعر والعلاقات.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/Literature/Lbook46.jpg",
    author: "شاكر الناصري"
  },
  {
    id: 45,
    title: "الهايكوات الكاملة",
    category: "الأدب",
    description: "مجموعة كاملة من قصائد الهايكو للشاعر جان كيرواك.",
    price: 376,
    priceUSD: 9.10,
    originalPrice: 537,
    originalPriceUSD: 13,
    discount: 30,
    image: "/book-images/Literature/Lbook47.webp",
    author: "جان كيرواك"
  },
  {
    id: 46,
    title: "الاغتراب الجميل",
    category: "الأدب",
    description: "استكشاف لجمالية الاغتراب والغربة في الأدب والحياة.",
    price: 405,
    priceUSD: 9.80,
    originalPrice: 578,
    originalPriceUSD: 14,
    discount: 30,
    image: "/book-images/Literature/Lbook48.jpg",
    author: "علي عبدالامير عجام"
  },
  {
    id: 47,
    title: "ثالث عيوني",
    category: "الأدب",
    description: "نصوص شعرية أو سردية تنظر إلى العالم بعين ثالثة مفعمة بالإبداع.",
    price: 173,
    priceUSD: 4.20,
    originalPrice: 248,
    originalPriceUSD: 6,
    discount: 30,
    image: "/book-images/Literature/Lbook49.jpg",
    author: "علي مهدi"
  },
  {
    id: 48,
    title: "رسائل جووج أورويل",
    category: "الأدب",
    description: "مجموعة من الرسائل الشخصية التي تكشف عن فكر جورج أورويل وخباياه.",
    price: 477,
    priceUSD: 11.55,
    originalPrice: 682,
    originalPriceUSD: 16.5,
    discount: 30,
    image: "/book-images/Literature/Lbook50.jpg",
    author: "جورج أورويل"
  },
  {
    id: 49,
    title: "أيام القراءة",
    category: "الأدب",
    description: "ذكريات وتأملات الكاتب مارسيل بروست حول تجربته مع القراءة.",
    price: 173,
    priceUSD: 4.20,
    originalPrice: 248,
    originalPriceUSD: 6,
    discount: 30,
    image: "/book-images/Literature/Lbook51.jpg",
    author: "مارسيل بروست"
  },
  {
    id: 50,
    title: "ليل يديها",
    category: "الأدب",
    description: "نصوص أدبية تلامس مشاعر الحب واللوعة والاشتياق.",
    price: 289,
    priceUSD: 7.00,
    originalPrice: 413,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Literature/Lbook52.jpg",
    author: "زاهيي وهبي"
  },
  {
    id: 51,
    title: "تحديق",
    category: "الأدب",
    description: "قصائد أو نصوص تتأمل العالم بتحديق عميق يكشف التفاصيل الخفية.",
    price: 173,
    priceUSD: 4.20,
    originalPrice: 248,
    originalPriceUSD: 6,
    discount: 30,
    image: "/book-images/Literature/Lbook53.jpg",
    author: "محمد الخالدي"
  },
  {
    id: 52,
    title: "شجرة ديانا",
    category: "الأدب",
    description: "عمل أدبي يستلهم الأسطورة والطبيعة في بناء عالمه الشعري.",
    price: 144,
    priceUSD: 3.50,
    originalPrice: 207,
    originalPriceUSD: 5,
    discount: 30,
    image: "/book-images/Literature/Lbook54.jpg",
    author: "اليخاندؤا بيثانيك"
  },
  {
    id: 53,
    title: "من الأعماق",
    category: "الأدب",
    description: "رسالة وجدانية عميقة كتبها أوسكار وايلد خلال سجنه.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Literature/Lbook55.jpg",
    author: "اوسكار وايلd"
  },
  {
    id: 54,
    title: "نقشوا على الحجر",
    category: "الأدب",
    description: "نصوص أدبية تخلد الذاكرة والهوية كما لو كانت منقوشة على الحجر.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/Literature/Lbook56.jpg",
    author: "سعيد الغامدي"
  },
  {
    id: 55,
    title: "تباريح القراءة",
    category: "الأدب",
    description: "تأملات في متعة القراءة وأثرها على الروح والعقل.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Literature/Lbook57.jpg",
    author: "نعيم محمد الفارسي"
  },
  {
    id: 56,
    title: "رسائل فتغنشتاين",
    category: "الأدب",
    description: "مراسلات الفيلسوف لودفيغ فتغنشتاين التي تكشف عن جوانب من شخصيته وفكره.",
    price: 231,
    priceUSD: 5.60,
    originalPrice: 330,
    originalPriceUSD: 8,
    discount: 30,
    image: "/book-images/Literature/Lbook58.jpg",
    author: "لودفيغ فتغنشتاين"
  },
  {
    id: 57,
    title: "الرسائل الفارسية",
    category: "الأدب",
    description: "رواية رسائلية ساخرة تنتقد المجتمع الأوروبي في القرن الثامن عشر.",
    price: 434,
    priceUSD: 10.50,
    originalPrice: 620,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/Literature/Lbook59.jpg",
    author: "شارل لوي دي سيكوندا"
  },
  {
    id: 58,
    title: "سرفانتس",
    category: "الأدب",
    description: "دراسة أدبية عن حياة وأعمال الأديب الإسباني ميغيل دي سرفانتس.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Literature/Lbook60.jpg",
    author: "نجيب ابو ملهم"
  },
  {
    id: 59,
    title: "في الطابق الرابع",
    category: "الأدب",
    description: "قصة أو رواية تدور أحداثها في طابق رابع يحمل أسرارًا خاصة.",
    price: 289,
    priceUSD: 7.00,
    originalPrice: 413,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Literature/Lbook61.jpg",
    author: "نوفل الجنابي"
  },
  {
    id: 60,
    title: "رسائل مارسيل بروست",
    category: "الأدب",
    description: "مجموعة من الرسائل التي كتبها مارسيل بروست تكشف عن عالمه الخاص.",
    price: 434,
    priceUSD: 10.50,
    originalPrice: 620,
    originalPriceUSD: 15,
    discount: 30,
    image: "/book-images/Literature/Lbook62.jpg",
    author: "مارسيل بروست"
  },
  {
    id: 61,
    title: "الرسائل الأخيرة لياكويرو اورتس",
    category: "الأدب",
    description: "مجموعة الرسائل الأخيرة التي تعكس أفكار الكاتب في أواخر حياته.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Literature/Lbook63.jpg",
    author: "أوغو فوسكولو"
  },
  {
    id: 62,
    title: "كيف يتكون الذوق الأدبي",
    category: "الأدب",
    description: "تحليل لعوامل تشكيل الذوق الأدبي وتطوره عند الفرد والقارئ.",
    price: 260,
    priceUSD: 6.30,
    originalPrice: 372,
    originalPriceUSD: 9,
    discount: 30,
    image: "/book-images/Literature/Lbook64.jpg",
    author: "أرنولد بينيت"
  },
  {
    id: 63,
    title: "رسائل نابليون إلى جوزفين",
    category: "الأدب",
    description: "رسائل حب وغرام كتبها نابليون بونابرت إلى زوجته جوزفين.",
    price: 347,
    priceUSD: 8.40,
    originalPrice: 496,
    originalPriceUSD: 12,
    discount: 30,
    image: "/book-images/Literature/Lbook65.jpg",
    author: "تمت الترجمة من قبل 'زهرة مروة'"
  },
  {
    id: 64,
    title: "الرجل في الرداء الأحمر",
    category: "الأدب",
    description: "رواية أو سيرة أدبية تستكشف حياة شخصية غامضة ترتدي الرداء الأحمر.",
    price: 405,
    priceUSD: 9.80,
    originalPrice: 578,
    originalPriceUSD: 14,
    discount: 30,
    image: "/book-images/Literature/Lbook66.jpg",
    author: "جوليان بارنز"
  },
  {
    id: 65,
    title: "رسائل ميّ",
    category: "الأدب",
    description: "مجموعة الرسائل التي كتبتها الأديبة مي زيادة، تعكس عاطفتها وفكرها.",
    price: 173,
    priceUSD: 4.20,
    originalPrice: 248,
    originalPriceUSD: 6,
    discount: 30,
    image: "/book-images/Literature/Lbook67.jpg",
    author: "مي زيادة"
  },
  {
    id: 66,
    title: "القراءة صنعة العظماء",
    category: "الأدب",
    description: "كتاب يبرز دور القراءة في بناء شخصيات العظماء وتشكيل وعيهم.",
    price: 405,
    priceUSD: 9.80,
    originalPrice: 578,
    originalPriceUSD: 14,
    discount: 30,
    image: "/book-images/Literature/Lbook68.jpg",
    author: "نعيم محمد الفarسي"
  },
  {
    id: 67,
    title: "جلجامش واختلاس لغز الزمن",
    category: "الأدب",
    description: "قراءة معاصرة لملحمة جلجامش وعلاقتها بإشكالية الزمن والخلود.",
    price: 405,
    priceUSD: 9.80,
    originalPrice: 578,
    originalPriceUSD: 14,
    discount: 30,
    image: "/book-images/Literature/Lbook69.jpg",
    author: "سعيد الغانمي"
  },
  {
    id: 68,
    title: "خيال لا ينقطع",
    category: "الأدب",
    description: "مجموعة نصوص تؤكد على قوة الخيال الأدبي واستمراريته في خلق العوالم.",
    price: 463,
    priceUSD: 11.20,
    originalPrice: 661,
    originalPriceUSD: 16,
    discount: 30,
    image: "/book-images/Literature/Lbook70.jpg",
    author: "سعيد الغانمي"
  },
  {
    id: 69,
    title: "بدلًا من الأبيض",
    category: "الأدب",
    description: "تكتسب مثل هذه الاقتباسات أهمية ليست هينة من نواح عديدة، فهي أولاً توفّر لبعض القراء، بوصفها اقتباسات، موادَ تفيدهم في كتابات أو بحوث يقومون بها، قد يصعب عليهم الوصول إليها أو البحث عنها، بل ربما لم تخطر في بالهم؛ وهي ثانياً قد تفتح لمثل هكذا كتّاب أو لغيرهم أبواب مصادر لم يصلوا إليها أو لم يعرفوها أو أبواب موضوعات للكتابة عنها دراساتٍ أو بحوثاً؛ وهي ثالثاً قد تضع يد من يقوم بدراسة الأديب صاحب الاقتباسات - الذي هو هنا ميسلون هادي- على طبيعة تفكير هذا الأديب والموضوعات التي يفكر فيها أو تهمه، وقد يجد الباحث أصداءً لها في كتابة الأديب مما يساعد على فتح بعض مغاليق نصه؛ وهي أخيراً تشكّل هدايا لمثل هكذا كتّاب وباحثين بل للقراء عموماً، كونها مختارة بذائقة غير عادية هي ذائقة كاتب معروف، سواء كان ميسلون هادي أو غيرها. لذا ليس غريباً ان نجد الكثير من الأدباء على مر الحِقب الزمنية ينشرون مثل هذه المختارات في كتب خاصة.",
    price: 124,
    priceUSD: 7,
    originalPrice: 413,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Literature/Lbook71.jpg",
    author: "ميلسون هادي"
  },
  {
    id: 70,
    title: "ديوان الجواهري 1/6",
    category: "الأدب",
    description: "تكتسب مثل هذه الاقتباسات أهمية ليست هينة من نواح عديدة، فهي أولاً توفّر لبعض القراء، بوصفها اقتباسات، موادَ تفيدهم في كتابات أو بحوث يقومون بها، قد يصعب عليهم الوصول إليها أو البحث عنها، بل ربما لم تخطر في بالهم؛ وهي ثانياً قد تفتح لمثل هكذا كتّاب أو لغيرهم أبواب مصادر لم يصلوا إليها أو لم يعرفوها أو أبواب موضوعات للكتابة عنها دراساتٍ أو بحوثاً؛ وهي ثالثاً قد تضع يد من يقوم بدراسة الأديب صاحب الاقتباسات - الذي هو هنا ميسلون هادي- على طبيعة تفكير هذا الأديب والموضوعات التي يفكر فيها أو تهمه، وقد يجد الباحث أصداءً لها في كتابة الأديب مما يساعد على فتح بعض مغاليق نصه؛ وهي أخيراً تشكّل هدايا لمثل هكذا كتّاب وباحثين بل للقراء عموماً، كونها مختارة بذائقة غير عادية هي ذائقة كاتب معروف، سواء كان ميسلون هادي أو غيرها. لذا ليس غريباً ان نجد الكثير من الأدباء على مر الحِقب الزمنية ينشرون مثل هذه المختارات في كتب خاصة.",
    price: 2313,
    priceUSD: 56,
    originalPrice: 3305,
    originalPriceUSD: 80,
    discount: 30,
    image: "/book-images/Literature/Lbook72.webp",
    author: "الجواهري"
  },
  {
    id: 71,
    title: "ذكراياتي 1/2",
    category: "الأدب",
    description: "تكتسب مثل هذه الاقتباسات أهمية ليست هينة من نواح عديدة، فهي أولاً توفّر لبعض القراء، بوصفها اقتباسات، موادَ تفيدهم في كتابات أو بحوث يقومون بها، قد يصعب عليهم الوصول إليها أو البحث عنها، بل ربما لم تخطر في بالهم؛ وهي ثانياً قد تفتح لمثل هكذا كتّاب أو لغيرهم أبواب مصادر لم يصلوا إليها أو لم يعرفوها أو أبواب موضوعات للكتابة عنها دراساتٍ أو بحوثاً؛ وهي ثالثاً قد تضع يد من يقوم بدراسة الأديب صاحب الاقتباسات - الذي هو هنا ميسلون هادي- على طبيعة تفكير هذا الأديب والموضوعات التي يفكر فيها أو تهمه، وقد يجد الباحث أصداءً لها في كتابة الأديب مما يساعد على فتح بعض مغاليق نصه؛ وهي أخيراً تشكّل هدايا لمثل هكذا كتّاب وباحثين بل للقراء عموماً، كونها مختارة بذائقة غير عادية هي ذائقة كاتب معروف، سواء كان ميسلون هادي أو غيرها. لذا ليس غريباً ان نجد الكثير من الأدباء على مر الحِقب الزمنية ينشرون مثل هذه المختارات في كتب خاصة.",
    price: 1300,
    priceUSD: 31.5,
    originalPrice: 1860,
    originalPriceUSD: 45,
    discount: 30,
    image: "/book-images/Literature/Lbook73.webp",
    author: "الجواهري"
  },
  {
    id: 72,
    title: "الحياة مع الأب",
    category: "الأدب",
    description: "ذكريات شخصية تكشف عن جانب إنساني حميم من حياة الكاتب الكبير ليو تولستوي.",
    price: 376,
    priceUSD: 9.10,
    originalPrice: 537,
    originalPriceUSD: 13,
    discount: 30,
    image: "/book-images/Literature/Lbook74.jpg",
    author: "الكسندرا تولستايا"
  },
  {
    id: 73,
    title: "سيغموند فرويد ، السيرة الذاتية",
    category: "الأدب",
    description: "سيرة ذاتية يروي فيها فرويد قصة حياته وتطور أفكاره في التحليل النفسي.",
    price: 202,
    priceUSD: 4.90,
    originalPrice: 289,
    originalPriceUSD: 6,
    discount: 30,
    image: "/book-images/Literature/Lbook75.jpg",
    author: "سيغموند فرويد"
  },

  // ======================================= //
  // السياسة
  // ======================================= //

  {
  id: 1,
  title: "فن الحرب",
  category: "سياسة",
  description: "..",
  price: 217,
  priceUSD: 5.25,
  originalPrice: 289,
  originalPriceUSD: 7,
  discount: 25,
  image: "/book-images/Policy/Pbook1.jpg",
  author: "نيكولو مكيافيلي"
  },

  // ======================================= //
  // التطوير الذاتي
  // ======================================= //
  
  {
    id: 1,
    title: "هذه سبيلي",
    category: "تطوير الذات",
    description: "كتاب يحفز على تحديد الهدف والسعي لتحقيق الذات بطريقة ملهمة.",
    price: 592,
    priceUSD: 14.40,
    originalPrice: 740,
    originalPriceUSD: 18,
    discount: 20,
    image: "/book-images/Self-dev/Sdbook1.jpg",
    author: "أيمن العتوم"
  },
  {
    id: 2,
    title: "الأب الغني والأب الفقير",
    category: "تطوير الذات",
    description: "كتاب كلاسيكي يغير المفاهيم حول المال والاستثمار والحرية المالية.",
    price: 658,
    priceUSD: 16.00,
    originalPrice: 823,
    originalPriceUSD: 20,
    discount: 20,
    image: "/book-images/Self-dev/Sdbook2.jpg",
    author: "روبرت تي كيوساكي"
  },
  {
    id: 3,
    title: "فكر وازدد ثراء",
    category: "تطوير الذات",
    description: "من أشهر كتب تطوير الذات، يقدم 13 مبدأ للنجاح وبناء الثروة.",
    price: 526,
    priceUSD: 12.80,
    originalPrice: 658,
    originalPriceUSD: 16,
    discount: 20,
    image: "/book-images/Self-dev/Sdbook3.jpg",
    author: "نابليون هيل"
  },
  {
    id: 4,
    title: "الرجال من المريخ والنساء من الزهرة",
    category: "تطوير الذات",
    description: "دليل لفهم الاختلافات بين الرجل والمرأة وتحسين العلاقات.",
    price: 559,
    priceUSD: 13.60,
    originalPrice: 699,
    originalPriceUSD: 17,
    discount: 20,
    image: "/book-images/Self-dev/Sdbook4.jpg",
    author: "د. جون غراي"
  },
  {
    id: 5,
    title: "مميز بالأصفر",
    category: "تطوير الذات",
    description: "مجموعة من النصائح العملية والبسيطة لحياة أكثر سعادة وتنظيمًا.",
    price: 395,
    priceUSD: 9.60,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/book-images/Self-dev/Sdbook5.png",
    author: "إنش جاكسون براون ، الابن"
  },
  {
    id: 6,
    title: "لا تكن عشوائيًا",
    category: "تطوير الذات",
    description: "كتاب يحث على التخطيط والحياة الهادفة بعيدًا عن العشوائية.",
    price: 526,
    priceUSD: 12.80,
    originalPrice: 658,
    originalPriceUSD: 16,
    discount: 20,
    image: "/book-images/Self-dev/Sdbook6.jpg",
    author: "اسماعيل تمر"
  },
  {
    id: 7,
    title: "فن اللا مبالاة",
    category: "تطوير الذات",
    description: "عيش حياة تتعارض مع التوقعات وتتقبل المصاعب بطريقة واقعية.",
    price: 395,
    priceUSD: 9.60,
    originalPrice: 494,
    originalPriceUSD: 12,
    discount: 20,
    image: "/book-images/Self-dev/Sdbook7.png",
    author: "مارك مانسون"
  },
  {
    id: 8,
    title: "قوة عقلك الباطن",
    category: "تطوير الذات",
    description: "اكتشف القدرات الخفية لعقلك الباطن لتحقيق النجاح والسعادة.",
    price: 625,
    priceUSD: 15.20,
    originalPrice: 782,
    originalPriceUSD: 19,
    discount: 20,
    image: "/book-images/Self-dev/Sdbook8.jpg",
    author: "الدكتور جوزيف ميرفي"
  },
  {
    id: 9,
    title: "لماذا ننام",
    category: "تطوير الذات",
    description: "استكشاف لعلم النوم وأهميته لصحتنا وعافيتنا وإنتاجيتنا.",
    price: 660,
    priceUSD: 16,
    originalPrice: 947,
    originalPriceUSD: 23,
    discount: 30,
    image: "/book-images/Self-dev/Sdbook9.jpg",
    author: "ماثيو ووكر"
  },
  {
    id: 10,
    title: "أفكار يومية",
    category: "تطوير الذات",
    description: "تأملات يومية ملهمة لتعزيز النمو الشخصي والوعي الذاتي.",
    price: 317,
    priceUSD: 7.70,
    originalPrice: 454,
    originalPriceUSD: 11,
    discount: 30,
    image: "/book-images/Self-dev/Sdbook10.jpg",
    author: "أومرآم ميخائيل ايفانهوف"
  },
  {
    id: 11,
    title: "من الصورة إلى الصورة",
    category: "تطوير الذات",
    description: "دليل عملي لفهم تحول الذات وتطوير الصورة الشخصية والإدراك الذاتي.",
    price: 289,
    priceUSD: 7.00,
    originalPrice: 413,
    originalPriceUSD: 10,
    discount: 30,
    image: "/book-images/Self-dev/Sdbook11.jpg",
    author: "أصغر فرهادي"
  },
  {
    id: 12,
    title: "عادات الأداء العالي",
    category: "تطوير الذات",
    description: "كتاب استثنائي يكشف عن العادات اليومية والاستراتيجيات الذهنية التي يمارسها القادة والأداء العالي لتحقيق نتائج استثنائية في العمل والحياة بشكل مستدام.",
    price: 499,
    priceUSD: 12.00,
    originalPrice: 832,
    originalPriceUSD: 20,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook12.jpg",
    author: "برندون بورتشارد"
  },
  {
    id: 13,
    title: "الفوز",
    category: "تطوير الذات",
    description: "من أسطورة الإدارة جاك ويلش، دليل عملي شامل لفن القيادة وإدارة الأعمال وتحقيق النجاح في المنافسات التجارية من خلال تطوير الفرق وبناء الثقافة التنظيمية الفعالة.",
    price: 499,
    priceUSD: 12.00,
    originalPrice: 832,
    originalPriceUSD: 20,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook13.jpg",
    author: "جاك ويلش"
  },
  {
    id: 14,
    title: "ذكاء الوقت",
    category: "تطوير الذات",
    description: "استراتيجيات مبتكرة لإدارة الوقت والطاقة بشكل أكثر ذكاءً، حيث يقدم أدوات عملية لتحقيق التوازن بين متطلبات العمل والحياة الشخصية مع تعظيم الإنتاجية.",
    price: 499,
    priceUSD: 12.00,
    originalPrice: 832,
    originalPriceUSD: 20,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook14.jpg",
    author: "آشلي ويلانز"
  },
  {
    id: 15,
    title: "المفتاح الرئيسي للثراء",
    category: "تطوير الذات",
    description: "كلاسيكي من نابليون هيل يلخص أهم المبادئ العقلية والنفسية لبناء الثروة، مع تركيز على قوة التفكير الإيجابي والتخطيط الاستراتيجي والعادات المالية الذكية.",
    price: 449,
    priceUSD: 10.80,
    originalPrice: 749,
    originalPriceUSD: 18,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook15.jpg",
    author: "نابليون هيل"
  },
  {
    id: 16,
    title: "طريقة وارن بافيت",
    category: "تطوير الذات",
    description: "تحليل عميق لاستراتيجيات الاستثمار والفلسفة الإدارية لوارن بافيت، يقدم رؤى قيمة حول اتخاذ القرارات المالية والحكمة في إدارة الأعمال والاستثمار طويل الأمد.",
    price: 499,
    priceUSD: 12.00,
    originalPrice: 832,
    originalPriceUSD: 20,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook16.jpg",
    author: "روبرت جي هاجستروم"
  },
  {
    id: 17,
    title: "نادي الخامسة صباحًا",
    category: "تطوير الذات",
    description: "رواية تحفيزية ملهمة تقدم فلسفة التحول الشخصي من خلال الاستيقاظ المبكر والعادات الصباحية التي تغير الحياة، تجمع بين القصة المشوقة والحكمة العملية.",
    price: 499,
    priceUSD: 12.00,
    originalPrice: 832,
    originalPriceUSD: 20,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook17.jpg",
    author: "روبن شارما"
  },
  {
    id: 18,
    title: "التغلب على صعوبات القراءة",
    category: "تطوير الذات",
    description: "دليل علمي متكامل يقدم حلولاً عملية للتحديات التي تواجه القراء، من تقنيات التركيز إلى استراتيجيات الفهم والاستيعاب، مع تمارين تطبيقية لتحسين المهارات القرائية.",
    price: 449,
    priceUSD: 10.80,
    originalPrice: 749,
    originalPriceUSD: 18,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook18.jpg",
    author: "الدكتورة سالي شايوتز"
  },
  {
    id: 19,
    title: "لا يتزعزع",
    category: "تطوير الذات",
    description: "من توني روبينز، مرشد شامل لبناء المرونة النفسية والثبات الداخلي في وجه التحديات، يدمج بين علوم الأعصاب وعلم النفس التطبيقي لخلق حالة من الثبات الذهني.",
    price: 449,
    priceUSD: 10.80,
    originalPrice: 749,
    originalPriceUSD: 18,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook19.jpg",
    author: "توني روبينز"
  },
  {
    id: 20,
    title: "إيلون ماسك",
    category: "تطوير الذات",
    description: "سيرة ذاتية شاملة تكشف أسرار عقلية إيلون ماسك الاستثنائية، من منهجيته في حل المشكلات إلى فلسفته في الابتكار وإدارة المخاطر، مع رؤى نادرة عن عمليات التفكير لديه.",
    price: 624,
    priceUSD: 15.00,
    originalPrice: 1040,
    originalPriceUSD: 25,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook20.jpg",
    author: "والتر إيزاكسون"
  },
  {
    id: 21,
    title: "أغنى رجل في بابل",
    category: "تطوير الذات",
    description: "حكايات خالدة عن الحكمة المالية مقدمة عبر قصص من بابل القديمة، تقدم مبادئ أساسية في الادخار والاستثمار وبناء الثروة بلغة بسيطة ومباشرة تناسب جميع الأعمار.",
    price: 349,
    priceUSD: 8.40,
    originalPrice: 582,
    originalPriceUSD: 14,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook21.jpg",
    author: "جورج كلاسون"
  },
  {
    id: 22,
    title: "مرشد الدقيقة الواحدة",
    category: "تطوير الذات",
    description: "دليل عملي مكثف يقدم استراتيجيات سريعة وفعالة لإدارة الوقت واتخاذ القرارات وتحقيق الأهداف اليومية، مصمم للأشخاص المشغولين الذين يبحثون عن نتائج فورية.",
    price: 374,
    priceUSD: 9.00,
    originalPrice: 624,
    originalPriceUSD: 15,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook22.jpg",
    author: "كين بلانشرد || كلير دياز-أورتيز"
  },
  {
    id: 23,
    title: "قواعد التربية",
    category: "تطوير الذات",
    description: "مجموعة من القواعد الذهبية في تربية الأطفال تتراوح بين الحزم والحنان، تقدم إرشادات عملية لتنشئة جيل متوازن نفسياً واجتماعياً مع الحفاظ على سلامة العلاقة الأسرية.",
    price: 499,
    priceUSD: 12.00,
    originalPrice: 832,
    originalPriceUSD: 20,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook23.jpg",
    author: "ريتشارد تمبلر"
  },
  {
    id: 24,
    title: "قواعد الحب",
    category: "تطوير الذات",
    description: "استكشاف عميق لفنون العلاقات العاطفية الناجحة، يقدم مبادئ أساسية للتواصل الفعال وحل الخلافات والحفاظ على الشغف في العلاقات طويلة الأمد.",
    price: 499,
    priceUSD: 12.00,
    originalPrice: 832,
    originalPriceUSD: 20,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook24.jpg",
    author: "ريتشارد تمبلر"
  },
  {
    id: 25,
    title: "قواعد الحياة",
    category: "تطوير الذات",
    description: "دليل حكيم للعيش بشكل أفضل، يجمع بين الفلسفة العملية والتجارب الإنسانية ليقدم قواعد ذهبية للتعامل مع تحديات الحياة اليومية وبناء حياة ذات معنى وقيمة.",
    price: 499,
    priceUSD: 12.00,
    originalPrice: 832,
    originalPriceUSD: 20,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook25.jpg",
    author: "ريتشارد تمبلر"
  },
  {
    id: 26,
    title: "قواعد الإدارة",
    category: "تطوير الذات",
    description: "ملخص مكثف لأفضل ممارسات الإدارة الفعالة، من تفويض المهام إلى تحفيز الفرق واتخاذ القرارات الاستراتيجية، مقدمة في صورة قواعد واضحة وسهلة التطبيق.",
    price: 499,
    priceUSD: 12.00,
    originalPrice: 832,
    originalPriceUSD: 20,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook26.png",
    author: "ريتشارد تمبلر"
  },
  {
    id: 27,
    title: "قواعد الثراء",
    category: "تطوير الذات",
    description: "مبادئ أساسية لبناء الثروة والحفاظ عليها، تتراوح بين تطوير العقلية المالية الصحيحة واستراتيجيات الاستثمار الذكية وإدارة الدخل والمصروفات بشكل فعال.",
    price: 499,
    priceUSD: 12.00,
    originalPrice: 832,
    originalPriceUSD: 20,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook27.png",
    author: "ريتشارد تمبلر"
  },
  {
    id: 28,
    title: "كيف تتعامل مع ذوي الطباع الصعبة",
    category: "تطوير الذات",
    description: "دليل عملي لفن التعامل مع الشخصيات الصعبة في العمل والحياة الشخصية، يقدم استراتيجيات اتصال فعالة وحلولاً عملية لإدارة الصراعات وحماية الطاقة النفسية.",
    price: 424,
    priceUSD: 10.20,
    originalPrice: 707,
    originalPriceUSD: 17,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook28.jpg",
    author: "جيل هايسون"
  },
  {
    id: 29,
    title: "تعلم أفضل",
    category: "تطوير الذات",
    description: "استناداً إلى أحدث الأبحاث في علم التعلم، يقدم هذا الكتاب استراتيجيات مثبتة لتحسين عملية التعلم والاحتفاظ بالمعلومات وتطوير المهارات في أي مجال وبأي عمر.",
    price: 449,
    priceUSD: 10.80,
    originalPrice: 749,
    originalPriceUSD: 18,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook29.jpg",
    author: "دوجلاس فيشر || نانسي فراي"
  },
  {
    id: 30,
    title: "عزيزي نابليون",
    category: "تطوير الذات",
    description: "رواية ملهمة تجمع بين الحكمة التاريخية والدروس العملية في القيادة واتخاذ القرارات، تقدم رؤى جديدة يمكن تطبيقها في الحياة الشخصية والمهنية.",
    price: 424,
    priceUSD: 10.20,
    originalPrice: 707,
    originalPriceUSD: 17,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook30.jpg",
    author: "جيم ستوفال"
  },
  {
    id: 31,
    title: "قوة الشخصية شديدة الحساسية",
    category: "تطوير الذات",
    description: "استكشاف عمق الشخصيات الحساسة وقوتها الخفية، يقدم أدوات عملية لتحويل الحساسية من عبء إلى مصدر للقوة والإبداع والحدس في العمل والعلاقات.",
    price: 474,
    priceUSD: 11.40,
    originalPrice: 791,
    originalPriceUSD: 19,
    discount: 40,
    image: "/book-images/Self-dev/Sdbook31.jpg",
    author: "ميريتسل جارسيا رويج"
  }
 ];
  const displayBooks = books;

  const allCategories = [...new Set(books.map(book => book.category))];
  const priorityCategories = ["إصدارات دار الطموح"];
  const otherCategories = allCategories.filter(cat => !priorityCategories.includes(cat) && cat !== "الأكثر مبيعاً");
  
  // Add Favorites category only if user is logged in (removed "الأكثر مبيعاً" from here)
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

  // Get best sellers books
  const bestSellersBooks = books.filter(book => book.category === "الأكثر مبيعاً");

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

  // Best sellers scroll functions
  const scrollBestSellersLeft = () => {
    if (bestSellersScrollRef.current) {
      const scrollAmount = isSmallDevice ? 220 : 270; // Adjust based on card width + gap
      bestSellersScrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollBestSellersRight = () => {
    if (bestSellersScrollRef.current) {
      const scrollAmount = isSmallDevice ? 220 : 270; // Adjust based on card width + gap
      bestSellersScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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

  // Best Sellers Ribbon Component
  const BestSellersRibbon = () => {
    if (bestSellersBooks.length === 0) return null;

    return (
      <div className={`mb-8 sm:mb-16 transition-all duration-1000 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Trophy className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold dark:text-white text-[#1d2d50]">
                الأكثر مبيعاً
              </h3>
              <p className="text-xs sm:text-sm dark:text-slate-400 text-[#6c7a89]">
                أشهر الكتب وأكثرها طلباً
              </p>
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={scrollBestSellersLeft}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-all duration-200 flex items-center justify-center group"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 group-hover:text-orange-700" />
            </button>
            <button
              onClick={scrollBestSellersRight}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-all duration-200 flex items-center justify-center group"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 group-hover:text-orange-700" />
            </button>
          </div>
        </div>

        {/* Books Carousel */}
        <div className="relative">
          <div
            ref={bestSellersScrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide px-1 sm:px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {bestSellersBooks.map((book) => {
              const isBookFavorite = favoriteBooks.has(book.id.toString());
              const isLoadingFavorite = loadingFavorites.has(book.id.toString());

              return (
                <div key={book.id} className="flex-shrink-0 w-52 sm:w-60 lg:w-64 group cursor-pointer"
                     onClick={() => openBookDetails(book)}>
                  <div className="relative dark:bg-slate-800/60 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-105">
                    
                    {/* Bestseller Badge */}
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      الأكثر مبيعاً
                    </div>

                    <div className="relative h-40 sm:h-48 lg:h-52 dark:bg-slate-700/20 bg-orange-50/30 p-3 sm:p-4 flex items-center justify-center">
                      <img 
                        src={book.image} 
                        alt={book.title}
                        className="h-32 sm:h-40 lg:h-44 w-24 sm:w-28 lg:w-32 object-contain rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105"
                      />

                      {/* Price Badge */}
                      <div className="absolute bottom-3 right-3">
                        {book.discount ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="bg-gray-500/80 text-white px-2 py-0.5 rounded text-xs line-through">
                              {getOriginalPrice(book)} {getCurrencySymbol()}
                            </div>
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded text-sm font-bold shadow-lg">
                              {getPrice(book)} {getCurrencySymbol()}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded text-sm font-bold shadow-lg">
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
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                            isBookFavorite 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500'
                          } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                        >
                          <Heart 
                            className={`h-4 w-4 transition-all duration-300 ${
                              isBookFavorite ? 'fill-current' : ''
                            }`} 
                          />
                        </button>
                      )}
                    </div>
                    
                    <div className="p-3 space-y-2">
                      <h4 className="text-sm sm:text-base font-bold dark:text-white text-[#1d2d50] line-clamp-2 leading-relaxed">
                        {book.title}
                      </h4>
                      
                      {book.author && (
                        <p className="dark:text-slate-400 text-[#6c7a89] text-xs sm:text-sm font-medium line-clamp-1">
                          بقلم: {book.author}
                        </p>
                      )}

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(book);
                          }}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          أضف للسلة
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendBookToWhatsApp(book);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-all duration-300"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

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

        {/* Best Sellers Ribbon - Show on main page */}
        {showCategorySelection && <BestSellersRibbon />}

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


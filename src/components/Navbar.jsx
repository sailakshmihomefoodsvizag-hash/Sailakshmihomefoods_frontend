import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, ShoppingCart, LogOut, ChevronDown } from 'lucide-react';
import { navLinks } from '../data';
import { mergeProductWithImages } from '../data';
import { productAPI } from '../services/api.js';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import logoImage from '../assets/images/sailakshmi.webp';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  const [showMobileResults, setShowMobileResults] = useState(false);
  const [isMobileSearching, setIsMobileSearching] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const userDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, openCart } = useCart();
  const { user, openAuthModal, logout } = useAuth();
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const debouncedMobileSearchQuery = useDebouncedValue(mobileSearchQuery, 300);

  // Handle desktop search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(query.length > 0);
  };

  // Handle mobile search
  const handleMobileSearchChange = (e) => {
    const query = e.target.value;
    setMobileSearchQuery(query);
    setShowMobileResults(query.length > 0);
  };

  // Handle product click from search
  const handleProductClick = (productId) => {
    setSearchQuery('');
    setMobileSearchQuery('');
    setSearchResults([]);
    setMobileSearchResults([]);
    setShowResults(false);
    setShowMobileResults(false);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    let isMounted = true;

    const runSearch = async () => {
      const query = debouncedSearchQuery.trim();
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const response = await productAPI.search(query, 6);
      if (!isMounted) return;

      if (response?.success && Array.isArray(response.products)) {
        setSearchResults(response.products.map(mergeProductWithImages));
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    };

    runSearch();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearchQuery]);

  useEffect(() => {
    let isMounted = true;

    const runMobileSearch = async () => {
      const query = debouncedMobileSearchQuery.trim();
      if (query.length < 2) {
        setMobileSearchResults([]);
        setIsMobileSearching(false);
        return;
      }

      setIsMobileSearching(true);
      const response = await productAPI.search(query, 6);
      if (!isMounted) return;

      if (response?.success && Array.isArray(response.products)) {
        setMobileSearchResults(response.products.map(mergeProductWithImages));
      } else {
        setMobileSearchResults([]);
      }
      setIsMobileSearching(false);
    };

    runMobileSearch();
    return () => {
      isMounted = false;
    };
  }, [debouncedMobileSearchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowMobileResults(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 left-0 w-full z-50 bg-white shadow-md transition-all duration-300"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-20 sm:min-h-20 lg:min-h-24">
          
          {/* Mobile: Left - Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>

          {/* Mobile: Center - Logo | Desktop: Left - Logo (stretched wider) */}
          <Link to="/" className="flex items-center justify-center flex-shrink-0 lg:flex-grow-0 px-2">
            <img
              src={logoImage}
              alt="Sai Lakshmi Home Foods"
              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-24 lg:h-20 object-contain rounded-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`relative text-sm font-medium transition-colors duration-300 pb-1 ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {link.name}
                {/* Active indicator line */}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 origin-left ${
                    isActive(link.href) ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right Section - Always visible */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center relative" ref={searchRef}>
              <div
                className={`flex items-center transition-all duration-300 ${
                  isSearchOpen ? 'w-64' : 'w-10'
                }`}
              >
                {isSearchOpen && (
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery && setShowResults(true)}
                    className="w-full px-4 py-2 rounded-l-xl border border-r-0 border-gray-200 focus:outline-none focus:border-primary font-montserrat"
                    autoFocus
                  />
                )}
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`p-2.5 rounded-xl transition-colors duration-200 ${
                    isSearchOpen
                      ? 'bg-primary text-white rounded-l-none'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Desktop Search Results Dropdown */}
              {showResults && isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  {searchQuery.trim().length < 2 ? (
                    <div className="px-4 py-6 text-center text-gray-500 font-montserrat">
                      Type at least 2 characters
                    </div>
                  ) : isSearching ? (
                    <div className="px-4 py-6 text-center text-gray-500 font-montserrat">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map((product) => (
                        <li
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                          </div>
                          <span className="ml-auto text-primary font-semibold text-sm">
                            ₹{product.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500 font-montserrat">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Icon - Desktop with Dropdown */}
            <div className="hidden lg:block relative" ref={userDropdownRef}>
              {user ? (
                // Logged in state - Show user name
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <span className="text-sm font-medium text-gray-700 font-montserrat max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                // Not logged in
                <button
                  onClick={openAuthModal}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {/* User Dropdown */}
              {showUserDropdown && user && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <Link
                    to="/account"
                    onClick={() => setShowUserDropdown(false)}
                    className="block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-semibold text-gray-800 font-montserrat truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </Link>
                  <Link
                    to="/account"
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors font-montserrat text-sm"
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors font-montserrat text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    My Orders
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-montserrat text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Search Icon - Mobile */}
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Cart Icon */}
            <button 
              onClick={openCart}
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Dark Overlay - Right 50% */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sidebar - Left 50% */}
          <div
            className={`absolute top-0 left-0 h-full w-1/2 max-w-[280px] min-w-[200px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 min-h-16">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center"
              >
                <img
                  src={logoImage}
                  alt="Sai Lakshmi Home Foods"
                  className="w-12 h-12 object-contain rounded-lg"
                />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Navigation Links - Top Section */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="px-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-left font-medium transition-colors duration-200 ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary border-l-4 border-primary'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Account Section - Bottom */}
            <div className="border-t border-gray-100 p-4">
              {user ? (
                // Logged in state
                <div className="space-y-2">
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-2 py-2 mb-3">
                    <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* My Account */}
                  <Link
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </Link>

                  {/* My Orders */}
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    My Orders
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={async () => {
                      await logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                // Not logged in
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    openAuthModal();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 text-sm">Login / Signup</p>
                    <p className="text-xs text-gray-500">Access your account</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-4 z-50" ref={mobileSearchRef}>
            <div className="relative">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={mobileSearchQuery}
                  onChange={handleMobileSearchChange}
                  onFocus={() => mobileSearchQuery && setShowMobileResults(true)}
                  className="flex-1 px-4 py-3 rounded-l-xl border border-r-0 border-gray-200 focus:outline-none focus:border-primary font-montserrat"
                  autoFocus
                />
                <button 
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="px-4 py-3 bg-primary text-white rounded-r-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Results */}
              {showMobileResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-64 overflow-y-auto">
                  {mobileSearchQuery.trim().length < 2 ? (
                    <div className="px-4 py-6 text-center text-gray-500 font-montserrat">
                      Type at least 2 characters
                    </div>
                  ) : isMobileSearching ? (
                    <div className="px-4 py-6 text-center text-gray-500 font-montserrat">
                      Searching...
                    </div>
                  ) : mobileSearchResults.length > 0 ? (
                    <ul>
                      {mobileSearchResults.map((product) => (
                        <li
                          key={product.id}
                          onClick={() => {
                            handleProductClick(product.id);
                            setIsMobileSearchOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                          </div>
                          <span className="text-primary font-semibold text-sm">
                            ₹{product.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500 font-montserrat">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

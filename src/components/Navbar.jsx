import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchProducts, getUserProfile, getWishlist, getCart } from '../Api';

const navItems = [
  'Shop All',
  'New Arrivals',
  'Trending Now',
  'Home Page',
]

// Categories for the "Shop All" dropdown – these map to the
// "category" values from the products API
const shopCategories = [
  { label: 'All', value: 'all' },
  { label: 'T‑Shirt', value: 't-shirt' },
  { label: 'Shirt', value: 'shirt' },
  { label: 'Hoodie', value: 'hoodie' },
]

const Navbar = ({ onSelectCategory = () => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [userName, setUserName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

  // Function to refresh wishlist count
  const refreshWishlistCount = () => {
    const token = localStorage.getItem('token')
    if (token) {
      getWishlist(token)
        .then((response) => {
          if (response.isSuccess && response.data && response.data.products) {
            setWishlistCount(response.data.products.length)
          }
        })
        .catch((err) => {
          console.error('Failed to fetch wishlist:', err)
        })
    } else {
      setWishlistCount(0)
    }
  }

  // Function to refresh cart count
  const refreshCartCount = () => {
    const token = localStorage.getItem('token')
    if (token) {
      getCart(token)
        .then((response) => {
          if (response.isSuccess && response.data && response.data.items) {
            // Calculate total quantity of all items in cart
            const totalQuantity = response.data.items.reduce((sum, item) => sum + item.quantity, 0)
            setCartCount(totalQuantity)
          }
        })
        .catch((err) => {
          console.error('Failed to fetch cart:', err)
        })
    } else {
      setCartCount(0)
    }
  }

  // Check login status and fetch user profile
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
      getUserProfile(token)
        .then((response) => {
          if (response.isSuccess && response.data) {
            setUserName(response.data.name.split(' ')[0]) // First name
          }
        })
        .catch((err) => {
          console.error('Failed to fetch user profile:', err)
          // If token is invalid, clear it
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          setIsLoggedIn(false)
        })

      // Fetch wishlist count
      refreshWishlistCount()
      // Fetch cart count
      refreshCartCount()
    } else {
      setIsLoggedIn(false)
      setUserName('')
      setWishlistCount(0)
      setCartCount(0)
    }
  }, [])

  // Listen for wishlist changes
  useEffect(() => {
    const handleWishlistChange = () => {
      refreshWishlistCount()
    }

    // Listen for custom wishlist change event
    window.addEventListener('wishlistChanged', handleWishlistChange)

    return () => {
      window.removeEventListener('wishlistChanged', handleWishlistChange)
    }
  }, [])

  // Listen for cart changes
  useEffect(() => {
    const handleCartChange = () => {
      refreshCartCount()
    }

    // Listen for custom cart change event
    window.addEventListener('cartChanged', handleCartChange)

    return () => {
      window.removeEventListener('cartChanged', handleCartChange)
    }
  }, [])

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false)
      }
    }

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserDropdownOpen])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setIsLoggedIn(false)
    setUserName('')
    setWishlistCount(0)
    setCartCount(0)
    setIsUserDropdownOpen(false)
    navigate('/login')
  }

  const handleCategoryClick = (value) => {
    // If we're on the home page (ProductPage), use the callback
    // Otherwise, navigate to home page with category in state
    if (window.location.pathname === '/') {
      onSelectCategory(value)
    } else {
      // Navigate to home page with category in state
      navigate('/', { state: { category: value } })
    }
    setIsShopDropdownOpen(false)
    setIsMenuOpen(false)
  }

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const response = await searchProducts(query.trim())
      if (response.isSuccess && response.data) {
        const products = Array.isArray(response.data) 
          ? response.data 
          : response.data.products || []
        setSearchResults(products)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim()) {
      handleSearch(value)
    } else {
      setSearchResults([])
    }
  }

  const handleSearchResultClick = (product) => {
    navigate(`/product/${product._id}`)
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <header className={`site-header fade-down ${isMenuOpen ? 'menu-open' : ''}`}>
      <button 
        className="hamburger" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
        {navItems.map((item) => {
          if (item === 'Shop All') {
            return (
              <div
                key={item}
                className="nav-item shop-all-wrapper"
                onMouseEnter={() => setIsShopDropdownOpen(true)}
                onMouseLeave={() => setIsShopDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="link-like-button"
                  onClick={() => handleCategoryClick('all')}
                >
                  {item}
                </button>

                {isShopDropdownOpen && (
                  <div className="shop-dropdown">
                    {shopCategories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        className="shop-dropdown-item"
                        onClick={() => handleCategoryClick(cat.value)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          if (item === 'Home Page') {
            return (
              <Link to="/" key={item} className="nav-item">
                {item}
              </Link>
            )
          }

          if (item === 'New Arrivals') {
            return (
              <Link to="/newarrival" key={item} className="nav-item">
                {item}
              </Link>
            )
          }

          if (item === 'Trending Now') {
            return (
              <Link to="/trendingnow" key={item} className="nav-item">
                {item}
              </Link>
            )
          }

          return (
            <a href="#" key={item} className="nav-item">
              {item}
            </a>
          )
        })}
      </nav>
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src="/Logo.svg" alt="The Bear House Logo" />
      </div>
      <div className="header-actions">
        {/* Search icon */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label="Search"
            className="header-icon-button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <span className="header-icon-symbol">🔍</span>
          </button>
          
          {/* Mobile search backdrop */}
          {isMobile && isSearchOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 998,
              }}
              onClick={() => setIsSearchOpen(false)}
            />
          )}
          
          {/* Search dropdown */}
          {isSearchOpen && (
            <div
              style={isMobile ? {
                position: 'fixed',
                top: '4rem',
                left: 0,
                right: 0,
                width: '100vw',
                background: 'white',
                borderRadius: '0 0 8px 8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: 999,
                padding: '20px',
              } : {
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '10px',
                width: '400px',
                maxWidth: '90vw',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: 1000,
                padding: '20px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              
              {/* Search Results */}
              {searchQuery.trim() && (
                <div
                  style={{
                    maxHeight: isMobile ? 'calc(100vh - 8rem)' : '400px',
                    overflowY: 'auto',
                    marginTop: '15px',
                  }}
                >
                  {isSearching ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <p>Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                      </p>
                      {searchResults.map((product, index) => (
                        <div
                          key={product._id || index}
                          onClick={() => handleSearchResultClick(product)}
                          style={{
                            display: 'flex',
                            gap: '16px',
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f5f5f5'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white'
                          }}
                        >
                          <img
                            src={product.mainImage}
                            alt={product.title}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                              {product.title}
                            </h4>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#333' }}>
                              {product.price ? `₹${(product.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'Price not available'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      <p>No products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wishlist icon with count like provided image */}
        <button
          type="button"
          aria-label="Wishlist"
          className="header-icon-button"
          onClick={() => navigate('/wishlist')}
        >
          <span className="header-icon-symbol wishlist-icon">♡</span>
          <span className="header-count-circle -ml-2">{wishlistCount}</span>
        </button>

        {/* Cart icon with count like provided image */}
        <button
          type="button"
          aria-label="Cart"
          className="header-icon-button"
          onClick={() => navigate('/cart')}
        >
          <span className="header-icon-symbol">🛒</span>
          <span className="header-count-circle -ml-2">{cartCount}</span>
        </button>

        {/* User/Login icon */}
        {isLoggedIn ? (
          <div ref={userRef} style={{ position: 'relative' }}>
            <button
              type="button"
              aria-label="User menu"
              className="header-icon-button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <span
                className="header-icon-symbol"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'red',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </span>
            </button>
            {isUserDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  padding: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '0 8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            aria-label="Login"
            className="header-icon-button"
            onClick={() => navigate('/login')}
          >
            <span className="header-icon-symbol">👤</span>
          </button>
        )}
      </div>
      {isMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Close icon in top right corner, aligned with hamburger */}
          <button
            type="button"
            aria-label="Close menu"
            className="header-icon-button"
            onClick={() => setIsMenuOpen(false)}
            style={{ 
              position: 'absolute', 
              top: '0', 
              right: '0', 
              zIndex: 1001,
              padding: '1rem'
            }}
          >
            <span className="header-icon-symbol">✕</span>
          </button>
          <nav
            className="mobile-nav"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              // Category filters first
              ...shopCategories.map((cat) => ({
                key: cat.value,
                label: cat.label,
                type: 'category',
                value: cat.value,
              })),
              // Then the rest of the nav items (excluding "Shop All" which is already expanded above)
              ...navItems
                .filter((item) => item !== 'Shop All')
                .map((item) => ({
                  key: item,
                  label: item,
                  type: 'nav',
                })),
            ].map((item) => {
              if (item.type === 'category') {
                return (
                  <button
                    key={item.key}
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => handleCategoryClick(item.value)}
                  >
                    {item.label}
                  </button>
                )
              }

              if (item.label === 'Home Page') {
                return (
                  <button
                    key={item.key}
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => {
                      setIsMenuOpen(false)
                      navigate('/')
                    }}
                  >
                    {item.label}
                  </button>
                )
              }

              if (item.label === 'New Arrivals') {
                return (
                  <button
                    key={item.key}
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => {
                      setIsMenuOpen(false)
                      navigate('/newarrival')
                    }}
                  >
                    {item.label}
                  </button>
                )
              }

              if (item.label === 'Trending Now') {
                return (
                  <button
                    key={item.key}
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => {
                      setIsMenuOpen(false)
                      navigate('/trendingnow')
                    }}
                  >
                    {item.label}
                  </button>
                )
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  className="mobile-nav-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar

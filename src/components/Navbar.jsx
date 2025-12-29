import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { searchProducts, getUserProfile, getWishlist, getCart } from '../Api';

const navItems = [
  'Shop All',
  'Home Page',
]

// Categories for the "Shop All" dropdown – these map to the
// "category" values from the products API
const shopCategories = [
  { label: 'All', value: 'all' },
  { label: 'Oversized T-shirts', value: 'oversized-tshirts' },
  { label: 'Printed T-shirts', value: 'printed-tshirts' },
  { label: 'Embrodery T-shirt', value: 'embrodery-tshirt' },
]

const Navbar = ({ onSelectCategory = () => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024)
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
      setIsMobile(window.innerWidth <= 1024)
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
    <header className={`site-header fade-down ${isMenuOpen ? 'menu-open' : ''}`} >
      <div className="left-section">
        {isMobile && (
          <button 
            className="hamburger" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        {/* Search icon on left side for mobile */}
        {isMobile && (
          <div ref={searchRef} className="header-icon-wrapper">
            <button
              type="button"
              aria-label="Search"
              className="header-icon-button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <svg className="header-icon-symbol" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>

            {/* Mobile search backdrop */}
            {isSearchOpen && (
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
                style={{
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
                      maxHeight: 'calc(100vh - 8rem)',
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
        )}

        {/* WhatsApp icon on left side for mobile, after search */}
        {isMobile && (
          <button
            type="button"
            aria-label="WhatsApp"
            className="header-icon-button"
            onClick={() => window.open(import.meta.env.VITE_WHATSAPP, '_blank')}
          >
            <FaWhatsapp className="header-icon-symbol" size={20} />
          </button>
        )}


        {!isMobile && (
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
                  <button
                    key={item}
                    type="button"
                    className="nav-item link-like-button"
                    onClick={() => navigate('/', { state: { resetCategory: true } })}
                  >
                    {item}
                  </button>
                )
              }

              return (
                <a href="#" key={item} className="nav-item">
                  {item}
                </a>
              )
            })}
          </nav>
        )}
      </div>
      <div className="logo" onClick={() => navigate('/', { state: { resetCategory: true } })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src="/logo.jpg" 
          alt="The Wolf Street Logo" 
          onError={(e) => {
            console.error('Logo image failed to load:', e.target.src)
            e.target.style.display = 'none'
          }}
          style={{ 
            width: isMobile ? '100px' : '150px', 
            height: isMobile ? '40px' : 'auto',
            objectFit: 'contain',
            cursor: 'pointer',
            display: 'block'
          }} 
        />
      </div>
      <div className="right-section">
        <div className="header-actions">
          {/* Search icon on right side for desktop only */}
          {!isMobile && (
            <div ref={searchRef} className="header-icon-wrapper">
              <button
                type="button"
                aria-label="Search"
                className="header-icon-button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <svg className="header-icon-symbol" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
              
              {/* Search dropdown */}
              {isSearchOpen && (
                <div
                  style={{
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
                        maxHeight: '400px',
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
          )}

          {/* Wishlist icon with count */}
          <button
            type="button"
            aria-label="Wishlist"
            className="header-icon-button"
            onClick={() => navigate('/wishlist')}
          >
            <svg className="header-icon-symbol wishlist-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path>
            </svg>
            {wishlistCount > 0 && (
              <span className="header-count-circle">{wishlistCount}</span>
            )}
          </button>

          {/* Cart icon with count */}
          <button
            type="button"
            aria-label="Cart"
            className="header-icon-button"
            onClick={() => navigate('/cart')}
          >
            <svg className="header-icon-symbol" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && (
              <span className="header-count-circle">{cartCount}</span>
            )}
          </button>

          {/* WhatsApp icon for desktop */}
          {!isMobile && (
            <button
              type="button"
              aria-label="WhatsApp"
              className="header-icon-button"
              onClick={() => window.open(import.meta.env.VITE_WHATSAPP, '_blank')}
            >
              <FaWhatsapp className="header-icon-symbol" size={20} />
            </button>
          )}

          {/* User/Login icon */}
          {isLoggedIn ? (
            <div ref={userRef} className="header-icon-wrapper">
              <button
                type="button"
                aria-label="User menu"
                className="header-icon-button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <span className="header-user-avatar">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </button>

              {/* Mobile user dropdown backdrop */}
              {isMobile && isUserDropdownOpen && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 1200,
                  }}
                  onClick={() => setIsUserDropdownOpen(false)}
                />
              )}

              {isUserDropdownOpen && (
                <div
                  className={isMobile ? '' : 'user-dropdown'}
                  style={isMobile ? {
                    position: 'fixed',
                    top: '4rem',
                    right: '1rem',
                    width: '150px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    zIndex: 1201,
                    padding: '8px 0',
                  } : {}}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserDropdownOpen(false)
                      navigate('/orders')
                    }}
                    className="user-dropdown-item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="1" />
                    </svg>
                    My Orders
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="user-dropdown-item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
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
              <svg className="header-icon-symbol" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          )}
        </div>
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
            className="mobile-menu-close"
            onClick={() => setIsMenuOpen(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
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
                      navigate('/', { state: { resetCategory: true } })
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

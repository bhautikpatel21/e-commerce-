import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import { getWishlist, removeFromWishlist, addToCart } from '../Api'
import { isFriday, calculateDiscountedPrice, formatPrice } from '../utils/discount'
import '../App.css'

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [isFridayDiscount, setIsFridayDiscount] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setIsFridayDiscount(isFriday())
  }, [])

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to view your wishlist')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await getWishlist(token)
        if (response.isSuccess && response.data) {
          setWishlistItems(response.data.products || [])
        } else {
          setError('Failed to load wishlist')
        }
      } catch (err) {
        setError(err.message || 'Failed to load wishlist')
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  const handleRemoveFromWishlist = async (productId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to manage wishlist', type: 'error' })
      return
    }

    try {
      const response = await removeFromWishlist(productId, token)
      if (response.isSuccess) {
        setWishlistItems(prev => prev.filter(item => item._id !== productId))
        setToast({ show: true, message: 'Item removed from wishlist', type: 'success' })
        window.dispatchEvent(new Event('wishlistChanged'))
      } else {
        setToast({ show: true, message: 'Failed to remove item from wishlist', type: 'error' })
      }
    } catch (err) {
      setToast({ show: true, message: 'Error removing item from wishlist', type: 'error' })
    }
  }

  const handleAddToCart = async (e, product) => {
    e.stopPropagation()
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to add items to cart', type: 'error' })
      return
    }

    try {
      const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M'
      const response = await addToCart(product._id, 1, defaultSize, token)
      if (response.isSuccess) {
        setToast({ show: true, message: `${product.title} added to cart`, type: 'success' })
        window.dispatchEvent(new Event('cartChanged'))
      } else {
        setToast({ show: true, message: 'Failed to add item to cart', type: 'error' })
      }
    } catch (err) {
      setToast({ show: true, message: 'Error adding item to cart', type: 'error' })
    }
  }

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`)
  }

  // Loading State
  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-5">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm tracking-wider">Loading your wishlist...</p>
        </div>
        <Footer />
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-5 p-10">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <p className="text-red-500 text-base text-center">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all duration-300"
          >
            Login to Continue
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page-shell">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      
      <div className="announcement-bar fade-down" style={{ overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
        <div className="marquee-content" style={{
          display: 'inline-block',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Free & Fast Shipping</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>· 100% Secure Payment</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Flat 10% OFF on Orders Above ₹2099</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Premium Fabric Quality</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Customization Options Available</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>All Friday Mega Sale</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>7-Day Easy Return Policy</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Free & Fast Shipping</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>· 100% Secure Payment</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Flat 10% OFF on Orders Above ₹2099</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Premium Fabric Quality</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Customization Options Available</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>All Friday Mega Sale</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>7-Day Easy Return Policy</span>
        </div>
      </div>

      <Navbar />

      <main className="bg-gradient-to-b from-gray-50 to-white min-h-[70vh]">
        {/* Hero Header */}
        <section className="py-20 px-5 text-center text-white relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/download.jpg')" }}
          ></div>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          <div className="relative z-10">
            <h1 className="font-['Montserrat'] text-3xl font-bold mb-2 tracking-tight drop-shadow-lg">
              My Wishlist
            </h1>
            <p className="text-sm opacity-80 tracking-wide">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 px-5 max-w-7xl mx-auto">
          {wishlistItems.length === 0 ? (
            /* Empty State */
            <div className="text-center py-24 px-5 bg-white rounded-2xl shadow-sm">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-50 to-white rounded-full flex items-center justify-center shadow-inner">
                <span className="text-5xl text-gray-300">♡</span>
              </div>
              <h2 className="font-['Montserrat'] text-xl font-semibold text-gray-900 mb-3">
                Your wishlist is empty
              </h2>
              <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                Save items you love by clicking the heart icon on any product
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-10 py-4 bg-gray-900 text-white rounded-full text-sm font-semibold tracking-wide hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                Explore Products
              </button>
            </div>
          ) : (
            /* Wishlist Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {wishlistItems.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product)}
                  onMouseEnter={() => setHoveredItem(product._id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="group bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-100 hover:border-transparent hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFromWishlist(product._id)
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center z-10 shadow-md text-gray-400 hover:bg-red-500 hover:text-white hover:scale-110 transition-all duration-200"
                    title="Remove from wishlist"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>

                  {/* Discount Badge */}
                  {isFridayDiscount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide z-10">
                      10% OFF
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={product.mainImage}
                      alt={product.title}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        hoveredItem === product._id ? 'scale-110' : 'scale-100'
                      }`}
                      loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className={`absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-black/70 to-transparent flex justify-center transition-opacity duration-300 ${
                      hoveredItem === product._id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-md text-xs font-semibold uppercase tracking-wide hover:bg-gray-900 hover:text-white transition-all duration-200"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-medium">
                      {product.category}
                    </span>
                    <h3 className="font-['Montserrat'] text-sm font-semibold text-gray-900 mb-3 leading-tight line-clamp-2 min-h-[40px]">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {product.price ? (
                          isFridayDiscount ? (
                            <>
                              <span className="text-base font-bold text-gray-900">
                                {formatPrice(calculateDiscountedPrice(product.price))}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">Price N/A</span>
                        )}
                      </div>
                      
                      {/* Size Pills */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="hidden sm:flex gap-1">
                          {product.sizes.slice(0, 3).map((size) => (
                            <span 
                              key={size} 
                              className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-semibold"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Continue Shopping Button */}
          {wishlistItems.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/')}
                className="px-10 py-3.5 bg-transparent border-2 border-gray-900 text-gray-900 text-xs font-semibold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Wishlist

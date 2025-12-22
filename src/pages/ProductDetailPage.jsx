
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Review from '../components/Review'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import Celebration from '../components/Celebration'
import '../App.css'
import { getProducts, addToCart, addToWishlist, getWishlist, removeFromWishlist, getProductReviews } from '../Api'
import { isFriday, calculateDiscountedPrice, formatPrice } from '../utils/discount'

function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [productsData, setProductsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [celebrate, setCelebrate] = useState(0)
  const [isFridayDiscount, setIsFridayDiscount] = useState(false)
  const [reviews, setReviews] = useState([])
  const [expandedSections, setExpandedSections] = useState({
    description: false,
    shipping: false,
    care: false,
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Check if today is Friday on component mount
  useEffect(() => {
    setIsFridayDiscount(isFriday())
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await getProducts()
        if (response.isSuccess && response.data) {
          setProductsData(response.data)
        } else {
          setError('Failed to load products')
        }
      } catch (err) {
        setError(err.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Find product by ID
  const product = productsData.find(
    (p) => p._id === productId
  )

  // Load wishlist and check if current product is wishlisted
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const response = await getWishlist(token)
        if (response.isSuccess && response.data && product) {
          setIsWishlisted(response.data.products.some(p => p._id === product._id))
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err)
      }
    }

    if (product) {
      fetchWishlist()
    }
  }, [product])

  // Track recently viewed products (save to localStorage only, display is in ProductPage)
  useEffect(() => {
    if (product && product._id) {
      // Get existing recently viewed from localStorage
      const stored = localStorage.getItem('recentlyViewed')
      let recentlyViewedIds = stored ? JSON.parse(stored) : []

      // Remove current product if it exists in the list
      recentlyViewedIds = recentlyViewedIds.filter(id => id !== product._id)

      // Add current product to the beginning
      recentlyViewedIds.unshift(product._id)

      // Keep only the last 5 products
      recentlyViewedIds = recentlyViewedIds.slice(0, 5)

      // Save back to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewedIds))
    }
  }, [product])

  // Fetch reviews for the product
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return
      try {
        const response = await getProductReviews(productId)
        if (response.isSuccess && response.data) {
          setReviews(response.data)
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err)
      }
    }

    fetchReviews()
  }, [productId])

  useEffect(() => {
    if (!loading && !product) {
      // If product not found, redirect to home
      navigate('/')
    }
  }, [product, loading, navigate])

  if (loading) {
    return (
      <div className="page-shell">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading product...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const productImages = [
    product.mainImage,
    ...(product.sideImages || []).slice(0, 3),
  ]

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
    return sum / reviews.length
  }

  const renderStars = (ratingValue) => {
    const fullStars = Math.floor(ratingValue)
    const hasHalfStar = ratingValue % 1 >= 0.5
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            // Full star
            return (
              <svg key={star} className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path d={starPath} />
              </svg>
            )
          } else if (star === fullStars + 1 && hasHalfStar) {
            // Half star
            return (
              <div key={star} className="relative w-5 h-5">
                {/* Empty star background */}
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 20 20" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={starPath} />
                </svg>
                {/* Filled half overlay */}
                <svg
                  className="absolute inset-0 w-5 h-5 text-orange-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{
                    clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                  }}
                >
                  <path d={starPath} />
                </svg>
              </div>
            )
          } else {
            // Empty star
            return (
              <svg key={star} className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 20 20" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={starPath} />
              </svg>
            )
          }
        })}
      </div>
    )
  }

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setToast({ show: true, message: 'Please select a size', type: 'error' })
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to add items to cart', type: 'error' })
      return
    }

    try {
      const response = await addToCart(product._id, 1, selectedSize, token)
      if (response.isSuccess) {
        setToast({ show: true, message: `${product.title} (Size: ${selectedSize}) added to cart`, type: 'success' })
        // Dispatch event to update navbar count
        window.dispatchEvent(new Event('cartChanged'))
        // Trigger celebration animation
        setCelebrate(Date.now())
      } else {
        setToast({ show: true, message: 'Failed to add item to cart', type: 'error' })
      }
    } catch (err) {
      setToast({ show: true, message: 'Error adding item to cart', type: 'error' })
    }
  }

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to manage wishlist', type: 'error' })
      return
    }

    try {
      let response
      if (isWishlisted) {
        response = await removeFromWishlist(product._id, token)
        if (response.isSuccess) {
          setIsWishlisted(false)
          setToast({ show: true, message: 'Removed from wishlist', type: 'success' })
          // Dispatch event to update navbar count
          window.dispatchEvent(new Event('wishlistChanged'))
        } else {
          setToast({ show: true, message: 'Failed to remove from wishlist', type: 'error' })
        }
      } else {
        response = await addToWishlist(product._id, token)
        if (response.isSuccess) {
          setIsWishlisted(true)
          setToast({ show: true, message: `${product.title} added to wishlist`, type: 'success' })
          // Dispatch event to update navbar count
          window.dispatchEvent(new Event('wishlistChanged'))
        } else {
          setToast({ show: true, message: 'Failed to add to wishlist', type: 'error' })
        }
      }
    } catch (err) {
      setToast({ show: true, message: 'Error updating wishlist', type: 'error' })
    }
  }

  return (
    <div className="page-shell">
      <Celebration trigger={celebrate} />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      <marquee
        className="announcement-bar fade-down"
        direction="right"
        behavior="scroll"
        scrollamount="20"
      >
        <p>TBH is better on the app · Flat ₹300 off on your first order</p>
      </marquee>

      <Navbar />

      <main>
        {/* Product hero section (same style as featured product) */}
        <section className="hero fade-up">
          {/* Left: all product images in a 2-column tall grid */}
          <div className="product-hero-media">
            {productImages.map((img, index) => (
              <div
                key={img || index}
                className="product-hero-item"
                onClick={() => setSelectedImageIndex(index)}
                style={{
                  cursor: 'pointer',
                  opacity: selectedImageIndex === index ? 1 : 0.7,
                  border: selectedImageIndex === index ? '2px solid black' : '2px solid transparent',
                  position: 'relative'
                }}
              >
                {isFridayDiscount && index === 0 && (
                  <div className="discount-badge-animated">
                    <div className="discount-badge-rotating-border">
                      <div className="discount-badge-inner">
                        10% OFF
                      </div>
                    </div>
                  </div>
                )}
                <img
                  src={img}
                  alt={`${product.title} view ${index + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Right: Product information panel */}
          <div className="product-panel">
            <p className="crumbs">
              The Wolf street / {product.category} / {product.title}
            </p>
            <h1 className="text-lg md:text-xl font-medium text-gray-800 leading-snug" style={{ fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase' }}>
              {product.title}
            </h1>
            <p className="subtitle">{product.description}</p>

            <div className="price-row">
              {product.price ? (
                isFridayDiscount ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '1.8rem' }}>
                      {formatPrice(product.price)}
                    </span>
                    <span className="price" style={{ color: '#333' }}>
                      {formatPrice(calculateDiscountedPrice(product.price))}
                    </span>
                  </div>
                ) : (
                  <span className="price">
                    {formatPrice(product.price)}
                  </span>
                )
              ) : (
                <span className="price">Price not available</span>
              )}
              {isFridayDiscount && (
                <span className="label success" style={{ background: '#000', color: '#fff' }}>
                  10% OFF
                </span>
              )}
              <span className="label success">
                Inclusive of all taxes
              </span>
              {reviews.length > 0 && (
                <span className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{calculateAverageRating().toFixed(1)}</span>
                  <div className="flex">
                    {renderStars(calculateAverageRating())}
                  </div>
                  <span className="text-gray-600">({reviews.length} reviews)</span>
                </span>
              )}
              <span className="label outline">
                Free shipping above ₹500
              </span>
            </div>

            <div className="thumb-row">
              {productImages.map((img, index) => (
                <button
                  key={img || index}
                  type="button"
                  className={`thumb-circle ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={img}
                    alt={`${product.title} thumb ${index + 1}`}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            <div className="my-8 border border-gray-200 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Size</span>
                <button 
                  type="button" 
                  className="text-xs text-gray-600 hover:text-gray-900 underline bg-transparent border-none cursor-pointer"
                >
                  Size chart
                </button>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`rounded-2xl border-2 px-4 py-3 font-semibold cursor-pointer transition-all duration-200 ${
                      selectedSize === size
                        ? 'bg-black text-white border-black shadow-lg scale-105'
                        : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="cta-stack w-full flex justify-center items-center" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button type="button" className="primary w-full" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleWishlistToggle}
                style={{
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '50%',
                  width: '52px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: isWishlisted ? '#e91e63' : '#333',
                  transition: 'all 0.3s ease',
                }}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isWishlisted ? '❤️' : '♡'}
              </button>
            </div>

            <p className="status-copy">
              Crafted for everyday comfort. Ships in 2–4 business days
              from our Bengaluru studio.
            </p>

            {/* Product Information Accordion Section */}
            <div style={{ 
              marginTop: '24px',
              border: '1px solid #e5e5e5',
              borderRadius: '0',
              overflow: 'hidden',
              background: '#fff',
              width: '100%',
            }}>
              {/* Description Section */}
              {product.proDes && (
                <>
                  <button
                    type="button"
                    onClick={() => toggleSection('description')}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#fff',
                      border: 'none',
                      borderBottom: '1px solid #e5e5e5',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                  >
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      color: '#1a1a1a',
                      textTransform: 'uppercase',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      DESCRIPTION
                    </span>
                    <svg
                      style={{
                        width: '16px',
                        height: '16px',
                        color: '#1a1a1a',
                        transition: 'transform 0.3s ease',
                        transform: expandedSections.description ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.description && (
                    <div style={{
                      padding: '20px',
                      background: '#fff',
                      borderBottom: '1px solid #e5e5e5',
                    }}>
                      <div style={{
                        fontSize: '14px',
                        lineHeight: '1.8',
                        color: '#333',
                        whiteSpace: 'pre-line'
                      }}>
                        {product.proDes}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Shipping Information Section */}
              {product.shipingInfo && (
                <>
                  <button
                    type="button"
                    onClick={() => toggleSection('shipping')}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#fff',
                      border: 'none',
                      borderBottom: product.proDes ? '1px solid #e5e5e5' : 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                  >
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      color: '#1a1a1a',
                      textTransform: 'uppercase',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      SHIPPING INFORMATION
                    </span>
                    <svg
                      style={{
                        width: '16px',
                        height: '16px',
                        color: '#1a1a1a',
                        transition: 'transform 0.3s ease',
                        transform: expandedSections.shipping ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.shipping && (
                    <div style={{
                      padding: '20px',
                      background: '#fff',
                      borderBottom: product.productCare ? '1px solid #e5e5e5' : 'none',
                    }}>
                      <div style={{
                        fontSize: '14px',
                        lineHeight: '1.8',
                        color: '#333',
                        whiteSpace: 'pre-line'
                      }}>
                        {product.shipingInfo}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Product Care Section */}
              {product.productCare && (
                <>
                  <button
                    type="button"
                    onClick={() => toggleSection('care')}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#fff',
                      border: 'none',
                      borderBottom: (product.proDes || product.shipingInfo) ? '1px solid #e5e5e5' : 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                  >
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      color: '#1a1a1a',
                      textTransform: 'uppercase',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      PRODUCT CARE
                    </span>
                    <svg
                      style={{
                        width: '16px',
                        height: '16px',
                        color: '#1a1a1a',
                        transition: 'transform 0.3s ease',
                        transform: expandedSections.care ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.care && (
                    <div style={{
                      padding: '20px',
                      background: '#fff',
                    }}>
                      <div style={{
                        fontSize: '14px',
                        lineHeight: '1.8',
                        color: '#333',
                        whiteSpace: 'pre-line'
                      }}>
                        {product.productCare}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>


        <Review productId={productId} />

        {/* You might also like section - Horizontal Slider */}
        {(() => {
          const relatedProducts = productsData
            .filter(p => p.category === product.category && p._id !== product._id)
            .slice(0, 8) // Show up to 8 products in slider
          if (relatedProducts.length === 0) return null
          
          return (
            <section className="related-products fade-up" style={{ 
              padding: '60px 0', 
              background: 'linear-gradient(180deg, #fafafa 0%, #fff 100%)',
              borderTop: '1px solid #eee',
              overflow: 'hidden'
            }}>
              <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    letterSpacing: '3px', 
                    color: '#888',
                    textTransform: 'uppercase',
                    fontWeight: '500'
                  }}>
                    Curated for you
                  </span>
                  <h2 style={{ 
                    fontFamily: 'Montserrat, sans-serif', 
                    fontSize: '28px',
                    fontWeight: '600',
                    marginTop: '8px',
                    color: '#1a1a1a',
                    letterSpacing: '-0.5px'
                  }}>
                    You Might Also Like
                  </h2>
                </div>
                
                {/* Slider Container */}
                <div 
                  id="related-products-slider"
                  style={{
                    display: 'flex',
                    gap: '20px',
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                    paddingBottom: '20px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {relatedProducts.map((relatedProduct) => (
                    <div
                      key={relatedProduct._id}
                      className="related-product-card"
                      onClick={() => navigate(`/product/${relatedProduct._id}`)}
                      style={{
                        cursor: 'pointer',
                        background: '#fff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        flex: '0 0 280px',
                        minWidth: '280px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)'
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                      }}
                    >
                      {/* Image Container */}
                      <div style={{ 
                        position: 'relative',
                        paddingTop: '125%',
                        overflow: 'hidden',
                        background: '#f5f5f5'
                      }}>
                        <img
                          src={relatedProduct.mainImage}
                          alt={relatedProduct.title}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                          }}
                          loading="lazy"
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                        {/* Quick View Overlay */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '12px',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        }}
                        className="quick-view-overlay"
                        >
                          <span style={{ 
                            color: '#fff', 
                            fontSize: '12px', 
                            fontWeight: '500',
                            letterSpacing: '1px'
                          }}>
                            QUICK VIEW
                          </span>
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div style={{ padding: '16px 14px 20px' }}>
                        <p style={{ 
                          fontSize: '11px', 
                          color: '#888', 
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          marginBottom: '6px'
                        }}>
                          {relatedProduct.category}
                        </p>
                        <h3 style={{ 
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1a1a1a',
                          marginBottom: '10px',
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {relatedProduct.title}
                        </h3>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between' 
                        }}>
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: '700',
                            color: '#1a1a1a'
                          }}>
                            {formatPrice(relatedProduct.price)}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: '#4CAF50',
                            fontWeight: '500',
                            background: '#e8f5e9',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            In Stock
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* View All Button */}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button
                    onClick={() => navigate('/', { state: { resetCategory: true } })}
                    style={{
                      background: 'transparent',
                      border: '2px solid #1a1a1a',
                      padding: '14px 40px',
                      fontSize: '13px',
                      fontWeight: '600',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: '0',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#1a1a1a'
                      e.target.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent'
                      e.target.style.color = '#1a1a1a'
                    }}
                  >
                    View All Products
                  </button>
                </div>
              </div>
              
              <style>{`
                .related-product-card:hover .quick-view-overlay {
                  opacity: 1 !important;
                }
                #related-products-slider::-webkit-scrollbar {
                  display: none;
                }
                #related-products-slider {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                @media (max-width: 600px) {
                  #related-products-slider > div {
                    flex: 0 0 240px !important;
                    min-width: 240px !important;
                  }
                }
              `}</style>
            </section>
          )
        })()}
      </main>

      <footer className="site-footer fade-up">
      </footer>

      <Footer />
    </div>
  )
}

export default ProductDetailPage


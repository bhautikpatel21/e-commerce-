import { useState, useEffect } from 'react'
import { addToCart, getWishlist, addToWishlist, removeFromWishlist } from '../Api'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Review from '../components/Review'
import Footer from '../components/Footer'
import Category from '../components/Category'
import ScrollableProductImage from '../components/ScrollableProductImage'
import '../App.css'
import { getProducts, getProductsByCategoryForHome } from '../Api'
import Subcribe from '../components/Subcribe'
import Toast from '../components/Toast'
import Celebration from '../components/Celebration'
import { isFriday, calculateDiscountedPrice, formatPrice } from '../utils/discount'

function parseProductTitle(title) {
  const match = title.match(/^([A-Z][a-z]+(?:-[A-Z][a-z]+)*)\s+(.*)$/);
  if (match) {
    return { type: match[1], name: match[2] };
  }
  return { type: '', name: title };
}

function ProductPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCategory, setSelectedCategory] = useState(null) // null = normal page
  const [productsData, setProductsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [shirtProducts, setShirtProducts] = useState([])
  const [tshirtProducts, setTshirtProducts] = useState([])
  const [hoodieProducts, setHoodieProducts] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [wishlistedItems, setWishlistedItems] = useState([])
  const [selectedSize, setSelectedSize] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [celebrate, setCelebrate] = useState(0)
  const [isFridayDiscount, setIsFridayDiscount] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const sliderImages = ['/images/poster1.jpg', '/images/poster2.jpg', '/images/poster3.jpg', '/images/poster4.jpg']

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % sliderImages.length)
  }

  // Check if today is Friday on component mount
  useEffect(() => {
    setIsFridayDiscount(isFriday())
  }, [])

  // Auto-slide every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Check for category in navigation state when component mounts or location changes
  useEffect(() => {
    // If navigating with resetCategory flag or no category, show original page
    if (location.state?.resetCategory === true) {
      setSelectedCategory(null)
      window.history.replaceState({}, document.title)
    } else if (location.state?.category) {
      setSelectedCategory(location.state.category)
      // Clear the state to avoid re-triggering on re-renders
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Helper function to render product price with discount
  const renderProductPrice = (product) => {
    if (!product.price) return <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#333' }}>Price not available</p>

    if (isFridayDiscount) {
      const discountedPriceUSD = calculateDiscountedPrice(product.price)
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <span
            style={{
              fontSize: '1em',
              fontWeight: 'normal',
              color: '#999',
              textDecoration: 'line-through',
            }}
          >
            {formatPrice(product.price)}
          </span>
          <span
            style={{
              fontSize: '1.1em',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            {formatPrice(discountedPriceUSD)}
          </span>
        </div>
      )
    } else {
      return (
        <p
          style={{
            fontSize: '1.1em',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          {formatPrice(product.price)}
        </p>
      )
    }
  }

  // Load wishlist from API on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const response = await getWishlist(token)
        if (response.isSuccess && response.data) {
          setWishlistedItems(response.data.products.map(p => p._id))
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err)
      }
    }

    fetchWishlist()
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

  // Load recently viewed products from localStorage
  useEffect(() => {
    if (productsData.length > 0) {
      const stored = localStorage.getItem('recentlyViewed')
      const recentlyViewedIds = stored ? JSON.parse(stored) : []

      // Get recently viewed products from productsData
      const recentlyViewedProducts = recentlyViewedIds
        .map(id => productsData.find(p => p._id === id))
        .filter(p => p !== undefined)
        .slice(0, 5) // Limit to 5 products

      setRecentlyViewed(recentlyViewedProducts)
    }
  }, [productsData])

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setCategoryLoading(true)

        // Fetch shirt products
        const shirtResponse = await getProductsByCategoryForHome('shirt', 1, 8)
        if (shirtResponse.isSuccess && shirtResponse.data) {
          setShirtProducts(Array.isArray(shirtResponse.data) ? shirtResponse.data : shirtResponse.data.products || [])
        }

        // Fetch t-shirt products
        const tshirtResponse = await getProductsByCategoryForHome('t-shirt', 1, 8)
        if (tshirtResponse.isSuccess && tshirtResponse.data) {
          setTshirtProducts(Array.isArray(tshirtResponse.data) ? tshirtResponse.data : tshirtResponse.data.products || [])
        }

        // Fetch hoodie products
        const hoodieResponse = await getProductsByCategoryForHome('hoodie', 1, 6)
        if (hoodieResponse.isSuccess && hoodieResponse.data) {
          setHoodieProducts(Array.isArray(hoodieResponse.data) ? hoodieResponse.data : hoodieResponse.data.products || [])
        }
      } catch (err) {
        console.error('Error fetching category products:', err)
      } finally {
        setCategoryLoading(false)
      }
    }

    fetchCategoryProducts()
  }, [])

  if (loading) {
    return (
      <div className="page-shell">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading products...</p>
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

  const featuredProduct = productsData[0]
  const featuredImages = featuredProduct
    ? [
      featuredProduct.mainImage,
      ...(featuredProduct.sideImages || []).slice(0, 3),
    ]
    : []

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

      <Navbar onSelectCategory={setSelectedCategory} />

      {/* Image Slider */}
      <div className="slider-container" style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', marginBottom: '20px' }}>
        <img
          src={sliderImages[currentImageIndex]}
          alt={`Poster ${currentImageIndex + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div className="feature-boxes" style={{ backgroundColor: '#f5f5f5', padding: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px', borderRadius: '8px', margin: '20px 0', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ flex: 1, borderRadius: '4px', overflow: 'hidden', height: '200px', minHeight: '150px' }}>
          <img 
            src="/images/embroidery.jpg" 
            alt="Premium Fabric" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div style={{ flex: 1, borderRadius: '4px', overflow: 'hidden', height: '200px', minHeight: '150px' }}>
          <img 
            src="/images/shiping.jpg" 
            alt="Fast Shipping" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>
      <main>
        {/* If a category is selected from Navbar, show full-page Category view */}
        {selectedCategory ? (
          <Category
            selectedCategory={selectedCategory}
            onProductClick={(product) => navigate(`/product/${product._id}`)}
          />
        ) : (
          <>
            {/* Featured product hero section (top of page) */}

            {/* Shirt Section */}
            <div className="category-section-container" style={{ marginBottom: '20px' }}>
              <div
                className="mt-10 mb-5 mx-2.5 cursor-pointer"
                onClick={() => setSelectedCategory('shirt')}
              >
                <h2 className="category-title category-title-text text-center text-black text-2xl font-bold uppercase tracking-widest">
                  Our Collections
                </h2>
              </div>
              <img
                src="/images/shirt.webp"
                alt="Shirt Banner"
                className="category-banner"
                style={{
                  width: '100%',
                  maxWidth: '1200px',
                  height: '250px',
                  objectFit: 'cover',
                  margin: '0 auto 30px',
                  display: 'block',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedCategory('shirt')}
                loading="lazy"
              />
              {categoryLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading shirt products...</p>
                </div>
              ) : (
                <>
                  <section
                    className="products-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '20px',
                      maxWidth: '1200px',
                      margin: '0 auto',
                    }}
                  >
                    {shirtProducts.map((product, index) => (
                      <div
                        key={product._id || product.title + index}
                        className="product-card"
                        style={{
                          textAlign: 'center',
                          border: '1px solid #e0e0e0',
                          overflow: 'hidden',
                          background: 'white',
                          cursor: 'pointer',
                          position: 'relative',
                          borderRadius: '12px',
                        }}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <ScrollableProductImage
                          product={product}
                          productId={`shirt-${index}`}
                          showDiscountBadge={isFridayDiscount}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid #e0e0e0', paddingTop: '10px' }}>
                          {(() => {
                            const { type, name } = parseProductTitle(product.title);
                            return (
                              <div className="product-title" style={{ fontSize: '1em', textAlign: 'center' }}>
                                {type ? <span className="title-type">{type}</span> : null}
                                <span className="title-name">{name}</span>
                              </div>
                            );
                          })()}
                          {renderProductPrice(product)}
                        </div>
                      </div>
                    ))}
                  </section>
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className='bg-gray-700'
                      onClick={() => setSelectedCategory('t-shirt')}
                      style={{
                        padding: '10px 30px',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1em',
                      }}
                    >
                      View More
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Promotional Banner Section */}
            <div className="promotional-banner" style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '0 auto 20px', maxWidth: '1200px' }}>
              <h3 style={{ fontSize: '1.2em', margin: '0 0 15px 0' }}>Make Way for New Drip</h3>
              <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Explore the Season's New Styles</h2>
              <p style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '0 0 10px 0' }}>Extra 10% on Orders Above $2599</p>
              <p style={{ fontSize: '0.9em', color: '#666', margin: '0' }}>Discount auto-applied at checkout | Exclusions apply</p>
            </div>

            {/* T-shirt Section */}
            <div className="category-section-container" style={{ marginBottom: '20px' }}>
              <div
                className="mt-10 mb-5 mx-2.5 cursor-pointer"
                onClick={() => setSelectedCategory('t-shirt')}
              >
                <h2 className="category-title category-title-text text-center text-black text-2xl font-bold uppercase tracking-widest">
                  T-Shirt
                </h2>
              </div>
              <img
                src="/images/t-shirt.webp"
                alt="T-shirt Banner"
                className="category-banner"
                style={{
                  width: '100%',
                  maxWidth: '1200px',
                  height: '250px',
                  objectFit: 'cover',
                  margin: '0 auto 30px',
                  display: 'block',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedCategory('t-shirt')}
                loading="lazy"
              />
              {categoryLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading t-shirt products...</p>
                </div>
              ) : (
                <>
                  <section
                    className="products-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '20px',
                      maxWidth: '1200px',
                      margin: '0 auto',
                    }}
                  >
                    {tshirtProducts.map((product, index) => (
                      <div
                        key={product._id || product.title + index}
                        className="product-card"
                        style={{
                          textAlign: 'center',
                          border: '1px solid #e0e0e0',
                          overflow: 'hidden',
                          background: 'white',
                          cursor: 'pointer',
                          position: 'relative',
                          borderRadius: '12px',
                        }}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <ScrollableProductImage
                          product={product}
                          productId={`tshirt-${index}`}
                          showDiscountBadge={isFridayDiscount}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid #e0e0e0', paddingTop: '10px' }}>
                          {(() => {
                            const { type, name } = parseProductTitle(product.title);
                            return (
                              <div className="product-title" style={{fontSize: '1em', textAlign: 'center' }}>
                                {type ? <span className="title-type">{type}</span> : null}
                                <span className="title-name">{name}</span>
                              </div>
                            );
                          })()}
                          {renderProductPrice(product)}
                        </div>
                      </div>
                    ))}
                  </section>
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className='bg-gray-700 view-more-button'
                      onClick={() => setSelectedCategory('t-shirt')}
                      style={{
                        padding: '10px 30px',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1em',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#4a5568'
                        e.target.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#374151'
                        e.target.style.transform = 'scale(1)'
                      }}
                    >
                      View More
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Customize Section - Enhanced Design */}
            <div 
              className="customize-section"
              style={{ 
                maxWidth: '1200px', 
                margin: '60px auto', 
                padding: '0 1rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="customize-section-inner" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '40px', 
                padding: '50px 40px',
                alignItems: 'center'
              }}>
                {/* Left Side - Content */}
                <div>
                  <div className="customize-badge-new" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: '#fff4e6',
                    color: '#d35400',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85em',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    border: '1px dashed #f0b27a'
                  }}>
                    <span>🎨</span>
                    <span>NEW FEATURE</span>
                  </div>
                  <h2 className="customize-title" style={{ 
                    fontSize: '2.2em', 
                    fontWeight: 'bold', 
                    color: '#333', 
                    marginBottom: '15px',
                    lineHeight: '1.2'
                  }}>
                    Design Your Own T-Shirt
                  </h2>
                  <p className="customize-description" style={{ 
                    fontSize: '1.1em', 
                    color: '#666', 
                    marginBottom: '30px',
                    lineHeight: '1.6'
                  }}>
                    Create a unique piece that's 100% you. Add custom text, logos, upload your own designs, and choose from multiple colors and sizes.
                  </p>
                  <div className="customize-features" style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '15px', 
                    marginBottom: '30px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                      <span style={{ fontSize: '1.2em' }}>✓</span>
                      <span style={{ fontSize: '0.95em' }}>Multiple Colors</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                      <span style={{ fontSize: '1.2em' }}>✓</span>
                      <span style={{ fontSize: '0.95em' }}>Custom Text & Images</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                      <span style={{ fontSize: '1.2em' }}>✓</span>
                      <span style={{ fontSize: '0.95em' }}>All Sizes Available</span>
                    </div>
                  </div>
                  <button
                    className="customize-button"
                    onClick={() => navigate('/customize')}
                    style={{
                      padding: '16px 50px',
                      fontSize: '1.1em',
                      fontWeight: 'bold',
                      background: '#374151',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 15px rgba(55, 65, 81, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#4a5568'
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 6px 20px rgba(55, 65, 81, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#374151'
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 4px 15px rgba(55, 65, 81, 0.3)'
                    }}
                  >
                    <span>Start Customizing</span>
                  </button>
                </div>

                {/* Right Side - Visual Preview */}
                <div className="customize-preview-container" style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '280px',
                    height: '320px',
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 21px)',
                    border: '3px dashed #d4c4b5',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ 
                      width: '180px', 
                      height: '200px',
                      position: 'relative'
                    }}>
                      <svg viewBox="0 0 200 220" style={{ width: '100%', height: '100%' }}>
                        <path 
                          d="M50 0 L0 50 L20 60 L20 220 L180 220 L180 60 L200 50 L150 0 L130 20 Q100 35 70 20 Z" 
                          fill="#ffffff"
                          stroke="#d4c4b5"
                          strokeWidth="2"
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '2em',
                        opacity: 0.3
                      }}>
                        🎨
                      </div>
                    </div>
                  </div>
                  <div className="customize-badge" style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#e17055',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85em',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(225, 112, 85, 0.4)',
                    animation: 'pulse 2s infinite'
                  }}>
                    Custom Design
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-boxes" style={{ backgroundColor: '#f5f5f5', padding: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '10px', borderRadius: '8px', margin: '20px 0', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
              <div style={{ flex: 1, borderRadius: '4px', overflow: 'hidden', height: '200px' }}>
                <img 
                  src="/images/febric.jpg" 
                  alt="Premium Fabric" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ flex: 1, borderRadius: '4px', overflow: 'hidden', height: '200px' }}>
                <img 
                  src="/images/return.jpg" 
                  alt="Return & Exchange" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ flex: 1, borderRadius: '4px', overflow: 'hidden', height: '200px' }}>
                <img 
                  src="/images/shiping.jpg" 
                  alt="Fast Shipping" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

            {/* Hoodie Section */}
            <div className="category-section-container" style={{ marginBottom: '60px' }}>
              <div
                className="mt-10 mb-5 mx-2.5 cursor-pointer"
                onClick={() => setSelectedCategory('hoodie')}
              >
                <h2 className="category-title category-title-text text-center text-black text-2xl font-bold uppercase tracking-widest">
                  Hoodie
                </h2>
              </div>
              <img
                src="/images/hoodie.webp"
                alt="Hoodie Banner"
                className="category-banner"
                style={{
                  width: '100%',
                  maxWidth: '1200px',
                  height: '250px',
                  objectFit: 'cover',
                  margin: '0 auto 30px',
                  display: 'block',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedCategory('hoodie')}
                loading="lazy"
              />
              {categoryLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading hoodie products...</p>
                </div>
              ) : (
                <>
                  <section
                    className="products-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '20px',
                      maxWidth: '1200px',
                      margin: '0 auto',
                    }}
                  >
                    {hoodieProducts.map((product, index) => (
                      <div
                        key={product._id || product.title + index}
                        className="product-card"
                        style={{
                          textAlign: 'center',
                          border: '1px solid #e0e0e0',
                          overflow: 'hidden',
                          background: 'white',
                          cursor: 'pointer',
                          position: 'relative',
                          borderRadius: '12px',
                        }}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <ScrollableProductImage
                          product={product}
                          productId={`hoodie-${index}`}
                          showDiscountBadge={isFridayDiscount}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid #e0e0e0', paddingTop: '10px' }}>
                          {(() => {
                            const { type, name } = parseProductTitle(product.title);
                            return (
                              <div className="product-title" style={{ fontSize: '1em', textAlign: 'center' }}>
                                {type ? <span className="title-type">{type}</span> : null}
                                <span className="title-name">{name}</span>
                              </div>
                            );
                          })()}
                          {renderProductPrice(product)}
                        </div>
                      </div>
                    ))}
                  </section>
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className='bg-gray-700 view-more-button'
                      onClick={() => setSelectedCategory('hoodie')}
                      style={{
                        padding: '10px 30px',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1em',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#4a5568'
                        e.target.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#374151'
                        e.target.style.transform = 'scale(1)'
                      }}
                    >
                      View More
                    </button>
                  </div>
                </>
              )}
            </div>

            {recentlyViewed.length > 0 && (
              <>
                <h2
                  style={{
                    textAlign: 'start',
                    color: 'black',
                    fontSize: '1.5em',
                    fontWeight: 'bold',
                    margin: '40px 0 20px 10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Recently viewed
                </h2>

                {/* Product grid */}
                <section
                  className="products-grid recently-viewed-grid"
                  style={{
                    display: 'grid',
                    gap: '20px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                  }}
                >
                  {recentlyViewed.map((product, index) => (
                    <div
                      key={product._id || product.title + index}
                      className="product-card"
                      style={{
                        textAlign: 'center',
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        background: 'white',
                        cursor: 'pointer',
                        position: 'relative',
                        borderRadius: '12px',
                      }}
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <ScrollableProductImage
                        product={product}
                        productId={`recent-${index}`}
                        showDiscountBadge={isFridayDiscount}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid #e0e0e0', paddingTop: '10px' }}>
                        {(() => {
                          const { type, name } = parseProductTitle(product.title);
                          return (
                            <div className="product-title" style={{ margin: '10px 0', fontSize: '1em', textAlign: 'center' }}>
                              {type ? <span className="title-type">{type}</span> : null}
                              <span className="title-name">{name}</span>
                            </div>
                          );
                        })()}
                        {renderProductPrice(product)}
                      </div>
                    </div>
                  ))}
                </section>
              </>
            )}

            <Subcribe />
          </>
        )}
      </main>

      <footer className="site-footer fade-up">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>

      <Footer />
    </div>
  )
}

export default ProductPage

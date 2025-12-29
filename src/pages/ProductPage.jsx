import { useState, useEffect } from 'react'
import { getWishlist, getHomepage } from '../Api'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
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
  const [oversizedProducts, setOversizedProducts] = useState([])
  const [printedProducts, setPrintedProducts] = useState([])
  const [embroderyProducts, setEmbroderyProducts] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [wishlistedItems, setWishlistedItems] = useState([])
  const [selectedSize, setSelectedSize] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [celebrate, setCelebrate] = useState(0)
  const [isFridayDiscount, setIsFridayDiscount] = useState(false)
  const [homepageImages, setHomepageImages] = useState({
    heroMobileImage: '',
    heroDesktopImage: '',
    collectionMobileImage: '',
    collectionDesktopImage: '',
    saleImage: '',
  })

  // Check if today is Friday on component mount
  useEffect(() => {
    setIsFridayDiscount(isFriday())
  }, [])

  // Fetch homepage images
  useEffect(() => {
    const fetchHomepageImages = async () => {
      try {
        const response = await getHomepage()
        if (response.isSuccess && response.data) {
          setHomepageImages({
            heroMobileImage: response.data.heroMobileImage || '',
            heroDesktopImage: response.data.heroDesktopImage || '',
            collectionMobileImage: response.data.collectionMobileImage || '',
            collectionDesktopImage: response.data.collectionDesktopImage || '',
            saleImage: response.data.saleImage || '',
          })
        }
      } catch (error) {
        console.log('Using default homepage images')
      }
    }
    fetchHomepageImages()
  }, [])

  useEffect(() => {
    if (location.state?.resetCategory === true) {
      setSelectedCategory(null)
      window.history.replaceState({}, document.title)
    } else if (location.state?.category) {
      setSelectedCategory(location.state.category)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const renderProductPrice = (product) => {
    if (!product.price) return <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#333' }}>Price not available</p>

    if (isFridayDiscount) {
      const discountedPriceUSD = calculateDiscountedPrice(product.price)
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
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
            textAlign: 'left',
          }}
        >
          {formatPrice(product.price)}
        </p>
      )
    }
  }

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

  useEffect(() => {
    if (productsData.length > 0) {
      const stored = localStorage.getItem('recentlyViewed')
      const recentlyViewedIds = stored ? JSON.parse(stored) : []

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

        const oversizedResponse = await getProductsByCategoryForHome('oversized-tshirts', 1, 8)
        if (oversizedResponse.isSuccess && oversizedResponse.data) {
          setOversizedProducts(Array.isArray(oversizedResponse.data) ? oversizedResponse.data : oversizedResponse.data.products || [])
        }

        const printedResponse = await getProductsByCategoryForHome('printed-tshirts', 1, 8)
        if (printedResponse.isSuccess && printedResponse.data) {
          setPrintedProducts(Array.isArray(printedResponse.data) ? printedResponse.data : printedResponse.data.products || [])
        }

        const embroderyResponse = await getProductsByCategoryForHome('embrodery-tshirt', 1, 6)
        if (embroderyResponse.isSuccess && embroderyResponse.data) {
          setEmbroderyProducts(Array.isArray(embroderyResponse.data) ? embroderyResponse.data : embroderyResponse.data.products || [])
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

      <Navbar onSelectCategory={setSelectedCategory} />

      <div className="responsive-banner-container">
        <img
          src={homepageImages.heroMobileImage || "/images/phoneBanner.jpg"}
          alt="Banner"
          className="mobile-banner"
        />
        <img
          src={homepageImages.heroDesktopImage || "/images/leptopBanner.jpg"}
          alt="Banner"
          className="desktop-banner"
        />
      </div>

      <div className="feature-boxes" style={{ padding: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px', borderRadius: '8px', margin: '20px 0', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ flex: 1, borderRadius: '4px', overflow: 'hidden', height: '200px' }}>
          <img
            src="/images/febric.jpg"
            alt="Premium Fabric"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div style={{ flex: 1, borderRadius: '4px', overflow: 'hidden', height: '200px' }}>
          <img
            src="/images/embroidery.jpg"
            alt="Premium Fabric"
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

            {/* Oversized T-shirts Section */}
            <div className="category-section-container" style={{ marginBottom: '20px' }}>
              <div
                className="mt-10 mb-5 mx-2.5 cursor-pointer"
                onClick={() => setSelectedCategory('oversized-tshirts')}
              >
                <h2 className="category-title category-title-text text-center text-black text-2xl font-bold uppercase tracking-widest">
                  Our collection
                </h2>
              </div>
              {categoryLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading oversized t-shirts products...</p>
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
                    {oversizedProducts.map((product, index) => (
                      <div
                      key={product._id || product.title + index}
                      className="product-card"
                      style={{
                        textAlign: 'left',
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
                        productId={`oversized-${index}`}
                        showDiscountBadge={isFridayDiscount}
                      />
                    
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',  
                          borderTop: '1px solid #e0e0e0',
                          paddingTop: '10px',
                          paddingLeft: '12px',        // optional (for spacing)
                          paddingRight: '12px',
                        }}
                      >
                        {(() => {
                          const { type, name } = parseProductTitle(product.title);
                          return (
                            <div
                              className="product-title"
                              style={{
                                fontSize: '1em',
                                textAlign: 'left', 
                                width: '100%',
                              }}
                            >
                              {type ? <span className="title-type">{type} </span> : null}
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
                      onClick={() => setSelectedCategory('oversized-tshirts')}
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
              <p style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '0 0 10px 0' }}>Extra 10% on Orders Above ₹2099</p>
              <p style={{ fontSize: '0.9em', color: '#666', margin: '0' }}>Discount auto-applied at checkout | Exclusions apply</p>
            </div>

            {/* Printed T-shirts Section */}
            <div className="category-section-container" style={{ marginBottom: '20px' }}>
              <div
                className="mt-10 mb-5 mx-2.5 cursor-pointer"
                onClick={() => setSelectedCategory('printed-tshirts')}
              >

              </div>
              <img
                src={homepageImages.collectionDesktopImage || "/images/banner2.jpg"}
                alt="Printed T-shirts Banner"
                className="category-banner desktop-banner"
                style={{
                  width: '90%',
                  height: '350px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: '8px',
                }}
                onClick={() => setSelectedCategory('printed-tshirts')}
                loading="lazy"
              />
              <img
                src={homepageImages.collectionMobileImage || "/images/banner2.jpg"}
                alt="Printed T-shirts Banner"
                className="category-banner mobile-banner"
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
                onClick={() => setSelectedCategory('printed-tshirts')}
                loading="lazy"
              />
              <h2 className="category-title category-title-text text-center text-black text-2xl font-bold uppercase tracking-widest mb-6">
                our collection
              </h2>
              {categoryLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading products...</p>
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
                    {[...printedProducts, ...embroderyProducts].map((product, index) => (
                      <div
                      key={product._id || product.title + index}
                      className="product-card"
                      style={{
                        textAlign: 'left',
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
                        productId={`collection-${index}`}
                        showDiscountBadge={isFridayDiscount}
                      />
                    
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          borderTop: '1px solid #e0e0e0',
                          paddingTop: '10px',
                          paddingLeft: '12px',      // optional (spacing)
                          paddingRight: '12px',
                        }}
                      >
                        {(() => {
                          const { type, name } = parseProductTitle(product.title);
                          return (
                            <div
                              className="product-title"
                              style={{
                                fontSize: '1em',
                                textAlign: 'left',
                                width: '100%',
                              }}
                            >
                              {type ? <span className="title-type">{type} </span> : null}
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
                      onClick={() => setSelectedCategory('all')}
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

            {/* Banner before Customize Section */}
            <div className="promo-banner-container" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 1rem' }}>
              <img
                src={homepageImages.saleImage || "/images/banner4.jpg"}
                alt="Black Friday Sale Banner"
                className="promo-banner-image"
                loading="lazy"
              />
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

            {recentlyViewed.length > 0 && (
              <>
                <h2
                  style={{
                    textAlign: 'center',
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
                    paddingLeft: '30px',
                    paddingRight: '30px',
                  }}
                >
                  {recentlyViewed.map((product, index) => (
                    <div
                      key={product._id || product.title + index}
                      className="product-card"
                      style={{
                        textAlign: 'left',
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start',paddingLeft: '10px', borderTop: '1px solid #e0e0e0', paddingTop: '3px' }}>
                        {(() => {
                          const { type, name } = parseProductTitle(product.title);
                          return (
                            <div className="product-title" style={{ fontSize: '1em', textAlign: 'left' }}>
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
      <Footer />
    </div>
  )
}

export default ProductPage

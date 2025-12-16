import { useState, useEffect } from 'react'
import { addToCart, getWishlist, addToWishlist, removeFromWishlist } from '../Api'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Review from '../components/Review'
import Footer from '../components/Footer'
import Category from '../components/Category'
import ScrollableProductImage from '../components/ScrollableProductImage'
import '../App.css'
import { getProducts, getProductsByCategory } from '../Api'
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

  // T-Shirt Customization States
  const [customTshirtColor, setCustomTshirtColor] = useState('#ffffff')
  const [customSize, setCustomSize] = useState('M')
  const [customQuantity, setCustomQuantity] = useState(1)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [activeElementId, setActiveElementId] = useState(null)
  
  // Multiple design elements (text, logo, uploaded images)
  const [designElements, setDesignElements] = useState([])

  const tshirtColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#1a1a1a' },
    { name: 'Navy', value: '#1e3a5f' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Forest Green', value: '#166534' },
    { name: 'Sky Blue', value: '#0ea5e9' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Orange', value: '#ea580c' },
  ]

  const fontOptions = [
    { name: 'Classic', value: 'Georgia, serif' },
    { name: 'Modern', value: 'Arial, sans-serif' },
    { name: 'Bold', value: 'Impact, sans-serif' },
    { name: 'Elegant', value: 'Times New Roman, serif' },
    { name: 'Fun', value: 'Comic Sans MS, cursive' },
    { name: 'Tech', value: 'Courier New, monospace' },
  ]

  const positionOptions = [
    { id: 'top-left', name: 'Top Left', style: { top: '25%', left: '20%' } },
    { id: 'top-center', name: 'Top Center', style: { top: '25%', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'top-right', name: 'Top Right', style: { top: '25%', right: '20%' } },
    { id: 'center-left', name: 'Center Left', style: { top: '50%', left: '20%', transform: 'translateY(-50%)' } },
    { id: 'center', name: 'Center', style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } },
    { id: 'center-right', name: 'Center Right', style: { top: '50%', right: '20%', transform: 'translateY(-50%)' } },
    { id: 'bottom-left', name: 'Bottom Left', style: { bottom: '30%', left: '20%' } },
    { id: 'bottom-center', name: 'Bottom Center', style: { bottom: '30%', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'bottom-right', name: 'Bottom Right', style: { bottom: '30%', right: '20%' } },
  ]

  const elementSizeOptions = [
    { id: 'xs', name: 'XS', scale: 0.5 },
    { id: 'sm', name: 'S', scale: 0.75 },
    { id: 'md', name: 'M', scale: 1 },
    { id: 'lg', name: 'L', scale: 1.25 },
    { id: 'xl', name: 'XL', scale: 1.5 },
    { id: 'xxl', name: 'XXL', scale: 2 },
  ]

  const addTextElement = () => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: 'Your Text',
      color: '#000000',
      font: 'Georgia, serif',
      position: 'center',
      size: 'md',
    }
    setDesignElements([...designElements, newElement])
    setActiveElementId(newElement.id)
  }

  const addLogoElement = (logoType) => {
    const logos = {
      'star': '⭐',
      'heart': '❤️',
      'fire': '🔥',
      'crown': '👑',
      'lightning': '⚡',
      'music': '🎵',
    }
    const newElement = {
      id: Date.now(),
      type: 'logo',
      content: logos[logoType] || '🎨',
      position: 'center',
      size: 'md',
    }
    setDesignElements([...designElements, newElement])
    setActiveElementId(newElement.id)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newElement = {
          id: Date.now(),
          type: 'image',
          content: reader.result,
          position: 'center',
          size: 'md',
        }
        setDesignElements([...designElements, newElement])
        setActiveElementId(newElement.id)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateElement = (id, updates) => {
    setDesignElements(designElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  const removeElement = (id) => {
    setDesignElements(designElements.filter(el => el.id !== id))
    if (activeElementId === id) setActiveElementId(null)
  }

  const getActiveElement = () => designElements.find(el => el.id === activeElementId)

  const handleCustomizeAddToCart = () => {
    const customProduct = {
      title: 'Custom T-Shirt',
      color: customTshirtColor,
      elements: designElements,
      size: customSize,
      quantity: customQuantity,
      price: 29.99 + (designElements.length * 2),
    }
    setToast({ show: true, message: 'Custom T-Shirt added to cart!', type: 'success' })
    setCelebrate(prev => prev + 1)
    console.log('Custom T-Shirt:', customProduct)
  }

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
        const shirtResponse = await getProductsByCategory('shirt', 1, 8)
        if (shirtResponse.isSuccess && shirtResponse.data) {
          setShirtProducts(Array.isArray(shirtResponse.data) ? shirtResponse.data : shirtResponse.data.products || [])
        }

        // Fetch t-shirt products
        const tshirtResponse = await getProductsByCategory('t-shirt', 1, 8)
        if (tshirtResponse.isSuccess && tshirtResponse.data) {
          setTshirtProducts(Array.isArray(tshirtResponse.data) ? tshirtResponse.data : tshirtResponse.data.products || [])
        }

        // Fetch hoodie products
        const hoodieResponse = await getProductsByCategory('hoodie', 1, 6)
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
      <div style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', marginBottom: '20px' }}>
        <img
          src={sliderImages[currentImageIndex]}
          alt={`Poster ${currentImageIndex + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}>👕</span>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>Made with Premium Fabric</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}>🚚</span>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>Shipping within 24 hours</p>
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
            <div style={{ marginBottom: '20px' }}>
              <div
                className="animated-dots-bg mt-10 mb-5 mx-2.5 cursor-pointer"
                onClick={() => setSelectedCategory('shirt')}
              >
                {/* 7 Animated Floating Dots */}
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                
                <h2 className="category-title-text text-center text-black text-2xl font-bold uppercase tracking-widest">
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
                      gap: '0',
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
                          margin: '-0.5px',
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
            <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '0 auto 20px' }}>
              <h3 style={{ fontSize: '1.2em', margin: '0 0 15px 0' }}>Make Way for New Drip</h3>
              <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Explore the Season's New Styles</h2>
              <p style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '0 0 10px 0' }}>Extra 10% on Orders Above $2599</p>
              <p style={{ fontSize: '0.9em', color: '#666', margin: '0' }}>Discount auto-applied at checkout | Exclusions apply</p>
            </div>

            {/* T-shirt Section */}
            <div style={{ marginBottom: '20px' }}>
              <div
                className="animated-dots-bg mt-10 mb-5 mx-2.5 cursor-pointer"
                onClick={() => setSelectedCategory('t-shirt')}
              >
                {/* 7 Animated Floating Dots */}
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                
                <h2 className="category-title-text text-center text-black text-2xl font-bold uppercase tracking-widest">
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
                      gap: '0',
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
                          margin: '-0.5px',
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

            {/* T-Shirt Customization Section */}
            <div className="customize-section">
              <div className="customize-header">
                <div className="customize-badge">NEW</div>
                <h2 className="customize-title">Design Your Own T-Shirt</h2>
                <p className="customize-subtitle">Create a unique piece that's 100% you. Add multiple texts, logos, and upload your own designs!</p>
              </div>

              <div className="customize-container">
                {/* T-Shirt Preview */}
                <div className="customize-preview">
                  <div className="tshirt-display">
                    <div className="tshirt-shape">
                      <svg viewBox="0 0 200 220" className="tshirt-svg">
                        <path 
                          d="M50 0 L0 50 L20 60 L20 220 L180 220 L180 60 L200 50 L150 0 L130 20 Q100 35 70 20 Z" 
                          fill={customTshirtColor}
                          stroke={customTshirtColor === '#ffffff' ? '#d4c4b5' : 'transparent'}
                          strokeWidth="2"
                        />
                      </svg>
                      {/* Render all design elements */}
                      {designElements.map((element) => {
                        const position = positionOptions.find(p => p.id === element.position)?.style || {}
                        const sizeScale = elementSizeOptions.find(s => s.id === element.size)?.scale || 1
                        
                        return (
                          <div
                            key={element.id}
                            className={`design-element ${activeElementId === element.id ? 'active' : ''}`}
                            style={{
                              ...position,
                              transform: `${position.transform || ''} scale(${sizeScale})`.trim(),
                            }}
                            onClick={() => setActiveElementId(element.id)}
                          >
                            {element.type === 'text' && (
                              <span 
                                style={{ 
                                  color: element.color,
                                  fontFamily: element.font,
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {element.content}
                              </span>
                            )}
                            {element.type === 'logo' && (
                              <span style={{ fontSize: '24px' }}>{element.content}</span>
                            )}
                            {element.type === 'image' && (
                              <img 
                                src={element.content} 
                                alt="Custom design"
                                style={{ 
                                  maxWidth: '60px', 
                                  maxHeight: '60px',
                                  objectFit: 'contain',
                                }}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <p className="preview-label">Live Preview • Click element to edit</p>
                  
                  {/* Elements List */}
                  {designElements.length > 0 && (
                    <div className="elements-list">
                      <p className="elements-list-title">Added Elements ({designElements.length})</p>
                      {designElements.map((el, idx) => (
                        <div 
                          key={el.id} 
                          className={`element-item ${activeElementId === el.id ? 'active' : ''}`}
                          onClick={() => setActiveElementId(el.id)}
                        >
                          <span className="element-icon">
                            {el.type === 'text' ? '✏️' : el.type === 'logo' ? el.content : '🖼️'}
                          </span>
                          <span className="element-name">
                            {el.type === 'text' ? el.content.substring(0, 10) + (el.content.length > 10 ? '...' : '') : 
                             el.type === 'logo' ? 'Logo' : 'Image'}
                          </span>
                          <button 
                            className="element-remove"
                            onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customization Options */}
                <div className="customize-options">
                  {/* Color Selection */}
                  <div className="option-group">
                    <h3 className="option-title">
                      <span className="option-number">1</span>
                      T-Shirt Color
                    </h3>
                    <div className="color-grid">
                      {tshirtColors.map((color) => (
                        <button
                          key={color.value}
                          className={`color-btn ${customTshirtColor === color.value ? 'active' : ''}`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setCustomTshirtColor(color.value)}
                          title={color.name}
                        >
                          {customTshirtColor === color.value && <span className="check-mark">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Elements */}
                  <div className="option-group">
                    <h3 className="option-title">
                      <span className="option-number">2</span>
                      Add Design Elements
                    </h3>
                    <div className="add-elements-row">
                      <button className="add-element-btn" onClick={addTextElement}>
                        <span>✏️</span> Add Text
                      </button>
                      <label className="add-element-btn upload-btn">
                        <span>📷</span> Upload Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                    <div className="logo-grid">
                      <p className="logo-grid-label">Quick Add Logos:</p>
                      <div className="logo-buttons">
                        {['star', 'heart', 'fire', 'crown', 'lightning', 'music'].map((logo) => (
                          <button 
                            key={logo}
                            className="logo-btn"
                            onClick={() => addLogoElement(logo)}
                          >
                            {logo === 'star' && '⭐'}
                            {logo === 'heart' && '❤️'}
                            {logo === 'fire' && '🔥'}
                            {logo === 'crown' && '👑'}
                            {logo === 'lightning' && '⚡'}
                            {logo === 'music' && '🎵'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Edit Selected Element */}
                  {getActiveElement() && (
                    <div className="option-group text-option-animate">
                      <h3 className="option-title">
                        <span className="option-number">3</span>
                        Edit Selected Element
                      </h3>
                      
                      {/* Text specific options */}
                      {getActiveElement().type === 'text' && (
                        <>
                          <input
                            type="text"
                            className="custom-text-input"
                            placeholder="Enter your text..."
                            value={getActiveElement().content}
                            onChange={(e) => updateElement(activeElementId, { content: e.target.value })}
                            maxLength={25}
                          />
                          <div className="text-options-row">
                            <div className="text-color-row">
                              <span>Color:</span>
                              <input
                                type="color"
                                value={getActiveElement().color}
                                onChange={(e) => updateElement(activeElementId, { color: e.target.value })}
                                className="text-color-picker"
                              />
                            </div>
                            <div className="font-selector">
                              <span>Font:</span>
                              <select
                                value={getActiveElement().font}
                                onChange={(e) => updateElement(activeElementId, { font: e.target.value })}
                                className="font-select"
                              >
                                {fontOptions.map((font) => (
                                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                    {font.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Position Selection */}
                      <div className="position-selector">
                        <p className="position-label">Position:</p>
                        <div className="position-grid">
                          {positionOptions.map((pos) => {
                            const arrowIcons = {
                              'top-left': (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="17" y1="17" x2="7" y2="7"></line>
                                  <polyline points="7 17 7 7 17 7"></polyline>
                                </svg>
                              ),
                              'top-center': (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="19" x2="12" y2="5"></line>
                                  <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                              ),
                              'top-right': (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="7" y1="17" x2="17" y2="7"></line>
                                  <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                              ),
                              'center-left': (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="19" y1="12" x2="5" y2="12"></line>
                                  <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                              ),
                              'center': (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="12" cy="12" r="8"></circle>
                                </svg>
                              ),
                              'center-right': (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                  <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                              ),
                              'bottom-left': (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="17" y1="7" x2="7" y2="17"></line>
                                  <polyline points="17 17 7 17 7 7"></polyline>
                                </svg>
                              ),
                              'bottom-center': (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <polyline points="19 12 12 19 5 12"></polyline>
                                </svg>
                              ),
                              'bottom-right': (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="7" y1="7" x2="17" y2="17"></line>
                                  <polyline points="17 7 17 17 7 17"></polyline>
                                </svg>
                              ),
                            }
                            return (
                              <button
                                key={pos.id}
                                className={`position-btn ${getActiveElement().position === pos.id ? 'active' : ''}`}
                                onClick={() => updateElement(activeElementId, { position: pos.id })}
                                title={pos.name}
                              >
                                {arrowIcons[pos.id]}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Element Size */}
                      <div className="element-size-selector">
                        <p className="position-label">Element Size:</p>
                        <div className="element-size-grid">
                          {elementSizeOptions.map((size) => (
                            <button
                              key={size.id}
                              className={`element-size-btn ${getActiveElement().size === size.id ? 'active' : ''}`}
                              onClick={() => updateElement(activeElementId, { size: size.id })}
                            >
                              {size.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* T-Shirt Size Selection */}
                  <div className="option-group">
                    <h3 className="option-title">
                      <span className="option-number">{getActiveElement() ? '4' : '3'}</span>
                      T-Shirt Size
                    </h3>
                    <div className="size-grid">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <button
                          key={size}
                          className={`size-btn ${customSize === size ? 'active' : ''}`}
                          onClick={() => setCustomSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="option-group">
                    <div className="quantity-price-row">
                      <div className="quantity-selector">
                        <span className="qty-label">Quantity:</span>
                        <button 
                          className="qty-btn"
                          onClick={() => setCustomQuantity(Math.max(1, customQuantity - 1))}
                        >
                          −
                        </button>
                        <span className="qty-value">{customQuantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => setCustomQuantity(customQuantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="price-display">
                        <span className="price-label">Total:</span>
                        <span className="price-value">
                          ${((29.99 + (designElements.length * 2)) * customQuantity).toFixed(2)}
                        </span>
                        {designElements.length > 0 && (
                          <span className="price-breakdown">
                            (Base $29.99 + ${designElements.length * 2} for {designElements.length} design{designElements.length > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    className="customize-add-btn"
                    onClick={handleCustomizeAddToCart}
                  >
                    <span className="btn-icon">🛒</span>
                    Add Custom T-Shirt to Cart
                  </button>

                  <p className="customize-note">
                    ✨ Free shipping on custom orders over $50 • 🔄 Easy returns within 30 days
                  </p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '5px', borderRadius: '8px', margin: '20px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}>👕</span>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>Made with Premium Fabric</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}> 💸 </span>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>7 Days Easy Return & Exchange</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}>🚚</span>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>Shipping within 24 hours</p>
              </div>
            </div>

            {/* Hoodie Section */}
            <div style={{ marginBottom: '60px' }}>
              <div
                className="animated-dots-bg mt-10 mb-5 mx-2.5 cursor-pointer"
                onClick={() => setSelectedCategory('hoodie')}
              >
                {/* 7 Animated Floating Dots */}
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                <span className="floating-dot"></span>
                
                <h2 className="category-title-text text-center text-black text-2xl font-bold uppercase tracking-widest">
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
                      gap: '0',
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
                          margin: '-0.5px',
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
                    gap: '0',
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
                        margin: '-0.5px',
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

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Review from '../components/Review'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import Celebration from '../components/Celebration'
import '../App.css'
import { getProducts, addToCart, addToWishlist, getWishlist, removeFromWishlist } from '../Api'
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

      <div className='w-12 h-12 bg-green-500'>
        <h1>ojosfsf</h1>
      </div>

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
              The Bear House / {product.category} / {product.title}
            </p>
            <h1>{product.title}</h1>
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

            <div className="size-selector">
              <div className="selector-header">
                <span className="crumbs">Size</span>
                <button type="button" className="ghost tiny">
                  Size chart
                </button>
              </div>
              <div className="size-grid">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`size-pill ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      transition: 'all 0.2s ease',
                    }}
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
          </div>
        </section>

        <Review productId={productId} />
      </main>

      <footer className="site-footer fade-up mb-4">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>

      <Footer />
    </div>
  )
}

export default ProductDetailPage


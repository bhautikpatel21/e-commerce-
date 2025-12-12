import { useState, useEffect } from 'react'
import { getTrendingNowProducts, addToCart, getWishlist, addToWishlist, removeFromWishlist } from '../Api'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScrollableProductImage from '../components/ScrollableProductImage'
import '../App.css'
import Toast from '../components/Toast'
import Celebration from '../components/Celebration'
import FridayOfferBanner from '../components/FridayOfferBanner'
import { isFriday, calculateDiscountedPrice, formatPrice } from '../utils/discount'

function parseProductTitle(title) {
  const match = title.match(/^([A-Z][a-z]+(?:-[A-Z][a-z]+)*)\s+(.*)$/);
  if (match) {
    return { type: match[1], name: match[2] };
  }
  return { type: '', name: title };
}

const TrendingNow = () => {
  const navigate = useNavigate()
  const [productsData, setProductsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wishlistedItems, setWishlistedItems] = useState([])
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [celebrate, setCelebrate] = useState(0)
  const [isFridayDiscount, setIsFridayDiscount] = useState(false)

  // Check if today is Friday on component mount
  useEffect(() => {
    setIsFridayDiscount(isFriday())
  }, [])

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

  // Fetch trending now products
  useEffect(() => {
    const fetchTrendingNowProducts = async () => {
      try {
        setLoading(true)
        const response = await getTrendingNowProducts()
        if (response.isSuccess && response.data) {
          setProductsData(Array.isArray(response.data) ? response.data : [])
        } else {
          setError('Failed to load trending products')
        }
      } catch (err) {
        setError(err.message || 'Failed to load trending products')
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingNowProducts()
  }, [])

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({ show: true, message: 'Please login first', type: 'error' });
      return;
    }
    
    if (!product.sizes || product.sizes.length === 0) {
      setToast({ show: true, message: 'No sizes available for this product', type: 'error' });
      return;
    }
    
    // Use first available size
    const sizeToUse = product.sizes[0];
    
    try {
      await addToCart(product._id, 1, sizeToUse, token);
      setToast({ show: true, message: `Added ${product.title} size ${sizeToUse} to cart`, type: 'success' });
      // Dispatch event to update navbar count
      window.dispatchEvent(new Event('cartChanged'))
      // Trigger celebration animation
      setCelebrate(Date.now())
    } catch (error) {
      setToast({ show: true, message: 'Error adding to cart: ' + error.message, type: 'error' });
    }
  }

  const handleWishlistToggle = async (productId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to manage wishlist', type: 'error' })
      return
    }

    const isCurrentlyWishlisted = wishlistedItems.includes(productId)
    try {
      let response
      if (isCurrentlyWishlisted) {
        response = await removeFromWishlist(productId, token)
        if (response.isSuccess) {
          setWishlistedItems(prev => prev.filter(id => id !== productId))
          setToast({ show: true, message: 'Removed from wishlist', type: 'success' })
          // Dispatch event to update navbar count
          window.dispatchEvent(new Event('wishlistChanged'))
        } else {
          setToast({ show: true, message: 'Failed to remove from wishlist', type: 'error' })
        }
      } else {
        response = await addToWishlist(productId, token)
        if (response.isSuccess) {
          setWishlistedItems(prev => [...prev, productId])
          setToast({ show: true, message: 'Added to wishlist', type: 'success' })
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

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading trending products...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
        <Footer />
      </div>
    )
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

      <FridayOfferBanner />

      <Navbar />

      <main>
        <h2
          style={{
            textAlign: 'center',
            color: 'black',
            fontSize: '2em',
            fontWeight: 'bold',
            margin: '40px 0 30px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Trending Now
        </h2>

        {productsData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>No trending products available at the moment.</p>
          </div>
        ) : (
          <section
            className="products-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px 0px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {productsData.map((product, index) => (
              <div
                key={product._id || product.title + index}
                className="product-card"
                style={{
                  textAlign: 'center',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'white',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <ScrollableProductImage
                  product={product}
                  productId={`trending-${index}`}
                  showDiscountBadge={isFridayDiscount}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {(() => {
                    const { type, name } = parseProductTitle(product.title);
                    return (
                      <div className="product-title" style={{ margin: '10px 0', fontSize: '1.2em', textAlign: 'center' }}>
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
        )}
      </main>

      <footer className="site-footer fade-up mb-4">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>

      <Footer />
    </div>
  )
}

export default TrendingNow


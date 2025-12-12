import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import ScrollableProductImage from '../components/ScrollableProductImage'
import { getWishlist, removeFromWishlist } from '../Api'
import { isFriday, calculateDiscountedPrice, formatPrice } from '../utils/discount'
import '../App.css'

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [isFridayDiscount, setIsFridayDiscount] = useState(false)
  const navigate = useNavigate()

  // Check if today is Friday on component mount
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
        // Dispatch event to update navbar count
        window.dispatchEvent(new Event('wishlistChanged'))
      } else {
        setToast({ show: true, message: 'Failed to remove item from wishlist', type: 'error' })
      }
    } catch (err) {
      setToast({ show: true, message: 'Error removing item from wishlist', type: 'error' })
    }
  }

  const handleProductClick = (product) => {
    navigate(`/product/${encodeURIComponent(product.title)}`)
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading wishlist...</p>
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

  return (
    <div className="page-shell">
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
        <section className="wishlist-section fade-up" style={{ padding: '50px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>My Wishlist</h1>

          {wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <p style={{ fontSize: '1.2rem', color: '#666' }}>Your wishlist is empty</p>
              <button
                onClick={() => navigate('/')}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="wishlist-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '30px',
              marginTop: '30px'
            }}>
              {wishlistItems.map((product) => (
                <div
                  key={product._id}
                  className="wishlist-item"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFromWishlist(product._id)
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      zIndex: 2
                    }}
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>

                  <div onClick={() => handleProductClick(product)}>
                    <div style={{ position: 'relative' }}>
                      <ScrollableProductImage
                        product={product}
                        productId={`wishlist-${product._id}`}
                        showDiscountBadge={isFridayDiscount}
                      />
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {product.title}
                      </h3>
                      <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.9rem' }}>
                        {product.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        {product.price ? (
                          isFridayDiscount ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#999', textDecoration: 'line-through' }}>
                                {formatPrice(product.price)}
                              </span>
                              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                                {formatPrice(calculateDiscountedPrice(product.price))}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                              {formatPrice(product.price)}
                            </span>
                          )
                        ) : (
                          <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Price not available</span>
                        )}
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer fade-up mb-4">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>

      <Footer />
    </div>
  )
}

export default Wishlist

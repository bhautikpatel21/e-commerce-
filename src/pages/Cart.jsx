import React, { useState, useEffect } from 'react'
import { getCart, updateCart, removeFromCart } from '../Api'
import Toast from '../components/Toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CheckoutModal from '../components/CheckoutModal'
import { isFriday, calculateDiscountedPrice, formatPrice, qualifiesForAmountDiscount, calculateAmountDiscountedTotal } from '../utils/discount'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [isFridayDiscount, setIsFridayDiscount] = useState(isFriday())
  const [showCheckout, setShowCheckout] = useState(false)

  const fetchCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please login to view your cart')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await getCart(token)
      if (response.isSuccess && response.data) {
        setCartItems(response.data.items || [])
      } else {
        setError('Failed to load cart')
      }
    } catch (err) {
      setError(err.message || 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
    setIsFridayDiscount(isFriday())
  }, [])

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const price = isFridayDiscount ? calculateDiscountedPrice(item.product.price) : item.product.price
      return total + (price * item.quantity)
    }, 0)
    return calculateAmountDiscountedTotal(subtotal)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = isFridayDiscount ? calculateDiscountedPrice(item.product.price) : item.product.price
      return total + (price * item.quantity)
    }, 0)
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to update cart', type: 'error' })
      return
    }

    try {
      const response = await updateCart(itemId, 'quantity', newQuantity, token)
      if (response.isSuccess) {
        setToast({ show: true, message: `Quantity updated to ${newQuantity}`, type: 'success' })
        // Update local state directly
        setCartItems(prevItems =>
          prevItems.map(item =>
            item._id === itemId ? { ...item, quantity: newQuantity } : item
          )
        )
        // Dispatch event to update navbar count
        window.dispatchEvent(new Event('cartChanged'))
      } else {
        setToast({ show: true, message: 'Failed to update quantity', type: 'error' })
      }
    } catch (err) {
      setToast({ show: true, message: 'Error updating quantity', type: 'error' })
    }
  };

  const handleSizeChange = async (itemId, newSize) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to update cart', type: 'error' })
      return
    }

    try {
      const response = await updateCart(itemId, 'size', newSize, token)
      if (response.isSuccess) {
        setToast({ show: true, message: `Size changed to ${newSize}`, type: 'success' })
        // Update local state directly
        setCartItems(prevItems =>
          prevItems.map(item =>
            item._id === itemId ? { ...item, size: newSize } : item
          )
        )
        // Dispatch event to update navbar count (for consistency)
        window.dispatchEvent(new Event('cartChanged'))
      } else {
        setToast({ show: true, message: 'Failed to update size', type: 'error' })
      }
    } catch (err) {
      setToast({ show: true, message: 'Error updating size', type: 'error' })
    }
  };

  const handleRemove = async (itemId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to remove item', type: 'error' })
      return
    }

    try {
      const response = await removeFromCart(itemId, token)
      if (response.isSuccess) {
        setToast({ show: true, message: 'Item removed', type: 'success' })
        // Update local state directly
        setCartItems(prevItems => prevItems.filter(item => item._id !== itemId))
        // Dispatch event to update navbar count
        window.dispatchEvent(new Event('cartChanged'))
      } else {
        setToast({ show: true, message: 'Failed to remove item', type: 'error' })
      }
    } catch (err) {
      setToast({ show: true, message: 'Error removing item', type: 'error' })
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <marquee
          className="announcement-bar fade-down"
          direction="right"
          behavior="scroll"
          scrollamount="20"
        >
          <p>TBH is better on the app · Flat ₹300 off on your first order</p>
        </marquee>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading cart...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell">
        <marquee
          className="announcement-bar fade-down"
          direction="right"
          behavior="scroll"
          scrollamount="20"
        >
          <p>TBH is better on the app · Flat ₹300 off on your first order</p>
        </marquee>
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
      <main className="cart-main" style={{ padding: '20px 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Cart Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#111',
            margin: '0 0 4px 0'
          }}>
            Shopping Cart
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            margin: 0
          }}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: '#f9f9f9',
            borderRadius: '12px'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>Your cart is empty</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Looks like you haven't added any items yet</p>
          </div>
        ) : (
          <div className="cart-layout" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            alignItems: 'start'
          }}>
            {/* Cart Items Section */}
            <div className="cart-items-container" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0',
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              {cartItems.map((item, index) => (
                <div 
                  key={item._id} 
                  className="cart-item-card"
                  style={{ 
                    padding: '20px 0', 
                    borderBottom: index < cartItems.length - 1 ? '1px solid #eee' : 'none',
                    background: 'white',
                  }}
                >
                  {/* Row 1: Image + Title + Size + Price */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '12px'
                  }}>
                    {/* Thumbnail - larger on desktop */}
                    <img
                      src={item.product.mainImage}
                      alt={item.product.title}
                      className="cart-item-img"
                      style={{ 
                        width: '70px', 
                        height: '70px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        flexShrink: 0,
                        border: '1px solid #f0f0f0'
                      }}
                    />

                    {/* Title + Size */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 className="cart-item-title" style={{ 
                        margin: '0 0 6px 0', 
                        fontSize: '15px', 
                        fontWeight: '600', 
                        color: '#333',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>
                        {item.product.title}
                      </h3>
                      <span 
                        onClick={() => {
                          // Use product's available sizes, not hardcoded list
                          const availableSizes = item.product.sizes || [item.size];
                          if (availableSizes.length > 1) {
                            const currentIndex = availableSizes.indexOf(item.size);
                            const nextIndex = (currentIndex + 1) % availableSizes.length;
                            handleSizeChange(item._id, availableSizes[nextIndex]);
                          }
                        }}
                        style={{
                          display: 'inline-block',
                          padding: '3px 12px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: item.product.sizes && item.product.sizes.length > 1 ? 'pointer' : 'default'
                        }}
                        title={item.product.sizes && item.product.sizes.length > 1 ? 'Click to change size' : ''}
                      >
                        {item.size}
                      </span>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {isFridayDiscount ? (
                        <>
                          <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>
                            {formatPrice(calculateDiscountedPrice(item.product.price) * item.quantity)}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Quantity Controls + Delete */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: '86px'
                  }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      background: '#f3f4f6', 
                      borderRadius: '20px'
                    }}>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        style={{ 
                          background: '#e5e7eb', 
                          border: 'none', 
                          cursor: 'pointer', 
                          fontSize: '14px', 
                          color: '#374151',
                          padding: '8px 16px',
                          fontWeight: '600',
                          borderRadius: '20px 0 0 20px',
                          transition: 'background 0.2s'
                        }}
                      >
                        −
                      </button>
                      <span style={{ 
                        minWidth: '36px', 
                        textAlign: 'center', 
                        fontWeight: '500',
                        fontSize: '14px',
                        color: '#374151'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        style={{ 
                          background: '#e5e7eb', 
                          border: 'none', 
                          cursor: 'pointer', 
                          fontSize: '14px', 
                          color: '#374151',
                          padding: '8px 16px',
                          fontWeight: '600',
                          borderRadius: '0 20px 20px 0',
                          transition: 'background 0.2s'
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item._id)}
                      style={{ 
                        background: '#f3f4f6', 
                        border: 'none', 
                        cursor: 'pointer', 
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                      }}
                      title="Remove item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary Section */}
            <div className="cart-total-section" style={{ 
              padding: '24px', 
              background: '#f9f9f9', 
              borderRadius: '12px',
              height: 'fit-content',
              position: 'sticky',
              top: '100px'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#111',
                margin: '0 0 20px 0'
              }}>
                Order Summary
              </h2>

              {/* Summary Items */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Subtotal ({cartItems.length} items)</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    {formatPrice(cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0))}
                  </span>
                </div>
                {isFridayDiscount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#22c55e', fontSize: '14px' }}>Friday Discount (10%)</span>
                    <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: '500' }}>
                      -{formatPrice(cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0) * 0.1)}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Shipping</span>
                  <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>FREE</span>
                </div>
              </div>

              {/* Total */}
              <div style={{ 
                borderTop: '2px solid #e5e5e5', 
                paddingTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>Total</span>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#111' }}>
                  {formatPrice(calculateTotal())}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                className="cart-checkout-btn"
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: '#111',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s'
                }}
                onClick={() => {
                  const token = localStorage.getItem('token')
                  if (!token) {
                    setToast({ show: true, message: 'Please login to checkout', type: 'error' })
                    return
                  }
                  setShowCheckout(true)
                }}
              >
                Proceed to Checkout
              </button>

              {/* Security Note */}
              <p style={{ 
                fontSize: '12px', 
                color: '#999', 
                textAlign: 'center',
                marginTop: '16px',
                marginBottom: 0
              }}>
                🔒 Secure checkout powered by SSL
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
      
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cartItems}
        totalAmount={calculateTotal()}
        onOrderSuccess={(orderId) => {
          setCartItems([])
          setToast({ show: true, message: 'Order placed successfully!', type: 'success' })
        }}
      />
    </div>
  )
}

export default Cart

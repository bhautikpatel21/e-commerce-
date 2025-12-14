import React, { useState, useEffect } from 'react'
import { getCart, updateCart, removeFromCart } from '../Api'
import Toast from '../components/Toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { isFriday, calculateDiscountedPrice, formatPrice } from '../utils/discount'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [isFridayDiscount, setIsFridayDiscount] = useState(isFriday())

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
      <main className="cart-main" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items-container" style={{ display: 'grid', gap: '20px' }}>
              {cartItems.map((item) => (
                <div 
                  key={item._id} 
                  className="cart-item-card"
                  style={{ 
                    display: 'flex', 
                    padding: '16px', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '12px', 
                    background: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <div className="cart-item-image" style={{ position: 'relative', marginRight: '16px' }}>
                    <img
                      src={item.product.mainImage}
                      alt={item.product.title}
                      className="cart-item-img"
                      style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                  <div className="cart-item-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="cart-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '12px' }}>
                        <div className="cart-item-title-section">
                          <h3 className="cart-item-title" style={{ margin: '0', fontSize: '16px', fontWeight: '500', flex: 1 }}>{item.product.title}</h3>
                          <p className="cart-item-price-mobile" style={{
                            margin: '4px 0 0 0',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            color: '#333',
                            display: 'none'
                          }}>
                            {isFridayDiscount ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                <span style={{
                                  fontSize: '12px',
                                  color: '#999',
                                  textDecoration: 'line-through'
                                }}>
                                  {formatPrice(item.product.price * item.quantity)}
                                </span>
                                <span style={{
                                  fontWeight: 'bold',
                                  fontSize: '16px',
                                  color: '#333'
                                }}>
                                  {formatPrice(calculateDiscountedPrice(item.product.price) * item.quantity)}
                                </span>
                              </div>
                            ) : (
                              formatPrice(item.product.price * item.quantity)
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="cart-size-section" style={{ marginBottom: '8px' }}>
                        <select 
                          value={item.size} 
                          onChange={(e) => handleSizeChange(item._id, e.target.value)}
                          className="cart-size-select"
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                            fontSize: '14px',
                            appearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                            backgroundPosition: 'right 4px center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '16px',
                            paddingRight: '24px'
                          }}
                        >
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="cart-item-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div className="cart-quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e0e0e0', borderRadius: '20px', padding: '4px' }}>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="qty-minus"
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            fontSize: '18px', 
                            color: '#666',
                            padding: '4px 8px',
                            minWidth: '24px'
                          }}
                        >
                          −
                        </button>
                        <span className="qty-value" style={{ minWidth: '20px', textAlign: 'center', fontWeight: '500' }}>{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="qty-plus"
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            fontSize: '18px', 
                            color: '#666',
                            padding: '4px 8px',
                            minWidth: '24px'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="cart-delete-btn"
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          fontSize: '18px', 
                          color: '#dc3545',
                          padding: '4px 8px'
                        }}
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-price-desktop" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', minWidth: '100px' }}>
                    {isFridayDiscount ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{
                          fontSize: '14px',
                          color: '#999',
                          textDecoration: 'line-through'
                        }}>
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                        <span style={{
                          fontWeight: 'bold',
                          fontSize: '18px',
                          color: '#333'
                        }}>
                          {formatPrice(calculateDiscountedPrice(item.product.price) * item.quantity)}
                        </span>
                      </div>
                    ) : (
                      <p style={{
                        margin: '0',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        color: '#333'
                      }}>
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total-section" style={{ marginTop: '30px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div className="cart-total-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                    Total: {isFridayDiscount && <span style={{ fontSize: '14px', color: '#28a745', fontWeight: 'bold' }}>10% OFF</span>}
                  </h3>
                  {isFridayDiscount ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{
                        fontSize: '16px',
                        color: '#999',
                        textDecoration: 'line-through'
                      }}>
                        ₹{cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '20px', color: '#333' }}>
                        {formatPrice(calculateTotal())}
                      </p>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '20px', color: '#333' }}>
                      {formatPrice(calculateTotal())}
                    </p>
                  )}
                </div>
                <button
                  className="cart-checkout-btn"
                  style={{
                    padding: '12px 24px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                  onClick={() => {
                    setToast({ show: true, message: 'Checkout functionality not implemented yet', type: 'error' })
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Cart

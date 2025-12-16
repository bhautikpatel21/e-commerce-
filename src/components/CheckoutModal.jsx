import React, { useState, useEffect } from 'react'
import { createOrder, createPayment, verifyPayment } from '../Api'
import { formatPrice } from '../utils/discount'

const CheckoutModal = ({ isOpen, onClose, cartItems, totalAmount, onOrderSuccess }) => {
  const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480)
  
  // Address form state
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  })

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setError(null)
      setOrderId(null)
      setOrderDetails(null)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode']
    for (const field of required) {
      if (!address[field].trim()) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    if (!/^\d{10}$/.test(address.phone)) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      setError('Please enter a valid 6-digit pincode')
      return false
    }
    return true
  }

  const formatShippingAddress = () => {
    const parts = [
      address.fullName,
      address.phone,
      address.addressLine1,
      address.addressLine2,
      address.landmark ? `Landmark: ${address.landmark}` : '',
      `${address.city}, ${address.state} - ${address.pincode}`
    ].filter(Boolean)
    return parts.join(', ')
  }

  const handleProceedToPayment = async () => {
    if (!validateAddress()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to continue')
        setLoading(false)
        return
      }

      // Create order with shipping address
      const shippingAddress = formatShippingAddress()
      const orderResponse = await createOrder(shippingAddress, token)
      
      if (orderResponse.isSuccess && orderResponse.data) {
        setOrderId(orderResponse.data._id)
        setOrderDetails(orderResponse.data)
        setStep(2)
        
        // Initiate payment after short delay
        setTimeout(() => {
          initiatePayment(orderResponse.data._id, token)
        }, 500)
      } else {
        setError(orderResponse.message || 'Failed to create order')
      }
    } catch (err) {
      setError(err.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  const initiatePayment = async (orderIdParam, token) => {
    setLoading(true)
    setError(null)
    
    try {
      const paymentResponse = await createPayment(orderIdParam, token)
      
      if (paymentResponse.isSuccess && paymentResponse.data) {
        const { razorpayOrderId, amount, currency, key } = paymentResponse.data
        
        const options = {
          key: key,
          amount: amount,
          currency: currency,
          name: 'TBH Store',
          description: 'Order Payment',
          order_id: razorpayOrderId,
          handler: async function (response) {
            await handlePaymentSuccess(response)
          },
          prefill: {
            name: address.fullName,
            contact: address.phone,
          },
          theme: {
            color: '#111111'
          },
          modal: {
            ondismiss: function() {
              setError('Payment was cancelled. You can retry payment.')
              setLoading(false)
            }
          }
        }
        
        const razorpay = new window.Razorpay(options)
        razorpay.on('payment.failed', function (response) {
          setError(`Payment failed: ${response.error.description}`)
          setLoading(false)
        })
        razorpay.open()
      } else {
        setError(paymentResponse.message || 'Failed to initiate payment')
        setLoading(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (response) => {
    setLoading(true)
    try {
      const verifyResponse = await verifyPayment(
        response.razorpay_order_id,
        response.razorpay_payment_id,
        response.razorpay_signature
      )
      
      if (verifyResponse.isSuccess) {
        setStep(3)
        // Notify parent component about successful order
        if (onOrderSuccess) {
          onOrderSuccess(orderId)
        }
        // Dispatch cart changed event
        window.dispatchEvent(new Event('cartChanged'))
      } else {
        setError(verifyResponse.message || 'Payment verification failed')
      }
    } catch (err) {
      setError(err.message || 'Payment verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRetryPayment = () => {
    const token = localStorage.getItem('token')
    if (orderId && token) {
      initiatePayment(orderId, token)
    }
  }

  if (!isOpen) return null

  const inputStyle = {
    width: '100%',
    padding: isMobile ? '14px 12px' : '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px', // Prevents iOS zoom on focus
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    WebkitAppearance: 'none'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  }

  return (
    <div className="checkout-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: isMobile ? '0' : '20px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div className="checkout-modal" style={{
        background: 'white',
        borderRadius: isMobile ? '20px 20px 0 0' : '16px',
        maxWidth: isMobile ? '100%' : '600px',
        width: '100%',
        maxHeight: isMobile ? '95vh' : '90vh',
        overflow: 'auto',
        position: 'relative',
        animation: isMobile ? 'slideUpMobile 0.3s ease' : 'slideUp 0.3s ease'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: isMobile ? '12px' : '16px',
            right: isMobile ? '12px' : '16px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: isMobile ? '32px' : '36px',
            height: isMobile ? '32px' : '36px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            opacity: loading ? 0.5 : 1
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Drag Handle for Mobile */}
        {isMobile && (
          <div style={{
            width: '40px',
            height: '4px',
            background: '#e5e7eb',
            borderRadius: '2px',
            margin: '8px auto 0'
          }} />
        )}

        {/* Progress Steps */}
        <div style={{
          padding: isMobile ? '16px 16px 12px' : '24px 24px 0',
          borderBottom: '1px solid #eee'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '4px' : '8px',
            marginBottom: isMobile ? '12px' : '24px'
          }}>
            {[
              { num: 1, label: 'Address' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Done' }
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '4px' : '8px'
                }}>
                  <div style={{
                    width: isMobile ? '28px' : '32px',
                    height: isMobile ? '28px' : '32px',
                    borderRadius: '50%',
                    background: step >= s.num ? '#111' : '#e5e7eb',
                    color: step >= s.num ? 'white' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    flexShrink: 0
                  }}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  {!isMobile && (
                    <span style={{
                      fontSize: '14px',
                      fontWeight: step === s.num ? '600' : '400',
                      color: step >= s.num ? '#111' : '#6b7280'
                    }}>
                      {s.label}
                    </span>
                  )}
                </div>
                {i < 2 && (
                  <div style={{
                    width: isMobile ? '30px' : '40px',
                    height: '2px',
                    background: step > s.num ? '#111' : '#e5e7eb',
                    transition: 'all 0.3s'
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Mobile step label */}
          {isMobile && (
            <div style={{
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: '600',
              color: '#111',
              marginBottom: '8px'
            }}>
              {step === 1 ? 'Enter Address' : step === 2 ? 'Complete Payment' : 'Order Complete'}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
          {/* Step 1: Address Form */}
          {step === 1 && (
            <div>
              <h2 style={{ 
                fontSize: isMobile ? '18px' : '20px', 
                fontWeight: '700', 
                marginBottom: isMobile ? '16px' : '20px', 
                color: '#111' 
              }}>
                Shipping Address
              </h2>
              
              {error && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
                {/* Full Name */}
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleAddressChange}
                    placeholder="Enter your full name"
                    style={inputStyle}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={address.phone}
                    onChange={handleAddressChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    style={inputStyle}
                  />
                </div>

                {/* Address Line 1 */}
                <div>
                  <label style={labelStyle}>Address Line 1 *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={address.addressLine1}
                    onChange={handleAddressChange}
                    placeholder="House No., Building, Street"
                    style={inputStyle}
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label style={labelStyle}>Address Line 2</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={address.addressLine2}
                    onChange={handleAddressChange}
                    placeholder="Area, Colony (Optional)"
                    style={inputStyle}
                  />
                </div>

                {/* City & State Row */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: isMobile ? '12px' : '16px' 
                }}>
                  <div>
                    <label style={labelStyle}>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      placeholder="State"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Pincode & Landmark Row */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: isMobile ? '12px' : '16px' 
                }}>
                  <div>
                    <label style={labelStyle}>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleAddressChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={address.landmark}
                      onChange={handleAddressChange}
                      placeholder="Nearby landmark (Optional)"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div style={{
                marginTop: isMobile ? '16px' : '24px',
                padding: isMobile ? '12px' : '16px',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>
                      {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                      Order Total
                    </div>
                  </div>
                  <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#111' }}>
                    {formatPrice(totalAmount)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px' : '16px',
                  background: loading ? '#6b7280' : '#111',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: isMobile ? '16px' : '24px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeLinecap="round" />
                    </svg>
                    Creating Order...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Payment Processing */}
          {step === 2 && (
            <div style={{ textAlign: 'center', padding: isMobile ? '30px 16px' : '40px 20px' }}>
              {loading ? (
                <>
                  <div style={{
                    width: isMobile ? '50px' : '60px',
                    height: isMobile ? '50px' : '60px',
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#111',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                  }} />
                  <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '600', marginBottom: '10px', color: '#111' }}>
                    Processing Payment
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Complete payment in Razorpay window...
                  </p>
                </>
              ) : (
                <>
                  {error && (
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      padding: '14px',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      fontSize: '13px',
                      textAlign: 'left'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}
                  
                  <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '600', marginBottom: '10px', color: '#111' }}>
                    Order Created
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                    Complete payment to confirm order
                  </p>
                  
                  <div style={{
                    background: '#f9fafb',
                    padding: isMobile ? '14px' : '16px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Amount to Pay</div>
                    <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#111' }}>
                      {formatPrice(totalAmount)}
                    </div>
                  </div>

                  <button
                    onClick={handleRetryPayment}
                    style={{
                      width: '100%',
                      padding: '14px 32px',
                      background: '#111',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Pay Now
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: isMobile ? '30px 16px' : '40px 20px' }}>
              <div style={{
                width: isMobile ? '64px' : '80px',
                height: isMobile ? '64px' : '80px',
                background: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <svg width={isMobile ? '32' : '40'} height={isMobile ? '32' : '40'} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              
              <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', marginBottom: '10px', color: '#111' }}>
                Order Placed!
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                Your order has been confirmed
              </p>
              
              {orderId && (
                <div style={{ 
                  color: '#374151', 
                  fontSize: '13px', 
                  marginBottom: '20px',
                  background: '#f3f4f6',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  wordBreak: 'break-all'
                }}>
                  Order ID: <strong>{orderId}</strong>
                </div>
              )}

              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '20px'
              }}>
                <p style={{ color: '#166534', fontSize: '13px', margin: 0 }}>
                  📧 Confirmation sent to your email
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: '10px', 
                justifyContent: 'center'
              }}>
                <a
                  href="/orders"
                  style={{
                    padding: '14px 20px',
                    background: '#111',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center'
                  }}
                >
                  View My Orders
                </a>
                <a
                  href="/"
                  style={{
                    padding: '14px 20px',
                    background: 'white',
                    color: '#111',
                    border: '2px solid #111',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center'
                  }}
                >
                  Continue Shopping
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUpMobile {
          from { 
            transform: translateY(100%);
          }
          to { 
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .checkout-modal input:focus {
          border-color: #111 !important;
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.1);
        }
        .checkout-modal::-webkit-scrollbar {
          width: 6px;
        }
        .checkout-modal::-webkit-scrollbar-track {
          background: transparent;
        }
        .checkout-modal::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
      `}</style>
    </div>
  )
}

export default CheckoutModal

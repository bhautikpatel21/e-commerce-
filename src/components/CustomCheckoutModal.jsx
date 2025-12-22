import React, { useState, useEffect } from 'react'
import { createPayment, verifyPayment } from '../Api'
import { formatPrice } from '../utils/discount'

const CustomCheckoutModal = ({ 
  isOpen, 
  onClose, 
  customTShirtData, 
  totalAmount, 
  size, 
  quantity,
  onOrderSuccess,
  createOrder
}) => {
  const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
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
      setIsMobile(window.innerWidth < 768)
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
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
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

      // Create custom t-shirt order with shipping address
      // This will capture the preview images automatically
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
          description: 'Custom T-Shirt Order Payment',
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
        if (onOrderSuccess) {
          onOrderSuccess(orderId)
        }
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
    padding: isMobile ? '12px' : '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: isMobile ? '16px' : '16px', // 16px prevents iOS zoom
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    appearance: 'none'
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: isMobile ? '0' : '20px',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget && step !== 2) {
        onClose()
      }
    }}
    >
      <div style={{
        background: 'white',
        borderRadius: isMobile ? '20px 20px 0 0' : '16px',
        width: '100%',
        maxWidth: isMobile ? '100%' : '600px',
        maxHeight: isMobile ? '95vh' : '90vh',
        overflow: 'auto',
        position: 'relative',
        marginTop: isMobile ? 'auto' : '0',
        marginBottom: isMobile ? '0' : 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: isMobile ? '12px' : '15px',
            right: isMobile ? '12px' : '15px',
            background: 'rgba(0, 0, 0, 0.05)',
            border: 'none',
            fontSize: isMobile ? '28px' : '24px',
            cursor: 'pointer',
            color: '#666',
            zIndex: 1,
            width: isMobile ? '36px' : '32px',
            height: isMobile ? '36px' : '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background 0.2s',
            lineHeight: '1',
            padding: 0
          }}
          onMouseEnter={(e) => {
            if (!isMobile) e.target.style.background = '#f0f0f0'
          }}
          onMouseLeave={(e) => {
            if (!isMobile) e.target.style.background = 'rgba(0, 0, 0, 0.05)'
          }}
          onTouchStart={(e) => e.target.style.background = '#f0f0f0'}
          onTouchEnd={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.05)'}
        >
          ×
        </button>

        {/* Step 1: Address Form */}
        {step === 1 && (
          <div style={{ padding: isMobile ? '16px 16px 20px 16px' : '30px' }}>
            <h2 style={{ 
              fontSize: isMobile ? '1.1rem' : '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: isMobile ? '16px' : '20px',
              marginTop: isMobile ? '8px' : '0',
              color: '#111',
              paddingRight: isMobile ? '40px' : '0'
            }}>
              Shipping Address
            </h2>

            {error && (
              <div style={{
                padding: isMobile ? '10px' : '12px',
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                marginBottom: isMobile ? '16px' : '20px',
                color: '#c33',
                fontSize: isMobile ? '0.85rem' : '0.9rem',
                lineHeight: '1.4'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name *"
                value={address.fullName}
                onChange={handleAddressChange}
                style={inputStyle}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                value={address.phone}
                onChange={handleAddressChange}
                style={inputStyle}
                maxLength="10"
                required
              />
              <input
                type="text"
                name="addressLine1"
                placeholder="Address Line 1 *"
                value={address.addressLine1}
                onChange={handleAddressChange}
                style={inputStyle}
                required
              />
              <input
                type="text"
                name="addressLine2"
                placeholder="Address Line 2"
                value={address.addressLine2}
                onChange={handleAddressChange}
                style={inputStyle}
              />
              <input
                type="text"
                name="landmark"
                placeholder="Landmark"
                value={address.landmark}
                onChange={handleAddressChange}
                style={inputStyle}
              />
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: isMobile ? '12px' : '16px' 
              }}>
                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  value={address.city}
                  onChange={handleAddressChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State *"
                  value={address.state}
                  onChange={handleAddressChange}
                  style={inputStyle}
                  required
                />
              </div>
              <input
                type="text"
                name="pincode"
                placeholder="Pincode *"
                value={address.pincode}
                onChange={handleAddressChange}
                style={inputStyle}
                maxLength="6"
                required
              />
            </div>

            <div style={{ 
              marginTop: isMobile ? '20px' : '24px', 
              display: 'flex', 
              gap: isMobile ? '10px' : '12px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: isMobile ? '12px' : '14px',
                  border: '2px solid #e8ddd0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  color: '#3d2c22',
                  minHeight: isMobile ? '44px' : 'auto'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPayment}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: isMobile ? '12px' : '14px',
                  border: 'none',
                  borderRadius: '8px',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #e17055 0%, #ff9f43 100%)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  color: 'white',
                  minHeight: isMobile ? '44px' : 'auto',
                  whiteSpace: isMobile ? 'normal' : 'nowrap'
                }}
              >
                {loading ? 'Processing...' : isMobile ? `Pay ₹${totalAmount}` : `Proceed to Payment - ₹${totalAmount}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Processing */}
        {step === 2 && (
          <div style={{ padding: isMobile ? '40px 20px' : '30px', textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: isMobile ? '1.1rem' : '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: isMobile ? '16px' : '20px',
              color: '#111'
            }}>
              Processing Payment
            </h2>
            {error && (
              <div style={{
                padding: isMobile ? '10px' : '12px',
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                marginBottom: isMobile ? '16px' : '20px',
                color: '#c33',
                fontSize: isMobile ? '0.85rem' : '0.9rem',
                lineHeight: '1.4',
                textAlign: 'left'
              }}>
                {error}
                {error.includes('cancelled') && (
                  <button
                    onClick={handleRetryPayment}
                    style={{
                      display: 'block',
                      marginTop: isMobile ? '8px' : '10px',
                      padding: isMobile ? '10px 14px' : '8px 16px',
                      background: '#e17055',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                      width: '100%'
                    }}
                  >
                    Retry Payment
                  </button>
                )}
              </div>
            )}
            {loading && (
              <div style={{ marginTop: isMobile ? '16px' : '20px' }}>
                <div style={{
                  width: isMobile ? '36px' : '40px',
                  height: isMobile ? '36px' : '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #e17055',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
                <p style={{ 
                  marginTop: isMobile ? '12px' : '15px', 
                  color: '#666',
                  fontSize: isMobile ? '0.9rem' : '1rem'
                }}>
                  Please complete the payment...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ padding: isMobile ? '40px 20px' : '30px', textAlign: 'center' }}>
            <div style={{
              width: isMobile ? '70px' : '80px',
              height: isMobile ? '70px' : '80px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: isMobile ? '35px' : '40px',
              color: 'white'
            }}>
              ✓
            </div>
            <h2 style={{ 
              fontSize: isMobile ? '1.1rem' : '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: isMobile ? '8px' : '10px',
              color: '#111',
              lineHeight: '1.3'
            }}>
              Order Placed Successfully!
            </h2>
            <p style={{ 
              color: '#666', 
              marginBottom: isMobile ? '16px' : '20px',
              fontSize: isMobile ? '0.9rem' : '1rem',
              lineHeight: '1.5',
              wordBreak: 'break-word',
              padding: isMobile ? '0 10px' : '0'
            }}>
              Your custom t-shirt order has been placed.
              {orderId && (
                <span style={{ display: 'block', marginTop: '8px', fontWeight: '500' }}>
                  Order ID: {orderId}
                </span>
              )}
            </p>
            <button
              onClick={onClose}
              style={{
                padding: isMobile ? '12px 24px' : '14px 28px',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #e17055 0%, #ff9f43 100%)',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '0.9rem' : '1rem',
                color: 'white',
                minWidth: isMobile ? '120px' : 'auto',
                minHeight: isMobile ? '44px' : 'auto'
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default CustomCheckoutModal


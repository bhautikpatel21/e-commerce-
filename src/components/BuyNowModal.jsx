import React, { useState, useEffect } from 'react'
import { createBuyNowOrder, createPayment, verifyPayment, checkPincodeServiceability } from '../Api'
import { formatPrice, isFriday, calculateDiscountedPrice } from '../utils/discount'

const BuyNowModal = ({ isOpen, onClose, product, quantity = 1, size, onOrderSuccess }) => {
  const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isFridayDiscount, setIsFridayDiscount] = useState(false)
  const [pincodeServiceable, setPincodeServiceable] = useState(null)

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

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('prepaid') // 'cod' or 'prepaid'

  useEffect(() => {
    setIsFridayDiscount(isFriday())
  }, [])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
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
      setPaymentMethod('prepaid') // Reset to default
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

  const handleAddressChange = async (e) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))

    // Check pincode serviceability when pincode changes
    if (name === 'pincode' && value.length === 6 && /^\d{6}$/.test(value)) {
      try {
        const token = localStorage.getItem('token')
        const response = await checkPincodeServiceability(value, token)
        // Check if pincode is serviceable - check both response.isSuccess and response.data.status/delivery
        const isServiceable = response.isSuccess && (response.data?.status === true || response.data?.delivery === 'Yes')
        setPincodeServiceable(isServiceable)
      } catch (err) {
        setPincodeServiceable(false)
      }
    } else if (name === 'pincode') {
      setPincodeServiceable(null)
    }
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
    if (pincodeServiceable === false) {
      setError('Delivery is not available to this pincode')
      return false
    }
    if (pincodeServiceable === null) {
      setError('Please enter a valid pincode to check delivery availability')
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

  const calculateTotal = () => {
    if (!product || !product.price) return 0
    const basePrice = isFridayDiscount ? calculateDiscountedPrice(product.price) : product.price
    return basePrice * quantity
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

      // Create order with shipping address and payment method
      const shippingAddress = formatShippingAddress()
      const orderResponse = await createBuyNowOrder(
        product._id,
        quantity,
        size,
        shippingAddress,
        paymentMethod,
        token
      )

      if (orderResponse.isSuccess && orderResponse.data) {
        setOrderId(orderResponse.data._id)
        setOrderDetails(orderResponse.data)

        if (paymentMethod === 'cod') {
          // For COD, skip payment step and go directly to success
          setStep(3)
          // Notify parent component about successful order
          if (onOrderSuccess) {
            onOrderSuccess(orderResponse.data._id)
          }
          // Dispatch cart changed event
          window.dispatchEvent(new Event('cartChanged'))
        } else {
          // For prepaid, proceed to payment
          setStep(2)
          // Initiate payment after short delay
          setTimeout(() => {
            initiatePayment(orderResponse.data._id, token)
          }, 500)
        }
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
          name: 'THE WOLF STREET',
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
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: isMobile ? '60px 10px 10px 10px' : '0px',
  }

  const contentStyle = {
    backgroundColor: 'white',
    borderRadius: isMobile ? '12px' : '0px',
    width: '100%',
    maxWidth: isMobile ? '100%' : '100%',
    height: isMobile ? 'auto' : '100%',
    maxHeight: isMobile ? '90vh' : '100%',
    overflowY: 'auto',
    position: 'relative',
  }

  return (
    <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
        {/* Close button */}
        {step !== 3 && (
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              zIndex: 10,
              color: '#666',
            }}
          >
            ×
          </button>
        )}

        {/* Step 1: Address Form */}
        {step === 1 && (
          <div style={{ padding: isMobile ? '20px' : '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              Shipping Address
            </h2>

            {/* Product Summary */}
            {product && (
              <div style={{
                background: '#f9fafb',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                gap: '15px',
              }}>
                <img
                  src={product.mainImage}
                  alt={product.title}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>
                    {product.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                    Size: {size || 'N/A'} | Qty: {quantity}
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {formatPrice(calculateTotal())}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                padding: '12px',
                background: '#fee',
                color: '#c33',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name *"
                value={address.fullName}
                onChange={handleAddressChange}
                style={inputStyle}
                disabled={loading}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                value={address.phone}
                onChange={handleAddressChange}
                style={inputStyle}
                disabled={loading}
                maxLength={10}
              />
              <input
                type="text"
                name="addressLine1"
                placeholder="Address Line 1 *"
                value={address.addressLine1}
                onChange={handleAddressChange}
                style={inputStyle}
                disabled={loading}
              />
              <input
                type="text"
                name="addressLine2"
                placeholder="Address Line 2"
                value={address.addressLine2}
                onChange={handleAddressChange}
                style={inputStyle}
                disabled={loading}
              />
              <input
                type="text"
                name="landmark"
                placeholder="Landmark (Optional)"
                value={address.landmark}
                onChange={handleAddressChange}
                style={inputStyle}
                disabled={loading}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  value={address.city}
                  onChange={handleAddressChange}
                  style={inputStyle}
                  disabled={loading}
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State *"
                  value={address.state}
                  onChange={handleAddressChange}
                  style={inputStyle}
                  disabled={loading}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode *"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  style={inputStyle}
                  disabled={loading}
                  maxLength={6}
                />
                {pincodeServiceable !== null && (
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {pincodeServiceable ? (
                      <>
                        <span style={{ color: '#22c55e', fontSize: '14px' }}>✓</span>
                        <span style={{ fontSize: '12px', color: '#22c55e' }}>Serviceable</span>
                      </>
                    ) : (
                      <>
                        <span style={{ color: '#ef4444', fontSize: '14px' }}>✗</span>
                        <span style={{ fontSize: '12px', color: '#ef4444' }}>Not Serviceable</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div style={{ marginTop: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Payment Method *
              </label>
              <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                <label style={{
                  flex: 1,
                  padding: '14px',
                  border: paymentMethod === 'cod' ? '2px solid #111' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'cod' ? '#f9fafb' : 'white',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: paymentMethod === 'cod' ? '#111' : 'white'
                    }}>
                      {paymentMethod === 'cod' && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          background: 'white',
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Cash on Delivery</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Pay when you receive your order</div>
                    </div>
                  </div>
                </label>

                <label style={{
                  flex: 1,
                  padding: '14px',
                  border: paymentMethod === 'prepaid' ? '2px solid #111' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'prepaid' ? '#f9fafb' : 'white',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="prepaid"
                    checked={paymentMethod === 'prepaid'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: paymentMethod === 'prepaid' ? '#111' : 'white'
                    }}>
                      {paymentMethod === 'prepaid' && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          background: 'white',
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Prepaid</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Pay now and get free shipping</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>
                  {quantity} item{quantity !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
                  <span>Sub Total</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151', marginTop: '4px' }}>
                    <span>Shipping Charge</span>
                    <span>{formatPrice(90)}</span>
                  </div>
                )}
                {paymentMethod === 'prepaid' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#22c55e', marginTop: '4px' }}>
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                )}
              </div>
              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  Total Amount
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>
                  {formatPrice(
                    paymentMethod === 'cod'
                      ? calculateTotal() + 90
                      : calculateTotal()
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '20px',
                background: loading ? '#ccc' : '#000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        )}

        {/* Step 2: Payment Processing */}
        {step === 2 && (
          <div style={{ padding: '40px 30px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              Processing Payment
            </h2>
            {error && (
              <div style={{
                padding: '12px',
                background: '#fee',
                color: '#c33',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}
            {error && (
              <button
                onClick={handleRetryPayment}
                style={{
                  padding: '12px 24px',
                  background: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Retry Payment
              </button>
            )}
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ padding: '40px 30px', textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
              Order Placed Successfully!
            </h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Your order has been confirmed and payment received.
            </p>
            {orderDetails && (
              <div style={{
                background: '#f9fafb',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left',
              }}>
                <p style={{ fontSize: '14px', marginBottom: '5px' }}>
                  <strong>Order ID:</strong> {orderDetails._id}
                </p>
                <p style={{ fontSize: '14px', marginBottom: '5px' }}>
                  <strong>Total Amount:</strong> {formatPrice(orderDetails.totalAmount)}
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: '#000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BuyNowModal

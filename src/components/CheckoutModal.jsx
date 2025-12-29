import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, createPayment, verifyPayment, getCouriers, calculateRate, checkPincodeServiceability } from '../Api'
import { formatPrice } from '../utils/discount'

const CheckoutModal = ({ isOpen, onClose, cartItems, totalAmount, onOrderSuccess }) => {
  const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480)

  // Shipping state
  const [shippingOptions, setShippingOptions] = useState([])
  const [selectedShipping, setSelectedShipping] = useState(null)
  const [shippingLoading, setShippingLoading] = useState(false)
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

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check pincode serviceability when pincode changes
  useEffect(() => {
    const checkPincode = async () => {
      if (address.pincode.length === 6) {
        setShippingLoading(true)
        try {
          const response = await checkPincodeServiceability(address.pincode)
          
          // Check if pincode is serviceable - check both response.isSuccess and response.data.status
          const isServiceable = response.isSuccess && (response.data?.status === true || response.data?.delivery === 'Yes')
          setPincodeServiceable(isServiceable)

          if (isServiceable) {
            // Default free shipping option - always available if pincode is serviceable
            const defaultShippingOption = {
              _id: 'free-shipping',
              name: 'Standard Shipping',
              courierName: 'Standard Delivery',
              rate: 0,
              estimatedDays: '5-7'
            }
            
            // Try to fetch couriers and rates
            try {
              const couriersResponse = await getCouriers()
              if (couriersResponse.isSuccess && couriersResponse.data && couriersResponse.data.length > 0) {
                // Calculate rates for each courier
                const optionsWithRates = await Promise.all(
                  couriersResponse.data.map(async (courier) => {
                    try {
                      const rateResponse = await calculateRate({
                        courierId: courier.courierId || courier._id,
                        pincode: address.pincode,
                        weight: 0.5 // Default 500g
                      })
                      
                      // Check for shipping rates in response
                      const shippingRate = rateResponse.data?.shipment_rates?.[0]
                      if (shippingRate) {
                        return {
                          ...courier,
                          _id: courier._id || courier.courierId,
                          name: shippingRate.courier_name || courier.courierName,
                          rate: shippingRate.shipping_charge || 0,
                          estimatedDays: shippingRate.service_mode === 'air' ? '2-3' : '5-7'
                        }
                      }
                      return null
                    } catch (err) {
                      console.log('Rate calculation error:', err)
                      return null
                    }
                  })
                )
                
                const validOptions = optionsWithRates.filter(option => option !== null)
                
                // If we got valid courier options, use them; otherwise use default
                if (validOptions.length > 0) {
                  setShippingOptions(validOptions)
                  setSelectedShipping(validOptions[0]) // Auto-select first option
                } else {
                  setShippingOptions([defaultShippingOption])
                  setSelectedShipping(defaultShippingOption)
                }
              } else {
                // No couriers configured, use default free shipping
                setShippingOptions([defaultShippingOption])
                setSelectedShipping(defaultShippingOption)
              }
            } catch (courierErr) {
              console.log('Courier fetch error:', courierErr)
              // Fallback to default shipping if courier fetch fails
              setShippingOptions([defaultShippingOption])
              setSelectedShipping(defaultShippingOption)
            }
          } else {
            setShippingOptions([])
            setSelectedShipping(null)
          }
        } catch (err) {
          console.log('Pincode check error:', err)
          setPincodeServiceable(false)
          setShippingOptions([])
          setSelectedShipping(null)
        } finally {
          setShippingLoading(false)
        }
      } else {
        setPincodeServiceable(null)
        setShippingOptions([])
        setSelectedShipping(null)
      }
    }

    checkPincode()
  }, [address.pincode, cartItems])

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
    if (pincodeServiceable === false) {
      setError('Delivery is not available to this pincode')
      return false
    }
    // If pincode is serviceable but no shipping selected, auto-select free shipping
    if (!selectedShipping && pincodeServiceable === true) {
      // This is fine - we'll use default free shipping
      return true
    }
    if (!selectedShipping && pincodeServiceable === null) {
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
      const orderResponse = await createOrder(shippingAddress, paymentMethod, token)

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
    if (!token) {
      setError('Session expired. Please log in again.')
      setTimeout(() => {
        onClose()
        navigate('/login')
      }, 2000)
      return
    }
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
    <div className="checkout-fullscreen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'white',
      zIndex: 9999,
      overflow: 'auto',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div className="checkout-content" style={{
        width: '100%',
        height: '100%',
        position: 'relative'
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

              {/* Payment Method Selection */}
              <div style={{ marginTop: isMobile ? '16px' : '20px' }}>
                <label style={labelStyle}>Payment Method *</label>
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

              {/* Shipping Options */}
              {address.pincode.length === 6 && (
                <div style={{ marginTop: isMobile ? '16px' : '20px' }}>

                  {shippingLoading ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#6b7280'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeLinecap="round" />
                      </svg>
                      Checking shipping options...
                    </div>
                  ) : pincodeServiceable === false ? (
                    <div style={{
                      padding: '12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#dc2626'
                    }}>
                      Delivery is not available to this pincode. Please try a different pincode.
                    </div>
                  ) : pincodeServiceable === true && shippingOptions.length === 0 ? (
                    <div style={{
                      padding: '12px',
                      background: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#92400e'
                    }}>
                      No shipping options available for this pincode. Please try a different pincode.
                    </div>
                  ) : null}
                </div>
              )}

              {/* Order Summary */}
              <div style={{
                marginTop: isMobile ? '16px' : '24px',
                padding: isMobile ? '12px' : '16px',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>
                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
                    <span>Sub Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151', marginTop: '4px' }}>
                      <span>Shipping Charg</span>
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
                  <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#111' }}>
                    {formatPrice(
                      paymentMethod === 'cod'
                        ? totalAmount + 90
                        : totalAmount
                    )}
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

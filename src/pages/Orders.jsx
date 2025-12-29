import React, { useState, useEffect } from 'react'
import { getOrders, cancelOrder, getOrderById, trackOrder } from '../Api'
import Toast from '../components/Toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { formatPrice } from '../utils/discount'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  })

  // Tracking state
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingData, setTrackingData] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)


  const fetchOrders = async (page = 1, status = null) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please login to view your orders')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const statusParam = status === 'all' ? null : status
      const response = await getOrders(token, page, pagination.pageSize, statusParam)
      
      if (response.isSuccess && response.data) {
        setOrders(response.data)
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            ...response.pagination
          }))
        }
      } else {
        setError('Failed to load orders')
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(pagination.pageNumber, filterStatus)
  }, [filterStatus])

  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to cancel order', type: 'error' })
      return
    }

    try {
      const response = await cancelOrder(cancellingOrderId, cancelReason, token)
      
      if (response.isSuccess) {
        setToast({ show: true, message: 'Order cancelled successfully', type: 'success' })
        setShowCancelModal(false)
        setCancellingOrderId(null)
        setCancelReason('')
        fetchOrders(pagination.pageNumber, filterStatus)
      } else {
        setToast({ show: true, message: response.message || 'Failed to cancel order', type: 'error' })
      }
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to cancel order', type: 'error' })
    }
  }

  const viewOrderDetails = async (orderId) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await getOrderById(orderId, token)
      if (response.isSuccess && response.data) {
        setSelectedOrder(response.data)
        setShowOrderDetail(true)
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to load order details', type: 'error' })
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
      shipped: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
      delivered: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
      cancelled: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
      returned: { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' }
    }
    return colors[status] || colors.pending
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#92400e' },
      paid: { bg: '#dcfce7', text: '#166534' },
      failed: { bg: '#fee2e2', text: '#991b1b' },
      refunded: { bg: '#f3e8ff', text: '#6b21a8' }
    }
    return colors[status] || colors.pending
  }

  const canCancelOrder = (order) => {
    if (order.status === 'canceled' || order.status === 'delivered' || order.status === 'returned') {
      return false
    }
    const orderDate = new Date(order.orderDate)
    const currentDate = new Date()
    const daysDiff = (currentDate - orderDate) / (1000 * 60 * 60 * 24)
    return daysDiff <= 3
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleTrackOrder = async (orderId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to track order', type: 'error' })
      return
    }

    try {
      setTrackingLoading(true)
      setShowTrackingModal(true)
      const response = await trackOrder(orderId)
      if (response.isSuccess && response.data) {
        setTrackingData(response.data)
      } else {
        setTrackingData({ message: 'No tracking information available yet.' })
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to load tracking information', type: 'error' })
      setTrackingData({ message: 'Unable to load tracking information at this time.' })
    } finally {
      setTrackingLoading(false)
    }
  }

  const getTrackingStatusIcon = (status) => {
    const statusIcons = {
      'Delivered': '✅',
      'Out for Delivery': '🚚',
      'In Transit': '📦',
      'Shipped': '🚀',
      'Picked Up': '📮',
      'Pending': '⏳',
      'Cancelled': '❌',
      'Returned': '↩️'
    }
    return statusIcons[status] || '📦'
  }

  if (loading && orders.length === 0) {
    return (
      <div className="page-shell">
      <div className="announcement-bar fade-down" style={{ overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
        <div className="marquee-content" style={{
          display: 'inline-block',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Free & Fast Shipping</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>· 100% Secure Payment</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Flat 10% OFF on Orders Above ₹2099</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Premium Fabric Quality</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Customization Options Available</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>All Friday Mega Sale</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>7-Day Easy Return Policy</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Free & Fast Shipping</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>· 100% Secure Payment</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Flat 10% OFF on Orders Above ₹2099</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Premium Fabric Quality</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Customization Options Available</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>All Friday Mega Sale</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>7-Day Easy Return Policy</span>
        </div>
      </div>

        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#111',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666' }}>Loading your orders...</p>
        </div>
        <Footer />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell">
                <div className="marquee-content" style={{
          display: 'inline-block',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Free & Fast Shipping</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>· 100% Secure Payment</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Flat 10% OFF on Orders Above ₹2099</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Premium Fabric Quality</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Customization Options Available</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>All Friday Mega Sale</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>7-Day Easy Return Policy</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Free & Fast Shipping</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>· 100% Secure Payment</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Flat 10% OFF on Orders Above ₹2099</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Premium Fabric Quality</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Customization Options Available</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>All Friday Mega Sale</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>7-Day Easy Return Policy</span>
        </div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
          <p style={{ color: '#dc2626', fontSize: '16px' }}>{error}</p>
          <a href="/login" style={{
            display: 'inline-block',
            marginTop: '16px',
            padding: '12px 24px',
            background: '#111',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600'
          }}>
            Login to Continue
          </a>
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
      <div className="announcement-bar fade-down" style={{ overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
        <div className="marquee-content" style={{
          display: 'inline-block',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Free & Fast Shipping</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>· 100% Secure Payment</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Flat 10% OFF on Orders Above ₹2099</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Premium Fabric Quality</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Customization Options Available</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>All Friday Mega Sale</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>7-Day Easy Return Policy</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Free & Fast Shipping</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>· 100% Secure Payment</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Flat 10% OFF on Orders Above ₹2099</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Premium Fabric Quality</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>Customization Options Available</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>All Friday Mega Sale</span>
          <span style={{ display: 'inline-block', marginRight: '30px' }}>7-Day Easy Return Policy</span>
        </div>
      </div>
      <Navbar />
      
      <main style={{ padding: '20px 20px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#111',
            margin: '0 0 4px 0'
          }}>
            My Orders
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            margin: 0
          }}>
            Track and manage your orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {[
            { value: 'all', label: 'All Orders' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'returned', label: 'Returned' }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              style={{
                padding: '10px 20px',
                border: filterStatus === filter.value ? '2px solid #111' : '2px solid #e5e7eb',
                borderRadius: '24px',
                background: filterStatus === filter.value ? '#111' : 'white',
                color: filterStatus === filter.value ? 'white' : '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: '#f9f9f9',
            borderRadius: '12px'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h6" />
            </svg>
            <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>No orders found</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet" 
                : `No ${filterStatus} orders found`}
            </p>
            <a href="/" style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#111',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Start Shopping
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const statusColor = getStatusColor(order.status)
              const paymentColor = getPaymentStatusColor(order.paymentStatus)
              
              return (
                <div 
                  key={order._id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s'
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    padding: '16px 20px',
                    background: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                        Order ID: <span style={{ color: '#374151', fontWeight: '500' }}>{order._id}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        Placed on {formatDate(order.orderDate)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: statusColor.bg,
                        color: statusColor.text,
                        border: `1px solid ${statusColor.border}`,
                        textTransform: 'capitalize'
                      }}>
                        {order.status}
                      </span>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: paymentColor.bg,
                        color: paymentColor.text,
                        textTransform: 'capitalize'
                      }}>
                        💳 {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: '16px 20px' }}>
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: idx < Math.min(order.items.length, 2) - 1 ? '1px solid #f3f4f6' : 'none'
                        }}
                      >
                        <img
                          src={item.product?.mainImage || '/placeholder.jpg'}
                          alt={item.product?.title || 'Product'}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #f0f0f0'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            margin: '0 0 4px 0', 
                            fontSize: '14px', 
                            fontWeight: '600',
                            color: '#111'
                          }}>
                            {item.product?.title || 'Product'}
                          </h4>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            {item.size && <span>Size: {item.size} • </span>}
                            Qty: {item.quantity}
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600',
                          color: '#111'
                        }}>
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#6b7280',
                        padding: '8px 0 0'
                      }}>
                        +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Shipping Progress Indicator for shipped/delivered orders */}
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        background: order.status === 'delivered' ? '#f0fdf4' : '#ecfeff',
                        borderRadius: '12px',
                        border: order.status === 'delivered' ? '1px solid #bbf7d0' : '1px solid #a5f3fc'
                      }}>
                        {/* Shipping Progress Bar */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            marginBottom: '8px',
                            fontSize: '12px',
                            color: '#6b7280'
                          }}>
                            <span>📦 Shipped</span>
                            <span>🚚 In Transit</span>
                            <span>🏠 Out for Delivery</span>
                            <span>✅ Delivered</span>
                          </div>
                          <div style={{
                            height: '6px',
                            background: '#e5e7eb',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: order.status === 'delivered' ? '100%' : 
                                     order.fshipStatus === 'Out for Delivery' ? '75%' : 
                                     order.fshipStatus === 'In Transit' ? '50%' : '25%',
                              background: order.status === 'delivered' ? '#22c55e' : 
                                         'linear-gradient(90deg, #22c55e 0%, #06b6d4 100%)',
                              borderRadius: '3px',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <div>
                            {order.awbNumber && (
                              <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '2px' }}>
                                AWB: <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{order.awbNumber}</span>
                              </div>
                            )}
                            {order.trackingNumber && (
                              <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '2px' }}>
                                Tracking: <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{order.trackingNumber}</span>
                              </div>
                            )}
                            {order.deliveryPartner && (
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                Via {order.deliveryPartner}
                              </div>
                            )}
                          </div>
                          {order.estimatedDeliveryDate && order.status !== 'delivered' && (
                            <div style={{ 
                              fontSize: '13px', 
                              fontWeight: '600',
                              color: '#0d9488',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              Expected: {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </div>
                          )}
                          {order.status === 'delivered' && order.deliveredAt && (
                            <div style={{ 
                              fontSize: '13px', 
                              fontWeight: '600',
                              color: '#16a34a',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              ✅ Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div style={{
                    padding: '16px 20px',
                    background: '#f9fafb',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>
                      Total: {formatPrice(order.totalAmount)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => viewOrderDetails(order._id)}
                        style={{
                          padding: '10px 20px',
                          background: '#111',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        View Details
                      </button>
                      {(order.awbNumber || order.trackingNumber || order.status === 'shipped' || order.status === 'delivered') && (
                        <button
                          onClick={() => handleTrackOrder(order._id)}
                          style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(22, 163, 74, 0.3)';
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          Track Live
                        </button>
                      )}
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => {
                            setCancellingOrderId(order._id)
                            setShowCancelModal(true)
                          }}
                          style={{
                            padding: '10px 20px',
                            background: 'white',
                            color: '#dc2626',
                            border: '2px solid #dc2626',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '32px'
          }}>
            <button
              onClick={() => {
                const newPage = pagination.pageNumber - 1
                setPagination(prev => ({ ...prev, pageNumber: newPage }))
                fetchOrders(newPage, filterStatus)
              }}
              disabled={pagination.pageNumber <= 1}
              style={{
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: pagination.pageNumber <= 1 ? '#f3f4f6' : 'white',
                color: pagination.pageNumber <= 1 ? '#9ca3af' : '#374151',
                fontSize: '14px',
                cursor: pagination.pageNumber <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{
              padding: '10px 16px',
              fontSize: '14px',
              color: '#374151'
            }}>
              Page {pagination.pageNumber} of {pagination.totalPages}
            </span>
            <button
              onClick={() => {
                const newPage = pagination.pageNumber + 1
                setPagination(prev => ({ ...prev, pageNumber: newPage }))
                fetchOrders(newPage, filterStatus)
              }}
              disabled={pagination.pageNumber >= pagination.totalPages}
              style={{
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: pagination.pageNumber >= pagination.totalPages ? '#f3f4f6' : 'white',
                color: pagination.pageNumber >= pagination.totalPages ? '#9ca3af' : '#374151',
                fontSize: '14px',
                cursor: pagination.pageNumber >= pagination.totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Order Details</h2>
              <button
                onClick={() => {
                  setShowOrderDetail(false)
                  setSelectedOrder(null)
                }}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Order Info */}
              <div style={{
                background: '#f9fafb',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Order ID</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{selectedOrder._id}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Order Date</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{formatDate(selectedOrder.orderDate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: getStatusColor(selectedOrder.status).bg,
                      color: getStatusColor(selectedOrder.status).text,
                      textTransform: 'capitalize'
                    }}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Payment</div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: getPaymentStatusColor(selectedOrder.paymentStatus).bg,
                      color: getPaymentStatusColor(selectedOrder.paymentStatus).text,
                      textTransform: 'capitalize'
                    }}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111' }}>
                  📍 Shipping Address
                </h3>
                <div style={{
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.6'
                }}>
                  {selectedOrder.shippingAddress}
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111' }}>
                  📦 Order Items
                </h3>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '16px',
                        borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <img
                        src={item.product?.mainImage || '/placeholder.jpg'}
                        alt={item.product?.title || 'Product'}
                        style={{
                          width: '70px',
                          height: '70px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #f0f0f0'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          margin: '0 0 6px 0', 
                          fontSize: '15px', 
                          fontWeight: '600',
                          color: '#111'
                        }}>
                          {item.product?.title || 'Product'}
                        </h4>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          {item.size && <span style={{ marginRight: '12px' }}>Size: {item.size}</span>}
                          <span>Quantity: {item.quantity}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                          Price: {formatPrice(item.price)} × {item.quantity}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '700',
                        color: '#111'
                      }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div style={{
                padding: '20px',
                background: '#111',
                borderRadius: '12px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>Total Amount</span>
                <span style={{ fontSize: '24px', fontWeight: '700' }}>
                  {formatPrice(selectedOrder.totalAmount)}
                </span>
              </div>

              {/* Tracking Info */}
              {(selectedOrder.trackingNumber || selectedOrder.awbNumber || selectedOrder.status === 'shipped') && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111' }}>
                    🚚 Shipping & Tracking
                  </h3>
                  <div style={{
                    padding: '16px',
                    background: '#f0fdf4',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0'
                  }}>
                    {/* Tracking Number & Courier */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      {selectedOrder.awbNumber && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>AWB Number</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#14532d' }}>
                            {selectedOrder.awbNumber}
                          </div>
                        </div>
                      )}
                      {selectedOrder.trackingNumber && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Tracking Number</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#14532d' }}>
                            {selectedOrder.trackingNumber}
                          </div>
                        </div>
                      )}
                      {selectedOrder.deliveryPartner && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Courier Partner</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#14532d' }}>
                            {selectedOrder.deliveryPartner}
                          </div>
                        </div>
                      )}
                      {selectedOrder.estimatedDeliveryDate && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Est. Delivery</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#14532d' }}>
                            {formatDate(selectedOrder.estimatedDeliveryDate)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Track Live Button */}
                    <button
                      onClick={() => {
                        setShowOrderDetail(false)
                        handleTrackOrder(selectedOrder._id)
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'background 0.2s'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Track Live Location
                    </button>
                  </div>
                </div>
              )}
              
              {/* Order not yet shipped message */}
              {!selectedOrder.trackingNumber && !selectedOrder.awbNumber && selectedOrder.status !== 'shipped' && selectedOrder.status !== 'delivered' && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111' }}>
                    🚚 Shipping Status
                  </h3>
                  <div style={{
                    padding: '16px',
                    background: '#fefce8',
                    borderRadius: '12px',
                    border: '1px solid #fef08a',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                    <div style={{ fontSize: '14px', color: '#854d0e', fontWeight: '500' }}>
                      {selectedOrder.status === 'pending' ? 'Order is being processed' : 
                       selectedOrder.status === 'confirmed' ? 'Order confirmed! Preparing for shipment' :
                       'Tracking info will be available once shipped'}
                    </div>
                    {selectedOrder.status === 'confirmed' && (
                      <div style={{ fontSize: '12px', color: '#a16207', marginTop: '8px' }}>
                        Expected to ship within 5-7 business days
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cancel Info */}
              {selectedOrder.status === 'canceled' && selectedOrder.cancelReason && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111' }}>
                    ❌ Cancellation Details
                  </h3>
                  <div style={{
                    padding: '16px',
                    background: '#fef2f2',
                    borderRadius: '8px',
                    border: '1px solid #fecaca'
                  }}>
                    <div style={{ fontSize: '14px', color: '#991b1b' }}>
                      <strong>Reason:</strong> {selectedOrder.cancelReason}
                    </div>
                    {selectedOrder.cancelDate && (
                      <div style={{ fontSize: '14px', color: '#991b1b', marginTop: '4px' }}>
                        <strong>Cancelled on:</strong> {formatDate(selectedOrder.cancelDate)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '450px',
            width: '100%',
            padding: '24px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </div>
            
            <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#111' }}>
              Cancel Order?
            </h2>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please tell us why you're cancelling..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '80px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancellingOrderId(null)
                  setCancelReason('')
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                🚚 Track Your Order
              </h2>
              <button
                onClick={() => {
                  setShowTrackingModal(false)
                  setTrackingData(null)
                }}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {trackingLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#111',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                  }} />
                  <p style={{ color: '#666' }}>Loading tracking info...</p>
                </div>
              ) : trackingData ? (
                <>
                  {/* Current Location & Status Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    padding: '20px',
                    borderRadius: '16px',
                    marginBottom: '20px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Background decoration */}
                    <div style={{
                      position: 'absolute',
                      right: '-30px',
                      top: '-30px',
                      width: '120px',
                      height: '120px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%'
                    }} />
                    <div style={{
                      position: 'absolute',
                      right: '30px',
                      bottom: '-20px',
                      width: '80px',
                      height: '80px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '50%'
                    }} />
                    
                    {/* Status Icon */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        {getTrackingStatusIcon(trackingData.currentStatus?.summary?.status || trackingData.trackingHistory?.trackingdata?.[0]?.Status || 'In Transit')}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '2px' }}>Current Status</div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>
                          {trackingData.currentStatus?.summary?.status || trackingData.trackingHistory?.trackingdata?.[0]?.Status || trackingData.status || 'In Transit'}
                        </div>
                      </div>
                    </div>

                    {/* Current Location */}
                    {(trackingData.currentStatus?.summary?.location || trackingData.trackingHistory?.trackingdata?.[0]?.Location) && (
                      <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <div>
                          <div style={{ fontSize: '11px', opacity: 0.8 }}>Current Location</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>
                            {trackingData.currentStatus?.summary?.location || trackingData.trackingHistory?.trackingdata?.[0]?.Location}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Estimated Delivery */}
                    {(trackingData.estimatedDeliveryDate || trackingData.currentStatus?.summary?.edd) && (
                      <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <div>
                          <div style={{ fontSize: '11px', opacity: 0.8 }}>Expected Delivery</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>
                            {new Date(trackingData.estimatedDeliveryDate || trackingData.currentStatus?.summary?.edd).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AWB Info */}
                  <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>AWB Number</div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#0c4a6e',
                          fontFamily: 'monospace'
                        }}>
                          {trackingData.awbNumber || 'Awaiting'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>Courier Partner</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>
                          {trackingData.deliveryPartner || 'Assigned Soon'}
                        </div>
                      </div>
                      {trackingData.originCity && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>Origin</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>
                            {trackingData.originCity}
                          </div>
                        </div>
                      )}
                      {trackingData.destinationCity && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>Destination</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>
                            {trackingData.destinationCity}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  {trackingData.trackingHistory?.trackingdata && trackingData.trackingHistory.trackingdata.length > 0 ? (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>
                        Shipment Journey
                      </h3>
                      <div style={{ position: 'relative', paddingLeft: '32px' }}>
                        {/* Timeline line */}
                        <div style={{
                          position: 'absolute',
                          left: '10px',
                          top: '10px',
                          bottom: '10px',
                          width: '2px',
                          background: '#e5e7eb'
                        }} />
                        
                        {trackingData.trackingHistory.trackingdata.map((event, idx) => (
                          <div key={idx} style={{
                            position: 'relative',
                            paddingBottom: idx < trackingData.trackingHistory.trackingdata.length - 1 ? '24px' : '0'
                          }}>
                            {/* Timeline dot */}
                            <div style={{
                              position: 'absolute',
                              left: '-26px',
                              top: '4px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: idx === 0 ? '#22c55e' : '#e5e7eb',
                              border: idx === 0 ? '3px solid #dcfce7' : '3px solid white',
                              boxShadow: '0 0 0 2px #e5e7eb'
                            }} />
                            
                            <div style={{
                              background: idx === 0 ? '#f0fdf4' : '#f9fafb',
                              border: idx === 0 ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                              padding: '12px 16px',
                              borderRadius: '8px'
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                flexWrap: 'wrap',
                                gap: '8px'
                              }}>
                                <div>
                                  <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: idx === 0 ? '#166534' : '#374151',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    <span>{getTrackingStatusIcon(event.Status)}</span>
                                    {event.Status}
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                    {event.Remark}
                                  </div>
                                  {event.Location && (
                                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                      📍 {event.Location}
                                    </div>
                                  )}
                                </div>
                                <div style={{
                                  fontSize: '12px',
                                  color: '#9ca3af',
                                  textAlign: 'right',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {event.DateandTime || event.date}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : trackingData.statusHistory && trackingData.statusHistory.length > 0 ? (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>
                        Order Status History
                      </h3>
                      <div style={{ position: 'relative', paddingLeft: '32px' }}>
                        <div style={{
                          position: 'absolute',
                          left: '10px',
                          top: '10px',
                          bottom: '10px',
                          width: '2px',
                          background: '#e5e7eb'
                        }} />
                        
                        {trackingData.statusHistory.slice().reverse().map((event, idx) => (
                          <div key={idx} style={{
                            position: 'relative',
                            paddingBottom: idx < trackingData.statusHistory.length - 1 ? '20px' : '0'
                          }}>
                            <div style={{
                              position: 'absolute',
                              left: '-26px',
                              top: '4px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: idx === 0 ? '#22c55e' : '#e5e7eb',
                              border: '3px solid white',
                              boxShadow: '0 0 0 2px #e5e7eb'
                            }} />
                            
                            <div style={{
                              background: '#f9fafb',
                              padding: '12px 16px',
                              borderRadius: '8px'
                            }}>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                textTransform: 'capitalize',
                                marginBottom: '4px'
                              }}>
                                {event.status}
                              </div>
                              {event.note && (
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                  {event.note}
                                </div>
                              )}
                              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                {new Date(event.timestamp).toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      background: '#f9fafb',
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        {trackingData.message || 'Your order is being processed. Tracking information will be available once shipped.'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    No tracking information available yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Orders


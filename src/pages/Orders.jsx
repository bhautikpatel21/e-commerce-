import React, { useState, useEffect } from 'react'
import { getOrders, cancelOrder, getOrderById } from '../Api'
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
      confirmed: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
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
    if (order.status === 'cancelled' || order.status === 'delivered' || order.status === 'returned') {
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

  if (loading && orders.length === 0) {
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
        <marquee
          className="announcement-bar fade-down"
          direction="right"
          behavior="scroll"
          scrollamount="20"
        >
          <p>TBH is better on the app · Flat ₹300 off on your first order</p>
        </marquee>
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
      <marquee
        className="announcement-bar fade-down"
        direction="right"
        behavior="scroll"
        scrollamount="20"
      >
        <p>TBH is better on the app · Flat ₹300 off on your first order</p>
      </marquee>
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
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' }
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
                    <div style={{ display: 'flex', gap: '8px' }}>
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
              {selectedOrder.trackingNumber && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111' }}>
                    🚚 Tracking Information
                  </h3>
                  <div style={{
                    padding: '16px',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ fontSize: '14px', color: '#166534' }}>
                      <strong>Tracking Number:</strong> {selectedOrder.trackingNumber}
                    </div>
                    {selectedOrder.deliveryPartner && (
                      <div style={{ fontSize: '14px', color: '#166534', marginTop: '4px' }}>
                        <strong>Delivery Partner:</strong> {selectedOrder.deliveryPartner}
                      </div>
                    )}
                    {selectedOrder.estimatedDeliveryDate && (
                      <div style={{ fontSize: '14px', color: '#166534', marginTop: '4px' }}>
                        <strong>Estimated Delivery:</strong> {formatDate(selectedOrder.estimatedDeliveryDate)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cancel Info */}
              {selectedOrder.status === 'cancelled' && selectedOrder.cancelReason && (
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

      <Footer />
    </div>
  )
}

export default Orders


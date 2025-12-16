const BASE_URL = import.meta.env.BASE_URL_BACKEND || 'https://prectise-1.onrender.com/v1'

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    method,
    headers,
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred')
    }
    
    return data
  } catch (error) {
    throw error
  }
}

// Register API
export const register = async (name, email, password, confirmPassword) => {
  return apiCall('/auth/register', 'POST', {
    name,
    email,
    password,
    confirmPassword,
  })
}

// Login API
export const login = async (email, password) => {
  return apiCall('/auth/login', 'POST', {
    email,
    password,
  })
}

// Send forget password OTP API
export const sendForgetPasswordOtp = async (email) => {
  return apiCall('/auth/forgetPassword/send-forget-password-otp', 'POST', {
    email,
  })
}

// Verify forget password OTP API
export const verifyForgetPasswordOtp = async (otp, token) => {
  return apiCall('/auth/forgetPassword/verify-forget-password-otp', 'POST', {
    otp,
  }, token)
}

// Update password API
export const updatePassword = async (password, confirmPassword, token) => {
  return apiCall('/auth/forgetPassword/updatePassword', 'POST', {
    password,
    confirmPassword,
  }, token)
}

// Get user profile API
export const getUserProfile = async (token) => {
  return apiCall('/user/getSingle', 'GET', null, token)
}

// Get all products API (with optional pagination)
export const getProducts = async (pageNumber = null, pageSize = null) => {
  if (pageNumber !== null && pageSize !== null) {
    const queryParams = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    })
    return apiCall(`/product/get?${queryParams.toString()}`, 'GET')
  }
  return apiCall('/product/get', 'GET')
}

// Get products by category with pagination
export const getProductsByCategory = async (category, pageNumber = 1, pageSize = 6) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    category: category,
  })
  return apiCall(`/product/get?${queryParams.toString()}`, 'GET')
}

// Search products API
export const searchProducts = async (searchQuery, pageNumber = 1, pageSize = 12) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    search: searchQuery,
  })
  return apiCall(`/product/get?${queryParams.toString()}`, 'GET')
}

// Add to cart API
export const addToCart = async (productId, quantity, size, token) => {
  return apiCall('/cart/add', 'POST', {
    productId,
    quantity,
    size,
  }, token)
}

// Get cart API
export const getCart = async (token) => {
  return apiCall('/cart/get', 'GET', null, token)
}

// Update cart API
export const updateCart = async (id, updateType, value, token) => {
  let body = { id }
  if (updateType === 'quantity') {
    body.quantity = value
  } else if (updateType === 'size') {
    body.newSize = value
  }
  return apiCall('/cart/update', 'PUT', body, token)
}

// Add to wishlist API
export const addToWishlist = async (productId, token) => {
  return apiCall('/wishlist/add', 'POST', {
    productId,
  }, token)
}

// Get wishlist API
export const getWishlist = async (token) => {
  return apiCall('/wishlist/get', 'GET', null, token)
}

// Remove from cart API
export const removeFromCart = async (itemId, token) => {
  return apiCall('/cart/removeItem', 'DELETE', {
    itemId,
  }, token)
}

// Remove from wishlist API
export const removeFromWishlist = async (productId, token) => {
  return apiCall('/wishlist/removeItem', 'DELETE', {
    productId,
  }, token)
}

// Add review API
export const addReview = async (productId, rating, comment, token) => {
  return apiCall('/review/add', 'POST', {
    productId,
    rating,
    comment,
  }, token)
}

// Get product reviews API
export const getProductReviews = async (productId) => {
  const queryParams = new URLSearchParams({
    productId,
  })
  return apiCall(`/review/get?${queryParams.toString()}`, 'GET')
}

// Delete review API
export const deleteReview = async (reviewId, token) => {
  return apiCall(`/review/delete/${reviewId}`, 'DELETE', null, token)
}

// Get new arrival products API
export const getNewArrivalProducts = async () => {
  return apiCall('/product/newArrival', 'GET')
}

// Get trending now products API
export const getTrendingNowProducts = async () => {
  return apiCall('/product/trandingNow', 'GET')
}

// Send mail API
export const sendMail = async (email) => {
  return apiCall('/email/sendMail', 'POST', {
    email,
  })
}

// ==================== ORDER APIs ====================

// Create order API
export const createOrder = async (shippingAddress, token) => {
  return apiCall('/order/create', 'POST', {
    shippingAddress,
  }, token)
}

// Get all orders API
export const getOrders = async (token, pageNumber = 1, pageSize = 10, status = null) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  })
  if (status) {
    queryParams.append('status', status)
  }
  return apiCall(`/order/getAll?${queryParams.toString()}`, 'GET', null, token)
}

// Get single order API
export const getOrderById = async (orderId, token) => {
  return apiCall(`/order/view/${orderId}`, 'GET', null, token)
}

// Cancel order API
export const cancelOrder = async (orderId, cancelReason, token) => {
  return apiCall(`/order/cancel/${orderId}`, 'PUT', {
    cancelReason,
  }, token)
}

// ==================== PAYMENT APIs ====================

// Create payment order API (Razorpay)
export const createPayment = async (orderId, token) => {
  return apiCall('/payment/create', 'POST', {
    orderId,
  }, token)
}

// Verify payment API (Razorpay)
export const verifyPayment = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  return apiCall('/payment/verify', 'POST', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  })
}



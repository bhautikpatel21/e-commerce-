const BASE_URL='https://thewolfstreet.onrender.com/v1'

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
      showOnly: 'true', // Only show products with isShow: true
    })
    return apiCall(`/product/get?${queryParams.toString()}`, 'GET')
  }
  const queryParams = new URLSearchParams({
    showOnly: 'true', // Only show products with isShow: true
  })
  return apiCall(`/product/get?${queryParams.toString()}`, 'GET')
}

// Get products by category with pagination for HOME PAGE sections
// Shows only products with isShow: true
export const getProductsByCategoryForHome = async (category, pageNumber = 1, pageSize = 6) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    category: category,
    showOnly: 'true', // Only show products with isShow: true for home page
  })
  return apiCall(`/product/get?${queryParams.toString()}`, 'GET')
}

// Get products by category with pagination for FILTER DROPDOWN
// Shows ALL products (isShow: true or false) when user selects from filter
export const getProductsByCategory = async (category, pageNumber = 1, pageSize = 6) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    category: category,
    // Don't include showOnly - show all products when filtering by category
  })
  return apiCall(`/product/get?${queryParams.toString()}`, 'GET')
}

// Get all products without isShow filter (for category filter "all")
export const getAllProducts = async (pageNumber = 1, pageSize = 30) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    // Don't include showOnly - show all products when "all" is selected from filter
  })
  return apiCall(`/product/get?${queryParams.toString()}`, 'GET')
}

// Search products API
export const searchProducts = async (searchQuery, pageNumber = 1, pageSize = 12) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    search: searchQuery,
    showOnly: 'true', // Only show products with isShow: true
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
export const addReview = async (productId, rating, comment, images = [], token) => {
  const formData = new FormData()
  formData.append('productId', productId)
  formData.append('rating', rating.toString())
  formData.append('comment', comment)
  
  // Append images
  images.forEach((image) => {
    formData.append('images', image)
  })

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://thewolfstreet.onrender.com/v1'
  const headers = {
    'Authorization': `Bearer ${token}`,
  }

  const response = await fetch(`${BASE_URL}/review/add`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const data = await response.json()
  
  if (!response.ok || !data.isSuccess) {
    throw new Error(data.message || 'An error occurred')
  }
  
  return data
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
export const createOrder = async (shippingAddress, paymentMethod, token) => {
  return apiCall('/order/create', 'POST', {
    shippingAddress,
    paymentMethod,
  }, token)
}

// Buy Now - Create order directly for single product
export const createBuyNowOrder = async (productId, quantity, size, shippingAddress, paymentMethod, token) => {
  return apiCall('/order/buyNow', 'POST', {
    productId,
    quantity,
    size,
    shippingAddress,
    paymentMethod
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

export const orderCustomTShirt = async (customTShirt, token) => {
  return apiCall('/order/customTShirt', 'POST', {
    customTShirt,
  }, token)
}

// Create custom t-shirt order API
export const createCustomTShirtOrder = async (orderData, token) => {
  const formData = new FormData();

  // Append non-file data
  formData.append('customTShirt', JSON.stringify(orderData.customTShirt));
  formData.append('shippingAddress', orderData.shippingAddress);
  formData.append('totalAmount', orderData.totalAmount.toString());
  if (orderData.size) formData.append('size', orderData.size);
  if (orderData.quantity) formData.append('quantity', orderData.quantity.toString());

  // Append front images
  if (orderData.frontImages && orderData.frontImages.length > 0) {
    orderData.frontImages.forEach((file, index) => {
      formData.append('frontImages', file);
    });
  }

  // Append back images
  if (orderData.backImages && orderData.backImages.length > 0) {
    orderData.backImages.forEach((file, index) => {
      formData.append('backImages', file);
    });
  }

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://thewolfstreet.onrender.com/v1';
  const headers = {
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(`${BASE_URL}/order/customTShirt`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.isSuccess) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Get homepage data API
export const getHomepage = async () => {
  return apiCall('/homepage/get', 'GET')
}

// ==================== F-SHIP APIs ====================

// Get couriers API
export const getCouriers = async () => {
  return apiCall('/fship/couriers', 'GET')
}

// Calculate rate API
export const calculateRate = async (data) => {
  const { pincode, weight = 0.5, amount = 0, paymentMode = 'P', expressType = 'surface' } = data
  return apiCall('/fship/rate-calculator', 'POST', {
    destinationPincode: pincode,
    paymentMode: paymentMode,
    amount: amount,
    expressType: expressType,
    weight: weight,
    length: 10,
    width: 10,
    height: 10,
    volumetricWeight: weight
  })
}

// Check pincode serviceability API
export const checkPincodeServiceability = async (pincode, token) => {
  return apiCall('/fship/pincode-serviceability', 'POST', {
    destinationPincode: pincode
  }, token)
}

// Track order API
export const trackOrder = async (orderId) => {
  return apiCall(`/fship/track/${orderId}`, 'GET')
}

// Track by AWB number API
export const trackByAwb = async (awbNumber) => {
  return apiCall('/fship/track-awb', 'POST', {
    awbNumber: awbNumber
  })
}

// Get default warehouse (for source pincode)
export const getDefaultWarehouse = async () => {
  return apiCall('/fship/warehouses/default', 'GET')
}


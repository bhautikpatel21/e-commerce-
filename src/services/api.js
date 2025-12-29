const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://thewolfstreet.onrender.com/v1';

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok || !data.isSuccess) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth APIs
export const login = async (email, password) => {
  return apiCall('/auth/login', 'POST', {
    email,
    password,
  });
};

export const register = async (userData) => {
  return apiCall('/auth/register', 'POST', userData);
};

export const getProfile = async (token) => {
  return apiCall('/user/profile', 'GET', null, token);
};

export const updateProfile = async (userData, token) => {
  return apiCall('/user/profile', 'PUT', userData, token);
};

export const forgotPassword = async (email) => {
  return apiCall('/auth/forgot-password', 'POST', { email });
};

export const resetPassword = async (token, password) => {
  return apiCall('/auth/reset-password', 'POST', { token, password });
};

// Product APIs
export const getProducts = async (pageNumber = 1, pageSize = 30, category = null, search = null) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (category) {
    queryParams.append('category', category);
  }

  if (search) {
    queryParams.append('search', search);
  }

  return apiCall(`/product/get?${queryParams.toString()}`, 'GET');
};

export const getProductById = async (productId) => {
  return apiCall(`/product/getSingle/${productId}`, 'GET');
};

export const getProductsByCategory = async (category, pageNumber = 1, pageSize = 30) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    category,
  });

  return apiCall(`/product/get?${queryParams.toString()}`, 'GET');
};

// Cart APIs
export const getCart = async (token) => {
  return apiCall('/cart', 'GET', null, token);
};

export const addToCart = async (productId, quantity, size, token) => {
  return apiCall('/cart/add', 'POST', {
    productId,
    quantity,
    size,
  }, token);
};

export const updateCartItem = async (productId, quantity, size, token) => {
  return apiCall('/cart/update', 'PUT', {
    productId,
    quantity,
    size,
  }, token);
};

export const removeFromCart = async (productId, size, token) => {
  return apiCall('/cart/remove', 'DELETE', {
    productId,
    size,
  }, token);
};

export const clearCart = async (token) => {
  return apiCall('/cart/clear', 'DELETE', null, token);
};

// Wishlist APIs
export const getWishlist = async (token) => {
  return apiCall('/wishlist', 'GET', null, token);
};

export const addToWishlist = async (productId, token) => {
  return apiCall('/wishlist/add', 'POST', { productId }, token);
};

export const removeFromWishlist = async (productId, token) => {
  return apiCall('/wishlist/remove', 'DELETE', { productId }, token);
};

// Order APIs
export const createOrder = async (orderData, token) => {
  return apiCall('/order/create', 'POST', orderData, token);
};

export const getUserOrders = async (token, pageNumber = 1, pageSize = 10) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  return apiCall(`/order/user?${queryParams.toString()}`, 'GET', null, token);
};

export const getOrderById = async (orderId, token) => {
  return apiCall(`/order/${orderId}`, 'GET', null, token);
};

export const getOrderTracking = async (orderId, token) => {
  return apiCall(`/order/${orderId}/tracking`, 'GET', null, token);
};

export const cancelOrder = async (orderId, token) => {
  return apiCall(`/order/${orderId}/cancel`, 'PUT', null, token);
};

// Review APIs
export const getProductReviews = async (productId, pageNumber = 1, pageSize = 10) => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    productId,
  });

  return apiCall(`/review/get?${queryParams.toString()}`, 'GET');
};

export const addReview = async (reviewData, token) => {
  return apiCall('/review/add', 'POST', reviewData, token);
};

export const updateReview = async (reviewId, reviewData, token) => {
  return apiCall(`/review/update/${reviewId}`, 'PUT', reviewData, token);
};

export const deleteReview = async (reviewId, token) => {
  return apiCall(`/review/delete/${reviewId}`, 'DELETE', null, token);
};

// Payment APIs
export const createPaymentOrder = async (amount, token) => {
  return apiCall('/payment/create-order', 'POST', { amount }, token);
};

export const verifyPayment = async (paymentData, token) => {
  return apiCall('/payment/verify', 'POST', paymentData, token);
};

// Newsletter APIs
export const subscribeNewsletter = async (email) => {
  return apiCall('/email/subscribe', 'POST', { email });
};

// F-Ship APIs (for frontend)
export const getShippingOptions = async (pincode) => {
  return apiCall('/fship/shipping-options', 'POST', { pincode });
};

// Custom T-Shirt APIs
export const createCustomTShirtOrder = async (orderData, token) => {
  return apiCall('/order/custom-tshirt', 'POST', orderData, token);
};

export const getCustomTShirtPreview = async (designData) => {
  return apiCall('/order/custom-tshirt/preview', 'POST', designData);
};

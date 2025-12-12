/**
 * Utility functions for discount calculations
 */

/**
 * Check if today is Friday
 * @returns {boolean} True if today is Friday
 */
export const isFriday = () => {
  const today = new Date()
  return today.getDay() === 5 // 0 = Sunday, 5 = Friday
}

/**
 * Calculate discounted price (10% off)
 * @param {number} originalPrice - Original price
 * @returns {number} Discounted price
 */
export const calculateDiscountedPrice = (originalPrice) => {
  return originalPrice * 0.9 // 10% discount
}

/**
 * Format price in Indian Rupees
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}


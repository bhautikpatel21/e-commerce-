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
 * Check if total qualifies for 10% discount (up to ₹2499)
 * @param {number} total - Cart total
 * @returns {boolean} True if qualifies
 */
export const qualifiesForAmountDiscount = (total) => {
  return total <= 2499
}

/**
 * Calculate discounted total for amount-based discount (10% off if <= ₹2499)
 * @param {number} total - Original total
 * @returns {number} Discounted total
 */
export const calculateAmountDiscountedTotal = (total) => {
  if (qualifiesForAmountDiscount(total)) {
    return total * 0.9 // 10% discount
  }
  return total
}

/**
 * Format price in Indian Rupees
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}


import React, { useState, useEffect } from 'react'
import { getProductReviews, addReview, deleteReview, getUserProfile } from '../Api'
import Toast from './Toast'

const Review = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [deletingReviewId, setDeletingReviewId] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    if (productId) {
      fetchReviews()
    }
    // Get current user ID
    const token = localStorage.getItem('token')
    const storedUserId = localStorage.getItem('userId')
    
    if (storedUserId) {
      setCurrentUserId(storedUserId)
    }
    
    if (token) {
      getUserProfile(token)
        .then((response) => {
          if (response.isSuccess && response.data) {
            const userId = response.data._id || response.data.id
            setCurrentUserId(userId)
            // Store userId in localStorage for quick access
            if (userId) {
              localStorage.setItem('userId', userId)
            }
          }
        })
        .catch((err) => {
          console.error('Failed to fetch user profile:', err)
        })
    }
  }, [productId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await getProductReviews(productId)
      if (response.isSuccess && response.data) {
        setReviews(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!rating) {
      setError('Please select a rating')
      return
    }

    if (!comment.trim()) {
      setError('Please write a comment')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please login to submit a review')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const response = await addReview(productId, rating, comment, token)
      if (response.isSuccess) {
        setSuccess(true)
        setComment('')
        setRating(0)
        setShowReviewForm(false)
        // Refresh user ID and reviews
        try {
          const userResponse = await getUserProfile(token)
          if (userResponse.isSuccess && userResponse.data) {
            const userId = userResponse.data._id || userResponse.data.id
            setCurrentUserId(userId)
            if (userId) {
              localStorage.setItem('userId', userId)
            }
          }
        } catch (err) {
          console.error('Failed to refresh user profile:', err)
        }
        await fetchReviews()
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError('Failed to submit review')
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to delete review', type: 'error' })
      return
    }

    try {
      setDeletingReviewId(reviewId)
      setError(null)
      const response = await deleteReview(reviewId, token)
      if (response.isSuccess) {
        setToast({ show: true, message: 'Review deleted successfully', type: 'success' })
        // Refresh reviews
        await fetchReviews()
      } else {
        setToast({ show: true, message: 'Failed to delete review', type: 'error' })
      }
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to delete review', type: 'error' })
    } finally {
      setDeletingReviewId(null)
    }
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
    return (sum / reviews.length).toFixed(1)
  }

  const renderStars = (ratingValue, interactive = false, size = 'text-2xl') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (interactive ? hoverRating || ratingValue : ratingValue)
          return (
            <span
              key={star}
              className={`${size} ${isFilled ? 'text-orange-500' : 'text-gray-300'} ${
                interactive ? 'cursor-pointer' : ''
              }`}
              onClick={interactive ? () => setRating(star) : undefined}
              onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
              onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            >
              {isFilled ? '★' : '☆'}
            </span>
          )
        })}
      </div>
    )
  }

  const averageRating = calculateAverageRating()

  return (
    <div className="flex flex-col py-8 mx-auto max-w-4xl px-4">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      <h2 className="text-gray-900 text-lg font-bold uppercase mb-6 text-center">CUSTOMER REVIEWS</h2>
      
      {/* Average Rating */}
      {reviews.length > 0 && (
        <div className="flex flex-col items-center mb-6">
          <div className="text-4xl font-bold mb-2">{averageRating}</div>
          {renderStars(Math.round(averageRating))}
          <p className="text-gray-600 text-sm mt-2">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Review submitted successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Write Review Button */}
      {!showReviewForm && (
        <div className="flex flex-col items-center mb-6">
          {reviews.length === 0 && (
            <p className="text-gray-900 text-sm mb-4 text-center">Be the first to write a review</p>
          )}
          <button
            onClick={() => {
              const token = localStorage.getItem('token')
              if (!token) {
                setError('Please login to write a review')
                return
              }
              setShowReviewForm(true)
            }}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
          >
            Write review
          </button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            {renderStars(rating, true)}
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">You rated: {rating} star{rating !== 1 ? 's' : ''}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Share your experience with this product..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false)
                setComment('')
                setRating(0)
                setError(null)
              }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            // Check multiple possible ID fields
            const reviewUserId = review.user?._id || review.user?.id || review.userId || review.user
            const isOwnReview = currentUserId && reviewUserId && String(reviewUserId) === String(currentUserId)
            
            // Debug logging (remove in production)
            if (process.env.NODE_ENV === 'development') {
              console.log('Review:', {
                reviewId: review._id,
                reviewUserId,
                currentUserId,
                isOwnReview,
                reviewUser: review.user
              })
            }
            
            return (
              <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {review.user?.name || review.userName || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : ''}
                        </div>
                      </div>
                      {isOwnReview && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deletingReviewId === review._id}
                          className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete your review"
                        >
                          {deletingReviewId === review._id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {renderStars(review.rating || 0, false, 'text-xl')}
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{review.comment || ''}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Review
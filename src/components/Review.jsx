import React, { useState, useEffect, useRef } from 'react'
import { getProductReviews, addReview, deleteReview, getUserProfile } from '../Api'
import Toast from './Toast'

const Review = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [deletingReviewId, setDeletingReviewId] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [hasReviewed, setHasReviewed] = useState(false)
  const scrollContainerRef = useRef(null)

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

  // Check if user has already reviewed
  useEffect(() => {
    if (currentUserId && reviews.length > 0) {
      const userHasReviewed = reviews.some(review => {
        const reviewUserId = review.user?._id || review.user?.id || review.userId || review.user
        return reviewUserId && String(reviewUserId) === String(currentUserId)
      })
      setHasReviewed(userHasReviewed)
    } else {
      setHasReviewed(false)
    }
  }, [reviews, currentUserId])

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
      const response = await addReview(productId, rating, comment, images, token)
      if (response.isSuccess) {
        setSuccess(true)
        setComment('')
        setRating(0)
        setImages([])
        setImagePreviews([])
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
        // After submitting, hasReviewed will be updated via useEffect
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
        // hasReviewed will be updated via useEffect after fetchReviews
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
    <div className="flex flex-col items-center py-8 mx-auto w-full px-4 sm:px-6 lg:px-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      <h2 className="text-gray-900 text-lg font-bold uppercase mb-6 text-center w-full">CUSTOMER REVIEWS</h2>

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
      {!showReviewForm && !hasReviewed && (
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

          <div className="mb-4">
            <label htmlFor="images" className="block text-sm font-medium mb-2">
              Upload Images
            </label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 5)
                setImages(files)
                
                // Create previews
                const previews = []
                files.forEach((file) => {
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    previews.push(reader.result)
                    if (previews.length === files.length) {
                      setImagePreviews(previews)
                    }
                  }
                  reader.readAsDataURL(file)
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = images.filter((_, i) => i !== index)
                        const newPreviews = imagePreviews.filter((_, i) => i !== index)
                        setImages(newImages)
                        setImagePreviews(newPreviews)
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                setImages([])
                setImagePreviews([])
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
        <div className="text-center py-12">
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          {/* Reviews Slider Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
              justifyContent: reviews.length <= 6 ? 'center' : 'flex-start',
            }}
          >
            {reviews.map((review) => {
              // Check multiple possible ID fields
              const reviewUserId = review.user?._id || review.user?.id || review.userId || review.user
              const isOwnReview = currentUserId && reviewUserId && String(reviewUserId) === String(currentUserId)
              
              return (
                <div 
                  key={review._id} 
                  className="flex-shrink-0 bg-white flex justify-center items-center rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                  style={{
                    scrollSnapAlign: 'start',
                    width: '220px',
                  }}
                >
                  {/* Header with Avatar */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-semibold text-sm">
                      {(review.user?.name || review.userName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-base mb-1">
                        {review.user?.name || review.userName || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-400">
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
                        className="text-red-500 hover:text-red-700 text-lg px-2 py-1 rounded-full hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title="Delete your review"
                      >
                        {deletingReviewId === review._id ? '...' : '×'}
                      </button>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="mb-3">
                    {renderStars(review.rating || 0, false, 'text-base')}
                  </div>
                  
                  {/* Comment */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {review.comment || ''}
                  </p>
                  
                  {/* Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-2">
                      {review.images.slice(0, 3).map((imagePath, imgIndex) => {
                        let fullImageUrl
                        if (imagePath.startsWith('http')) {
                          fullImageUrl = imagePath
                        } else {
                          // Remove /v1/ from the path if it exists
                          const cleanPath = imagePath.replace(/^\/?v1\//, '/')
                          const imageUrl = (import.meta.env.VITE_API_IMAGE_URL || 'https://thewolfstreet.onrender.com').replace(/\/$/, '')
                          fullImageUrl = `${imageUrl}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`
                        }
                        return (
                          <img
                            key={imgIndex}
                            src={fullImageUrl}
                            alt={`Review image ${imgIndex + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-400 hover:scale-105 transition-all duration-200"
                            onClick={() => window.open(fullImageUrl, '_blank')}
                          />
                        )
                      })}
                      {review.images.length > 3 && (
                        <div className="w-20 h-20 rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all">
                          +{review.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Scroll Navigation */}
          {reviews.length > 6 && (
            <div className="flex justify-center items-center mt-6 gap-3">
              <button
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' })
                  }
                }}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">
                {Math.ceil((scrollContainerRef.current?.scrollLeft || 0) / 400) + 1} / {Math.ceil(reviews.length / 6)}
              </span>
              <button
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' })
                  }
                }}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Review
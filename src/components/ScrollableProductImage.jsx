import { useState, useRef, useEffect } from 'react'

const ScrollableProductImage = ({ product, productId, showDiscountBadge = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const intervalRef = useRef(null)
  const containerRef = useRef(null)

  const allImages = [
    product.mainImage,
    ...(product.sideImages || [])
  ].filter(Boolean)

  const handleWheel = (e) => {
    e.preventDefault() // Prevent default scroll behavior
    if (allImages.length <= 1) return

    if (e.deltaY > 0) {
      // Scroll down: next image
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length)
    } else if (e.deltaY < 0) {
      // Scroll up: previous image
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length)
    }
  }

  useEffect(() => {
    if (isHovering && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length)
      }, 1200) // Change image every 1.2 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setCurrentImageIndex(0) // Reset to first image when not hovering
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovering, allImages.length])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [allImages.length])

  return (
    <div
      ref={containerRef}
      className="product-image-container"
      style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {showDiscountBadge && (
        <div className="discount-badge-animated">
          <div className="discount-badge-rotating-border">
            <div className="discount-badge-inner">
              10% OFF
            </div>
          </div>
        </div>
      )}
      <img
        src={allImages[currentImageIndex]}
        alt={`${product.title} - Image ${currentImageIndex + 1}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#f8f8f8',
          transition: 'opacity 0.3s ease-in-out', // Smooth transition between images
        }}
        loading="lazy"
      />
    </div>
  )
}

export default ScrollableProductImage

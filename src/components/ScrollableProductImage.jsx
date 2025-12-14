import { useState, useRef } from 'react'

const ScrollableProductImage = ({ product, productId, showDiscountBadge = false }) => {
  const scrollContainerRef = useRef(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const isDragging = useRef(false)
  
  const allImages = [
    product.mainImage,
    ...(product.sideImages || [])
  ].filter(Boolean)

  if (allImages.length <= 1) {
    return (
      <div className="product-image-container" style={{ position: 'relative', width: '100%' }}>
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
          src={product.mainImage}
          alt={product.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#f8f8f8',
          }}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className="product-image-container" style={{ position: 'relative', width: '100%' }}>
      {showDiscountBadge && (
        <div className="discount-badge-animated">
          <div className="discount-badge-rotating-border">
            <div className="discount-badge-inner">
              10% OFF
            </div>
          </div>
        </div>
      )}
      <div
        ref={scrollContainerRef}
        className="product-image-scroll-container"
        style={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          width: '100%',
          cursor: isScrolling || isDragging.current ? 'grabbing' : 'grab',
          userSelect: 'none',
          WebkitOverflowScrolling: 'touch',
          backgroundColor: '#f8f8f8',
        }}
      >
        {allImages.map((image, imgIndex) => (
          <img
            key={imgIndex}
            src={image}
            alt={`${product.title} - Image ${imgIndex + 1}`}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              flexShrink: 0,
              scrollSnapAlign: 'start',
            }}
            loading={imgIndex === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </div>
  )
}

export default ScrollableProductImage

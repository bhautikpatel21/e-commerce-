import { useState, useRef } from 'react'

const ScrollableProductImage = ({ product, productId, showDiscountBadge = false }) => {
  const scrollContainerRef = useRef(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const hasMoved = useRef(false)
  const clickStartX = useRef(0)
  const clickStartY = useRef(0)

  const allImages = [
    product.mainImage,
    ...(product.sideImages || [])
  ].filter(Boolean)

  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
        scrollContainerRef.current.scrollLeft += e.deltaX
        setIsScrolling(true)
        setTimeout(() => setIsScrolling(false), 150)
      } else if (e.shiftKey) {
        e.preventDefault()
        scrollContainerRef.current.scrollLeft += e.deltaY
        setIsScrolling(true)
        setTimeout(() => setIsScrolling(false), 150)
      }
    }
  }

  const handleMouseDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft
    scrollLeft.current = scrollContainerRef.current.scrollLeft
    clickStartX.current = e.pageX
    clickStartY.current = e.pageY
    hasMoved.current = false
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollContainerRef.current) return
    const moveDistance = Math.abs(e.pageX - clickStartX.current) + Math.abs(e.pageY - clickStartY.current)
    if (moveDistance > 5) {
      hasMoved.current = true
      setIsScrolling(true)
    }
    if (hasMoved.current) {
      e.preventDefault()
      const x = e.pageX - scrollContainerRef.current.offsetLeft
      const walk = (x - startX.current) * 2
      scrollContainerRef.current.scrollLeft = scrollLeft.current - walk
    }
  }

  const handleMouseUp = (e) => {
    const wasDragging = isDragging.current
    const didMove = hasMoved.current
    isDragging.current = false
    
    // If user dragged/scrolled, prevent click
    if (didMove || wasDragging) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setTimeout(() => {
      setIsScrolling(false)
      hasMoved.current = false
    }, 100)
  }

  const handleMouseLeave = () => {
    isDragging.current = false
    setIsScrolling(false)
  }

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    clickStartX.current = e.touches[0].clientX
    clickStartY.current = e.touches[0].clientY
    hasMoved.current = false
  }

  const handleTouchMove = (e) => {
    if (!scrollContainerRef.current) return
    const touchX = e.touches[0].clientX
    const touchY = e.touches[0].clientY
    const moveDistance = Math.abs(touchX - clickStartX.current) + Math.abs(touchY - clickStartY.current)
    if (moveDistance > 5) {
      hasMoved.current = true
    }
    const deltaX = touchStartX.current - touchX
    const deltaY = touchStartY.current - touchY
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
      scrollContainerRef.current.scrollLeft += deltaX
      touchStartX.current = touchX
      setIsScrolling(true)
    }
  }

  const handleTouchEnd = (e) => {
    const didMove = hasMoved.current
    setIsScrolling(false)
    
    // If user swiped, prevent click
    if (didMove) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setTimeout(() => {
      hasMoved.current = false
    }, 100)
  }

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

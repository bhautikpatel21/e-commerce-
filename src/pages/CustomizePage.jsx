import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Celebration from '../components/Celebration'
import CustomCheckoutModal from '../components/CustomCheckoutModal'
import { createCustomTShirtOrder } from '../Api'
import '../App.css'

function CustomizePage() {
  const navigate = useNavigate()
  const [selectedColor, setSelectedColor] = useState('yellow')
  const [selectedSide, setSelectedSide] = useState('front') // 'front' or 'back'
  const [frontTexts, setFrontTexts] = useState([])
  const [backTexts, setBackTexts] = useState([])
  const [frontImages, setFrontImages] = useState([])
  const [backImages, setBackImages] = useState([])
  const [activeElement, setActiveElement] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [celebrate, setCelebrate] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [sliderIndex, setSliderIndex] = useState(0) // 0 for front, 1 for back
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [basePrice, setBasePrice] = useState(499) // Base price for custom t-shirt
  
  const frontCanvasRef = useRef(null)
  const backCanvasRef = useRef(null)
  const sliderRef = useRef(null)
  const fileInputRef = useRef(null)

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sync slider index with selected side
  useEffect(() => {
    if (selectedSide === 'front') {
      setSliderIndex(0)
    } else {
      setSliderIndex(1)
    }
  }, [selectedSide])

  // Handle touch start for swipe (only on container, not on draggable elements)
  const handleTouchStart = (e) => {
    // Don't handle swipe if touching a draggable element
    if (e.target.closest('[data-draggable]')) {
      return
    }
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  // Handle touch move for swipe
  const handleTouchMove = (e) => {
    // Don't handle swipe if touching a draggable element
    if (e.target.closest('[data-draggable]')) {
      return
    }
    setTouchEnd(e.targetTouches[0].clientX)
  }

  // Handle touch end and determine swipe direction
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && sliderIndex < 1) {
      setSliderIndex(1)
      setSelectedSide('back')
    }
    if (isRightSwipe && sliderIndex > 0) {
      setSliderIndex(0)
      setSelectedSide('front')
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Color to image mapping
  const colorImages = {
    yellow: { front: '/images/11.jpg', back: '/images/10.jpg' },
    black: { front: '/images/black1.jpg', back: '/images/black2.jpg' },
    white: { front: '/images/white1.jpg', back: '/images/white2.jpg' },
    green: { front: '/images/13.jpg', back: '/images/12.jpg' }
  }

  const colors = [
    { name: 'Yellow', value: 'yellow' },
    { name: 'Black', value: 'black' },
    { name: 'White', value: 'white' },
    { name: 'Green', value: 'green' }
  ]

  // Add text element
  const addText = (side) => {
    const newText = {
      id: Date.now(),
      text: 'Your Text',
      xPercent: 10, // Percentage from left (10%)
      yPercent: 20, // Percentage from top (20%)
      fontSize: 24,
      color: '#000000',
      fontFamily: 'Arial, sans-serif'
    }
    
    if (side === 'front') {
      setFrontTexts(prev => [...prev, newText])
      setActiveElement({ ...newText, side: 'front', type: 'text' })
    } else {
      setBackTexts(prev => [...prev, newText])
      setActiveElement({ ...newText, side: 'back', type: 'text' })
    }
  }

  // Handle image upload
  const handleImageUpload = (e, side) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        // Reset input
        if (e.target) {
          e.target.value = ''
        }
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        // Reset input
        if (e.target) {
          e.target.value = ''
        }
        return
      }

      const reader = new FileReader()
      
      reader.onloadend = () => {
        if (reader.error) {
          console.error('Error reading file:', reader.error)
          // Reset input
          if (e.target) {
            e.target.value = ''
          }
          return
        }

        const newImage = {
          id: Date.now(),
          src: reader.result,
          xPercent: 10, // Percentage from left (10%)
          yPercent: 20, // Percentage from top (20%)
          width: 100,
          height: 100
        }
        
        if (side === 'front') {
          setFrontImages(prev => [...prev, newImage])
          setActiveElement({ ...newImage, side: 'front', type: 'image' })
        } else {
          setBackImages(prev => [...prev, newImage])
          setActiveElement({ ...newImage, side: 'back', type: 'image' })
        }

        // Reset input to allow selecting the same file again
        if (e.target) {
          e.target.value = ''
        }
      }

      reader.onerror = () => {
        console.error('FileReader error:', reader.error)
        // Reset input
        if (e.target) {
          e.target.value = ''
        }
      }

      reader.readAsDataURL(file)
    }
  }

  // Container refs for calculating positions
  const frontContainerRef = useRef(null)
  const backContainerRef = useRef(null)

  // Handle mouse/touch down for dragging
  const handleStartDrag = (e, element, side, type) => {
    e.preventDefault()
    e.stopPropagation()
    
    const container = side === 'front' ? frontContainerRef.current : backContainerRef.current
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    // Support both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    const mouseX = clientX - rect.left
    const mouseY = clientY - rect.top
    
    // Convert element position from percentage to pixels for offset calculation
    const elementXPx = (element.xPercent || element.x || 0) * rect.width / 100
    const elementYPx = (element.yPercent || element.y || 0) * rect.height / 100
    
    // Calculate offset from mouse/touch position to element position
    const offsetX = mouseX - elementXPx
    const offsetY = mouseY - elementYPx
    
    setDragOffset({ x: offsetX, y: offsetY })
    setIsDragging(true)
    setActiveElement({ ...element, side, type })
  }

  // Handle mouse/touch move for dragging (document level)
  const handleMove = useCallback((e) => {
    if (!isDragging || !activeElement) return
    
    const container = activeElement.side === 'front' ? frontContainerRef.current : backContainerRef.current
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    // Support both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    const mouseX = clientX - rect.left
    const mouseY = clientY - rect.top
    
    // Calculate new position accounting for offset
    const newX = mouseX - dragOffset.x
    const newY = mouseY - dragOffset.y
    
    // Constrain to container bounds
    const elementWidth = activeElement.type === 'text' ? 100 : (activeElement.width || 100)
    const elementHeight = activeElement.type === 'text' ? 30 : (activeElement.height || 100)
    const maxX = rect.width - elementWidth
    const maxY = rect.height - elementHeight
    
    const constrainedX = Math.max(0, Math.min(newX, maxX))
    const constrainedY = Math.max(0, Math.min(newY, maxY))
    
    // Convert to percentages for consistent positioning across screen sizes
    const xPercent = (constrainedX / rect.width) * 100
    const yPercent = (constrainedY / rect.height) * 100
    
    // Update element position using functional updates
    if (activeElement.side === 'front') {
      if (activeElement.type === 'text') {
        setFrontTexts(prev => prev.map(el => 
          el.id === activeElement.id ? { ...el, xPercent, yPercent } : el
        ))
      } else {
        setFrontImages(prev => prev.map(el => 
          el.id === activeElement.id ? { ...el, xPercent, yPercent } : el
        ))
      }
    } else {
      if (activeElement.type === 'text') {
        setBackTexts(prev => prev.map(el => 
          el.id === activeElement.id ? { ...el, xPercent, yPercent } : el
        ))
      } else {
        setBackImages(prev => prev.map(el => 
          el.id === activeElement.id ? { ...el, xPercent, yPercent } : el
        ))
      }
    }
    
    // Update active element position
    setActiveElement(prev => prev ? { ...prev, xPercent, yPercent } : null)
  }, [isDragging, activeElement, dragOffset])

  // Handle mouse/touch up
  const handleEndDrag = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add document-level mouse and touch event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleEndDrag)
      document.addEventListener('touchmove', handleMove, { passive: false })
      document.addEventListener('touchend', handleEndDrag)
      document.body.style.userSelect = 'none' // Prevent text selection while dragging
      document.body.style.touchAction = 'none' // Prevent scrolling while dragging
      
      return () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleEndDrag)
        document.removeEventListener('touchmove', handleMove)
        document.removeEventListener('touchend', handleEndDrag)
        document.body.style.userSelect = '' // Restore text selection
        document.body.style.touchAction = '' // Restore touch action
      }
    }
  }, [isDragging, handleMove, handleEndDrag])

  // Update active element
  const updateActiveElement = (updates) => {
    if (!activeElement) return
    
    // Use functional updates to avoid stale state
    if (activeElement.side === 'front') {
      if (activeElement.type === 'text') {
        setFrontTexts(prev => prev.map(el => 
          el.id === activeElement.id ? { ...el, ...updates } : el
        ))
      } else {
        setFrontImages(prev => prev.map(el => 
          el.id === activeElement.id ? { ...el, ...updates } : el
        ))
      }
    } else {
      if (activeElement.type === 'text') {
        setBackTexts(prev => prev.map(el => 
          el.id === activeElement.id ? { ...el, ...updates } : el
        ))
      } else {
        setBackImages(prev => prev.map(el => 
          el.id === activeElement.id ? { ...el, ...updates } : el
        ))
      }
    }
    
    setActiveElement(prev => prev ? { ...prev, ...updates } : null)
  }

  // Remove element
  const removeElement = (id, side, type) => {
    if (side === 'front') {
      if (type === 'text') {
        setFrontTexts(prev => prev.filter(el => el.id !== id))
      } else {
        setFrontImages(prev => prev.filter(el => el.id !== id))
      }
    } else {
      if (type === 'text') {
        setBackTexts(prev => prev.filter(el => el.id !== id))
      } else {
        setBackImages(prev => prev.filter(el => el.id !== id))
      }
    }
    
    setActiveElement(prev => prev && prev.id === id ? null : prev)
  }

  // Apply changes to t-shirt
  const applyChanges = () => {
    // This would typically save the design or add to cart
    setCelebrate(prev => prev + 1)
  }

  // Prepare custom t-shirt data for order
  const getCustomTShirtData = () => {
    return {
      color: selectedColor,
      frontTexts: frontTexts,
      backTexts: backTexts,
      frontImages: frontImages,
      backImages: backImages,
      size: selectedSize,
      quantity: quantity,
      basePrice: basePrice
    }
  }

  // Handle buy now
  const handleBuyNow = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    
    // Check if there's any customization
    if (frontTexts.length === 0 && backTexts.length === 0 && 
        frontImages.length === 0 && backImages.length === 0) {
      alert('Please add some text or image to customize your t-shirt before buying.')
      return
    }
    
    setShowCheckout(true)
  }

  // Handle order success
  const handleOrderSuccess = (orderId) => {
    setCelebrate(prev => prev + 1)
    setShowCheckout(false)
  }

  // Capture t-shirt preview as image
  const captureTShirtPreview = async (side) => {
    return new Promise((resolve, reject) => {
      const container = side === 'front' ? frontContainerRef.current : backContainerRef.current
      if (!container) {
        reject(new Error(`Container not found for ${side} view`))
        return
      }

      // Wait a bit for any animations or rendering to complete
      setTimeout(() => {
        // Use html2canvas if available
        if (window.html2canvas) {
          window.html2canvas(container, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            removeContainer: false
          }).then(canvas => {
            const imageData = canvas.toDataURL('image/png')
            resolve(imageData)
          }).catch(err => {
            console.error(`Error capturing ${side} preview:`, err)
            // Return empty string if capture fails
            resolve('')
          })
        } else {
          // Fallback: return empty string if html2canvas not loaded
          console.warn('html2canvas not available, preview image not captured')
          resolve('')
        }
      }, 100)
    })
  }

  // Custom order creation for custom t-shirt
  const createCustomOrder = async (shippingAddress, token) => {
    try {
      // Capture front and back preview images
      const frontImage = await captureTShirtPreview('front')
      const backImage = await captureTShirtPreview('back')
      
      const customTShirtData = getCustomTShirtData()
      customTShirtData.frontPreviewImage = frontImage
      customTShirtData.backPreviewImage = backImage
      
      const totalAmount = basePrice * quantity
      
      return await createCustomTShirtOrder({
        customTShirt: customTShirtData,
        shippingAddress,
        totalAmount,
        size: selectedSize,
        quantity: quantity
      }, token)
    } catch (error) {
      console.error('Error capturing preview images:', error)
      // Continue without images if capture fails
      const customTShirtData = getCustomTShirtData()
      const totalAmount = basePrice * quantity
      
      return await createCustomTShirtOrder({
        customTShirt: customTShirtData,
        shippingAddress,
        totalAmount,
        size: selectedSize,
        quantity: quantity
      }, token)
    }
  }

  // Render t-shirt preview
  const renderTShirtPreview = (side) => {
    const texts = side === 'front' ? frontTexts : backTexts
    const images = side === 'front' ? frontImages : backImages
    const isActive = selectedSide === side
    const containerRef = side === 'front' ? frontContainerRef : backContainerRef
    
    // Get the correct image source for the selected side
    let imageSrc = null
    if (colorImages[selectedColor] && colorImages[selectedColor][side]) {
      imageSrc = colorImages[selectedColor][side]
    } else if (colorImages[selectedColor]?.front) {
      imageSrc = colorImages[selectedColor].front
    } else {
      imageSrc = '/images/11.jpg' // Default fallback
    }
    
    // Debug log
    console.log(`Rendering ${side} view:`, {
      side,
      selectedColor,
      imageSrc,
      hasColorImages: !!colorImages[selectedColor],
      colorImagesKeys: colorImages[selectedColor] ? Object.keys(colorImages[selectedColor]) : [],
      fullColorImages: colorImages[selectedColor]
    })
    
    return (
      <div 
        ref={containerRef}
        className="tshirt-preview-container"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: isMobile ? '100%' : '400px',
          margin: '0 auto',
          border: isActive ? '3px solid #e17055' : '2px solid #e8ddd0',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'crosshair',
          backgroundColor: side === 'back' ? '#fff5f0' : '#faf8f5',
          touchAction: 'none',
          minHeight: isMobile ? '250px' : '300px',
          display: 'block',
          zIndex: side === 'back' ? 2 : 1
        }}
        onMouseLeave={handleEndDrag}
      >
        <img
          key={`${side}-${selectedColor}`}
          src={imageSrc}
          alt={`${side} view t-shirt`}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            minHeight: isMobile ? '250px' : '300px',
            maxHeight: isMobile ? '400px' : '600px',
            objectFit: 'contain',
            backgroundColor: '#f0f0f0',
            visibility: 'visible',
            opacity: 1,
            position: 'relative',
            zIndex: 1,
            pointerEvents: 'none'
          }}
          onError={(e) => {
            console.error(`Failed to load ${side} image:`, imageSrc, 'for color:', selectedColor)
            // Show a placeholder if image fails to load
            e.target.style.backgroundColor = '#e0e0e0'
            e.target.alt = `Image not found: ${imageSrc}`
            e.target.style.border = '2px dashed #ccc'
            e.target.style.minHeight = '300px'
            // Create a placeholder div
            const container = e.target.parentElement
            if (container && !container.querySelector('.error-placeholder')) {
              const placeholder = document.createElement('div')
              placeholder.className = 'error-placeholder'
              placeholder.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #666; font-size: 1rem; z-index: 2;'
              placeholder.textContent = 'Image not found'
              container.appendChild(placeholder)
            }
          }}
          onLoad={(e) => {
            console.log(`Successfully loaded ${side} image:`, imageSrc, 'for color:', selectedColor)
            e.target.style.opacity = 1
          }}
          loading="eager"
        />
        
        {/* Render text elements */}
        {texts.map((textEl) => {
          // Support both percentage and pixel positioning for backward compatibility
          const leftPos = textEl.xPercent !== undefined ? `${textEl.xPercent}%` : `${textEl.x || 0}px`
          const topPos = textEl.yPercent !== undefined ? `${textEl.yPercent}%` : `${textEl.y || 0}px`
          
          return (
          <div
            key={textEl.id}
            data-draggable="true"
            style={{
              position: 'absolute',
              left: leftPos,
              top: topPos,
              fontSize: `${textEl.fontSize}px`,
              color: textEl.color,
              fontFamily: textEl.fontFamily,
              fontWeight: 'bold',
              cursor: isDragging && activeElement && activeElement.id === textEl.id ? 'grabbing' : 'grab',
              padding: '4px',
              border: activeElement && activeElement.id === textEl.id && activeElement.side === side
                ? '2px solid #e17055'
                : '2px solid transparent',
              backgroundColor: activeElement && activeElement.id === textEl.id && activeElement.side === side
                ? 'rgba(225, 112, 85, 0.1)'
                : 'transparent',
              borderRadius: '4px',
              userSelect: 'none',
              pointerEvents: 'auto',
              zIndex: 10,
              whiteSpace: 'nowrap',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
              WebkitTextStroke: textEl.color === '#ffffff' || textEl.color === '#FFFFFF' ? '0.5px #000000' : 'none'
            }}
            onMouseDown={(e) => handleStartDrag(e, textEl, side, 'text')}
            onTouchStart={(e) => {
              e.stopPropagation()
              handleStartDrag(e, textEl, side, 'text')
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (!isDragging) {
                setActiveElement({ ...textEl, side, type: 'text' })
              }
            }}
          >
            {textEl.text}
          </div>
          )
        })}
        
        {/* Render image elements */}
        {images.map((imgEl) => {
          // Support both percentage and pixel positioning for backward compatibility
          const leftPos = imgEl.xPercent !== undefined ? `${imgEl.xPercent}%` : `${imgEl.x || 0}px`
          const topPos = imgEl.yPercent !== undefined ? `${imgEl.yPercent}%` : `${imgEl.y || 0}px`
          
          return (
          <div
            key={imgEl.id}
            data-draggable="true"
            style={{
              position: 'absolute',
              left: leftPos,
              top: topPos,
              width: `${imgEl.width}px`,
              height: `${imgEl.height}px`,
              cursor: isDragging && activeElement && activeElement.id === imgEl.id ? 'grabbing' : 'grab',
              border: activeElement && activeElement.id === imgEl.id && activeElement.side === side
                ? '2px solid #e17055'
                : '2px solid transparent',
              backgroundColor: activeElement && activeElement.id === imgEl.id && activeElement.side === side
                ? 'rgba(225, 112, 85, 0.1)'
                : 'transparent',
              borderRadius: '4px',
              overflow: 'hidden',
              pointerEvents: 'auto',
              zIndex: 10
            }}
            onMouseDown={(e) => handleStartDrag(e, imgEl, side, 'image')}
            onTouchStart={(e) => {
              e.stopPropagation()
              handleStartDrag(e, imgEl, side, 'image')
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (!isDragging) {
                setActiveElement({ ...imgEl, side, type: 'image' })
              }
            }}
          >
            <img
              src={imgEl.src}
              alt="Custom design"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />
          </div>
          )
        })}
        
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: isActive ? '#e17055' : 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}
        >
          {side}
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <Celebration trigger={celebrate} />
      
      <Navbar />
      
      <div style={{ 
        padding: isMobile ? '12px' : '20px', 
        maxWidth: '1400px', 
        margin: '0 auto' 
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: isMobile ? '1.5rem' : '2.5rem', 
          fontWeight: 'bold', 
          marginBottom: isMobile ? '15px' : '30px',
          color: '#2c1810'
        }}>
          Customize Your T-Shirt
        </h1>

        {/* Color Selection */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: isMobile ? '12px' : '24px',
          marginBottom: isMobile ? '12px' : '30px',
          border: '1px solid #e8ddd0',
          boxShadow: '0 4px 15px rgba(139, 90, 43, 0.06)'
        }}>
          <h3 style={{ 
            fontSize: isMobile ? '0.9rem' : '1.2rem', 
            fontWeight: 'bold', 
            marginBottom: isMobile ? '10px' : '20px',
            color: '#3d2c22'
          }}>
            Select Color
          </h3>
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '12px' : '16px', 
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                style={{
                  width: isMobile ? '60px' : '80px',
                  height: isMobile ? '60px' : '80px',
                  borderRadius: '12px',
                  border: selectedColor === color.value ? '4px solid #e17055' : '2px solid #e8ddd0',
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${
                    color.value === 'yellow' ? '#F5F1E6' :
                    color.value === 'black' ? '#000000' :
                    color.value === 'white' ? '#FFFFFF' :
                    color.value === 'green' ? '#93ACB0' :
                    '#808080'
                  } 0%, ${
                    color.value === 'yellow' ? '#E8E0D0' :
                    color.value === 'black' ? '#333333' :
                    color.value === 'white' ? '#F5F5F5' :
                    color.value === 'green' ? '#7A9BA0' :
                    '#A0A0A0'
                  } 100%)`,
                  boxShadow: selectedColor === color.value 
                    ? '0 0 0 4px rgba(225, 112, 85, 0.25)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  transform: selectedColor === color.value ? 'scale(1.1)' : 'scale(1)'
                }}
                title={color.name}
              >
                {selectedColor === color.value && (
                  <span style={{ 
                    color: color.value === 'black' ? 'white' : 'black',
                    fontSize: isMobile ? '18px' : '24px',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* T-Shirt Preview - Front and Back */}
        {isMobile ? (
          /* Mobile Slider View */
          <div style={{ marginBottom: isMobile ? '12px' : '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMobile ? '10px' : '15px',
              padding: isMobile ? '0 5px' : '0 10px'
            }}>
              <h3 style={{ 
                fontSize: isMobile ? '0.9rem' : '1rem', 
                fontWeight: 'bold', 
                color: '#3d2c22' 
              }}>
                {sliderIndex === 0 ? 'Front View' : 'Back View'}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setSliderIndex(0)
                    setSelectedSide('front')
                  }}
                  style={{
                    padding: isMobile ? '5px 10px' : '6px 12px',
                    background: sliderIndex === 0 ? '#e17055' : '#faf8f5',
                    color: sliderIndex === 0 ? 'white' : '#3d2c22',
                    border: '2px solid #e8ddd0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.75rem' : '0.85rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Front
                </button>
                <button
                  onClick={() => {
                    setSliderIndex(1)
                    setSelectedSide('back')
                  }}
                  style={{
                    padding: isMobile ? '5px 10px' : '6px 12px',
                    background: sliderIndex === 1 ? '#e17055' : '#faf8f5',
                    color: sliderIndex === 1 ? 'white' : '#3d2c22',
                    border: '2px solid #e8ddd0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.75rem' : '0.85rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Back
                </button>
              </div>
            </div>
            
            {/* Slider Container */}
            <div
              ref={sliderRef}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
                touchAction: 'pan-x',
                width: '100%',
                minHeight: isMobile ? '300px' : '400px',
                backgroundColor: '#faf8f5'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div style={{
                display: 'flex',
                transform: `translateX(calc(-${sliderIndex} * 50%))`,
                transition: 'transform 0.3s ease',
                width: '200%',
                minHeight: isMobile ? '300px' : '400px',
                willChange: 'transform'
              }}>
                {/* Front View Slide */}
                <div style={{
                  width: '50%',
                  flexShrink: 0,
                  padding: '0 10px',
                  minWidth: '50%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}>
                  {renderTShirtPreview('front')}
                </div>
                
                {/* Back View Slide */}
                <div 
                  style={{
                    width: '50%',
                    flexShrink: 0,
                    padding: '0 10px',
                    minWidth: '50%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    position: 'relative'
                  }}
                >
                  {renderTShirtPreview('back')}
                </div>
              </div>
            </div>
            
            {/* Slider Indicators */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: isMobile ? '10px' : '15px'
            }}>
              <button
                onClick={() => {
                  setSliderIndex(0)
                  setSelectedSide('front')
                }}
                style={{
                  width: sliderIndex === 0 ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: sliderIndex === 0 ? '#e17055' : '#d0d0d0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
                aria-label="Front view"
              />
              <button
                onClick={() => {
                  setSliderIndex(1)
                  setSelectedSide('back')
                }}
                style={{
                  width: sliderIndex === 1 ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: sliderIndex === 1 ? '#e17055' : '#d0d0d0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
                aria-label="Back view"
              />
            </div>
          </div>
        ) : (
          /* Desktop Grid View */
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            marginBottom: '30px'
          }}>
            {/* Front View */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  color: '#3d2c22' 
                }}>
                  Front View
                </h3>
                <button
                  onClick={() => setSelectedSide('front')}
                  style={{
                    padding: '8px 16px',
                    background: selectedSide === 'front' ? '#e17055' : '#faf8f5',
                    color: selectedSide === 'front' ? 'white' : '#3d2c22',
                    border: '2px solid #e8ddd0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    fontSize: '1rem'
                  }}
                >
                  Select Front
                </button>
              </div>
              {renderTShirtPreview('front')}
            </div>

            {/* Back View */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  color: '#3d2c22' 
                }}>
                  Back View
                </h3>
                <button
                  onClick={() => setSelectedSide('back')}
                  style={{
                    padding: '8px 16px',
                    background: selectedSide === 'back' ? '#e17055' : '#faf8f5',
                    color: selectedSide === 'back' ? 'white' : '#3d2c22',
                    border: '2px solid #e8ddd0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    fontSize: '1rem'
                  }}
                >
                  Select Back
                </button>
              </div>
              {renderTShirtPreview('back')}
            </div>
          </div>
        )}

        {/* Customization Controls */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: isMobile ? '12px' : '24px',
          marginBottom: isMobile ? '15px' : '30px',
          border: '1px solid #e8ddd0',
          boxShadow: '0 4px 15px rgba(139, 90, 43, 0.06)'
        }}>
          <h3 style={{ 
            fontSize: isMobile ? '0.9rem' : '1.2rem', 
            fontWeight: 'bold', 
            marginBottom: isMobile ? '10px' : '20px',
            color: '#3d2c22'
          }}>
            Customize {selectedSide === 'front' ? 'Front' : 'Back'}
          </h3>

          {/* Add Text and Image Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '8px' : '16px', 
            marginBottom: isMobile ? '12px' : '20px',
            flexDirection: isMobile ? 'row' : 'row'
          }}>
            <button
              onClick={() => addText(selectedSide)}
              style={{
                padding: isMobile ? '8px 12px' : '12px 24px',
                background: 'linear-gradient(135deg, #e17055 0%, #ff9f43 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '0.8rem' : '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(225, 112, 85, 0.3)',
                width: isMobile ? '50%' : 'auto',
                flex: isMobile ? '1' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 20px rgba(225, 112, 85, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 15px rgba(225, 112, 85, 0.3)'
                }
              }}
            >
              ✏️ Add Text
            </button>
            
            <label
              htmlFor="image-upload-input"
              style={{
                padding: isMobile ? '8px 12px' : '12px 24px',
                background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '0.8rem' : '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 184, 148, 0.3)',
                display: 'inline-block',
                width: isMobile ? '50%' : 'auto',
                flex: isMobile ? '1' : 'none',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 184, 148, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 184, 148, 0.3)'
                }
              }}
            >
              📷 Upload Image
              <input
                id="image-upload-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, selectedSide)}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Active Element Editor */}
          {activeElement && (
            <div style={{
              background: '#faf8f5',
              borderRadius: '12px',
              padding: isMobile ? '10px' : '20px',
              marginTop: isMobile ? '12px' : '20px',
              border: '2px solid #e8ddd0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isMobile ? '10px' : '15px',
                flexWrap: isMobile ? 'wrap' : 'nowrap',
                gap: isMobile ? '8px' : '0'
              }}>
                <h4 style={{ 
                  fontSize: isMobile ? '0.8rem' : '1rem', 
                  fontWeight: 'bold', 
                  color: '#3d2c22' 
                }}>
                  Edit {activeElement.type === 'text' ? 'Text' : 'Image'}
                </h4>
                <button
                  onClick={() => removeElement(activeElement.id, activeElement.side, activeElement.type)}
                  style={{
                    padding: isMobile ? '4px 8px' : '6px 12px',
                    background: '#ffebee',
                    color: '#c62828',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.75rem' : '1rem'
                  }}
                >
                  Remove
                </button>
              </div>

              {activeElement.type === 'text' && (
                <>
                  <input
                    type="text"
                    value={activeElement.text}
                    onChange={(e) => updateActiveElement({ text: e.target.value })}
                    placeholder="Enter text..."
                    style={{
                      width: '100%',
                      padding: isMobile ? '8px' : '12px',
                      marginBottom: isMobile ? '10px' : '15px',
                      border: '2px solid #e8ddd0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      outline: 'none'
                    }}
                  />
                  
                  <div style={{ 
                    display: isMobile ? 'grid' : 'flex', 
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'none',
                    gap: isMobile ? '8px' : '16px', 
                    marginBottom: isMobile ? '10px' : '15px', 
                    flexWrap: 'wrap',
                    flexDirection: isMobile ? 'row' : 'row'
                  }}>
                    <div style={{ flex: isMobile ? 'none' : '0 1 auto' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: isMobile ? '4px' : '8px', 
                        fontSize: isMobile ? '0.75rem' : '0.9rem', 
                        color: '#7f6b5d' 
                      }}>
                        Font Size
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
                        <input
                          type="range"
                          min="12"
                          max="48"
                          value={activeElement.fontSize}
                          onChange={(e) => updateActiveElement({ fontSize: parseInt(e.target.value) })}
                          style={{ flex: '1', minWidth: isMobile ? '60px' : '100px' }}
                        />
                        <span style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', minWidth: isMobile ? '35px' : '40px' }}>
                          {activeElement.fontSize}px
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ flex: isMobile ? 'none' : '0 1 auto' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: isMobile ? '4px' : '8px', 
                        fontSize: isMobile ? '0.75rem' : '0.9rem', 
                        color: '#7f6b5d' 
                      }}>
                        Color
                      </label>
                      <input
                        type="color"
                        value={activeElement.color}
                        onChange={(e) => updateActiveElement({ color: e.target.value })}
                        style={{ 
                          width: isMobile ? '100%' : '60px', 
                          height: isMobile ? '35px' : '40px', 
                          cursor: 'pointer',
                          maxWidth: isMobile ? 'none' : 'none'
                        }}
                      />
                    </div>
                    
                    <div style={{ flex: isMobile ? '1 1 100%' : '0 1 auto', gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: isMobile ? '4px' : '8px', 
                        fontSize: isMobile ? '0.75rem' : '0.9rem', 
                        color: '#7f6b5d' 
                      }}>
                        Font Family
                      </label>
                      <select
                        value={activeElement.fontFamily}
                        onChange={(e) => updateActiveElement({ fontFamily: e.target.value })}
                        style={{
                          padding: isMobile ? '8px' : '8px',
                          border: '2px solid #e8ddd0',
                          borderRadius: '8px',
                          fontSize: isMobile ? '0.75rem' : '0.9rem',
                          cursor: 'pointer',
                          width: '100%',
                          maxWidth: isMobile ? '100%' : '200px'
                        }}
                      >
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="Impact, sans-serif">Impact</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeElement.type === 'image' && (
                <div style={{ 
                  display: isMobile ? 'grid' : 'flex', 
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'none',
                  gap: isMobile ? '8px' : '16px', 
                  flexWrap: 'wrap',
                  flexDirection: isMobile ? 'row' : 'row'
                }}>
                  <div style={{ flex: isMobile ? 'none' : '0 1 auto' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: isMobile ? '4px' : '8px', 
                      fontSize: isMobile ? '0.75rem' : '0.9rem', 
                      color: '#7f6b5d' 
                    }}>
                      Width
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={activeElement.width}
                        onChange={(e) => updateActiveElement({ width: parseInt(e.target.value) })}
                        style={{ flex: '1', minWidth: isMobile ? '60px' : '100px' }}
                      />
                      <span style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', minWidth: isMobile ? '45px' : '50px' }}>
                        {activeElement.width}px
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ flex: isMobile ? 'none' : '0 1 auto' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: isMobile ? '4px' : '8px', 
                      fontSize: isMobile ? '0.75rem' : '0.9rem', 
                      color: '#7f6b5d' 
                    }}>
                      Height
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={activeElement.height}
                        onChange={(e) => updateActiveElement({ height: parseInt(e.target.value) })}
                        style={{ flex: '1', minWidth: isMobile ? '60px' : '100px' }}
                      />
                      <span style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', minWidth: isMobile ? '45px' : '50px' }}>
                        {activeElement.height}px
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Size, Quantity and Buy Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: isMobile ? '12px' : '24px',
          marginBottom: isMobile ? '15px' : '30px',
          border: '1px solid #e8ddd0',
          boxShadow: '0 4px 15px rgba(139, 90, 43, 0.06)'
        }}>
          <h3 style={{ 
            fontSize: isMobile ? '0.9rem' : '1.2rem', 
            fontWeight: 'bold', 
            marginBottom: isMobile ? '15px' : '20px',
            color: '#3d2c22'
          }}>
            Order Details
          </h3>

          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '12px' : '20px', 
            marginBottom: isMobile ? '15px' : '20px',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'flex-end'
          }}>
            {/* Size Selection */}
            <div style={{ flex: isMobile ? '1' : '0 1 auto' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: isMobile ? '0.85rem' : '0.9rem', 
                color: '#7f6b5d',
                fontWeight: '500'
              }}>
                Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  border: '2px solid #e8ddd0',
                  borderRadius: '8px',
                  fontSize: isMobile ? '0.85rem' : '1rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            {/* Quantity Selection */}
            <div style={{ flex: isMobile ? '1' : '0 1 auto' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: isMobile ? '0.85rem' : '0.9rem', 
                color: '#7f6b5d',
                fontWeight: '500'
              }}>
                Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid #e8ddd0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#3d2c22'
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '60px',
                    padding: '10px',
                    border: '2px solid #e8ddd0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid #e8ddd0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#3d2c22'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Display */}
            <div style={{ flex: isMobile ? '1' : '0 1 auto', textAlign: isMobile ? 'left' : 'right' }}>
              <div style={{ 
                fontSize: isMobile ? '0.85rem' : '0.9rem', 
                color: '#7f6b5d',
                marginBottom: '4px'
              }}>
                Total Price
              </div>
              <div style={{ 
                fontSize: isMobile ? '1.5rem' : '2rem', 
                fontWeight: 'bold', 
                color: '#e17055'
              }}>
                ₹{basePrice * quantity}
              </div>
            </div>
          </div>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '16px 24px',
              background: 'linear-gradient(135deg, #e17055 0%, #ff9f43 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: isMobile ? '1rem' : '1.1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(225, 112, 85, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 20px rgba(225, 112, 85, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(225, 112, 85, 0.3)'
              }
            }}
          >
            🛒 Buy Now
          </button>
        </div>
      </div>
      
      {/* Checkout Modal for Custom T-Shirt */}
      {showCheckout && (
        <CustomCheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          customTShirtData={getCustomTShirtData()}
          totalAmount={basePrice * quantity}
          size={selectedSize}
          quantity={quantity}
          onOrderSuccess={handleOrderSuccess}
          createOrder={createCustomOrder}
        />
      )}
      
      <Footer />
    </div>
    )
}
export default CustomizePage
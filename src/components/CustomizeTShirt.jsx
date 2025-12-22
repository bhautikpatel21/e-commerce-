import { useState } from 'react'

function CustomizeTShirt({ onClose, onAddToCart, isPage = false }) {
  const [customTshirtColor, setCustomTshirtColor] = useState('#ffffff')
  const [customSize, setCustomSize] = useState('M')
  const [customQuantity, setCustomQuantity] = useState(1)
  const [activeElementId, setActiveElementId] = useState(null)
  const [designElements, setDesignElements] = useState([])

  const tshirtColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#1a1a1a' },
    { name: 'Navy', value: '#1e3a5f' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Forest Green', value: '#166534' },
    { name: 'Sky Blue', value: '#0ea5e9' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Orange', value: '#ea580c' },
  ]

  const fontOptions = [
    { name: 'Classic', value: 'Georgia, serif' },
    { name: 'Modern', value: 'Arial, sans-serif' },
    { name: 'Bold', value: 'Impact, sans-serif' },
    { name: 'Elegant', value: 'Times New Roman, serif' },
    { name: 'Fun', value: 'Comic Sans MS, cursive' },
    { name: 'Tech', value: 'Courier New, monospace' },
  ]

  const positionOptions = [
    { id: 'top-left', name: 'Top Left', style: { top: '25%', left: '20%' } },
    { id: 'top-center', name: 'Top Center', style: { top: '25%', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'top-right', name: 'Top Right', style: { top: '25%', right: '20%' } },
    { id: 'center-left', name: 'Center Left', style: { top: '50%', left: '20%', transform: 'translateY(-50%)' } },
    { id: 'center', name: 'Center', style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } },
    { id: 'center-right', name: 'Center Right', style: { top: '50%', right: '20%', transform: 'translateY(-50%)' } },
    { id: 'bottom-left', name: 'Bottom Left', style: { bottom: '30%', left: '20%' } },
    { id: 'bottom-center', name: 'Bottom Center', style: { bottom: '30%', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'bottom-right', name: 'Bottom Right', style: { bottom: '30%', right: '20%' } },
  ]

  const elementSizeOptions = [
    { id: 'xs', name: 'XS', scale: 0.5 },
    { id: 'sm', name: 'S', scale: 0.75 },
    { id: 'md', name: 'M', scale: 1 },
    { id: 'lg', name: 'L', scale: 1.25 },
    { id: 'xl', name: 'XL', scale: 1.5 },
    { id: 'xxl', name: 'XXL', scale: 2 },
  ]

  const addTextElement = () => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: 'Your Text',
      color: '#000000',
      font: 'Georgia, serif',
      position: 'center',
      size: 'md',
    }
    setDesignElements([...designElements, newElement])
    setActiveElementId(newElement.id)
  }

  const addLogoElement = (logoType) => {
    const logos = {
      'star': '⭐',
      'heart': '❤️',
      'fire': '🔥',
      'crown': '👑',
      'lightning': '⚡',
      'music': '🎵',
    }
    const newElement = {
      id: Date.now(),
      type: 'logo',
      content: logos[logoType] || '🎨',
      position: 'center',
      size: 'md',
    }
    setDesignElements([...designElements, newElement])
    setActiveElementId(newElement.id)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newElement = {
          id: Date.now(),
          type: 'image',
          content: reader.result,
          position: 'center',
          size: 'md',
        }
        setDesignElements([...designElements, newElement])
        setActiveElementId(newElement.id)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateElement = (id, updates) => {
    setDesignElements(designElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  const removeElement = (id) => {
    setDesignElements(designElements.filter(el => el.id !== id))
    if (activeElementId === id) setActiveElementId(null)
  }

  const getActiveElement = () => designElements.find(el => el.id === activeElementId)

  const handleCustomizeAddToCart = () => {
    const customProduct = {
      title: 'Custom T-Shirt',
      color: customTshirtColor,
      elements: designElements,
      size: customSize,
      quantity: customQuantity,
      price: 29.99 + (designElements.length * 2),
    }
    if (onAddToCart) {
      onAddToCart(customProduct)
    }
    console.log('Custom T-Shirt:', customProduct)
  }

  return (
    <div className={isPage ? "relative w-full min-h-screen overflow-x-hidden max-w-full" : "fixed inset-0 bg-black/80 z-[1000] overflow-y-auto p-2 sm:p-5"}>
      <div className={`relative ${isPage ? 'w-full max-w-full' : 'max-w-[1400px]'} mx-auto bg-white ${isPage ? 'rounded-none sm:rounded-xl' : 'rounded-xl sm:rounded-2xl'} ${isPage ? 'p-1 sm:p-2 md:p-3 lg:p-5' : 'p-3 sm:p-5'}`}>
        {/* Close/Back Button */}
        {onClose && (
          <div className={`${isPage ? 'sticky top-0 sm:top-2 z-20 mb-2 sm:mb-3' : 'absolute top-2 right-2 sm:top-5 sm:right-5'} ${isPage ? 'w-full flex justify-end' : ''}`}>
            <button
              onClick={onClose}
              className={`bg-gray-100 border-none rounded-full ${isPage ? 'w-auto px-2.5 sm:px-3 md:px-4 text-xs sm:text-sm' : 'w-8 h-8 sm:w-10 sm:h-10'} text-base sm:text-lg md:text-xl cursor-pointer flex items-center justify-center transition-colors duration-300 hover:bg-gray-200 shadow-sm`}
            >
              {isPage ? '← Back' : '×'}
            </button>
          </div>
        )}

        <div className={`bg-[#fefcf9] ${isPage ? 'rounded-lg sm:rounded-2xl' : 'rounded-2xl sm:rounded-[32px]'} ${isPage ? 'p-3 sm:p-6 md:p-8 lg:p-12' : 'p-4 sm:p-8 lg:p-12'} my-0 relative overflow-hidden border-2 border-[#e8ddd0] shadow-[0_20px_60px_rgba(139,90,43,0.08)]`}>
          <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-11 relative z-10">
            <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#fff4e6] text-[#d35400] text-[10px] sm:text-xs font-bold py-1 px-2 sm:py-1.5 sm:px-3 md:py-2 md:px-4 rounded-full mb-2 sm:mb-3 md:mb-4 tracking-wide border border-dashed border-[#f0b27a]">
              ✂️ NEW
            </div>
            <h2 className="text-[#2c1810] text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 md:mb-4 font-serif tracking-tight px-1 sm:px-2">
              Design Your Own T-Shirt
            </h2>
            <p className="text-[#7f6b5d] text-xs sm:text-sm md:text-base lg:text-lg mx-auto max-w-[520px] leading-relaxed px-2 sm:px-4">
              Create a unique piece that's 100% you. Add multiple texts, logos, and upload your own designs!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4 sm:gap-6 md:gap-8 lg:gap-12 relative z-10">
            {/* T-Shirt Preview */}
            <div className="flex flex-col items-center justify-center order-2 lg:order-1">
              <div className="w-full max-w-[280px] sm:max-w-[300px] h-auto aspect-[280/320] sm:aspect-[300/340] sm:w-[300px] sm:h-[340px] rounded-xl sm:rounded-2xl md:rounded-3xl flex items-center justify-center relative bg-[repeating-linear-gradient(0deg,transparent,transparent_20px,rgba(0,0,0,0.02)_20px,rgba(0,0,0,0.02)_21px),repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(0,0,0,0.02)_20px,rgba(0,0,0,0.02)_21px)] border-2 sm:border-[3px] border-dashed border-[#d4c4b5] transition-all duration-300 hover:border-[#c49a6c] hover:shadow-[0_15px_40px_rgba(139,90,43,0.15)]">
                <div className="relative w-[55%] sm:w-[60%] md:w-[200px] h-auto aspect-[200/220] sm:h-[220px]">
                  <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-[3px_3px_0_#d4c4b5]">
                    <path 
                      d="M50 0 L0 50 L20 60 L20 220 L180 220 L180 60 L200 50 L150 0 L130 20 Q100 35 70 20 Z" 
                      fill={customTshirtColor}
                      stroke={customTshirtColor === '#ffffff' ? '#d4c4b5' : 'transparent'}
                      strokeWidth="2"
                    />
                  </svg>
                  {/* Render all design elements */}
                  {designElements.map((element) => {
                    const position = positionOptions.find(p => p.id === element.position)?.style || {}
                    const sizeScale = elementSizeOptions.find(s => s.id === element.size)?.scale || 1
                    
                    return (
                      <div
                        key={element.id}
                        className={`absolute cursor-pointer p-1 border-2 rounded transition-all duration-200 ${
                          activeElementId === element.id 
                            ? 'border-[#e17055] bg-[rgba(225,112,85,0.1)]' 
                            : 'border-transparent hover:border-[rgba(225,112,85,0.5)]'
                        }`}
                        style={{
                          ...position,
                          transform: `${position.transform || ''} scale(${sizeScale})`.trim(),
                        }}
                        onClick={() => setActiveElementId(element.id)}
                      >
                        {element.type === 'text' && (
                          <span 
                            className="text-sm font-bold"
                            style={{ 
                              color: element.color,
                              fontFamily: element.font,
                            }}
                          >
                            {element.content}
                          </span>
                        )}
                        {element.type === 'logo' && (
                          <span className="text-2xl">{element.content}</span>
                        )}
                        {element.type === 'image' && (
                          <img 
                            src={element.content} 
                            alt="Custom design"
                            className="max-w-[60px] max-h-[60px] object-contain"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <p className="text-[#a08979] text-xs mt-3 sm:mt-4 uppercase tracking-[2px] sm:tracking-[3px] font-semibold text-center px-2">
                Live Preview • Click element to edit
              </p>
              
              {/* Elements List */}
              {designElements.length > 0 && (
                <div className="w-full mt-3 sm:mt-4 md:mt-5 bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-[#e8ddd0]">
                  <p className="text-[10px] sm:text-xs text-[#7f6b5d] mb-1.5 sm:mb-2 md:mb-2.5 font-semibold uppercase tracking-wide">
                    Added Elements ({designElements.length})
                  </p>
                  {designElements.map((el) => (
                    <div 
                      key={el.id} 
                      className={`flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 bg-[#faf8f5] rounded-lg mb-1 sm:mb-1.5 cursor-pointer transition-all duration-200 border-2 ${
                        activeElementId === el.id 
                          ? 'border-[#e17055] bg-[#fff4e6]' 
                          : 'border-transparent hover:bg-[#fff8f0]'
                      }`}
                      onClick={() => setActiveElementId(el.id)}
                    >
                      <span className="text-base sm:text-lg">
                        {el.type === 'text' ? '✏️' : el.type === 'logo' ? el.content : '🖼️'}
                      </span>
                      <span className="flex-1 text-xs sm:text-sm text-[#3d2c22] font-medium truncate">
                        {el.type === 'text' ? el.content.substring(0, 8) + (el.content.length > 8 ? '...' : '') : 
                         el.type === 'logo' ? 'Logo' : 'Image'}
                      </span>
                      <button 
                        className="w-5 h-5 sm:w-6 sm:h-6 border-none bg-[#ffebee] text-[#c62828] rounded-full text-sm sm:text-base font-bold flex items-center justify-center transition-all duration-200 hover:bg-[#c62828] hover:text-white flex-shrink-0"
                        onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customization Options */}
            <div className="flex flex-col gap-4 sm:gap-5 order-1 lg:order-2">
              {/* Color Selection */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e8ddd0] shadow-[0_4px_15px_rgba(139,90,43,0.06)] transition-all duration-300 hover:border-[#d4c4b5] hover:shadow-[0_8px_25px_rgba(139,90,43,0.1)]">
                <h3 className="text-[#3d2c22] text-sm sm:text-base font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-[#ff9f43] to-[#e17055] rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-[0_3px_10px_rgba(225,112,85,0.3)]">
                    1
                  </span>
                  T-Shirt Color
                </h3>
                <div className="flex gap-2.5 sm:gap-3.5 flex-wrap">
                  {tshirtColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 cursor-pointer transition-all duration-300 relative shadow-[0_3px_10px_rgba(0,0,0,0.1)] hover:scale-110 hover:rotate-6 ${
                        customTshirtColor === color.value 
                          ? 'border-[#e17055] shadow-[0_0_0_3px_rgba(225,112,85,0.25)] sm:shadow-[0_0_0_4px_rgba(225,112,85,0.25)] scale-110' 
                          : 'border-[#f5f0eb] hover:border-[#d4c4b5]'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setCustomTshirtColor(color.value)}
                      title={color.name}
                    >
                      {customTshirtColor === color.value && (
                        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Elements */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e8ddd0] shadow-[0_4px_15px_rgba(139,90,43,0.06)] transition-all duration-300 hover:border-[#d4c4b5] hover:shadow-[0_8px_25px_rgba(139,90,43,0.1)]">
                <h3 className="text-[#3d2c22] text-sm sm:text-base font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-[#ff9f43] to-[#e17055] rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-[0_3px_10px_rgba(225,112,85,0.3)]">
                    2
                  </span>
                  Add Design Elements
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 px-3 sm:px-4 bg-gradient-to-br from-[#e17055] to-[#ff9f43] border-none rounded-lg sm:rounded-xl text-white text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(225,112,85,0.3)]"
                    onClick={addTextElement}
                  >
                    <span>✏️</span> <span className="hidden sm:inline">Add Text</span><span className="sm:hidden">Text</span>
                  </button>
                  <label className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 px-3 sm:px-4 bg-gradient-to-br from-[#00b894] to-[#00cec9] border-none rounded-lg sm:rounded-xl text-white text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,184,148,0.3)]">
                    <span>📷</span> <span className="hidden sm:inline">Upload Image</span><span className="sm:hidden">Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="bg-[#faf8f5] rounded-lg sm:rounded-xl p-2.5 sm:p-3.5">
                  <p className="text-xs text-[#7f6b5d] mb-2 sm:mb-2.5 font-semibold">Quick Add Logos:</p>
                  <div className="flex gap-2 sm:gap-2.5 flex-wrap">
                    {['star', 'heart', 'fire', 'crown', 'lightning', 'music'].map((logo) => (
                      <button 
                        key={logo}
                        className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#e8ddd0] bg-white rounded-lg sm:rounded-xl text-xl sm:text-2xl cursor-pointer transition-all duration-200 hover:scale-110 hover:border-[#e17055] hover:shadow-[0_4px_12px_rgba(225,112,85,0.2)]"
                        onClick={() => addLogoElement(logo)}
                      >
                        {logo === 'star' && '⭐'}
                        {logo === 'heart' && '❤️'}
                        {logo === 'fire' && '🔥'}
                        {logo === 'crown' && '👑'}
                        {logo === 'lightning' && '⚡'}
                        {logo === 'music' && '🎵'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit Selected Element */}
              {getActiveElement() && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e8ddd0] shadow-[0_4px_15px_rgba(139,90,43,0.06)] transition-all duration-300 hover:border-[#d4c4b5] hover:shadow-[0_8px_25px_rgba(139,90,43,0.1)] animate-[slideIn_0.3s_ease]">
                  <h3 className="text-[#3d2c22] text-sm sm:text-base font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-[#ff9f43] to-[#e17055] rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-[0_3px_10px_rgba(225,112,85,0.3)]">
                      3
                    </span>
                    Edit Selected Element
                  </h3>
                  
                  {/* Text specific options */}
                  {getActiveElement().type === 'text' && (
                    <>
                      <input
                        type="text"
                        className="w-full py-3 sm:py-4 px-3 sm:px-5 bg-[#faf8f5] border-2 border-[#e8ddd0] rounded-lg sm:rounded-xl text-[#3d2c22] text-sm sm:text-base font-serif outline-none transition-all duration-300 placeholder:text-[#b8a89a] placeholder:italic focus:border-[#e17055] focus:bg-white focus:shadow-[0_0_0_3px_rgba(225,112,85,0.1)] sm:focus:shadow-[0_0_0_4px_rgba(225,112,85,0.1)]"
                        placeholder="Enter your text..."
                        value={getActiveElement().content}
                        onChange={(e) => updateElement(activeElementId, { content: e.target.value })}
                        maxLength={25}
                      />
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-3 sm:mt-3.5">
                        <div className="flex items-center gap-2.5 sm:gap-3.5 text-[#7f6b5d] text-xs sm:text-sm font-medium">
                          <span>Color:</span>
                          <input
                            type="color"
                            value={getActiveElement().color}
                            onChange={(e) => updateElement(activeElementId, { color: e.target.value })}
                            className="w-9 h-9 sm:w-11 sm:h-11 border-2 border-[#e8ddd0] rounded-full cursor-pointer bg-transparent p-0.5"
                          />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-2.5 text-[#7f6b5d] text-xs sm:text-sm font-medium">
                          <span>Font:</span>
                          <select
                            value={getActiveElement().font}
                            onChange={(e) => updateElement(activeElementId, { font: e.target.value })}
                            className="flex-1 sm:flex-none py-2 sm:py-2.5 px-2.5 sm:px-3.5 border-2 border-[#e8ddd0] rounded-lg bg-white text-[#3d2c22] text-xs sm:text-sm cursor-pointer outline-none transition-all duration-200 focus:border-[#e17055]"
                          >
                            {fontOptions.map((font) => (
                              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                {font.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Position Selection */}
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm text-[#7f6b5d] mb-2 sm:mb-3 font-semibold">Position:</p>
                    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 w-full sm:w-fit">
                      {positionOptions.map((pos) => {
                        const arrowIcons = {
                          'top-left': (
                            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="17" y1="17" x2="7" y2="7"></line>
                              <polyline points="7 17 7 7 17 7"></polyline>
                            </svg>
                          ),
                          'top-center': (
                            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="19" x2="12" y2="5"></line>
                              <polyline points="5 12 12 5 19 12"></polyline>
                            </svg>
                          ),
                          'top-right': (
                            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="7" y1="17" x2="17" y2="7"></line>
                              <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                          ),
                          'center-left': (
                            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="19" y1="12" x2="5" y2="12"></line>
                              <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                          ),
                          'center': (
                            <svg width="12" height="12" className="sm:w-[14px] sm:h-[14px]" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="12" r="8"></circle>
                            </svg>
                          ),
                          'center-right': (
                            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          ),
                          'bottom-left': (
                            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="17" y1="7" x2="7" y2="17"></line>
                              <polyline points="17 17 7 17 7 7"></polyline>
                            </svg>
                          ),
                          'bottom-center': (
                            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <polyline points="19 12 12 19 5 12"></polyline>
                            </svg>
                          ),
                          'bottom-right': (
                            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="7" y1="7" x2="17" y2="17"></line>
                              <polyline points="17 7 17 17 7 17"></polyline>
                            </svg>
                          ),
                        }
                        return (
                          <button
                            key={pos.id}
                            className={`w-10 h-10 sm:w-12 sm:h-12 border rounded-lg text-sm sm:text-base cursor-pointer transition-all duration-200 flex items-center justify-center text-[#9a958f] shadow-[0_2px_4px_rgba(0,0,0,0.04)] hover:bg-[#f8f6f4] hover:border-[#d4cfc8] hover:text-[#6b6560] hover:scale-105 ${
                              getActiveElement().position === pos.id 
                                ? 'bg-gradient-to-br from-[#f5a366] to-[#e88a4a] border-transparent text-white shadow-[0_4px_12px_rgba(232,138,74,0.35)]' 
                                : 'border-[#e0dbd5] bg-[#fefefe]'
                            }`}
                            onClick={() => updateElement(activeElementId, { position: pos.id })}
                            title={pos.name}
                          >
                            {arrowIcons[pos.id]}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Element Size */}
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm text-[#7f6b5d] mb-2 sm:mb-3 font-semibold">Element Size:</p>
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                      {elementSizeOptions.map((size) => (
                        <button
                          key={size.id}
                          className={`py-2 sm:py-2.5 px-3 sm:px-4 border-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 ${
                            getActiveElement().size === size.id
                              ? 'bg-gradient-to-br from-[#e17055] to-[#ff9f43] border-transparent text-white'
                              : 'border-[#e8ddd0] bg-[#faf8f5] text-[#5d4e42] hover:bg-[#fff8f0] hover:border-[#d4c4b5]'
                          }`}
                          onClick={() => updateElement(activeElementId, { size: size.id })}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* T-Shirt Size Selection */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e8ddd0] shadow-[0_4px_15px_rgba(139,90,43,0.06)] transition-all duration-300 hover:border-[#d4c4b5] hover:shadow-[0_8px_25px_rgba(139,90,43,0.1)]">
                <h3 className="text-[#3d2c22] text-sm sm:text-base font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-[#ff9f43] to-[#e17055] rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-[0_3px_10px_rgba(225,112,85,0.3)]">
                    {getActiveElement() ? '4' : '3'}
                  </span>
                  T-Shirt Size
                </h3>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      className={`w-[45px] h-[40px] sm:w-[54px] sm:h-[46px] rounded-lg font-bold cursor-pointer transition-all duration-300 text-xs sm:text-sm ${
                        customSize === size
                          ? 'bg-gradient-to-br from-[#e17055] to-[#ff9f43] border-transparent text-white shadow-[0_4px_15px_rgba(225,112,85,0.35)]'
                          : 'bg-[#faf8f5] border-2 border-[#e8ddd0] text-[#5d4e42] hover:bg-[#fff8f0] hover:border-[#d4c4b5]'
                      }`}
                      onClick={() => setCustomSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Price */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e8ddd0] shadow-[0_4px_15px_rgba(139,90,43,0.06)] transition-all duration-300 hover:border-[#d4c4b5] hover:shadow-[0_8px_25px_rgba(139,90,43,0.1)]">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-5 pt-1.5 border-t-2 border-dashed border-[#e8ddd0] mt-1.5">
                  <div className="flex items-center gap-2.5 sm:gap-3.5">
                    <span className="text-[#7f6b5d] text-xs sm:text-sm font-semibold">Quantity:</span>
                    <button 
                      className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] bg-[#faf8f5] border-2 border-[#e8ddd0] rounded-lg text-[#5d4e42] text-lg sm:text-xl cursor-pointer transition-all duration-200 font-semibold hover:bg-[#fff8f0] hover:border-[#e17055] hover:text-[#e17055]"
                      onClick={() => setCustomQuantity(Math.max(1, customQuantity - 1))}
                    >
                      −
                    </button>
                    <span className="text-[#3d2c22] text-lg sm:text-xl font-bold min-w-[30px] sm:min-w-[35px] text-center">{customQuantity}</span>
                    <button 
                      className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] bg-[#faf8f5] border-2 border-[#e8ddd0] rounded-lg text-[#5d4e42] text-lg sm:text-xl cursor-pointer transition-all duration-200 font-semibold hover:bg-[#fff8f0] hover:border-[#e17055] hover:text-[#e17055]"
                      onClick={() => setCustomQuantity(customQuantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[#7f6b5d] text-xs sm:text-sm font-semibold">Total:</span>
                      <span className="text-[#27ae60] text-xl sm:text-2xl font-extrabold font-serif">
                        ${((29.99 + (designElements.length * 2)) * customQuantity).toFixed(2)}
                      </span>
                    </div>
                    {designElements.length > 0 && (
                      <span className="block text-xs text-[#7f6b5d] text-center sm:text-left">
                        (Base $29.99 + ${designElements.length * 2} for {designElements.length} design{designElements.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button 
                className="w-full py-4 sm:py-5 px-4 sm:px-8 bg-gradient-to-br from-[#e17055] to-[#ff9f43] border-none rounded-xl sm:rounded-2xl text-white text-base sm:text-lg font-bold cursor-pointer flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 shadow-[0_8px_30px_rgba(225,112,85,0.35)] uppercase tracking-wide hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(225,112,85,0.45)] active:-translate-y-0.5"
                onClick={handleCustomizeAddToCart}
              >
                <span className="text-xl sm:text-2xl">🛒</span>
                <span className="hidden sm:inline">Add Custom T-Shirt to Cart</span>
                <span className="sm:hidden">Add to Cart</span>
              </button>

              <p className="text-center text-[#a08979] text-xs sm:text-sm mt-2 px-2">
                ✨ Free shipping on custom orders over $50 • 🔄 Easy returns within 30 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomizeTShirt

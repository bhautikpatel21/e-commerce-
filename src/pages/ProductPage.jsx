import { useState, useEffect } from 'react'
import { addToCart, getWishlist, addToWishlist, removeFromWishlist } from '../Api'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Review from '../components/Review'
import Footer from '../components/Footer'
import Category from '../components/Category'
import ScrollableProductImage from '../components/ScrollableProductImage'
import '../App.css'
import { getProducts, getProductsByCategory } from '../Api'
import Subcribe from '../components/Subcribe'
import Toast from '../components/Toast'
import Celebration from '../components/Celebration'
import FridayOfferBanner from '../components/FridayOfferBanner'
import { isFriday, calculateDiscountedPrice, formatPrice } from '../utils/discount'

function parseProductTitle(title) {
  const match = title.match(/^([A-Z][a-z]+(?:-[A-Z][a-z]+)*)\s+(.*)$/);
  if (match) {
    return { type: match[1], name: match[2] };
  }
  return { type: '', name: title };
}

function ProductPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCategory, setSelectedCategory] = useState(null) // null = normal page
  const [productsData, setProductsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [shirtProducts, setShirtProducts] = useState([])
  const [tshirtProducts, setTshirtProducts] = useState([])
  const [hoodieProducts, setHoodieProducts] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [wishlistedItems, setWishlistedItems] = useState([])
  const [selectedSize, setSelectedSize] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [celebrate, setCelebrate] = useState(0)
  const [isFridayDiscount, setIsFridayDiscount] = useState(false)

  // Check if today is Friday on component mount
  useEffect(() => {
    setIsFridayDiscount(isFriday())
  }, [])

  // Check for category in navigation state when component mounts or location changes
  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category)
      // Clear the state to avoid re-triggering on re-renders
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Helper function to render product price with discount
  const renderProductPrice = (product) => {
    if (!product.price) return <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#333' }}>Price not available</p>
    
    if (isFridayDiscount) {
      const discountedPriceUSD = calculateDiscountedPrice(product.price)
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <span
            style={{
              fontSize: '1em',
              fontWeight: 'normal',
              color: '#999',
              textDecoration: 'line-through',
            }}
          >
            {formatPrice(product.price)}
          </span>
          <span
            style={{
              fontSize: '1.1em',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            {formatPrice(discountedPriceUSD)}
          </span>
        </div>
      )
    } else {
      return (
        <p
          style={{
            fontSize: '1.1em',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          {formatPrice(product.price)}
        </p>
      )
    }
  }

  // Load wishlist from API on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const response = await getWishlist(token)
        if (response.isSuccess && response.data) {
          setWishlistedItems(response.data.products.map(p => p._id))
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err)
      }
    }

    fetchWishlist()
  }, [])

  const handleAddToCart = async (product) => {
    if (!selectedSize) {
      setToast({ show: true, message: 'Please select a size', type: 'error' });
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({ show: true, message: 'Please login first', type: 'error' });
      return;
    }
    try {
      await addToCart(product._id, 1, selectedSize, token);
      setToast({ show: true, message: `Added ${product.title} size ${selectedSize} to cart`, type: 'success' });
      // Dispatch event to update navbar count
      window.dispatchEvent(new Event('cartChanged'))
      // Trigger celebration animation
      setCelebrate(Date.now())
    } catch (error) {
      setToast({ show: true, message: 'Error adding to cart: ' + error.message, type: 'error' });
    }
  }

  const handleWishlistToggle = async (productId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ show: true, message: 'Please login to manage wishlist', type: 'error' })
      return
    }

    const isCurrentlyWishlisted = wishlistedItems.includes(productId)
    try {
      let response
      if (isCurrentlyWishlisted) {
        response = await removeFromWishlist(productId, token)
        if (response.isSuccess) {
          setWishlistedItems(prev => prev.filter(id => id !== productId))
          setToast({ show: true, message: 'Removed from wishlist', type: 'success' })
          // Dispatch event to update navbar count
          window.dispatchEvent(new Event('wishlistChanged'))
        } else {
          setToast({ show: true, message: 'Failed to remove from wishlist', type: 'error' })
        }
      } else {
        response = await addToWishlist(productId, token)
        if (response.isSuccess) {
          setWishlistedItems(prev => [...prev, productId])
          setToast({ show: true, message: 'Added to wishlist', type: 'success' })
          // Dispatch event to update navbar count
          window.dispatchEvent(new Event('wishlistChanged'))
        } else {
          setToast({ show: true, message: 'Failed to add to wishlist', type: 'error' })
        }
      }
    } catch (err) {
      setToast({ show: true, message: 'Error updating wishlist', type: 'error' })
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await getProducts()
        if (response.isSuccess && response.data) {
          setProductsData(response.data)
        } else {
          setError('Failed to load products')
        }
      } catch (err) {
        setError(err.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Load recently viewed products from localStorage
  useEffect(() => {
    if (productsData.length > 0) {
      const stored = localStorage.getItem('recentlyViewed')
      const recentlyViewedIds = stored ? JSON.parse(stored) : []
      
      // Get recently viewed products from productsData
      const recentlyViewedProducts = recentlyViewedIds
        .map(id => productsData.find(p => p._id === id))
        .filter(p => p !== undefined)
        .slice(0, 5) // Limit to 5 products
      
      setRecentlyViewed(recentlyViewedProducts)
    }
  }, [productsData])

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setCategoryLoading(true)
        
        // Fetch shirt products
        const shirtResponse = await getProductsByCategory('shirt', 1, 6)
        if (shirtResponse.isSuccess && shirtResponse.data) {
          setShirtProducts(Array.isArray(shirtResponse.data) ? shirtResponse.data : shirtResponse.data.products || [])
        }

        // Fetch t-shirt products
        const tshirtResponse = await getProductsByCategory('t-shirt', 1, 6)
        if (tshirtResponse.isSuccess && tshirtResponse.data) {
          setTshirtProducts(Array.isArray(tshirtResponse.data) ? tshirtResponse.data : tshirtResponse.data.products || [])
        }

        // Fetch hoodie products
        const hoodieResponse = await getProductsByCategory('hoodie', 1, 6)
        if (hoodieResponse.isSuccess && hoodieResponse.data) {
          setHoodieProducts(Array.isArray(hoodieResponse.data) ? hoodieResponse.data : hoodieResponse.data.products || [])
        }
      } catch (err) {
        console.error('Error fetching category products:', err)
      } finally {
        setCategoryLoading(false)
      }
    }

    fetchCategoryProducts()
  }, [])

  if (loading) {
    return (
      <div className="page-shell">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </div>
    )
  }

  const featuredProduct = productsData[0]
  const featuredImages = featuredProduct
    ? [
        featuredProduct.mainImage,
        ...(featuredProduct.sideImages || []).slice(0, 3),
      ]
    : []

  return (
    <div className="page-shell">
      <Celebration trigger={celebrate} />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      <marquee
        className="announcement-bar fade-down"
        direction="right"
        behavior="scroll"
        scrollamount="20"
      >
        <p>TBH is better on the app · Flat ₹300 off on your first order</p>
      </marquee>

      <FridayOfferBanner />

      <Navbar onSelectCategory={setSelectedCategory} />

      <main>
        {/* If a category is selected from Navbar, show full-page Category view */}
        {selectedCategory ? (
          <Category
            selectedCategory={selectedCategory}
            onProductClick={(product) => navigate(`/product/${product._id}`)}
          />
        ) : (
          <>
            {/* Featured product hero section (top of page) */}
            {featuredProduct && (
              <section className="hero fade-up">
                {/* Left: all product images in a 2-column tall grid */}
                <div
                  className="product-hero-media"
                  onClick={() => navigate(`/product/${featuredProduct._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {featuredImages.map((img, index) => (
                    <div key={img || index} className="product-hero-item">
                      <img
                        src={img}
                        alt={`${featuredProduct.title} view ${index + 1}`}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>

                {/* Right: Product information panel */}
                <div className="product-panel">
                  <p className="crumbs">
                    The Bear House / Featured / Classic drop
                  </p>
                  {(() => {
                    const { type, name } = parseProductTitle(featuredProduct.title);
                    return type ? (
                      <>
                        <h1 className="title-type">{type}</h1>
                        <p className="title-name">{name}</p>
                      </>
                    ) : (
                      <h1>{name}</h1>
                    );
                  })()}
                  <p className="subtitle">{featuredProduct.description}</p>

                  <div className="price-row">
                    {featuredProduct.price ? (
                      isFridayDiscount ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '1.8rem' }}>
                            {formatPrice(featuredProduct.price)}
                          </span>
                          <span className="price" style={{ color: '#333' }}>
                            {formatPrice(calculateDiscountedPrice(featuredProduct.price))}
                          </span>
                        </div>
                      ) : (
                        <span className="price">
                          {formatPrice(featuredProduct.price)}
                        </span>
                      )
                    ) : (
                      <span className="price">Price not available</span>
                    )}
                    {isFridayDiscount && (
                      <span className="label success" style={{ background: '#000', color: '#fff' }}>
                        10% OFF
                      </span>
                    )}
                    <span className="label success">
                      Inclusive of all taxes
                    </span>
                    <span className="label outline">
                      Free shipping above ₹500
                    </span>
                  </div>

                  <div className="thumb-row">
                    {featuredImages.map((img, index) => (
                      <button
                        key={img || index}
                        type="button"
                        className="thumb-circle"
                      >
                        <img
                          src={img}
                          alt={`${featuredProduct.title} thumb ${
                            index + 1
                          }`}
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>

                  <div className="size-selector">
                    <div className="selector-header">
                      <span className="crumbs">Size</span>
                      <button type="button" className="ghost tiny">
                        Size chart
                      </button>
                    </div>
                    <div className="size-grid">
                      {featuredProduct.sizes.map((size) => (
                        <button 
                          key={size} 
                          type="button" 
                          onClick={() => setSelectedSize(size)}
                          className={`size-pill ${selectedSize === size ? 'selected' : ''}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cta-stack w-full flex justify-center items-center" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button type="button" className="primary w-full" onClick={(e) => { e.stopPropagation(); handleAddToCart(featuredProduct); }}>
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleWishlistToggle(featuredProduct._id); }}
                      style={{
                        background: 'transparent',
                        border: '1px solid #333',
                        borderRadius: '50%',
                        width: '52px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '20px',
                        color: wishlistedItems.includes(featuredProduct._id) ? '#e91e63' : '#333',
                        transition: 'all 0.3s ease',
                      }}
                      title={wishlistedItems.includes(featuredProduct._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {wishlistedItems.includes(featuredProduct._id) ? '❤️' : '♡'}
                    </button>
                  </div>

                  <p className="status-copy">
                    Crafted for everyday comfort. Ships in 2–4 business days
                    from our Bengaluru studio.
                  </p>
                </div>
              </section>
            )}

            <Review />

            {/* Shirt Section */}
            <div style={{ marginBottom: '60px' }}>
              <h2
                className="category-section-title"
                style={{
                  textAlign: 'start',
                  color: 'black',
                  fontSize: '1.5em',
                  fontWeight: 'bold',
                  margin: '40px 0 20px 10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedCategory('shirt')}
              >
                Shirt
              </h2>
              <img
                src="/images/shirt.webp"
                alt="Shirt Banner"
                className="category-banner"
                style={{
                  width: '100%',
                  maxWidth: '1200px',
                  height: '250px',
                  objectFit: 'cover',
                  margin: '0 auto 30px',
                  display: 'block',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedCategory('shirt')}
                loading="lazy"
              />
              {categoryLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading shirt products...</p>
                </div>
              ) : (
                <>
                  <section
                    className="products-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '20px 0px',
                      maxWidth: '1200px',
                      margin: '0 auto',
                    }}
                  >
                    {shirtProducts.map((product, index) => (
                      <div
                        key={product._id || product.title + index}
                        className="product-card"
                        style={{
                          textAlign: 'center',
                          border: '1px solid #eee',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: 'white',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <ScrollableProductImage
                          product={product}
                          productId={`shirt-${index}`}
                          showDiscountBadge={isFridayDiscount}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {(() => {
                            const { type, name } = parseProductTitle(product.title);
                            return (
                              <div className="product-title" style={{ margin: '10px 0', fontSize: '1.2em', textAlign: 'center' }}>
                                {type ? <span className="title-type">{type}</span> : null}
                                <span className="title-name">{name}</span>
                              </div>
                            );
                          })()}
                          {renderProductPrice(product)}
                        </div>
                      </div>
                    ))}
                  </section>
                </>
              )}
            </div>

            {/* T-shirt Section */}
            <div style={{ marginBottom: '60px' }}>
              <h2
                className="category-section-title"
                style={{
                  textAlign: 'start',
                  color: 'black',
                  fontSize: '1.5em',
                  fontWeight: 'bold',
                  margin: '40px 0 20px 10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedCategory('t-shirt')}
              >
                T-Shirt
              </h2>
              <img
                src="/images/t-shirt.webp"
                alt="T-shirt Banner"
                className="category-banner"
                style={{
                  width: '100%',
                  maxWidth: '1200px',
                  height: '250px',
                  objectFit: 'cover',
                  margin: '0 auto 30px',
                  display: 'block',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedCategory('t-shirt')}
                loading="lazy"
              />
              {categoryLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading t-shirt products...</p>
                </div>
              ) : (
                <>
                  <section
                    className="products-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '20px 0px',
                      maxWidth: '1200px',
                      margin: '0 auto',
                    }}
                  >
                    {tshirtProducts.map((product, index) => (
                      <div
                        key={product._id || product.title + index}
                        className="product-card"
                        style={{
                          textAlign: 'center',
                          border: '1px solid #eee',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: 'white',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <ScrollableProductImage
                          product={product}
                          productId={`tshirt-${index}`}
                          showDiscountBadge={isFridayDiscount}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {(() => {
                            const { type, name } = parseProductTitle(product.title);
                            return (
                              <div className="product-title" style={{ margin: '10px 0', fontSize: '1.2em', textAlign: 'center' }}>
                                {type ? <span className="title-type">{type}</span> : null}
                                <span className="title-name">{name}</span>
                              </div>
                            );
                          })()}
                          {renderProductPrice(product)}
                        </div>
                      </div>
                    ))}
                  </section>
                </>
              )}
            </div>

            {/* Hoodie Section */}
            <div style={{ marginBottom: '60px' }}>
              <h2
                className="category-section-title"
                style={{
                  textAlign: 'start',
                  color: 'black',
                  fontSize: '1.5em',
                  fontWeight: 'bold',
                  margin: '40px 0 20px 10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedCategory('hoodie')}
              >
                Hoodie
              </h2>
              <img
                src="/images/hoodie.webp"
                alt="Hoodie Banner"
                className="category-banner"
                style={{
                  width: '100%',
                  maxWidth: '1200px',
                  height: '250px',
                  objectFit: 'cover',
                  margin: '0 auto 30px',
                  display: 'block',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedCategory('hoodie')}
                loading="lazy"
              />
              {categoryLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading hoodie products...</p>
                </div>
              ) : (
                <>
                  <section
                    className="products-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '20px 0px',
                      maxWidth: '1200px',
                      margin: '0 auto',
                    }}
                  >
                    {hoodieProducts.map((product, index) => (
                      <div
                        key={product._id || product.title + index}
                        className="product-card"
                        style={{
                          textAlign: 'center',
                          border: '1px solid #eee',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: 'white',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <ScrollableProductImage
                          product={product}
                          productId={`hoodie-${index}`}
                          showDiscountBadge={isFridayDiscount}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {(() => {
                            const { type, name } = parseProductTitle(product.title);
                            return (
                              <div className="product-title" style={{ margin: '10px 0', fontSize: '1.2em', textAlign: 'center' }}>
                                {type ? <span className="title-type">{type}</span> : null}
                                <span className="title-name">{name}</span>
                              </div>
                            );
                          })()}
                          {renderProductPrice(product)}
                        </div>
                      </div>
                    ))}
                  </section>
                </>
              )}
            </div>

            {recentlyViewed.length > 0 && (
              <>
                <h2
                  style={{
                    textAlign: 'start',
                    color: 'black',
                    fontSize: '1.5em',
                    fontWeight: 'bold',
                    margin: '40px 0 20px 10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Recently viewed
                </h2>

                {/* Product grid */}
                <section
                  className="products-grid recently-viewed-grid"
                  style={{
                    display: 'grid',
                    gap: '20px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                  }}
                >
                  {recentlyViewed.map((product, index) => (
                    <div
                      key={product._id || product.title + index}
                      className="product-card"
                      style={{
                        textAlign: 'center',
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'white',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <ScrollableProductImage
                        product={product}
                        productId={`recent-${index}`}
                        showDiscountBadge={isFridayDiscount}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {(() => {
                          const { type, name } = parseProductTitle(product.title);
                          return (
                            <div className="product-title" style={{ margin: '10px 0', fontSize: '1.2em', textAlign: 'center' }}>
                              {type ? <span className="title-type">{type}</span> : null}
                              <span className="title-name">{name}</span>
                            </div>
                          );
                        })()}
                        {renderProductPrice(product)}
                      </div>
                    </div>
                  ))}
                </section>
              </>
            )}

            <Subcribe />
          </>
        )}
      </main>

      <footer className="site-footer fade-up mb-4">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>

      <Footer />
    </div>
  )
}

export default ProductPage


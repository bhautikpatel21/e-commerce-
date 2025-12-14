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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const sliderImages = ['/images/poster1.jpg', '/images/poster2.jpg', '/images/poster3.jpg', '/images/poster4.jpg']

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % sliderImages.length)
  }

  // Check if today is Friday on component mount
  useEffect(() => {
    setIsFridayDiscount(isFriday())
  }, [])

  // Auto-slide every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage()
    }, 2000)
    return () => clearInterval(interval)
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
        const shirtResponse = await getProductsByCategory('shirt', 1, 8)
        if (shirtResponse.isSuccess && shirtResponse.data) {
          setShirtProducts(Array.isArray(shirtResponse.data) ? shirtResponse.data : shirtResponse.data.products || [])
        }

        // Fetch t-shirt products
        const tshirtResponse = await getProductsByCategory('t-shirt', 1, 8)
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

      <Navbar onSelectCategory={setSelectedCategory} />

      {/* Image Slider */}
      <div style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', marginBottom: '20px' }}>
        <img
          src={sliderImages[currentImageIndex]}
          alt={`Poster ${currentImageIndex + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}>👕</span>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>Made with Premium Fabric</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}>🚚</span>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>Shipping within 24 hours</p>
        </div>
      </div>
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


            {/* Shirt Section */}
            <div style={{ marginBottom: '20px' }}>
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
                our collections
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
                          border: '1px solid black',
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid black', paddingTop: '10px' }}>
                          {(() => {
                            const { type, name } = parseProductTitle(product.title);
                            return (
                              <div className="product-title" style={{ margin: '10px 0', fontSize: '1em', textAlign: 'center' }}>
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
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className='bg-gray-700'
                      onClick={() => setSelectedCategory('t-shirt')}
                      style={{
                        padding: '10px 30px',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1em',
                      }}
                    >
                      View More
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Promotional Banner Section */}
            <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '0 auto 20px' }}>
              <h3 style={{ fontSize: '1.2em', margin: '0 0 15px 0' }}>Make Way for New Drip</h3>
              <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Explore the Season's New Styles</h2>
              <p style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '0 0 10px 0' }}>Extra 10% on Orders Above $2599</p>
              <p style={{ fontSize: '0.9em', color: '#666', margin: '0' }}>Discount auto-applied at checkout | Exclusions apply</p>
            </div>

            {/* T-shirt Section */}
            <div style={{ marginBottom: '20px' }}>
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
                          border: '1px solid black',
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid black', paddingTop: '10px' }}>
                          {(() => {
                            const { type, name } = parseProductTitle(product.title);
                            return (
                              <div className="product-title" style={{ margin: '10px 0', fontSize: '1em', textAlign: 'center' }}>
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
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className='bg-gray-700'
                      onClick={() => setSelectedCategory('t-shirt')}
                      style={{
                        padding: '10px 30px',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1em',
                      }}
                    >
                      View More
                    </button>
                  </div>
                </>
              )}
            </div>

            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '5px', borderRadius: '8px', margin: '20px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}>👕</span>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>Made with Premium Fabric</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}> 💸 </span>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>7 Days Easy Return & Exchange</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}>🚚</span>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>Shipping within 24 hours</p>
              </div>
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
                          border: '1px solid black',
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid black', paddingTop: '10px' }}>
                          {(() => {
                            const { type, name } = parseProductTitle(product.title);
                            return (
                              <div className="product-title" style={{ margin: '10px 0', fontSize: '1em', textAlign: 'center' }}>
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
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className='bg-gray-700'
                      onClick={() => setSelectedCategory('t-shirt')}
                      style={{
                        padding: '10px 30px',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1em',
                      }}
                    >
                      View More
                    </button>
                  </div>
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
                        border: '1px solid black',
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid black', paddingTop: '10px' }}>
                        {(() => {
                          const { type, name } = parseProductTitle(product.title);
                          return (
                            <div className="product-title" style={{ margin: '10px 0', fontSize: '1em', textAlign: 'center' }}>
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

      <footer className="site-footer fade-up">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>

      <Footer />
    </div>
  )
}

export default ProductPage

import React, { useState, useEffect } from 'react'
import { getProductsByCategory, getAllProducts } from '../Api'
import ScrollableProductImage from './ScrollableProductImage'
import { isFriday, calculateDiscountedPrice, formatPrice } from '../utils/discount'

// This component shows products for the selected category.
// Categories come from the API via the "category" field:
// "t-shirt", "shirt", "hoodie", etc. Use "all" to show everything.

const Category = ({ selectedCategory = 'all', onProductClick = () => {} }) => {
  const [productsData, setProductsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isFridayDiscount, setIsFridayDiscount] = useState(false)
  const pageSize = 30 // Products per page

  // Check if today is Friday on component mount
  useEffect(() => {
    setIsFridayDiscount(isFriday())
  }, [])

  useEffect(() => {
    // Reset to page 1 when category changes
    setCurrentPage(1)
  }, [selectedCategory])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        let response
        
        if (selectedCategory === 'all') {
          // Call getAllProducts - shows ALL products when "all" is selected from filter
          response = await getAllProducts(currentPage, pageSize)
        } else {
          // Call /product/get?pageNumber=X&category=Y for specific categories
          // This doesn't include showOnly, so it shows all products
          response = await getProductsByCategory(selectedCategory, currentPage, pageSize)
        }

        if (response.isSuccess && response.data) {
          // Handle different response structures
          if (Array.isArray(response.data)) {
            setProductsData(response.data)
            // If response doesn't include pagination info, estimate
            setTotalPages(Math.ceil(response.data.length / pageSize))
            setTotalProducts(response.data.length)
          } else if (response.data.products) {
            // Response has pagination structure
            setProductsData(response.data.products)
            setTotalPages(response.data.totalPages || 1)
            setTotalProducts(response.data.totalProducts || response.data.products.length)
          } else {
            setProductsData([])
            setTotalPages(1)
            setTotalProducts(0)
          }
        } else {
          setError('Failed to load products')
          setProductsData([])
        }
      } catch (err) {
        setError(err.message || 'Failed to load products')
        setProductsData([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, currentPage])

  const filteredProducts = productsData

  // Helper function to render product price with discount
  const renderProductPrice = (product) => {
    if (!product.price) return <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#333' }}>Price not available</p>
    
    if (isFridayDiscount) {
      const discountedPriceUSD = calculateDiscountedPrice(product.price)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <p
            style={{
              fontSize: '1em',
              fontWeight: 'normal',
              color: '#999',
              textDecoration: 'line-through',
              margin: 0,
            }}
          >
            {formatPrice(product.price)}
          </p>
          <p
            style={{
              fontSize: '1.1em',
              fontWeight: 'bold',
              color: '#333',
              margin: 0,
            }}
          >
            {formatPrice(discountedPriceUSD)}
          </p>
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

  const titleMap = {
    all: 'All Products',
    't-shirt': 'T‑Shirts',
    shirt: 'Shirts',
    hoodie: 'Hoodies',
  }

  const heading = titleMap[selectedCategory] || 'Products'

  if (loading) {
    return (
      <section className="category-section">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading products...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="category-section">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </section>
    )
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pageNumbers = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          margin: '40px 0',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: currentPage === 1 ? '#f5f5f5' : 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            color: currentPage === 1 ? '#999' : '#333',
            fontSize: '14px',
          }}
        >
          Previous
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                color: '#333',
                fontSize: '14px',
              }}
            >
              1
            </button>
            {startPage > 2 && <span style={{ padding: '0 5px' }}>...</span>}
          </>
        )}

        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: currentPage === pageNum ? '#333' : 'white',
              color: currentPage === pageNum ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: currentPage === pageNum ? 'bold' : 'normal',
            }}
          >
            {pageNum}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span style={{ padding: '0 5px' }}>...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                color: '#333',
                fontSize: '14px',
              }}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: currentPage === totalPages ? '#f5f5f5' : 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            color: currentPage === totalPages ? '#999' : '#333',
            fontSize: '14px',
          }}
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <section className="category-section">
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
        {heading}
        {totalProducts > 0 && (
          <span style={{ fontSize: '0.8em', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
            ({totalProducts} {totalProducts === 1 ? 'product' : 'products'})
          </span>
        )}
      </h2>

      {filteredProducts.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>No products found in this category.</p>
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
            {filteredProducts.map((product, index) => (
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
                onClick={() => onProductClick(product)}
              >
                <ScrollableProductImage
                  product={product}
                  productId={`category-${index}`}
                  showDiscountBadge={isFridayDiscount}
                />
                <h3 style={{ margin: '10px 0', fontSize: '1.2em' }}>
                  {product.title}
                </h3>
                {renderProductPrice(product)}
              </div>
            ))}
          </section>

          {renderPagination()}
        </>
      )}
    </section>
  )
}

export default Category
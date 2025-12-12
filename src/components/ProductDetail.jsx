import React, { useState } from 'react';
import { addToCart } from '../Api';
import Toast from './Toast';
import Celebration from './Celebration';

const ProductDetail = ({ product, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [celebrate, setCelebrate] = useState(0);

  const images = [product.mainImage, ...product.sideImages.slice(0, 3)]; // Up to 4 images

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async () => {
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
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    alert(`Proceeding to checkout for ${product.title} size ${selectedSize}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Celebration trigger={celebrate} />
      <div className="bg-white max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold z-10"
        >
          ×
        </button>
        <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-8">
          {/* Left: Media Panel */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <img
                src={images[selectedImageIndex] || product.mainImage}
                alt={product.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.title} view ${index + 1}`}
                  className={`w-full h-20 object-cover rounded cursor-pointer transition-all ${
                    selectedImageIndex === index ? 'border-2 border-black' : 'border border-gray-200'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Right: Product Panel */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm inline-block mb-2">
              10 people viewing right now
            </div>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="flex gap-2 mb-4">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedSize === size
                      ? 'bg-black text-white scale-105 shadow-lg'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-105'
                  }`}
                  style={{
                    transform: selectedSize === size ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: selectedSize === size ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="text-2xl font-bold mb-4">
              {product.price ? `₹${(product.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'Price not available'}
            </div>
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-white border border-black text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Buy Now
              </button>
            </div>
            <div className="flex gap-4 mb-6 text-sm text-gray-600">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>PayPal</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>Free shipping on orders over ₹500. Returns within 7 days.</p>
              <p className="mt-2">Category: {product.category}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

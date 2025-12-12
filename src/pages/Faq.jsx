import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

const Faq = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const faqs = [
    {
      question: "What is The Bear House?",
      answer: "The Bear House is a premium menswear brand focused on timeless, comfortable clothing designed for modern gentlemen. We create pieces that blend European minimalism with Indian craftsmanship."
    },
    {
      question: "How do I care for my Bear House garments?",
      answer: "We recommend machine washing in cold water, tumble drying on low heat, or air drying. Avoid bleach and iron on low heat. Our fabrics are designed to maintain their shape and comfort over time."
    },
    {
      question: "What sizes do you offer?",
      answer: "We offer sizes from S to XXL. Our sizing is based on standard measurements. Please refer to our size chart for detailed measurements to ensure the best fit."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship worldwide. Shipping costs and delivery times vary by location. Free shipping is available on orders above ₹500 within India."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unused items in original condition. Returns are free within India. International returns may incur shipping costs."
    },
    {
      question: "Are your products sustainable?",
      answer: "Yes, we prioritize sustainable practices. Our fabrics are sourced responsibly, and we use eco-friendly packaging. We're committed to slow fashion principles."
    },
    {
      question: "How long does shipping take?",
      answer: "Orders are typically processed within 1-2 business days. Domestic shipping takes 3-5 days, while international shipping can take 7-14 days depending on the destination."
    },
    {
      question: "Can I track my order?",
      answer: "Yes, you'll receive a tracking number via email once your order ships. You can track your package through our website or the carrier's tracking system."
    }
  ]

  return (
    <div className="page-shell">
      <marquee className="announcement-bar fade-down" direction="right" behavior="scroll" scrollamount="20">
        <p>TBH is better on the app · Flat ₹300 off on your first order</p>
      </marquee>

      <Navbar />

      <main className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-4xl font-bold text-gray-900 mb-4 mt-6"
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 }
              }}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
            >
              Frequently Asked Questions
            </motion.h1>
            <p className="text-lg text-gray-600">Find answers to common questions about The Bear House</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div
                  className="p-6 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center justify-between">
                    <motion.h3
                      className="text-lg font-semibold text-gray-900 pr-4"
                      whileHover={{ color: "#000" }}
                    >
                      {faq.question}
                    </motion.h3>
                    <motion.div
                      className="transform transition-transform duration-300"
                      animate={{ rotate: hoveredIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.div
                        className="mt-4 overflow-hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a href="mailto:support@thebearhouse.com" className="inline-block bg-black mb-6 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300">
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />

      <footer className="site-footer fade-up">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>
    </div>
  )
}

export default Faq

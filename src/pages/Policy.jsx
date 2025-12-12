import React from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

const Policy = () => {
  const policies = [
    {
      title: "Shipping Policy",
      content: [
        {
          heading: "Processing Time",
          text: "Orders are typically processed within 1-2 business days after payment confirmation. Custom orders may take longer."
        },
        {
          heading: "Shipping Rates",
          text: "Shipping costs are calculated based on order weight, dimensions, and destination. Free shipping is available on orders above ₹500 within India."
        },
        {
          heading: "Delivery Time",
          text: "Domestic shipping: 3-5 business days. International shipping: 7-14 business days. Delivery times may vary during peak seasons."
        },
        {
          heading: "International Shipping",
          text: "We ship worldwide. Import duties and taxes are the responsibility of the recipient. Additional charges may apply."
        }
      ]
    },
    {
      title: "Return & Exchange Policy",
      content: [
        {
          heading: "Return Window",
          text: "Items can be returned within 30 days of delivery. Items must be unused, unworn, and in original packaging with tags attached."
        },
        {
          heading: "Exchange Process",
          text: "Exchanges are accepted within 30 days. Contact our support team to initiate an exchange. Size exchanges are preferred over returns."
        },
        {
          heading: "Return Shipping",
          text: "Return shipping is free within India for defective items. For other returns, customers are responsible for return shipping costs."
        },
        {
          heading: "Refunds",
          text: "Refunds are processed within 5-7 business days after receiving the returned item. Original payment method will be used for refunds."
        }
      ]
    },
    {
      title: "Privacy Policy",
      content: [
        {
          heading: "Information Collection",
          text: "We collect personal information necessary for order processing, including name, email, shipping address, and payment information."
        },
        {
          heading: "Data Usage",
          text: "Your information is used solely for order fulfillment, customer service, and to improve our services. We do not sell or share personal data."
        },
        {
          heading: "Data Security",
          text: "We implement industry-standard security measures to protect your personal information. Payment data is encrypted and processed securely."
        },
        {
          heading: "Cookies",
          text: "We use cookies to enhance your browsing experience and analyze website traffic. You can disable cookies in your browser settings."
        }
      ]
    },
    {
      title: "Terms of Service",
      content: [
        {
          heading: "Acceptance of Terms",
          text: "By accessing and using our website, you accept and agree to be bound by the terms and provision of this agreement."
        },
        {
          heading: "Product Information",
          text: "We strive to provide accurate product descriptions and images. Colors may vary slightly due to monitor settings and photography lighting."
        },
        {
          heading: "Pricing",
          text: "All prices are subject to change without notice. The price listed at the time of purchase will be honored for that transaction."
        },
        {
          heading: "Limitation of Liability",
          text: "The Bear House shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products."
        }
      ]
    }
  ]

  return (
    <div className="page-shell">
      <marquee className="announcement-bar fade-down" direction="right" behavior="scroll" scrollamount="20">
        <p>TBH is better on the app · Flat ₹300 off on your first order</p>
      </marquee>

      <Navbar />

      <main className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-6 mt-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-4xl font-bold text-gray-900 mb-4"
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 }
              }}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
            >
              Policies & Terms
            </motion.h1>
            <p className="text-lg text-gray-600">Important information about our services and your rights</p>
          </motion.div>

          <div className="space-y-8">
            {policies.map((policy, policyIndex) => (
              <motion.div
                key={policyIndex}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: policyIndex * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="bg-black text-white px-6 py-4">
                  <h2 className="text-xl font-bold">{policy.title}</h2>
                </div>
                <div className="p-6 space-y-6">
                  {policy.content.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: (policyIndex * 0.1) + (itemIndex * 0.1) }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.heading}</h3>
                      <p className="text-gray-700 leading-relaxed">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12 bg-white rounded-lg shadow-md p-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-6">If you have any questions about our policies or need assistance, please don't hesitate to contact us.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="mailto:support@thebearhouse.com"
                className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Email Support
              </motion.a>
              <motion.a
                href="tel:+919876543210"
                className="inline-block border border-black text-black px-6 py-3 rounded-lg hover:bg-black hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Call Us
              </motion.a>
            </div>
          </motion.div>
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

export default Policy

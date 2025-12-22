import React from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

const Policy = () => {
  const policies = [
    {
      title: "Privacy Policy",
      content: [
        {
          heading: "Introduction",
          text: "At The Wolf Street, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you visit or make a purchase from our website."
        },
        {
          heading: "Information We Collect",
          text: "We may collect the following information: Personal details such as name, email address, phone number, and shipping/billing address; Payment information (processed securely through third‑party payment gateways; we do not store card details); Order history and purchase preferences; Device information such as IP address, browser type, and cookies."
        },
        {
          heading: "How We Use Your Information",
          text: "Your information is used to: Process and deliver orders; Communicate order updates and customer support; Improve our website, products, and services; Send promotional emails (only if you opt‑in); Prevent fraud and ensure secure transactions."
        },
        {
          heading: "Data Security",
          text: "We implement appropriate security measures to protect your personal data. However, no method of transmission over the internet is 100% secure."
        },
        {
          heading: "Third‑Party Sharing",
          text: "We do not sell or trade your personal information. Data may be shared only with trusted partners such as payment gateways and shipping providers to fulfill your order."
        },
        {
          heading: "Your Rights",
          text: "You may request access, correction, or deletion of your personal data by contacting us."
        }
      ]
    },
    {
      title: "Return & Refund Policy",
      content: [
        {
          heading: "Eligibility for Returns",
          text: "Items must be returned within 7 days of delivery. Products must be unused, unworn, and in original packaging with tags. Sale or discounted items may not be eligible for return."
        },
        {
          heading: "Refund Process",
          text: "Once we receive and inspect the returned item, we will notify you of approval or rejection. Approved refunds will be processed to the original payment method within 5–7 business days."
        },
        {
          heading: "Exchange Policy",
          text: "Exchanges are subject to product availability. If unavailable, a refund will be issued."
        }
      ]
    },
    {
      title: "Terms and Conditions",
      content: [
        {
          heading: "General",
          text: "By accessing and using the The Wolf Street website, you agree to comply with these Terms and Conditions."
        },
        {
          heading: "Products & Pricing",
          text: "All prices are listed in applicable currency and include taxes unless stated otherwise. Prices and product availability are subject to change without notice."
        },
        {
          heading: "Orders",
          text: "We reserve the right to cancel orders due to stock issues, pricing errors, or suspected fraud. Order confirmation does not guarantee acceptance of the order."
        },
        {
          heading: "Intellectual Property",
          text: "All content on this website (logos, images, text) is the property of The Wolf Street and may not be used without permission."
        },
        {
          heading: "Limitation of Liability",
          text: "The Wolf Street is not liable for indirect or incidental damages arising from the use of our products or website."
        }
      ]
    },
    {
      title: "Contact Information",
      content: [
        {
          heading: "Get in Touch",
          text: "If you have any questions or concerns, you can contact us using the details below: Brand Name: The Wolf Street; Email: thewolfstreetindia@gmail.com; Phone: +919904699062; Business Hours: Monday to Saturday, 9:00 AM – 6:00 PM. We aim to respond to all queries within 24–48 hours."
        }
      ]
    },
    {
      title: "Shipping Policy",
      content: [
        {
          heading: "Shipping Locations",
          text: "We currently ship across India. International shipping may be available in the future."
        },
        {
          heading: "Processing Time",
          text: "Orders are processed within 1–3 business days after confirmation. Orders placed on weekends or holidays will be processed on the next business day."
        },
        {
          heading: "Delivery Time",
          text: "Standard delivery: 4–7 business days depending on location. Delays may occur due to unforeseen circumstances or courier issues."
        },
        {
          heading: "Shipping Charges",
          text: "Shipping charges (if applicable) will be displayed at checkout."
        },
        {
          heading: "Tracking",
          text: "Once your order is shipped, you will receive a tracking link via email or SMS."
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
                href="mailto:thewolfstreetindia@gmail.com"
                className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Email Support
              </motion.a>
              <motion.a
                href="tel:+919904699062"
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
        <p>Crafted & marketed by The Wolf Street · India</p>
        <small>Reference design inspired by MITOK product page on The Wolf Street</small>
      </footer>
    </div>
  )
}

export default Policy


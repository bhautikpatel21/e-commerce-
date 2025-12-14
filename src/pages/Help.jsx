import React from 'react';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaUser, FaShoppingCart, FaHeadset, FaEnvelope, FaPhone } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Help = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const helpTopics = [
    {
      icon: <FaUser className="text-4xl text-blue-500" />,
      title: 'Account Issues',
      description: 'Trouble logging in, resetting passwords, or managing your account? We\'ve got you covered.',
    },
    {
      icon: <FaShoppingCart className="text-4xl text-green-500" />,
      title: 'Orders & Shipping',
      description: 'Questions about placing orders, tracking shipments, or returns? Find answers here.',
    },
    {
      icon: <FaHeadset className="text-4xl text-purple-500" />,
      title: 'Technical Support',
      description: 'Facing issues with our website or app? Our tech team is here to help.',
    },
  ];

  return (
    <div className="page-shell">
      <marquee
        className="announcement-bar fade-down"
        direction="right"
        behavior="scroll"
        scrollamount="20"
      >
        <p>TBH is better on the app · Flat ₹300 off on your first order</p>
      </marquee>

      <Navbar />

      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        {/* Hero Section */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <motion.h1
            className="text-4xl md:text-4xl font-bold text-gray-900 mb-4 pt-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            How Can We Help You?
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Browse our help topics or get in touch with our support team.
          </motion.p>
        </motion.div>

        {/* Help Topics */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12" variants={containerVariants}>
          {helpTopics.map((topic, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="flex justify-center mb-4"
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {topic.icon}
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{topic.title}</h3>
              <p className="text-gray-600 text-center">{topic.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div className="bg-white p-8 rounded-lg shadow-lg" variants={itemVariants}>
          <motion.h2
            className="text-3xl font-bold text-gray-900 mb-6 text-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            Still Need Help?
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-6 text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Our support team is here to assist you. Reach out to us through the following channels.
          </motion.p>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={containerVariants}>
            <motion.div
              className="flex items-center space-x-4"
              variants={itemVariants}
              whileHover={{ x: 10 }}
            >
              <FaEnvelope className="text-2xl text-blue-500" />
              <div>
                <h4 className="font-semibold text-gray-900">Email Support</h4>
                <p className="text-gray-600">support@example.com</p>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center space-x-4"
              variants={itemVariants}
              whileHover={{ x: 10 }}
            >
              <FaPhone className="text-2xl text-green-500" />
              <div>
                <h4 className="font-semibold text-gray-900">Phone Support</h4>
                <p className="text-gray-600">1-800-HELP-NOW</p>
              </div>
            </motion.div>
          </motion.div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="site-footer fade-up">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>

      <Footer />
    </div>
  );
};

export default Help;

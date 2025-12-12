import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Subscribe from '../components/Subcribe';
import '../App.css';

const Newsletter = () => {
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

      <main className="min-h-screen text-slate-900 pb-10">
        <Subscribe />
      </main>

      <Footer />

      <footer className="site-footer fade-up">
        <p>Crafted & marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>
    </div>
  );
};

export default Newsletter;

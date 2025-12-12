import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Ourshop = () => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate('/');
  };

  const handleViewCollections = () => {
    navigate('/');
  };

  return (
    <div className="page-shell">
      <marquee
        className="announcement-bar fade-down"
        direction="right"
        behavior="scroll"
        scrollAmount="20"
      >
        <p>TBH is better on the app · Flat ₹300 off on your first order</p>
      </marquee>

      <Navbar />

      <main className="min-h-screen text-slate-900 pb-10">
        {/* Hero Section with Background Video */}
        <section className="relative w-full mx-auto overflow-hidden sm:rounded-2xl mt-10 shadow-2xl">
        <video
          className="w-full h-[460px] md:h-[520px] object-cover"
          src="/images/bg-video-hero-section.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-linear-to-tr from-black/70 via-slate-900/40 to-transparent" />

        <div className="absolute inset-0 px-6 sm:px-10 lg:px-14 py-10 flex flex-col justify-center text-white">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-slate-200/80 mb-4 animate-fadeIn">
            Welcome to Our Shop
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight max-w-2xl animate-fadeUp">
            Discover Beauty &amp; Style
            <span className="block text-amber-300 font-bold">
              Curated For You
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-200/90 animate-fadeUp delay-100">
            Handpicked collections, premium quality, and a smooth shopping experience –
            all in one place. Explore our latest arrivals and timeless bestsellers.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 items-center animate-fadeUp delay-150">
            <button onClick={handleShopNow} className="px-6 py-2.5 rounded-full bg-white text-slate-900 text-sm font-semibold shadow-lg shadow-slate-900/30 hover:-translate-y-0.5 hover:shadow-xl transition">
              Shop Now
            </button>
            <button onClick={handleViewCollections} className="px-6 py-2.5 rounded-full border border-white/40 text-sm font-semibold text-white/90 backdrop-blur hover:bg-white/10 transition">
              View Collections
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 sm:gap-8 text-xs sm:text-sm animate-fadeUp delay-200">
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-semibold">2K+</span>
              <span className="text-slate-200/80">Happy Customers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-semibold">150+</span>
              <span className="text-slate-200/80">Exclusive Products</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-semibold">24/7</span>
              <span className="text-slate-200/80">Support</span>
            </div>
          </div>
        </div>
        </section>

        {/* Middle Feature Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 mt-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5 animate-fadeUp">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-slate-500">
            Why Shop With Us?
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Elevate your everyday routine
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            From skincare essentials to lifestyle accessories, our shop is designed
            to make your daily rituals feel special. We carefully select products
            that balance quality, design, and value.
          </p>
          <ul className="space-y-3 text-sm sm:text-base text-slate-700">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Premium, tested quality products</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Fast, reliable shipping worldwide</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Easy returns &amp; friendly support</span>
            </li>
          </ul>
        </div>

        <div className="relative animate-fadeUp md:animate-fadeIn">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-400/40">
            <img
              src="/images/middleImage.webp"
              alt="Our shop products"
              className="w-full h-72 sm:h-80 md:h-96 object-cover scale-[1.02] hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-5 left-5 sm:left-8 bg-white/90 backdrop-blur px-4 sm:px-5 py-2.5 rounded-2xl shadow-lg text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Top Rated • 4.9/5
          </div>
        </div>
        </section>

        {/* Download / App Promo Section */}
        <section className="relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 mt-16 mb-16 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-emerald-100/20 opacity-50" />
          <div className="relative grid lg:grid-cols-[1.2fr,0.9fr] gap-10 items-start">
            <div className="space-y-6 animate-fadeUp">
              <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-slate-500">
                Shop On The Go
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                Download our shopping experience
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Stay connected with new drops, limited offers, and personalized
                recommendations. Access your wishlist and orders anytime, anywhere.
              </p>

              <div className="flex flex-wrap gap-4 mt-6">
                <button className="flex items-center gap-3 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                  <img
                    src="/images/download.jpg"
                    alt="Download app"
                    className="h-10 w-10 rounded-xl object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="text-left">
                    <span className="block text-[0.7rem] uppercase tracking-wide text-slate-200">
                      Available on
                    </span>
                    <span className="block text-sm font-semibold">
                      App Store
                    </span>
                  </div>
                </button>

                <button className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <img
                    src="/images/download2.jpg"
                    alt="Download app alternative"
                    className="h-10 w-10 rounded-xl object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="text-left">
                    <span className="block text-[0.7rem] uppercase tracking-wide text-slate-500">
                      Get it on
                    </span>
                    <span className="block text-sm font-semibold text-slate-900">
                      Play Store
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid gap-4 animate-fadeUp lg:animate-fadeIn">
              <div className="rounded-2xl bg-white shadow-md p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                    Real-time updates
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 ml-11">
                  Be the first to know about exclusive launches and private sales.
                </p>
              </div>
              <div className="rounded-2xl bg-white shadow-md p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                    Secure checkout
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 ml-11">
                  Encrypted payments and multiple secure options for peace of mind.
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg p-5 border border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-amber-400 group-hover:bg-amber-300 transition-colors">
                    <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base">
                    Personalized picks
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 ml-11">
                  Receive product suggestions tailored to your style and routine.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Scroll hint */}
        <div className="flex flex-col items-center justify-center text-[0.7rem] sm:text-xs text-slate-500 pb-6 animate-bounce">
          <span>Scroll to explore more</span>
          <span className="mt-1 h-8 w-px bg-linear-to-b from-slate-400 to-transparent" />
        </div>
      </main>

      <Footer />

      <footer className="site-footer fade-up">
        <p>Crafted &amp; marketed by Bear House Clothing Pvt Ltd · Bengaluru, India</p>
        <small>Reference design inspired by MITOK product page on The Bear House</small>
      </footer>
    </div>
  );
};

export default Ourshop;
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full border-t py-6 sm:py-10 text-black" style={{ marginBottom: 0 }}>
      <div className="flex justify-center mb-6">
        <img src="/logo.jpg" alt="Logo" className="h-10 w-auto" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6 px-4 sm:px-6 text-sm uppercase tracking-wide font-semibold">

        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <Link to="/help" className="hover-effect">Help</Link>
          <Link to="/policy" className="hover-effect">Return Policy</Link>
          {/* <Link to="/faq" className="hover-effect">FAQ</Link> */}
        </div>

        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {/* <Link to="/about" className="hover-effect">About Us</Link> */}
          <Link to="/newsletter" className="hover-effect">Newsletter</Link>
          <Link to="/policy" className="hover-effect">Shipping Policy</Link>
        </div>

        <div className="flex flex-col gap-2 items-center sm:gap-3">
          <a href="/policy" className="hover-effect">Term & service</a>
        </div>

        <div className="flex flex-col gap-2 items-center sm:gap-3">
          {/* <Link to="/ourshop" className="hover-effect">Our Store</Link> */}
          <Link to="/newsletter" className="hover-effect">Newsletter</Link>
        </div>
      </div>

      <p className="text-xs text-center mt-6 sm:mt-10 mb-0 pb-0">
        © 2025 BEAR THE WOLF STREET  LIMITED
      </p>
    </footer>
  );
};

export default Footer;

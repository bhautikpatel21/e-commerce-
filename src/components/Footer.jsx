import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t py-10 text-black">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10 px-6 text-sm uppercase tracking-wide font-semibold">
        
        <div className="flex flex-col gap-3">
          <Link to="/help" className="hover-effect">Help</Link>
          <Link to="/faq" className="hover-effect">FAQ</Link>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/about" className="hover-effect">About Us</Link>
          <Link to="/policy" className="hover-effect">Shipping Policy</Link>
        </div>

        <div className="flex flex-col gap-3">
          <a href="/policy" className="hover-effect">Term & service</a>
          <Link to="/policy" className="hover-effect">Return / Exchange Policy</Link>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/ourshop" className="hover-effect">Our Store</Link>
          <Link to="/newsletter" className="hover-effect">Newsletter</Link>
        </div>
      </div>

      <p className="text-xs text-center mt-10">
        © 2025 BEAR HOUSE CLOTHING PRIVATE LIMITED All rights reserved
      </p>
    </footer>
  );
};

export default Footer;

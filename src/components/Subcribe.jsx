import React, { useState } from "react";
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const Subscribe = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (email.trim() !== "") {
      setSubscribed(true);
    }
  };

  return (
    <div className="relative w-full mt-6 px-12">
      <div className="absolute inset-0" style={{ backgroundImage: 'url(/images/subcribe.webp)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 0.5 }}></div>
      <div className="relative z-10 flex flex-col items-center w-full py-12 text-center gap-6">
        <h2 className="text-2xl font-bold uppercase tracking-wide">
          SIGN UP AND SAVE
        </h2>
        <p className="text-gray-600">Subscribe to get special offers</p>

        {!subscribed ? (
          <div className="flex flex-col gap-2 w-full max-w-md">
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-400 rounded px-4 py-1 w-full outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleSubscribe}
              className="bg-black text-white font-semibold w-full py-2"
            >
              SIGN UP NOW
            </button>
          </div>
        ) : (
          <p className="text-green-600 font-semibold text-lg">
            Thank you for subscribing! 🎉
          </p>
        )}

        {/* Social Icons */}
        <div className="flex gap-5 text-2xl mt-4">
          <FaInstagram />
          <FaFacebook />
          <FaYoutube />
          <RxCross2 />
          <FaLinkedin />
        </div>

        {/* Download App */}
        <p className="text-lg font-medium mt-6">DOWNLOAD OUR APP</p>
        <div className="flex gap-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
            alt="Google Play"
            className="w-36 cursor-pointer"
          />
          <img
            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
            alt="App Store"
            className="w-36 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Subscribe;

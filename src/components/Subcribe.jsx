import React, { useState } from "react";
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { sendMail } from "../Api";
import Toast from "./Toast";

const Subscribe = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleSubscribe = async () => {
    if (email.trim() === "") {
      setToast({ show: true, message: 'Please enter your email address', type: 'error' });
      return;
    }
    
    try {
      await sendMail(email);
      setSubscribed(true);
      setToast({ show: true, message: 'Successfully subscribed! 🎉', type: 'success' });
    } catch (error) {
      console.error("Error sending email:", error);
      setToast({ show: true, message: 'Enter valid email address.', type: 'error' });
    }
  };

  return (
    <div className="relative w-full h-[500px] mt-6 px-12">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      <div className="absolute inset-0 h-[500px] flex justify-center items-center" style={{ backgroundImage: 'url(/images/subcribe.webp)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 0.5 }}></div>
      <div className="relative z-10 flex flex-col items-center justify-center w-full py-12 text-center gap-6">
        <h2 className="text-2xl font-bold uppercase tracking-wid mt-18">
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
              SUBSCRIB NOW
            </button>
          </div>
        ) : (
          <p className="text-green-600 font-semibold text-lg">
            Thank you for subscribing! 🎉
          </p>
        )}

      </div>
    </div>
  );
};

export default Subscribe;

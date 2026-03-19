import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function VerifyOtp() {

  const [otp, setOtp] = useState("")
  const location = useLocation();
  const navigate = useNavigate();

  const email = location?.state.email;

  useEffect(() => {
    if (location.state?.message) {
      toast(location.state.message);
    }
  }, []);

  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP")
      return;
    }

    const res = await fetch("http://localhost:4000/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        otp
      })

    })
    const data = await res.json();

    if (res.ok) {
      navigate("/login", {
        state: {
          message: data.message,
          email
        }
      });
    } else {
      toast.error(data.message);
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <ToastContainer />
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-4">
          Verify OTP
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Enter the OTP sent to your email
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <button
          onClick={verifyOtp}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
        >
          Verify OTP
        </button>

      </div>
    </div>
  );
}



export default VerifyOtp

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validateVerify2FA } from "../utils/validator";
import { API_URL } from "../services/api";

function Verify2FA() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast(location.state.message);
    }
  }, []);

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const verifyOTP = async () => {
    const error = validateVerify2FA({ userId, code });
    if (error) {
      toast.error(error);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          code,
        }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        if (data.role === "admin") {
          navigate("/admin", {
            state: { message: data.message },
          });
        } else {
          navigate("/", {
            state: { message: data.message },
          });
        }
      } else {
        toast(data.message);
      }
    } catch (error) {
      console.log(error);
      toast("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 py-10">
      <ToastContainer />

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
          Verify OTP
        </h2>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setCode(e.target.value)}
        />

        <button
          onClick={verifyOTP}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}

export default Verify2FA;

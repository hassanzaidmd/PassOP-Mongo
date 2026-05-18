import { useParams } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validateResetPassword } from "../utils/validator";
import { API_URL } from "../services/api";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async () => {
    const error = validateResetPassword({ password });
    if (error) return toast.error(error);

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      toast(data.message);
    } catch (error) {
      toast.error("Reset failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-16">
      <ToastContainer />

      <div className="bg-white shadow-lg p-18 rounded-xl w-96">
        <h1 className="text-4xl text font-bold text-center">
          <span className="text-green-500"> &lt;</span>

          <span>Pass</span>
          <span className="text-green-500">OP/&gt;</span>
        </h1>
        <p className="text-green-900 text-lg text-center">
          Your own Password Manager
        </p>

        <h2 className="text-2xl font-bold my-6 text-center">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="Enter new password"
          className="border w-full p-3 rounded mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={resetPassword}
          disabled={isLoading}
          className="bg-indigo-600 text-white w-full p-3 rounded disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;

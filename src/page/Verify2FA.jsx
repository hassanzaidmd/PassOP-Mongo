import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Verify2FA() {

    const [code, setCode] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const userId = location.state?.userId;

    // 🔒 Redirect if userId missing
    useEffect(() => {
        if (!userId) {
            navigate("/login");
        }
    }, [userId, navigate]);

    const verifyOTP = async () => {

        if (!code) {
            toast("Please enter OTP");
            return;
        }

        try {
            const res = await fetch("http://localhost:4000/api/auth/verify-2fa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId,
                    code
                })
            });

            const data = await res.json();

            if (data.token) {

                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);

                toast("Login successful");

                if (data.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }

            } else {
                toast(data.message);
            }

        } catch (error) {
            console.log(error);
            toast("Something went wrong");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">

            <div className="bg-white p-8 rounded-2xl shadow-lg w-96">

                <h2 className="text-2xl font-bold text-center mb-6">
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
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition"
                >
                    Verify
                </button>

            </div>

        </div>
    );
}

export default Verify2FA;
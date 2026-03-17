import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const loginUser = async () => {

    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      alert("Invalid credentials");
    }
  }

  return (
    <div className=" flex pt-15 items-center justify-center ">

      <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]"></div></div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-10">

      <h1 className='text-4xl text font-bold text-center'>
        <span className='text-green-500'> &lt;</span>

        <span>Pass</span><span className='text-green-500'>OP/&gt;</span>

      </h1>
      <p className='text-green-900 text-lg text-center'>Your own Password Manager</p>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome Back
        </h2>

        <div className="flex flex-col gap-5">

          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <button
            onClick={loginUser}
            className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Login
          </button>

        </div>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline ml-1"
          >
            Register
          </Link>
        </p>
        <p className="text-center text-gray-600 mt-2">
          <Link
            to="/forgot-password"
            className="text-indigo-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;
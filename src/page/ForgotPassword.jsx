import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validate } from "../../backend/utils/validator";

function ForgotPassword() {

  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    
    const isValid = validate({email});
    if (!isValid) return;

    const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();


    toast(data.message);

  }

  return (
    <div className="flex justify-center items-center py-16">
      <ToastContainer />

      <div className="bg-white shadow-lg p-18 rounded-xl w-96">
        <h1 className='text-4xl text font-bold text-center'>
          <span className='text-green-500'> &lt;</span>

          <span>Pass</span><span className='text-green-500'>OP/&gt;</span>

        </h1>
        <p className='text-green-900 text-lg text-center'>Your own Password Manager</p>

        <h2 className="text-2xl font-bold my-6 text-center">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="border w-full p-3 rounded mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white w-full p-3 rounded"
        >
          Send Reset Link
        </button>

      </div>

    </div>
  );
}

export default ForgotPassword;
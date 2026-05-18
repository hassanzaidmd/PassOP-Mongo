import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const token = localStorage.getItem("token");

  const logout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-slate-800 text-white">
      <div className="myContainer flex justify-between items-center px-4 py-5 h-14">
        <div className="cursor-pointer logo font-bold text-white text-2xl">
          <span className="text-green-500 ">&lt;</span>
          <span>Pass</span>
          <span className="text-green-500">OP/&gt;</span>
        </div>

        <div className="btns flex gap-2.5">
          <button className="text-white bg-green-700 my-5 mx-2 rounded-full flex cursor-pointer justify-between items-center ring-white ring-1">
            <img
              className="invert w-10 p-1"
              src="/icons/github.svg"
              alt="github logo"
            />
            <span className="font-bold px-2">GitHub</span>
          </button>

          {token && (
            <button
              type="button"
              onClick={logout}
              disabled={isLoggingOut}
              className="text-white bg-green-700 my-5 mx-2 rounded-full flex cursor-pointer justify-between items-center ring-white ring-1 disabled:cursor-not-allowed"
            >
              <lord-icon
                src="https://cdn.lordicon.com/zifyscfa.json"
                trigger="hover"
                stroke="bold"
                colors="primary:#ffffff,secondary:#ffffff"
                style={{ width: "35px", height: "35px" }}
              ></lord-icon>
              <span className="font-bold px-2">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

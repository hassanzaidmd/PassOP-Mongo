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
      <div className="myContainer flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center py-4 sm:py-5">
        <div className="cursor-pointer logo font-bold text-white text-xl sm:text-2xl whitespace-nowrap">
          <span className="text-green-500 ">&lt;</span>
          <span>Pass</span>
          <span className="text-green-500">OP/&gt;</span>
        </div>

        <div className="btns flex flex-wrap gap-2">
          <button className="text-white bg-green-700 rounded-full flex cursor-pointer justify-between items-center ring-white ring-1 px-3 py-1.5 sm:px-0 sm:py-0">
            <img
              className="invert w-8 sm:w-10 p-1"
              src="/icons/github.svg"
              alt="github logo"
            />
            <span className="font-bold px-2 text-sm sm:text-base">GitHub</span>
          </button>

          {token && (
            <button
              type="button"
              onClick={logout}
              disabled={isLoggingOut}
              className="text-white bg-green-700 rounded-full flex cursor-pointer justify-between items-center ring-white ring-1 disabled:cursor-not-allowed px-3 py-1.5 sm:px-0 sm:py-0"
            >
              <lord-icon
                src="https://cdn.lordicon.com/zifyscfa.json"
                trigger="hover"
                stroke="bold"
                colors="primary:#ffffff,secondary:#ffffff"
                style={{ width: "32px", height: "32px" }}
              ></lord-icon>
              <span className="font-bold px-2 text-sm sm:text-base">
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

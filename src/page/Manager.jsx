import React, { useEffect, useRef, useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useLocation } from "react-router-dom";
import useSearch from "../hooks/useSearch";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validatePasswordEntry } from "../utils/validator";
import { API_URL } from "../services/api";

function Manager() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast(location.state.message);
    }
  }, []);

  const ref = useRef();
  const passRef = useRef();
  const [form, setform] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setpasswordArray] = useState([]);
  const [isLoadingPasswords, setIsLoadingPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const token = localStorage.getItem("token");
  const keys = useMemo(() => ["site", "username"], []);
  const { search, setSearch, filteredData } = useSearch(passwordArray, keys);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getPassword = async () => {
    setIsLoadingPasswords(true);
    try {
      const req = await fetch(`${API_URL}`, {
        headers: {
          Authorization: token,
        },
      });
      const passwords = await req.json();
      setpasswordArray(passwords);
    } finally {
      setIsLoadingPasswords(false);
    }
  };

  useEffect(() => {
    getPassword();
  }, []);

  function showPassword() {
    if (ref.current.src.includes("eye.png")) {
      ref.current.src = "icons/eyecross.png";
      passRef.current.type = "text";
    } else {
      ref.current.src = "icons/eye.png";
      passRef.current.type = "password";
    }
  }

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const savePassword = async () => {
    const error = validatePasswordEntry({
      site: form.site,
      username: form.username,
      password: form.password,
    });
    if (error) return toast.error(error);

    setIsSaving(true);
    try {
      if (form.id) {
        await fetch(`${API_URL}/${form.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(form),
        });

        const res = await fetch(`${API_URL}`, {
          headers: {
            Authorization: token,
          },
        });
        const data = await res.json();
        setpasswordArray(data);
        toast("Password saved!");
      } else {
        const newEntry = { ...form, id: uuidv4() };
        await fetch(`${API_URL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(newEntry),
        });
        setpasswordArray((prev) => [...prev, newEntry]);
        toast("Password saved!");
      }
      setform({ site: "", username: "", password: "" });
    } catch (error) {
      toast.error("Failed to save password.");
    } finally {
      setIsSaving(false);
    }
  };

  const editPassword = async (e) => {
    console.log("Editing password with id ", e);
    setform(passwordArray.filter((i) => i.id === e)[0]);
  };

  const deletePassword = async (e) => {
    console.log("deleting password with id ", e);
    setDeletingId(e);
    try {
      setpasswordArray(passwordArray.filter((item) => item.id !== e));
      await fetch(`${API_URL}/${e}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ id: e }),
      });
      toast("Password Deleted 🗑️🗑️", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (error) {
      toast.error("Failed to delete password.");
    } finally {
      setDeletingId(null);
    }
  };

  const copyText = (text) => {
    toast("Copied to clipboard! ", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <ToastContainer />

      <div className="myContainer pb-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-center">
          <span className="text-green-500"> &lt;</span>
          <span>Pass</span>
          <span className="text-green-500">OP/&gt;</span>
        </h1>
        <p className="text-green-900 text-base sm:text-lg text-center">
          Your own Password Manager
        </p>

        <div className="flex flex-col p-4 text-black gap-6 sm:gap-8 items-center">
          <input
            value={form.site}
            onChange={handleChange}
            placeholder="Enter website URL"
            className="rounded-full border border-green-500 w-full p-4 py-1"
            type="text"
            name="site"
            id="site"
          />
          <div className="flex flex-col md:flex-row w-full justify-between gap-4 sm:gap-8">
            <input
              value={form.username}
              onChange={handleChange}
              placeholder="Enter Username"
              className="rounded-full border border-green-500 w-full p-4 py-1"
              type="text"
              name="username"
              id="username"
            />
            <div className="relative">
              <input
                ref={passRef}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="rounded-full border border-green-500 w-full p-4 py-1"
                type="password"
                name="password"
                id="password"
              />
              <span
                className="absolute right-[3px] top-[4px] cursor-pointer"
                onClick={showPassword}
              >
                <img
                  ref={ref}
                  className="p-1"
                  width={26}
                  src="icons/eye.png"
                  alt="eye"
                />
              </span>
            </div>
          </div>

          <button
            onClick={savePassword}
            disabled={isSaving}
            className="flex justify-center items-center gap-2 bg-green-400 hover:bg-green-300 disabled:bg-green-300 disabled:cursor-not-allowed rounded-full px-8 py-2 w-fit border border-green-900"
          >
            <lord-icon
              src="https://cdn.lordicon.com/jgnvfzqg.json"
              trigger="hover"
            ></lord-icon>
            {isSaving ? "Saving..." : "Save Password"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by site or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-2 px-4 border border-green-400 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="passwords">
          <h2 className="font-bold text-2xl py-4">Your Passwords</h2>
          {isLoadingPasswords && <div>Loading passwords...</div>}
          {!isLoadingPasswords && passwordArray.length === 0 && (
            <div>No passwords to show</div>
          )}
          {!isLoadingPasswords && passwordArray.length !== 0 && (
            <>
              <div className="md:hidden space-y-4 mb-10">
                {Array.isArray(currentItems) &&
                  currentItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-green-200 bg-white shadow-sm p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Site
                          </p>
                          <a
                            href={item.site}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-green-900 break-all"
                          >
                            {item.site}
                          </a>
                        </div>
                        <button
                          type="button"
                          className="shrink-0"
                          onClick={() => copyText(item.site)}
                        >
                          <lord-icon
                            style={{ width: "28px", height: "28px" }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover"
                          ></lord-icon>
                        </button>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Username
                          </p>
                          <p className="font-medium break-all">{item.username}</p>
                        </div>
                        <button
                          type="button"
                          className="shrink-0"
                          onClick={() => copyText(item.username)}
                        >
                          <lord-icon
                            style={{ width: "28px", height: "28px" }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover"
                          ></lord-icon>
                        </button>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Password
                          </p>
                          <p className="font-medium break-all">
                            {"*".repeat(item.password.length)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="shrink-0"
                          onClick={() => copyText(item.password)}
                        >
                          <lord-icon
                            style={{ width: "28px", height: "28px" }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover"
                          ></lord-icon>
                        </button>
                      </div>

                      <div className="flex items-center justify-end gap-4 border-t pt-3 border-green-100">
                        <button
                          type="button"
                          onClick={() => editPassword(item.id)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700"
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/gwlusjdu.json"
                            trigger="hover"
                            style={{ width: "22px", height: "22px" }}
                          ></lord-icon>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePassword(item.id)}
                          disabled={deletingId === item.id}
                          className={`inline-flex items-center gap-2 text-sm font-medium ${
                            deletingId === item.id
                              ? "text-red-400"
                              : "text-red-700"
                          }`}
                        >
                          {deletingId === item.id ? (
                            "Deleting..."
                          ) : (
                            <>
                              <lord-icon
                                src="https://cdn.lordicon.com/skkahier.json"
                                trigger="hover"
                                style={{ width: "22px", height: "22px" }}
                              ></lord-icon>
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
              <table className="min-w-[720px] table-auto w-full rounded-md overflow-hidden mb-10">
                <thead className="bg-green-800 text-white">
                  <tr>
                    <th className="py-2">Site</th>
                    <th className="py-2">Username</th>
                    <th className="py-2">Password</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-green-100">
                  {Array.isArray(currentItems) &&
                    currentItems.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td className="py-2 border border-white text-center">
                            <div className="flex items-center justify-center ">
                              <a href={item.site} target="_blank">
                                {item.site}
                              </a>
                              <div
                                className="lordiconcopy size-7 cursor-pointer"
                                onClick={() => {
                                  copyText(item.site);
                                }}
                              >
                                <lord-icon
                                  style={{
                                    width: "25px",
                                    height: "25px",
                                    paddingTop: "3px",
                                    paddingLeft: "3px",
                                  }}
                                  src="https://cdn.lordicon.com/iykgtsbt.json"
                                  trigger="hover"
                                ></lord-icon>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 border border-white text-center">
                            <div className="flex items-center justify-center ">
                              <span>{item.username}</span>
                              <div
                                className="lordiconcopy size-7 cursor-pointer"
                                onClick={() => {
                                  copyText(item.username);
                                }}
                              >
                                <lord-icon
                                  style={{
                                    width: "25px",
                                    height: "25px",
                                    paddingTop: "3px",
                                    paddingLeft: "3px",
                                  }}
                                  src="https://cdn.lordicon.com/iykgtsbt.json"
                                  trigger="hover"
                                ></lord-icon>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 border border-white text-center">
                            <div className="flex items-center justify-center ">
                              <span>{"*".repeat(item.password.length)}</span>
                              <div
                                className="lordiconcopy size-7 cursor-pointer"
                                onClick={() => {
                                  copyText(item.password);
                                }}
                              >
                                <lord-icon
                                  style={{
                                    width: "25px",
                                    height: "25px",
                                    paddingTop: "3px",
                                    paddingLeft: "3px",
                                  }}
                                  src="https://cdn.lordicon.com/iykgtsbt.json"
                                  trigger="hover"
                                ></lord-icon>
                              </div>
                            </div>
                          </td>
                          <td className="justify-center py-2 border border-white text-center">
                            <span
                              className="cursor-pointer mx-1"
                              onClick={() => {
                                editPassword(item.id);
                              }}
                            >
                              <lord-icon
                                src="https://cdn.lordicon.com/gwlusjdu.json"
                                trigger="hover"
                                style={{ width: "25px", height: "25px" }}
                              ></lord-icon>
                            </span>
                            <span
                              className={`cursor-pointer mx-1 ${
                                deletingId === item.id
                                  ? "pointer-events-none opacity-60"
                                  : ""
                              }`}
                              onClick={() => {
                                deletePassword(item.id);
                              }}
                            >
                              {deletingId === item.id ? (
                                <span className="text-xs font-semibold text-red-700">
                                  Deleting...
                                </span>
                              ) : (
                                <lord-icon
                                  src="https://cdn.lordicon.com/skkahier.json"
                                  trigger="hover"
                                  style={{ width: "25px", height: "25px" }}
                                ></lord-icon>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              </div>

              <div className="flex flex-wrap items-center justify-center mb-6 gap-4 mt-6">
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>

                <span className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow">
                  {currentPage}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Manager;

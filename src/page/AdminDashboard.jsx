import React, { useEffect, useState, useMemo } from "react";
import { getUsers, deleteUser, promoteUser, createUser } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Trash2, ShieldPlus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import useSearch from "../hooks/useSearch";
import "react-toastify/dist/ReactToastify.css";
import { validateAdminCreateUser } from "../utils/validator";

function AdminDashboard() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast(location.state.message);
    }
  }, []);

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const navigate = useNavigate();
  const keys = useMemo(() => ["username", "email"], []);
  const { search, setSearch, filteredData } = useSearch(users, keys);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await getUsers(token);
      setUsers(data);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    setBusyAction({ type: "delete", id });
    try {
      const message = await deleteUser(id, token);
      toast(message);
      loadUsers();
    } finally {
      setBusyAction(null);
    }
  };

  const handlePromote = async (id) => {
    setBusyAction({ type: "promote", id });
    try {
      const message = await promoteUser(id, token);
      toast(message);
      loadUsers();
    } finally {
      setBusyAction(null);
    }
  };

  const handleCreate = async () => {
    const error = validateAdminCreateUser({
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.role,
    });
    if (error) return toast.error(error);

    setIsCreating(true);
    try {
      await createUser(form, token);
      setForm({ username: "", email: "", password: "", role: "user" });
      loadUsers();
      toast("User Created");
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (role !== "admin") {
      navigate("/");
    }
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <ToastContainer />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-10">
        Admin Dashboard
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 mb-10">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Create New User
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Username"
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2 transition"
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by site or username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 md:w-1/2 p-2 px-4 border border-green-400 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Users</h2>

        <div className="md:hidden space-y-4">
          {isLoadingUsers && (
            <div className="py-6 text-center">Loading users...</div>
          )}

          {!isLoadingUsers &&
            currentItems.map((user) => (
              <div
                key={user._id}
                className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 space-y-4"
              >
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Email
                  </p>
                  <p className="break-all font-medium text-gray-900">
                    {user.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Role
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium
                      ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 border-t pt-3 border-gray-100">
                  <button
                    onClick={() => handlePromote(user._id)}
                    disabled={
                      busyAction?.type === "promote" &&
                      busyAction?.id === user._id
                    }
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
                  >
                    <ShieldPlus size={16} />
                    {busyAction?.type === "promote" &&
                    busyAction?.id === user._id
                      ? "Promoting..."
                      : "Promote"}
                  </button>

                  <button
                    onClick={() => handleDelete(user._id)}
                    disabled={
                      busyAction?.type === "delete" &&
                      busyAction?.id === user._id
                    }
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
                  >
                    <Trash2 size={16} />
                    {busyAction?.type === "delete" &&
                    busyAction?.id === user._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[640px] w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoadingUsers && (
              <tr>
                <td className="py-6 text-center" colSpan="3">
                  Loading users...
                </td>
              </tr>
            )}

            {!isLoadingUsers &&
              currentItems.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3">{user.email}</td>

                  <td className="py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                        ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3 flex justify-center items-center gap-3">
                    <button
                      onClick={() => handlePromote(user._id)}
                      disabled={
                        busyAction?.type === "promote" &&
                        busyAction?.id === user._id
                      }
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
                    >
                      <ShieldPlus size={16} />
                      {busyAction?.type === "promote" &&
                      busyAction?.id === user._id
                        ? "Promoting..."
                        : "Promote"}
                    </button>

                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={
                        busyAction?.type === "delete" &&
                        busyAction?.id === user._id
                      }
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
                    >
                      <Trash2 size={16} />
                      {busyAction?.type === "delete" &&
                      busyAction?.id === user._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
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
      </div>

      <div className="flex justify-center mt-10">
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition shadow"
          onClick={() =>
            navigate("/", {
              state: { message: "Manage your Password" },
            })
          }
        >
          Manage Your Passwords
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;

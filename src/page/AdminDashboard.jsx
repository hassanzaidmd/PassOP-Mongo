import React, { useEffect, useState } from "react";
import { getUsers, deleteUser, promoteUser, createUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Trash2, ShieldPlus } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function AdminDashboard() {

    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" });
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const loadUsers = async () => {
        const data = await getUsers(token);
        setUsers(data);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (id) => {
        let apple = await deleteUser(id, token);
        toast(apple)
        loadUsers();
    };

    const handlePromote = async (id) => {
        let apple = await promoteUser(id, token);
        toast(apple)
        loadUsers();
    };

    const handleCreate = async () => {
        await createUser(form, token);
        setForm({ username: "", email: "", password: "", role: "user" });
        loadUsers();
        toast("User Created")
    };
    useEffect(() => {

        if (role !== "admin") {
            navigate("/");
        }

    }, [])
    return (
        <div className="p-10">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition="Bounce"
            />
            {/* Same as */}
            <ToastContainer />

            <h1 className="text-3xl font-bold text-gray-800 mb-10">
                Admin Dashboard
            </h1>

            {/* Create User Card */}

            <div className="bg-white shadow-lg rounded-xl p-6 mb-10">

                <h2 className="text-xl font-semibold mb-6 text-gray-700">
                    Create New User
                </h2>

                <div className="grid grid-cols-5 gap-4">

                    <input
                        type="text"
                        placeholder="Username"
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                        value={form.username}
                        onChange={(e) =>
                            setForm({ ...form, username: e.target.value })
                        }
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />

                    <select
                        value={form.role}
                        onChange={(e) =>
                            setForm({ ...form, role: e.target.value })
                        }
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button
                        onClick={handleCreate}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-4 py-2 transition"
                    >
                        Create
                    </button>

                </div>
            </div>

            {/* Users Table */}

            <div className="bg-white shadow-lg rounded-xl p-6">

                <h2 className="text-xl font-semibold mb-6 text-gray-700">
                    Users
                </h2>

                <table className="w-full text-left border-collapse">

                    <thead>
                        <tr className="border-b text-gray-600">
                            <th className="pb-3">Email</th>
                            <th className="pb-3">Role</th>
                            <th className="pb-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {users.map((user) => (

                            <tr
                                key={user._id}
                                className="border-b hover:bg-gray-50 transition"
                            >

                                <td className="py-3">{user.email}</td>

                                <td className="py-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium
                                            ${user.role === "admin"
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
                                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
                                    >
                                        <ShieldPlus size={16} />
                                        Promote
                                    </button>

                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* Navigate Button */}

            <div className="flex justify-center mt-10">

                <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition shadow"
                    onClick={() => navigate("/")}
                >
                    Manage Your Passwords
                </button>

            </div>

        </div>
    );
}

export default AdminDashboard;
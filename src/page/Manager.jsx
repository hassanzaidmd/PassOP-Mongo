import React, { useEffect, useRef, useState, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useLocation } from 'react-router-dom';
import useSearch from '../hooks/useSearch';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validate } from "../../backend/utils/validator";

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
  const [form, setform] = useState({ site: "", username: "", password: "" })
  const [passwordArray, setpasswordArray] = useState([])
  const token = localStorage.getItem("token")
  const keys = useMemo(() => ["site", "username"], []);
  const { search, setSearch, filteredData } = useSearch(
    passwordArray,
    keys
  );


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
    let req = await fetch("http://localhost:4000", {
      headers: {
        Authorization: token
      }
    });
    let passwords = await req.json();
    setpasswordArray(passwords);
  }


  useEffect(() => {
    getPassword();
  }, [])


  function showPassword() {
    if (ref.current.src.includes("eye.png")) {
      ref.current.src = "icons/eyecross.png"
      passRef.current.type = "text";
    }
    else {
      ref.current.src = "icons/eye.png"
      passRef.current.type = "password";
    }
  }

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value })
  }

  const savePassword = async () => {

    const isValid = validate({ site: form.site, user: form.username, password: form.password });
    if (!isValid) return;

      if (form.id) {
        // UPDATE EXISTING PASSWORD
        await fetch(`http://localhost:4000/${form.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify(form)
        });

        // Re-fetch all passwords from DB instead of relying on local state
        const res = await fetch("http://localhost:4000", {
          headers: {
            Authorization: token
          }
        });
        const data = await res.json();
        setpasswordArray(data);

        toast('Password saved!');
      } else {
        // ADD NEW PASSWORD
        const newEntry = { ...form, id: uuidv4() };
        await fetch("http://localhost:4000", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify(newEntry)
        });
        setpasswordArray(prev => [...prev, newEntry]);
        toast('Password saved!');
      }
      setform({ site: "", username: "", password: "" });
  };
  const editPassword = async (e) => {
    console.log("Editing password with id ", e)
    setform(passwordArray.filter(i => i.id === e)[0])
  }

  const deletePassword = async (e) => {
    console.log("deleing password with id ", e)
    setpasswordArray(passwordArray.filter(item => item.id !== e))
    await fetch(`http://localhost:4000/${e}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ id: e })
    })
    console.log(passwordArray)
    toast('Password Deleted 🗑️🗑️', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }
  const copyText = (text) => {
    toast('Copied to clipboard! ', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    navigator.clipboard.writeText(text)
  }
  return (
    <>
      <ToastContainer />

      <div className="myContainer pb-0">
        <h1 className='text-4xl text font-bold text-center'>
          <span className='text-green-500'> &lt;</span>

          <span>Pass</span><span className='text-green-500'>OP/&gt;</span>

        </h1>
        <p className='text-green-900 text-lg text-center'>Your own Password Manager</p>

        <div className="flex flex-col p-4 text-black gap-8 items-center">
          <input value={form.site} onChange={handleChange} placeholder='Enter website URL' className='rounded-full border border-green-500 w-full p-4 py-1' type="text" name="site" id="site" />
          <div className="flex flex-col md:flex-row w-full justify-between gap-8">
            <input value={form.username} onChange={handleChange} placeholder='Enter Username' className='rounded-full border border-green-500 w-full p-4 py-1' type="text" name="username" id="username" />
            <div className="relative">

              <input ref={passRef} value={form.password} onChange={handleChange} placeholder='Enter Password' className='rounded-full border border-green-500 w-full p-4 py-1' type="password" name="password" id="password" />
              <span className='absolute right-[3px] top-[4px] cursor-pointer' onClick={showPassword}>
                <img ref={ref} className='p-1' width={26} src="icons/eye.png" alt="eye" />
              </span>
            </div>

          </div>
          <button onClick={savePassword} className='flex justify-center items-center gap-2 bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-fit border border-green-900'>
            <lord-icon
              src="https://cdn.lordicon.com/jgnvfzqg.json"
              trigger="hover" >
            </lord-icon>
            Save Password</button>
        </div>
        <input
          type="text"
          placeholder="🔍 Search by site or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-2 px-4 border border-green-400 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="passwords">
          <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
          {passwordArray.length === 0 && <div> No passwords to show</div>}
          {passwordArray.length != 0 && <div>
            <table className="table-auto w-full rounded-md overflow-hidden mb-10">
              <thead className='bg-green-800 text-white'>
                <tr>
                  <th className='py-2'>Site</th>
                  <th className='py-2'>Username</th>
                  <th className='py-2'>Password</th>
                  <th className='py-2'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-green-100'>
                {Array.isArray(currentItems) && currentItems.map((item, index) => {
                  return <tr key={index}>
                    <td className='py-2 border border-white text-center'>
                      <div className='flex items-center justify-center '>
                        <a href={item.site} target='_blank'>{item.site}</a>
                        <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.site) }}>
                          <lord-icon
                            style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover" >
                          </lord-icon>
                        </div>
                      </div>
                    </td>
                    <td className='py-2 border border-white text-center'>
                      <div className='flex items-center justify-center '>
                        <span>{item.username}</span>
                        <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.username) }}>
                          <lord-icon
                            style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover" >
                          </lord-icon>
                        </div>
                      </div>
                    </td>
                    <td className='py-2 border border-white text-center'>
                      <div className='flex items-center justify-center '>
                        <span>{"*".repeat(item.password.length)}</span>
                        <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.password) }}>
                          <lord-icon
                            style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover" >
                          </lord-icon>
                        </div>
                      </div>
                    </td>
                    <td className='justify-center py-2 border border-white text-center'>
                      <span className='cursor-pointer mx-1' onClick={() => { editPassword(item.id) }}>
                        <lord-icon
                          src="https://cdn.lordicon.com/gwlusjdu.json"
                          trigger="hover"
                          style={{ "width": "25px", "height": "25px" }}>
                        </lord-icon>
                      </span>
                      <span className='cursor-pointer mx-1' onClick={() => { deletePassword(item.id) }}>
                        <lord-icon
                          src="https://cdn.lordicon.com/skkahier.json"
                          trigger="hover"
                          style={{ "width": "25px", "height": "25px" }}>
                        </lord-icon>
                      </span>
                    </td>
                  </tr>

                })}
              </tbody>
            </table>
            <div className="flex items-center justify-center mb-6 gap-4 mt-6">

              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⬅ Prev
              </button>

              <span className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow">
                {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next ➡
              </button>

            </div>
          </div>
          }
        </div>
      </div>
    </>
  )
}

export default Manager

import React from 'react'
import { useNavigate } from 'react-router-dom'

function Navbar() {
    const navigate = useNavigate();
    const logout = () => {
      localStorage.removeItem("token")
      navigate("/login")
    }
    const token = localStorage.getItem("token");
    
    return (
        <nav className='bg-slate-800 text-white'>
            <div className="myContainer flex justify-between items-center px-4 py-5 h-14">
                <div className="cursor-pointer logo font-bold text-white text-2xl">
                    <span className='text-green-500 '>&lt;</span>
                    <span>Pass</span>
                    <span className='text-green-500'>OP/&gt;</span>
                </div>
                {/* <div className="menu">
                    <ul>
                        <li className='flex gap-4 '>
                            <a className='hover:font-bold' href='/'>Home</a>
                            <a className='hover:font-bold' href='#'>About</a>
                            <a className='hover:font-bold' href='#'>Contact</a>
                        </li>
                    </ul>
                </div> */}
                <div className="btns flex gap-2.5">
                    <button className='text-white bg-green-700 my-5 mx-2 rounded-full flex cursor-pointer  justify-between items-center ring-white ring-1'>
                        <img className='invert  w-10 p-1' src="/icons/github.svg" alt="github logo" />
                        <span className='font-bold px-2'>GitHub</span>
                    </button>
                    {token  && (
                        <div className="logout text-white bg-green-700 my-5 mx-2 rounded-full flex cursor-pointer  justify-between items-center ring-white ring-1" onClick={logout}>
                        <lord-icon
                            src="https://cdn.lordicon.com/zifyscfa.json"
                            trigger="hover"
                            stroke= "bold"
                            colors="primary:#ffffff,secondary:#ffffff"
                            style={{ "width": "35px", "height": "35px" }}>
                        </lord-icon>
                    </div>
                    )}
                </div>


            </div>
        </nav>
    )
}

export default Navbar

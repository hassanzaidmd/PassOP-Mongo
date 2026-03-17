import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Manager from './page/Manager'
import Login from './page/Login'
import Register from './page/Register'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './App.css'
import AdminDashboard from './page/AdminDashboard'
import ForgotPassword from "./page/ForgotPassword";
import ResetPassword from "./page/ResetPassword";

function App() {

  return (
    <BrowserRouter>
      <div className='min-h-screen flex flex-col'>
        <Navbar />
        <div className="flex-1 bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          <Routes>
            <Route path='/' element={<Manager />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/register' element={<Register />}></Route>
            <Route path='/admin' element={<AdminDashboard />}></Route>
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App


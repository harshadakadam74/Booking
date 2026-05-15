import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Hotel, Menu, X, User, LogOut } from 'lucide-react'

const Header = () => {
  const [open, setOpen] = useState(false)

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const loggedInUser = localStorage.getItem('user')
    return !!loggedInUser
  })

  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem('user')
    return loggedInUser ? JSON.parse(loggedInUser) : null
  })

  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
    navigate('/')
  }

  return (
    <header className="  bg-blue-300/35 top-0 w-full  z-50 sm:px-8 lg:px-16 ">

      {/* Floating White Navbar */}
      <div className=" mx-auto px-6 py-3.5 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-3xl font-bold text-blue-600">
          <Hotel size={30} /> FastBooking
        </Link>

      

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-12">

          <Link
            to="/list-property"
            className="text-gray-700 hover:text-blue-600"
          >
            List your property
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
              >
                <User size={18} />
                {user?.name || 'Account'}
              </Link>

              <button
                onClick={handleLogout}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mx-4 mt-2 bg-white rounded-xl shadow p-4 flex flex-col gap-4">


          <Link to="/list-property" onClick={() => setOpen(false)}>
            List your property
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/account" onClick={() => setOpen(false)}>
                {user?.name || 'Account'}
              </Link>

              <button
                onClick={() => {
                  handleLogout()
                  setOpen(false)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded text-center"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Header
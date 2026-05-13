import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { House, Menu, X, User, LogOut } from 'lucide-react'

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
    <header className="w-full h-20 bg-blue-900 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-full sm:px-6 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-2xl gap-2 flex items-center font-bold text-white">
          <House /> FastBooking
        </Link>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/list-property"
            className="text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            List Your Property
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/account"
                className="text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <User size={18} />
                {user?.name || 'Account'}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 font-semibold px-4 py-2 rounded flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 font-semibold px-4 py-2 rounded"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-blue-700 px-6 pb-4 flex flex-col gap-4">
          <Link
            to="/list-property"
            className="text-white"
            onClick={() => setOpen(false)}
          >
            List Your Property
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/account"
                className="text-white flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <User size={18} />
                {user?.name || 'Account'}
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setOpen(false)
                }}
                className="bg-white text-blue-600 font-semibold px-4 py-2 rounded text-center flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 font-semibold px-4 py-2 rounded text-center"
                onClick={() => setOpen(false)}
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

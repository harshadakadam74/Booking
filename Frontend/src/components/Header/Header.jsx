import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { House, Menu, X } from 'lucide-react'

const Header = () => {
  const [open, setOpen] = useState(false)

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
            to="/hotellist"
            className="text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            List Your Property
          </Link>

          <Link
            to="/login"
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded"
          >
            Register
          </Link>
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
            to="/hotellist"
            className="text-white"
            onClick={() => setOpen(false)}
          >
            List Your Property
          </Link>

          <Link
            to="/login"
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded text-center"
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
        </div>
      )}
    </header>
  )
}

export default Header

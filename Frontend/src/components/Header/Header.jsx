import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import Logo from "../Logo/Logo";

const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const authToken = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("user");

  const isLoggedIn = !!authToken;

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid user data:", error);
    localStorage.removeItem("user");
  }

  const displayName =
    user?.name ||
    `${user?.firstname || ""} ${user?.lastname || ""}`.trim() ||
    "Account";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur-md">

      {/* Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">

        {/* FastBooking Logo */}
        <Link
          to="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">

          {/* List Property */}
          <Link
            to="/list-property"
            className="font-medium text-slate-700 transition hover:text-[#C58A18]"
          >
            List your property
          </Link>

          {isLoggedIn ? (
            <>
              {/* Account */}
              <Link
                to="/account"
                className="flex items-center gap-2 font-medium text-slate-700 transition hover:text-[#C58A18]"
              >
                <User size={18} className="text-[#082B5C]" />
                <span>{displayName}</span>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-[#082B5C] px-4 py-2.5 font-semibold text-white shadow-sm transition duration-300 hover:bg-[#C58A18]"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="font-medium text-slate-700 transition hover:text-[#C58A18]"
              >
                Login
              </Link>

              {/* Register */}
              <Link
                to="/register"
                className="rounded-lg bg-[#082B5C] px-5 py-2.5 font-semibold text-white shadow-sm transition duration-300 hover:bg-[#C58A18]"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-[#082B5C] transition hover:bg-blue-50 md:hidden"
        >
          {open ? <X size={27} /> : <Menu size={27} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-blue-100 bg-white px-4 py-4 shadow-md md:hidden">

          <div className="mx-auto flex max-w-7xl flex-col gap-2">

            {/* List Property */}
            <Link
              to="/list-property"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 font-medium text-slate-700 transition hover:bg-blue-50 hover:text-[#C58A18]"
            >
              List your property
            </Link>

            {isLoggedIn ? (
              <>
                {/* Account */}
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-slate-700 transition hover:bg-blue-50 hover:text-[#C58A18]"
                >
                  <User size={18} className="text-[#082B5C]" />
                  {displayName}
                </Link>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#082B5C] px-4 py-3 font-semibold text-white transition hover:bg-[#C58A18]"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 font-medium text-slate-700 transition hover:bg-blue-50 hover:text-[#C58A18]"
                >
                  Login
                </Link>

                {/* Register */}
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-[#082B5C] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#C58A18]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
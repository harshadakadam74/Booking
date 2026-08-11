import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/fastbooking-logo.png";

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center shrink-0"
      aria-label="FastBooking Home"
    >
      <img
        src={logo}
        alt="FastBooking Logo"
        className="w-10 sm:w-10 md:w-10 h-auto object-contain"
      />
    </Link>
  );
};

export default Logo;
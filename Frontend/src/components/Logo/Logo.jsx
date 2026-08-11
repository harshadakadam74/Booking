import React from "react";
import logo from "../../assets/fastbooking-logo.png";

const Logo = () => {
  return (
    <img
      src={logo}
      alt="FastBooking Logo"
      className="w-40 sm:w-40 md:w-40 h-auto object-contain"
    />
  );
};

export default Logo;
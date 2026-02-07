import React from 'react'

import { Link } from "react-router-dom";
import { TriangleAlert } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white px-4 text-center">

      <TriangleAlert size={80} className="mb-6 text-yellow-400" />

      <h1 className="text-7xl font-bold mb-4">404</h1>

      <p className="text-2xl mb-2">
        Oops! Page not found
      </p>

      <p className="text-gray-200 mb-8 max-w-md">
        The page you are looking for doesn’t exist or has been moved.
      </p>

      <Link
        to="/"
        className="bg-yellow-400 text-black px-6 py-3 rounded font-semibold hover:bg-yellow-300 transition"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;




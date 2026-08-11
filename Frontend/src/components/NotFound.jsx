import React from "react";
import { Link } from "react-router-dom";
import { TriangleAlert, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center px-6">

      {/* Main Card */}
      <div className="w-full max-w-2xl text-center">

        {/* Decorative Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="
              w-24
              h-24
              rounded-3xl
              bg-[#fff7e3]
              border
              border-[#f0d58a]
              flex
              items-center
              justify-center
              shadow-sm
            "
          >
            <TriangleAlert
              size={48}
              strokeWidth={1.8}
              className="text-[#d49a00]"
            />
          </div>
        </div>

        {/* 404 */}
        <h1
          className="
            text-8xl
            md:text-9xl
            font-extrabold
            text-[#0b376d]
            tracking-tight
          "
        >
          404
        </h1>

        {/* Gold Line */}
        <div className="flex justify-center items-center gap-2 my-5">
          <div className="w-12 h-1 bg-[#d49a00] rounded-full"></div>

          <div className="w-2 h-2 bg-[#d49a00] rounded-full"></div>

          <div className="w-12 h-1 bg-[#d49a00] rounded-full"></div>
        </div>

        {/* Heading */}
        <h2
          className="
            text-2xl
            md:text-3xl
            font-bold
            text-[#0b376d]
            mb-3
          "
        >
          Oops! Page Not Found
        </h2>

        {/* Description */}
        <p
          className="
            text-[#64748b]
            text-base
            md:text-lg
            leading-relaxed
            max-w-md
            mx-auto
            mb-8
          "
        >
          The page you are looking for doesn't exist or may
          have been moved to another location.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">

          {/* Home Button */}
          <Link
            to="/"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              bg-[#0b376d]
              hover:bg-[#082c58]
              text-white
              px-7
              py-3.5
              rounded-xl
              font-semibold
              shadow-lg
              transition-all
              duration-300
              border-b-4
              border-[#d49a00]
              hover:border-[#e0aa18]
            "
          >
            <Home size={18} />
            Go Back Home
          </Link>

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              bg-white
              text-[#0b376d]
              border
              border-[#d7e0ea]
              px-7
              py-3.5
              rounded-xl
              font-semibold
              hover:border-[#d49a00]
              hover:text-[#c18a00]
              shadow-sm
              transition-all
              duration-300
            "
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

        </div>

        {/* Branding */}
        <div className="mt-12">

          <div className="flex justify-center items-center gap-2">

            <div
              className="
                w-9
                h-9
                rounded-lg
                bg-[#0b376d]
                flex
                items-center
                justify-center
                shadow-sm
              "
            >
              <span className="text-lg">✈️</span>
            </div>

            <div className="text-left">

              <h3 className="text-[#0b376d] font-bold leading-none">
                FastBooking
              </h3>

              <p
                className="
                  text-[8px]
                  text-[#c99100]
                  font-semibold
                  tracking-[2px]
                  uppercase
                "
              >
                Travel & Stay
              </p>

            </div>

          </div>

          <p className="text-xs text-gray-400 mt-4">
            © 2026 FastBooking. All rights reserved.
          </p>

        </div>

      </div>
    </div>
  );
};

export default NotFound;
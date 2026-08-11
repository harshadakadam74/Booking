import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookingHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/account/bookings")}
        className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#082B5C] transition-all duration-300 hover:bg-[#082B5C] hover:text-white"
      >
        <ArrowLeft
          size={18}
          className="text-[#C58A18]"
        />

        <span>Back to My Bookings</span>
      </button>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-md">

        {/* Gold Accent */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#C58A18]" />

        <div className="pl-3">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#C58A18]">
            FastBooking
          </p>

          <h1 className="text-2xl font-bold text-[#082B5C] sm:text-3xl">
            {title}
          </h1>

          <div className="mt-3 h-1 w-16 rounded-full bg-[#C58A18]" />
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;
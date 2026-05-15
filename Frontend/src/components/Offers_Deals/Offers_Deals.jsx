import React from 'react'
import { Link } from "react-router-dom";

const Offers_Deals = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-18 sm:mt-20 md:mt-24">

      {/* Offers Section */}
      <section className="mb-10">

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
          Offers
        </h2>

        <p className="text-gray-500 mb-6 text-sm sm:text-base">
          Promotions, deals and special offers for you
        </p>

        {/* CARD */}
        <div className="flex flex-col md:flex-row items-center gap-5 bg-white border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition">

          {/* IMAGE */}
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            alt="Offer"
            className="w-full h-44 sm:h-52 md:w-40 md:h-40 object-cover rounded-lg"
          />

          {/* TEXT */}
          <div className="flex-1 w-full text-center md:text-left">

            <p className="text-xs sm:text-sm text-gray-500 mb-1">
              Early 2026 Deals
            </p>

            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
              At least 15% off
            </h3>

            <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">
              Save on your next stay with Early 2026 Deals.
              Book now, stay until 1 April 2026.
            </p>

            {/* BUTTON FIX */}
            <Link
              to="/deals"
              className="block md:inline-block w-full md:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-5 py-3 rounded-lg font-medium transition"
            >
              Explore deals
            </Link>

          </div>

        </div>

      </section>
    </div>
  )
}

export default Offers_Deals;
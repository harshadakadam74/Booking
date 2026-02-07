import React from 'react'
import { Link } from "react-router-dom";

const Offers_Deals = () => {
  return (
   <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-14  mt-8 sm:mt-55 md:mt-20 lg:mt-24">
  {/* Offers Section */}
  <section className="mb-8 sm:mb-10 md:mb-12 animate-fadeIn">
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2">
      Offers
    </h2>

    <p className="text-gray-500 mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">
      Promotions, deals and special offers for you
    </p>

    <div
      className="
        flex flex-col md:flex-row
        items-start md:items-center 
        justify-between
        gap-4 sm:gap-6 md:gap-8
        bg-white
        border border-gray-100
        rounded-lg sm:rounded-xl
        p-4 sm:p-6 md:p-8
        shadow-sm
        hover:shadow-md
        transition-shadow duration-300
      "
    >
      {/* TEXT */}
      <div className="flex-1 w-full md:w-auto">
        <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-1 md:mb-2">
          Early 2026 Deals
        </p>

        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 md:mb-3">
          At least 15% off
        </h3>

        <p className="text-gray-600 mb-4 md:mb-6 max-w-md text-xs sm:text-sm md:text-base leading-relaxed">
          Save on your next stay with Early 2026 Deals.
          Book now, stay until 1 April 2026.
        </p>

        <Link
          to="/deals"
          className="
            inline-block
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            text-white text-sm md:text-base
            px-4 sm:px-6 md:px-8
            py-2 md:py-3
            rounded-lg
            font-medium
            transition-all duration-200
            hover:scale-105 active:scale-95
          "
        >
          Explore deals
        </Link>
      </div>

      {/* IMAGE (desktop only) */}
      <img
        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
        alt="Offer"
        className="
          hidden md:block
          w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48
          object-cover
          rounded-lg
          animate-slideIn
          flex-shrink-0
        "
      />
    </div>
  </section>
</div>

  )
}

export default Offers_Deals
import React from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowRight } from "lucide-react";

const Offers_Deals = () => {
  return (
    <section className="mb-10 py-10 px-10">
      {/* Section Heading */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-lg bg-[#FFF8E7] p-2">
            <Tag size={20} className="text-[#C58A18]" />
          </div>

          <h2 className="text-xl font-bold text-[#082B5C] sm:text-2xl md:text-3xl">
            Offers
          </h2>
        </div>

        <p className="text-sm text-slate-500 sm:text-base">
          Promotions, deals and special offers for you
        </p>
      </div>

      {/* Offer Card */}
      <div className="group flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C58A18]/40 hover:shadow-lg sm:p-6 md:flex-row">

        {/* Image */}
        <div className="relative w-full shrink-0 md:w-44">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            alt="Travel Offer"
            className="h-44 w-full rounded-xl object-cover sm:h-52 md:h-44"
          />

          {/* Gold Discount Badge */}
          <span className="absolute left-3 top-3 rounded-full bg-[#C58A18] px-3 py-1 text-xs font-bold text-white shadow-md">
            15% OFF
          </span>
        </div>

        {/* Content */}
        <div className="w-full flex-1 text-center md:text-left">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#C58A18] sm:text-sm">
            Special Deal
          </p>

          <h3 className="mb-2 text-lg font-bold text-[#082B5C] sm:text-xl md:text-2xl">
            At least 15% off
          </h3>

          <p className="mb-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Save on your next stay with FastBooking special offers.
            Discover great hotels and enjoy exclusive discounts.
          </p>

          {/* Button */}
          <Link
            to="/deals"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#082B5C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C58A18] hover:shadow-md sm:text-base md:w-auto"
          >
            Explore Deals
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Gold Accent */}
        <div className="hidden h-24 w-1 rounded-full bg-gradient-to-b from-transparent via-[#C58A18] to-transparent md:block" />
      </div>
    </section>
  );
};

export default Offers_Deals;
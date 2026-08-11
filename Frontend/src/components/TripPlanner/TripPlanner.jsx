import React from "react";
import { useNavigate } from "react-router-dom";
import { Navigation, ArrowRight } from "lucide-react";
import { indianDestinations } from "../../Data/IndianDestinations";

const TripPlanner = () => {
  const navigate = useNavigate();

  const handleDestinationClick = (destination) => {
    const searchData = {
      location: `${destination.name}, India`,
      dates: {
        startDate: new Date(),
        endDate: new Date(
          new Date().getTime() + 24 * 60 * 60 * 1000
        ),
        key: "selection",
      },
      guests: {
        adults: 2,
        children: 0,
        rooms: 1,
      },
      workTrip: false,
    };

    navigate("/book-place", {
      state: searchData,
    });
  };

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ================= HEADER ================= */}
        <div className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#C58A18]" />

            <span className="text-sm font-semibold uppercase tracking-widest text-[#C58A18]">
              Discover India
            </span>

            <span className="h-px w-10 bg-[#C58A18]" />
          </div>

          <h2 className="text-2xl font-bold text-[#082B5C] sm:text-3xl md:text-4xl">
            Quick and Easy Trip Planner
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
            Pick a vibe and explore the top destinations in India
          </p>
        </div>

        {/* ================= DESTINATION GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {indianDestinations.map((destination) => (
            <div
              key={destination.id}
              onClick={() => handleDestinationClick(destination)}
              className="
                group cursor-pointer overflow-hidden
                rounded-2xl border border-slate-100
                bg-white shadow-md
                transition-all duration-300
                hover:-translate-y-2
                hover:border-[#C58A18]/50
                hover:shadow-xl
              "
            >
              {/* ================= IMAGE ================= */}
              <div className="relative h-60 overflow-hidden bg-slate-200">
                <img
                  src={destination.image}
                  alt={destination.name}
                  loading="lazy"
                  className="
                    h-full w-full object-cover
                    transition-transform duration-500
                    group-hover:scale-110
                  "
                />

                {/* Dark Blue Gradient */}
                <div
                  className="
                    absolute inset-0
                    bg-gradient-to-t
                    from-[#082B5C]/95
                    via-[#082B5C]/20
                    to-transparent
                  "
                />

                {/* Gold Top Border */}
                <div
                  className="
                    absolute left-0 right-0 top-0
                    h-1 bg-[#C58A18]
                    opacity-0
                    transition-opacity duration-300
                    group-hover:opacity-100
                  "
                />

                {/* ================= IMAGE CONTENT ================= */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="mb-1 text-xl font-bold text-white">
                    {destination.name}
                  </h3>

                  <p className="mb-2 text-sm text-slate-200">
                    {destination.vibe}
                  </p>

                  <div className="flex items-center text-sm text-white">
                    <Navigation
                      size={14}
                      className="mr-1.5 text-[#E3AE32]"
                    />

                    <span>
                      {destination.distance} km away
                    </span>
                  </div>
                </div>
              </div>

              {/* ================= CARD FOOTER ================= */}
              <div
                className="
                  min-h-[85px]
                  bg-white p-4
                  transition-colors duration-300
                  group-hover:bg-[#FFF8E7]
                "
              >
                <p className="line-clamp-2 text-xs leading-5 text-slate-600">
                  {destination.description}
                </p>

                {/* Gold Accent */}
                <div
                  className="
                    mt-3 h-0.5 w-8 rounded-full
                    bg-[#C58A18]
                    transition-all duration-300
                    group-hover:w-14
                  "
                />
              </div>
            </div>
          ))}
        </div>

        {/* ================= EXPLORE MORE ================= */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-sm text-slate-500">
            Looking for more inspiration?
          </p>

          <button
            onClick={() => navigate("/book-place")}
            className="
              group
              inline-flex items-center gap-2
              rounded-xl
              border-2 border-[#082B5C]
              bg-[#082B5C]
              px-6 py-3
              text-sm font-semibold text-white
              transition-all duration-300
              hover:border-[#C58A18]
              hover:bg-[#C58A18]
              hover:shadow-lg
              active:scale-95
            "
          >
            Browse All Destinations

            <ArrowRight
              size={17}
              className="
                transition-transform duration-300
                group-hover:translate-x-1
              "
            />
          </button>
        </div>

      </div>
    </section>
  );
};

export default TripPlanner;
import React from "react";
import { Link } from "react-router-dom";
import {
  Hotel,
  Building2,
  Palmtree,
  House,
} from "lucide-react";
import "./PropertyType.css";

const BrowseByPropertyType = () => {
  const propertyTypes = [
    {
      name: "Hotels",
      icon: Hotel,
      link: "/hotels",
    },
    {
      name: "Apartments",
      icon: Building2,
      link: "/apartments",
    },
    {
      name: "Resorts",
      icon: Palmtree,
      link: "/resorts",
    },
    {
      name: "Villas",
      icon: House,
      link: "/villas",
    },
  ];

  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#C58A18]" />

            <span className="text-sm font-semibold uppercase tracking-widest text-[#C58A18]">
              Explore
            </span>

            <span className="h-px w-10 bg-[#C58A18]" />
          </div>

          <h2 className="text-2xl font-bold text-[#082B5C] sm:text-3xl md:text-4xl">
            Browse by Property Type
          </h2>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Explore stays that match your travel style
          </p>
        </div>

        {/* Property Types */}
        <div className="property-scroll-wrapper overflow-hidden">
          <div className="property-scroll flex gap-4 sm:gap-5">

            {/* Duplicate list for seamless scrolling */}
            {[...propertyTypes, ...propertyTypes].map(
              ({ name, icon: Icon, link }, index) => (
                <Link
                  key={`${name}-${index}`}
                  to={link}
                  className="
                    group
                    flex
                    w-32
                    shrink-0
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-blue-100
                    bg-white
                    p-4
                    text-center
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#C58A18]
                    hover:shadow-xl
                    active:scale-95
                    sm:w-40
                    sm:p-6
                    md:w-48
                    md:p-8
                  "
                >
                  {/* Icon */}
                  <div
                    className="
                      mb-4
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#FFF8E7]
                      transition-all
                      duration-300
                      group-hover:bg-[#082B5C]
                    "
                  >
                    <Icon
                      size={28}
                      strokeWidth={1.8}
                      className="
                        text-[#C58A18]
                        transition-all
                        duration-300
                        group-hover:scale-110
                        group-hover:text-[#E3AE32]
                      "
                    />
                  </div>

                  {/* Name */}
                  <h3
                    className="
                      text-sm
                      font-bold
                      text-[#082B5C]
                      transition-colors
                      duration-300
                      group-hover:text-[#C58A18]
                      sm:text-base
                    "
                  >
                    {name}
                  </h3>

                  {/* Gold Accent */}
                  <div
                    className="
                      mt-3
                      h-0.5
                      w-8
                      rounded-full
                      bg-[#C58A18]
                      transition-all
                      duration-300
                      group-hover:w-12
                    "
                  />
                </Link>
              )
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default BrowseByPropertyType;
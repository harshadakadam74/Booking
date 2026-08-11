import React from "react";
import {
  BedDouble,
  UsersRound,
  Sparkles,
  Wifi,
  Coffee,
  Wind,
} from "lucide-react";

const RoomInformation = ({ booking }) => {
  const guests = booking?.guests || {
    adults: 2,
    rooms: 1,
  };

  const amenities = booking?.amenities || [
    "Breakfast",
    "AC",
    "Wi-Fi",
  ];

  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-md">

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">

        <div className="rounded-xl bg-blue-50 p-3">
          <BedDouble
            size={22}
            className="text-[#082B5C]"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#082B5C]">
            Room Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Details about your selected room
          </p>
        </div>

      </div>

      {/* Room Details */}
      <div className="grid gap-4 md:grid-cols-3">

        {/* Room Type */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 transition duration-300 hover:border-[#C58A18] hover:shadow-sm">

          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <BedDouble
              size={19}
              className="text-[#C58A18]"
            />

            <span className="text-sm font-medium">
              Room Type
            </span>
          </div>

          <p className="font-bold text-[#082B5C]">
            {booking?.propertyType || "Deluxe Room"}
          </p>

        </div>

        {/* Guests */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 transition duration-300 hover:border-[#C58A18] hover:shadow-sm">

          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <UsersRound
              size={19}
              className="text-[#C58A18]"
            />

            <span className="text-sm font-medium">
              Guests
            </span>
          </div>

          <p className="font-bold text-[#082B5C]">
            {guests.adults || 2} Adults
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {guests.rooms || 1} Room
            {(guests.rooms || 1) > 1 ? "s" : ""}
          </p>

        </div>

        {/* Amenities */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 transition duration-300 hover:border-[#C58A18] hover:shadow-sm">

          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <Sparkles
              size={19}
              className="text-[#C58A18]"
            />

            <span className="text-sm font-medium">
              Amenities
            </span>
          </div>

          <div className="flex flex-wrap gap-2">

            {amenities.map((item, index) => (
              <span
                key={index}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#082B5C] shadow-sm"
              >
                {item}
              </span>
            ))}

          </div>

        </div>

      </div>

      {/* Amenity Highlights */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">

        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4">
          <div className="rounded-lg bg-blue-50 p-2">
            <Coffee
              size={18}
              className="text-[#C58A18]"
            />
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Breakfast
            </p>
            <p className="font-semibold text-[#082B5C]">
              Included
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4">
          <div className="rounded-lg bg-blue-50 p-2">
            <Wind
              size={18}
                className="text-[#C58A18]"
            />
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Air Conditioning
            </p>
            <p className="font-semibold text-[#082B5C]">
              Available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4">
          <div className="rounded-lg bg-blue-50 p-2">
            <Wifi
              size={18}
              className="text-[#C58A18]"
            />
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Internet
            </p>
            <p className="font-semibold text-[#082B5C]">
              Free Wi-Fi
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Accent */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

    </div>
  );
};

export default RoomInformation;
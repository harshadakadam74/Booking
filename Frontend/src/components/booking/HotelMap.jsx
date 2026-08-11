import React from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
} from "lucide-react";

const HotelMap = ({ location }) => {
  const hotelLocation =
    location || "Bhopal, Madhya Pradesh";

  const openGoogleMaps = () => {
    const query = encodeURIComponent(hotelLocation);

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-md">

      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-3">
          <MapPin
            size={22}
            className="text-[#082B5C]"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#082B5C]">
            Hotel Location
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Find your hotel on Google Maps
          </p>
        </div>
      </div>

      {/* Map Preview */}
      <div className="relative h-56 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-sky-50 to-[#FFF8E7]">

        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(90deg, #bfdbfe 1px, transparent 1px),
                linear-gradient(#bfdbfe 1px, transparent 1px)
              `,
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        {/* Center Location */}
        <div className="relative flex h-full items-center justify-center">
          <div className="flex flex-col items-center">

            {/* Location Pin */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#082B5C] shadow-xl">

              <MapPin
                size={27}
                fill="#C58A18"
                className="text-[#C58A18]"
              />

              {/* Pulse */}
              <span className="absolute h-14 w-14 animate-ping rounded-full border-2 border-[#C58A18] opacity-30" />
            </div>

            {/* Location Name */}
            <div className="mt-4 rounded-xl border border-white/70 bg-white/90 px-5 py-3 text-center shadow-md backdrop-blur">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Hotel Location
              </p>

              <p className="mt-1 font-bold text-[#082B5C]">
                {hotelLocation}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Icon */}
        <div className="absolute right-4 top-4 rounded-xl bg-white p-2.5 shadow-md">
          <Navigation
            size={19}
            className="text-[#C58A18]"
          />
        </div>
      </div>

      {/* Location Details */}
      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">

          <div className="rounded-lg bg-white p-2 shadow-sm">
            <MapPin
              size={17}
              className="text-[#C58A18]"
            />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Address
            </p>

            <p className="mt-1 text-sm font-semibold text-[#082B5C]">
              {hotelLocation}
            </p>
          </div>

        </div>
      </div>

      {/* Google Maps Button */}
      <button
        type="button"
        onClick={openGoogleMaps}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#082B5C] px-5 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C58A18] hover:shadow-lg"
      >
        <Navigation size={17} />

        Open in Google Maps

        <ExternalLink size={15} />
      </button>

      {/* Bottom Accent */}
      <div className="mt-5 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

    </div>
  );
};

export default HotelMap;
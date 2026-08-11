import React from "react";
import {
  MapPin,
  Star,
  Wifi,
  Car,
  UtensilsCrossed,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";

const HotelInformation = ({ booking }) => {
  const amenities = booking?.amenities || [
    "Wi-Fi",
    "Parking",
    "Restaurant",
    "Pool",
  ];

  const hotelName =
    booking?.property || "Luxury Downtown Hotel";

  const location =
    booking?.location || "Bhopal, India";

  const rating = booking?.rating || 4.8;

  const hotelPhone =
    booking?.hotelPhone || "+91 98765 43210";

  const hotelEmail =
    booking?.hotelEmail || "hotel@example.com";

  const getAmenityIcon = (amenity) => {
    const value = amenity.toLowerCase();

    if (value.includes("wifi") || value.includes("wi-fi")) {
      return <Wifi size={14} />;
    }

    if (value.includes("parking")) {
      return <Car size={14} />;
    }

    if (
      value.includes("restaurant") ||
      value.includes("dining")
    ) {
      return <UtensilsCrossed size={14} />;
    }

    return <Sparkles size={14} />;
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-md">

      {/* Header */}
      <div className="relative bg-[#082B5C] px-6 py-5">

        {/* Gold Accent */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#C58A18]" />

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-3">
            <Sparkles
              size={22}
              className="text-[#E3AE32]"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Hotel Information
            </h2>

            <p className="mt-1 text-sm text-blue-100">
              Your selected property details
            </p>
          </div>
        </div>
      </div>

      {/* Hotel Main Information */}
      <div className="p-6">

        <div className="flex flex-col gap-6 md:flex-row">

          {/* Hotel Image */}
          <div className="relative shrink-0 overflow-hidden rounded-2xl">

            {booking?.image ? (
              <img
                src={booking.image}
                alt={hotelName}
                className="h-52 w-full object-cover transition duration-500 hover:scale-105 md:w-60"
              />
            ) : (
              <div className="flex h-52 w-full items-center justify-center bg-blue-50 md:w-60">
                <Sparkles
                  size={42}
                  className="text-[#C58A18]"
                />
              </div>
            )}

            {/* Rating */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#082B5C] shadow-md">
              <Star
                size={15}
                fill="currentColor"
                className="text-[#C58A18]"
              />
              {rating}
            </div>

          </div>

          {/* Hotel Details */}
          <div className="flex-1">

            {/* Rating */}
            <div className="flex items-center gap-1">

              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  fill="currentColor"
                  className={
                    index < Math.round(rating)
                      ? "text-[#C58A18]"
                      : "text-slate-200"
                  }
                />
              ))}

              <span className="ml-2 text-sm font-semibold text-slate-600">
                {rating} / 5
              </span>

            </div>

            {/* Hotel Name */}
            <h2 className="mt-3 text-2xl font-bold text-[#082B5C]">
              {hotelName}
            </h2>

            {/* Location */}
            <div className="mt-2 flex items-center gap-2 text-slate-600">
              <MapPin
                size={17}
                className="shrink-0 text-[#C58A18]"
              />

              <span>
                {location}
              </span>
            </div>

            {/* Amenities */}
            <div className="mt-5 flex flex-wrap gap-2">

              {amenities.map((item, idx) => (
                <span
                  key={`${item}-${idx}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#082B5C] transition hover:border-[#C58A18] hover:bg-[#FFF8E7]"
                >
                  <span className="text-[#C58A18]">
                    {getAmenityIcon(item)}
                  </span>

                  {item}
                </span>
              ))}

            </div>

            {/* Contact */}
            <div className="mt-5 flex flex-wrap gap-3">

              <a
                href={`tel:${hotelPhone}`}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-[#082B5C] shadow-sm transition hover:border-[#C58A18] hover:text-[#C58A18]"
              >
                <Phone size={15} />
                Contact Hotel
              </a>

              <a
                href={`mailto:${hotelEmail}`}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-[#082B5C] shadow-sm transition hover:border-[#C58A18] hover:text-[#C58A18]"
              >
                <Mail size={15} />
                Email
              </a>

            </div>

          </div>
        </div>

        {/* Facilities */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Internet */}
          <div className="group rounded-2xl border border-blue-100 bg-blue-50 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#C58A18] hover:shadow-md">

            <div className="mb-3 inline-flex rounded-xl bg-white p-3 shadow-sm">
              <Wifi
                size={19}
                className="text-[#082B5C]"
              />
            </div>

            <p className="text-sm text-slate-500">
              Internet
            </p>

            <p className="mt-1 font-bold text-[#082B5C]">
              High Speed Wi-Fi
            </p>

          </div>

          {/* Parking */}
          <div className="group rounded-2xl border border-blue-100 bg-blue-50 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#C58A18] hover:shadow-md">

            <div className="mb-3 inline-flex rounded-xl bg-white p-3 shadow-sm">
              <Car
                size={19}
                className="text-[#C58A18]"
              />
            </div>

            <p className="text-sm text-slate-500">
              Parking
            </p>

            <p className="mt-1 font-bold text-[#082B5C]">
              Available
            </p>

          </div>

          {/* Dining */}
          <div className="group rounded-2xl border border-blue-100 bg-blue-50 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#C58A18] hover:shadow-md">

            <div className="mb-3 inline-flex rounded-xl bg-white p-3 shadow-sm">
              <UtensilsCrossed
                size={19}
                className="text-[#082B5C]"
              />
            </div>

            <p className="text-sm text-slate-500">
              Dining
            </p>

            <p className="mt-1 font-bold text-[#082B5C]">
              On-site Restaurant
            </p>

          </div>

          {/* Safety */}
          <div className="group rounded-2xl border border-blue-100 bg-blue-50 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#C58A18] hover:shadow-md">

            <div className="mb-3 inline-flex rounded-xl bg-white p-3 shadow-sm">
              <ShieldCheck
                size={19}
                className="text-[#C58A18]"
              />
            </div>

            <p className="text-sm text-slate-500">
              Safety
            </p>

            <p className="mt-1 font-bold text-[#082B5C]">
              24/7 Security
            </p>

          </div>

        </div>

        {/* Nearby Attractions */}
        <div className="mt-5 rounded-2xl border border-[#E3AE32]/30 bg-[#FFF8E7] p-5">

          <div className="flex items-start gap-3">

            <div className="rounded-xl bg-white p-2 shadow-sm">
              <MapPin
                size={18}
                className="text-[#C58A18]"
              />
            </div>

            <div>
              <p className="font-bold text-[#082B5C]">
                Nearby Attractions
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                City Center, Lake View Park, Museum Road
              </p>
            </div>

          </div>

        </div>

        {/* Google Maps */}
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#082B5C] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#C58A18]"
          onClick={() => {
            const query = encodeURIComponent(
              `${hotelName}, ${location}`
            );

            window.open(
              `https://www.google.com/maps/search/?api=1&query=${query}`,
              "_blank"
            );
          }}
        >
          <MapPin size={16} />
          View on Google Maps
          <ExternalLink size={14} />
        </button>

        {/* Gold Divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

      </div>
    </div>
  );
};

export default HotelInformation;
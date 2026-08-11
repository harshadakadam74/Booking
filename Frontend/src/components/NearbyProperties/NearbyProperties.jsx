import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  Star,
  ArrowRight,
  LocateFixed,
  Wifi,
  Car,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ==================================================
// NEARBY PROPERTIES
// ==================================================

const NEARBY_PROPERTIES = [
  {
    id: 1,
    name: "City Center Hotel",
    location: "Downtown",
    distance: "1.2 km",
    rating: "4.7",
    reviews: 328,
    price: 120,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    amenities: ["Free WiFi", "Parking"],
  },
  {
    id: 2,
    name: "Grand Plaza",
    location: "Central Avenue",
    distance: "2.4 km",
    rating: "4.8",
    reviews: 512,
    price: 150,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80",
    amenities: ["Free WiFi", "Parking"],
  },
  {
    id: 3,
    name: "Royal Residency",
    location: "Business District",
    distance: "3.1 km",
    rating: "4.6",
    reviews: 274,
    price: 95,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    amenities: ["Free WiFi", "Parking"],
  },
];

// ==================================================
// COMPONENT
// ==================================================

const NearbyProperties = () => {
  const navigate = useNavigate();

  const [locationStatus, setLocationStatus] = useState("");

  // ==================================================
  // LOAD FAVORITES
  // ==================================================

  const [liked, setLiked] = useState(() => {
    try {
      const saved = localStorage.getItem("likedProperties");

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to load favorites:", error);
      return [];
    }
  });

  // ==================================================
  // FIND USER LOCATION
  // ==================================================

  const findNearby = () => {
    if (!navigator.geolocation) {
      setLocationStatus(
        "Location is not supported by your browser."
      );

      return;
    }

    setLocationStatus("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

        setLocationStatus(
          "Location detected successfully!"
        );
      },
      (error) => {
        console.error("Location error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus(
            "Location permission denied. Please allow location access."
          );
        } else {
          setLocationStatus(
            "Unable to detect your location."
          );
        }
      }
    );
  };

  // ==================================================
  // TOGGLE FAVORITE
  // ==================================================

  const toggleFavorite = (hotel) => {
    setLiked((prev) => {
      const exists = prev.some(
        (item) => item.id === hotel.id
      );

      const updated = exists
        ? prev.filter((item) => item.id !== hotel.id)
        : [...prev, hotel];

      localStorage.setItem(
        "likedProperties",
        JSON.stringify(updated)
      );

      // Notify other components
      window.dispatchEvent(
        new Event("favoritesUpdated")
      );

      return updated;
    });
  };

  // ==================================================
  // CHECK FAVORITE
  // ==================================================

  const isLiked = (id) => {
    return liked.some(
      (item) => item.id === id
    );
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <section className="bg-blue-950 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Navigation size={18} />

              <span className="text-sm font-bold uppercase tracking-[0.2em]">
                Near You
              </span>
            </div>

            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Hotels Near Your Location
            </h2>

            <p className="mt-3 max-w-2xl text-blue-200">
              Discover highly rated hotels and comfortable
              stays close to your current location.
            </p>
          </div>

          {/* ==================================================
              LOCATION BUTTON
          ================================================== */}

          <div>
            <button
              type="button"
              onClick={findNearby}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-yellow-500/20 transition hover:bg-yellow-400"
            >
              <LocateFixed size={18} />

              Find Nearby
            </button>

            {locationStatus && (
              <p className="mt-2 text-right text-xs text-blue-200">
                {locationStatus}
              </p>
            )}
          </div>
        </div>

        {/* ==================================================
            HOTEL CARDS
        ================================================== */}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {NEARBY_PROPERTIES.map((hotel) => (
            <div
              key={hotel.id}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/[0.13]"
            >

              {/* ==================================================
                  IMAGE
              ================================================== */}

              <div className="relative h-52 overflow-hidden">

                <img
                  src={hotel.image}
                  alt={hotel.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Distance */}
                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-900 shadow">
                  <MapPin size={13} />
                  {hotel.distance}
                </div>

                {/* Favorite */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(hotel)}
                  className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition ${
                    isLiked(hotel.id)
                      ? "bg-red-500 text-white"
                      : "bg-black/30 text-white hover:bg-white hover:text-red-500"
                  }`}
                  aria-label={`Save ${hotel.name}`}
                >
                  <Heart
                    size={18}
                    fill={
                      isLiked(hotel.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>

                {/* Hotel name */}
                <div className="absolute bottom-4 left-4">

                  <h3 className="text-xl font-bold">
                    {hotel.name}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 text-sm text-blue-100">
                    <MapPin size={13} />
                    {hotel.location}
                  </p>

                </div>
              </div>

              {/* ==================================================
                  CONTENT
              ================================================== */}

              <div className="p-5">

                {/* Rating + Price */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="flex items-center gap-1 rounded-lg bg-yellow-500 px-2 py-1 text-xs font-extrabold text-slate-950">
                      <Star
                        size={12}
                        fill="currentColor"
                      />

                      {hotel.rating}
                    </span>

                    <span className="text-xs text-blue-200">
                      {hotel.reviews} reviews
                    </span>

                  </div>

                  <div className="text-right">

                    <span className="text-lg font-extrabold text-yellow-400">
                      ${hotel.price}
                    </span>

                    <span className="ml-1 text-xs text-blue-200">
                      /night
                    </span>

                  </div>
                </div>

                {/* ==================================================
                    AMENITIES
                ================================================== */}

                <div className="mt-5 flex flex-wrap gap-2">

                  {hotel.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-blue-100"
                    >
                      {amenity === "Free WiFi" ? (
                        <Wifi size={13} />
                      ) : (
                        <Car size={13} />
                      )}

                      {amenity}
                    </span>
                  ))}

                </div>

                {/* ==================================================
                    VIEW HOTEL
                ================================================== */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/book?hotel=${hotel.id}`)
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-950 transition hover:bg-yellow-400"
                >
                  View Hotel

                  <ArrowRight size={17} />
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* ==================================================
            BOTTOM CTA
        ================================================== */}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5 sm:flex-row">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-slate-950">
              <MapPin size={20} />
            </div>

            <div>
              <p className="font-bold">
                Looking for more hotels?
              </p>

              <p className="text-sm text-blue-200">
                Explore all properties available near you.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() => navigate("/hotels")}
            className="inline-flex items-center gap-2 rounded-xl border border-yellow-400 px-5 py-2.5 text-sm font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-slate-950"
          >
            Explore Hotels

            <ArrowRight size={16} />
          </button>

        </div>

      </div>
    </section>
  );
};

export default NearbyProperties;
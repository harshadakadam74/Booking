import React, { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Heart,
  Waves,
  Sparkles,
  LocateFixed,
  List,
  Map,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { listHotels } from "../../services/destinationService";

const formatPrice = (price, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(price));
  } catch {
    return `${currency} ${Number(price).toLocaleString("en-IN")}`;
  }
};

const Hotels = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const latitudeParam = searchParams.get("lat");
  const longitudeParam = searchParams.get("lng");
  const latitude = latitudeParam === null ? Number.NaN : Number(latitudeParam);
  const longitude = longitudeParam === null ? Number.NaN : Number(longitudeParam);
  const hasUserLocation =
    latitudeParam !== null &&
    longitudeParam !== null &&
    latitudeParam.trim() !== "" &&
    longitudeParam.trim() !== "" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [radius, setRadius] = useState(10);
  const [view, setView] = useState("list");
  const [locationStatus, setLocationStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (hasUserLocation) {
      const query = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        radius: String(radius),
      });

      apiFetch(`/api/v1/hotels/nearby?${query}`)
        .then((response) => {
          if (cancelled) return;
          if (!Array.isArray(response?.properties)) {
            throw new Error("The hotel API returned an unexpected response. Check that the backend is running the current project version.");
          }
          const nearbyHotels = response.properties
            .filter((hotel) => (
              hotel?._id &&
              hotel.active !== false &&
              (!hotel.approvalStatus || hotel.approvalStatus === "approved") &&
              !hotel.isDemo
            ))
            .map((hotel) => ({
              ...hotel,
              id: String(hotel._id),
              rating: Number(hotel.rating) || 0,
              reviews: Number(hotel.ratingCount ?? hotel.reviews) || 0,
              amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
            }));
          setLoadError("");
          setHotels(nearbyHotels);
          setLocationStatus(`${nearbyHotels.length} stays found within ${radius} km.`);
        })
        .catch((error) => {
          if (!cancelled) {
            setHotels([]);
            setLoadError(error.message || "Unable to find nearby stays.");
            setLocationStatus("Nearby hotels could not be loaded.");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    listHotels({
      propertyType: "Hotel",
      page: 1,
      limit: 30,
    })
      .then((result) => {
        if (!Array.isArray(result?.properties)) {
          throw new Error("The hotel API returned an unexpected response. Check that the backend is running the current project version.");
        }
        const formattedHotels = result.properties
          .filter((hotel) => (
            hotel?._id &&
            hotel.active !== false &&
            (!hotel.approvalStatus || hotel.approvalStatus === "approved") &&
            !hotel.isDemo
          ))
          .map((hotel) => ({
            ...hotel,
            id: String(hotel._id),
            rating: Number(hotel.rating) || 0,
            reviews: Number(hotel.ratingCount ?? hotel.reviews) || 0,
            amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
          }));
        if (!cancelled) {
          setLoadError("");
          setHotels(formattedHotels);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setHotels([]);
          setLoadError(error.message || "Unable to load hotels.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasUserLocation, latitude, longitude, radius, retry]);

  const handleRadiusChange = (event) => {
    setLoading(true);
    setLocationStatus("Finding stays near your location...");
    setRadius(Number(event.target.value));
  };
  const [likedProperties, setLikedProperties] = useState(() => {
    try {
      const liked = localStorage.getItem("likedProperties");
      return liked ? new Set(JSON.parse(liked).map(String)) : new Set();
    } catch (error) {
      console.error("Error loading liked properties:", error);
      return new Set();
    }
  });

  // =========================
  // Load liked properties
  // =========================
  // =========================
  // Like / Unlike
  // =========================
  const toggleLike = (propertyId) => {
    setLikedProperties((prev) => {
      const newLiked = new Set(prev);

      if (newLiked.has(propertyId)) {
        newLiked.delete(propertyId);
      } else {
        newLiked.add(propertyId);
      }

      localStorage.setItem(
        "likedProperties",
        JSON.stringify([...newLiked])
      );

      return newLiked;
    });
  };

  // =========================
  // Amenity Icons
  // =========================
  const getAmenityIcon = (amenity) => {
    const iconClass = "text-[#C58A18]";
    const normalizedAmenity = String(amenity).toLowerCase().replace(/[^a-z]/g, "");

    switch (normalizedAmenity) {
      case "wifi":
      case "wirelessinternet":
        return <Wifi size={18} className={iconClass} />;

      case "parking":
        return <Car size={18} className={iconClass} />;

      case "restaurant":
        return <Utensils size={18} className={iconClass} />;

      case "gym":
        return <Dumbbell size={18} className={iconClass} />;

      case "pool":
      case "swimmingpool":
        return <Waves size={18} className={iconClass} />;

      case "spa":
        return <Sparkles size={18} className={iconClass} />;

      default:
        return null;
    }
  };

  // =========================
  // Book Now
  // =========================
  const handleBookNow = (hotel) => {
    const hotelId = String(hotel._id || "");
    if (!/^[a-f\d]{24}$/i.test(hotelId)) {
      setLoadError("This hotel listing has an invalid database ID. Please retry.");
      return;
    }

    navigate(`/hotels/${encodeURIComponent(hotelId)}`);
  };

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <section className="flex min-h-100 items-center justify-center bg-[#F7F9FC]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#C58A18]" />

          <p className="font-medium text-[#082B5C]">
            Finding the best hotels...
          </p>
        </div>
      </section>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <section className="min-h-screen bg-[#F7F9FC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            Header
        ========================= */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-[#082B5C] px-6 py-8 shadow-xl sm:px-10 sm:py-10">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-24 border-[#E3AE32]/10" />
          <div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-[#C58A18]/10 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E3AE32]/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E3AE32]">
              <Sparkles size={15} />
              FastBooking stays
            </div>

            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              Find your next favorite hotel
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Compare trusted stays, discover memorable destinations, and book
              with confidence through FastBooking.
            </p>
          </div>
        </div>

        {hasUserLocation && (
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#082B5C]">
              <LocateFixed size={18} className="text-[#C58A18]" />
              <span>{locationStatus || "Hotels near your location"}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span>Distance</span>
                <select
                  value={radius}
                  onChange={handleRadiusChange}
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#C58A18]"
                >
                  <option value="1">Within 1 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                </select>
              </label>

              <div className="flex rounded-lg border border-slate-200 p-1" aria-label="Hotel view">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${view === "list" ? "bg-[#082B5C] text-white" : "text-slate-600"}`}
                >
                  <List size={16} /> List
                </button>
                <button
                  type="button"
                  onClick={() => setView("map")}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${view === "map" ? "bg-[#082B5C] text-white" : "text-slate-600"}`}
                >
                  <Map size={16} /> Map links
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================
            Hotel Grid
        ========================= */}
        {view === "map" && hasUserLocation && hotels.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => {
              const coordinates = hotel.geoLocation?.coordinates;
              const longitude = Number(coordinates?.[0]);
              const latitudeValue = Number(coordinates?.[1]);
              const hasCoordinates = Number.isFinite(longitude) &&
                Number.isFinite(latitudeValue) &&
                Math.abs(longitude) <= 180 &&
                Math.abs(latitudeValue) <= 90;
              const mapUrl = hasCoordinates
                ? `https://www.openstreetmap.org/?mlat=${latitudeValue}&mlon=${longitude}#map=16/${latitudeValue}/${longitude}`
                : "";

              return (
                <article key={hotel.id} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                  <h2 className="font-bold text-[#082B5C]">{hotel.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{hotel.city || hotel.location || hotel.address}</p>
                  {hasCoordinates ? (
                    <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#082B5C] underline decoration-[#C58A18] underline-offset-4">
                      <MapPin size={16} className="text-[#C58A18]" /> Open map
                    </a>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">Map coordinates are not available for this listing.</p>
                  )}
                  <button type="button" onClick={() => handleBookNow(hotel)} className="mt-4 block text-sm font-bold text-[#082B5C]">View hotel details</button>
                </article>
              );
            })}
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-[#082B5C]">Hotels could not be loaded</h2>
            <p className="mt-2 text-sm text-slate-600">{loadError}</p>
            <button type="button" onClick={() => { setLoading(true); setRetry((value) => value + 1); }} className="mt-5 rounded-lg bg-[#082B5C] px-5 py-2.5 text-sm font-bold text-white">Retry</button>
          </div>
        ) : hotels.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-[#082B5C]">
              No hotels are currently available
            </h2>

            <p className="mt-2 text-slate-500">
              Approved hotel listings will appear here when they are available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="
                  group
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[#C58A18]/40
                  hover:shadow-xl
                "
              >
                {/* =========================
                    Image
                ========================= */}
                <div className="relative overflow-hidden">
                  {hotel.image || hotel.images?.[0] ? (
                    <div className="relative">
                      <img
                        src={hotel.image || hotel.images[0]}
                        alt={hotel.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                        className="
                      h-56
                      w-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                      />
                      <div className="hidden h-56 flex items-center justify-center bg-gradient-to-br from-[#082B5C] to-[#E3AE32] text-sm font-semibold text-white">
                        Hotel image unavailable
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-gradient-to-br from-[#082B5C] to-[#E3AE32] text-sm font-semibold text-white" aria-label="No hotel image available">
                      No hotel image available
                    </div>
                  )}

                  {/* Dark image overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

                  {/* Favorite */}
                  <button
                    type="button"
                    onClick={() => toggleLike(hotel.id)}
                    aria-label={
                      likedProperties.has(hotel.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    className="
                      absolute
                      right-3
                      top-3
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      bg-white/95
                      shadow-md
                      transition-all
                      duration-300
                      hover:scale-110
                    "
                  >
                    <Heart
                      size={20}
                      className={
                        likedProperties.has(hotel.id)
                          ? "fill-red-500 text-red-500"
                          : "text-[#082B5C]"
                      }
                    />
                  </button>
                </div>

                {/* =========================
                    Content
                ========================= */}
                <div className="p-5">

                  {/* Hotel name */}
                  {hotel.isDemo && (
                    <p className="mb-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-950">
                      DEMO · NOT A REAL HOTEL
                    </p>
                  )}
                  <h2 className="
                    mb-2
                    line-clamp-1
                    text-xl
                    font-bold
                    text-[#082B5C]
                  ">
                    {hotel.name}
                  </h2>

                  {/* Location */}
                  <div className="mb-3 flex items-center">
                    <MapPin
                      size={16}
                      className="mr-1.5 shrink-0 text-[#C58A18]"
                    />

                    <span className="truncate text-sm text-slate-500">
                      {[hotel.city || hotel.location, hotel.state, hotel.country].filter(Boolean).join(", ")}
                    </span>
                  </div>

                  {hotel.distanceKm !== undefined && (
                    <p className="mb-3 flex items-center gap-1 text-sm font-semibold text-[#082B5C]">
                      <MapPin size={15} className="text-[#C58A18]" />
                      {hotel.distanceKm.toFixed(1)} km from your location
                    </p>
                  )}

                  {/* Rating */}
                  {hotel.reviews > 0 && hotel.rating > 0 ? (
                    <div className="mb-4 flex items-center">
                      <div className="
                      flex
                      items-center
                      gap-1
                      rounded-md
                      bg-[#FFF8E7]
                      px-2
                      py-1
                    ">
                      <Star
                        size={15}
                        className="fill-[#C58A18] text-[#C58A18]"
                      />

                      <span className="text-sm font-bold text-[#082B5C]">
                        {hotel.rating.toFixed(1)}
                      </span>
                    </div>

                    <span className="ml-2 text-sm text-slate-500">
                      ({hotel.reviews.toLocaleString()} reviews)
                    </span>
                  </div>
                  ) : (
                    <p className="mb-4 text-sm font-medium text-slate-500">
                      {hotel.reviews > 0 ? `${hotel.reviews.toLocaleString()} guest reviews` : "New listing · Be the first to review"}
                    </p>
                  )}

                  {hotel.availableRooms !== undefined && (
                    <p className={`mb-4 text-sm font-semibold ${hotel.availableRooms > 0 ? "text-green-700" : "text-red-600"}`}>
                      {hotel.availableRooms > 0 ? `${hotel.availableRooms} rooms available` : "Sold out"}
                    </p>
                  )}

                  {/* Divider */}
                  <div className="mb-4 h-px bg-slate-100" />

                  {/* Amenities */}
                  <div className="mb-5 flex items-center gap-2">
                    {hotel.amenities.slice(0, 4).map((amenity) => (
                      <div
                        key={amenity}
                        title={amenity}
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          bg-[#FFF8E7]
                        "
                      >
                        {getAmenityIcon(amenity)}
                      </div>
                    ))}

                    {hotel.amenities.length > 4 && (
                      <span className="text-xs text-slate-500">
                        +{hotel.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* =========================
                      Price + Book
                  ========================= */}
                  <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="
                          text-2xl
                          font-bold
                          text-[#082B5C]
                        ">
                          {formatPrice(hotel.price, hotel.currency || "INR")}
                        </span>

                        <span className="text-sm text-slate-500">
                          / room, per night
                        </span>
                      </div>

                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleBookNow(hotel)}
                        className="
                          inline-flex
                          flex-1
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-[#082B5C]
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-[#082B5C]
                          transition-all
                          duration-300
                          hover:bg-blue-50
                        "
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        disabled={hotel.isDemo || hotel.availableRooms === 0}
                        title={hotel.isDemo ? "Demo listings cannot be booked." : undefined}
                        onClick={() => handleBookNow(hotel)}
                        className="
                        inline-flex
                        flex-1
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#082B5C]
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:bg-[#C58A18]
                        hover:shadow-md
                        disabled:cursor-not-allowed
                        disabled:bg-slate-300
                        disabled:hover:translate-y-0
                      "
                      >
                        {hotel.isDemo ? "Demo Only" : "Book Now"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gold bottom accent */}
                <div className="h-1 w-0 bg-[#C58A18] transition-all duration-300 group-hover:w-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hotels;
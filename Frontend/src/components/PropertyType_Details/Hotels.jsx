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
import { fetchPublicProperties } from "../../services/authService";
import { apiFetch } from "../../services/api";
import { getPricePrediction } from "../../utils/pricePrediction";

const Hotels = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lng"));
  const hasUserLocation = Number.isFinite(latitude) && Number.isFinite(longitude);

  // =========================
  // Hotel Data
  // =========================
  const [hotels, setHotels] = useState(() => {
   const mockHotels = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    location: "New York, USA",
    rating: 4.5,
    reviews: 1250,
    price: 150,
    originalPrice: 200,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "gym"],
    discount: 25,
  },

  {
    id: 2,
    name: "Ocean View Resort",
    location: "Miami, USA",
    rating: 4.8,
    reviews: 890,
    price: 220,
    originalPrice: 280,
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "pool"],
    discount: 21,
  },

  {
    id: 3,
    name: "Mountain Lodge",
    location: "Aspen, USA",
    rating: 4.3,
    reviews: 650,
    price: 180,
    originalPrice: 230,
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "spa"],
    discount: 22,
  },

  {
    id: 4,
    name: "Royal Palace Hotel",
    location: "Dubai, UAE",
    rating: 4.9,
    reviews: 2100,
    price: 320,
    originalPrice: 420,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "pool"],
    discount: 24,
  },

  {
    id: 5,
    name: "Taj Heritage Resort",
    location: "Jaipur, India",
    rating: 4.7,
    reviews: 980,
    price: 110,
    originalPrice: 150,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "spa"],
    discount: 27,
  },

  {
    id: 6,
    name: "Beach Paradise Resort",
    location: "Goa, India",
    rating: 4.6,
    reviews: 760,
    price: 130,
    originalPrice: 180,
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "pool"],
    discount: 28,
  },

  {
    id: 7,
    name: "Luxury Hills Resort",
    location: "Manali, India",
    rating: 4.5,
    reviews: 540,
    price: 95,
    originalPrice: 130,
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "spa"],
    discount: 27,
  },

  {
    id: 8,
    name: "Royal London Hotel",
    location: "London, UK",
    rating: 4.6,
    reviews: 1420,
    price: 240,
    originalPrice: 300,
    image:
      "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "gym"],
    discount: 20,
  },

  {
    id: 9,
    name: "Paris Luxury Stay",
    location: "Paris, France",
    rating: 4.8,
    reviews: 1680,
    price: 280,
    originalPrice: 350,
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "restaurant", "gym", "spa"],
    discount: 20,
  },

  {
    id: 10,
    name: "Tokyo Grand Hotel",
    location: "Tokyo, Japan",
    rating: 4.7,
    reviews: 1890,
    price: 210,
    originalPrice: 270,
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "gym"],
    discount: 22,
  },

  {
    id: 11,
    name: "Swiss Alpine Resort",
    location: "Zermatt, Switzerland",
    rating: 4.9,
    reviews: 870,
    price: 350,
    originalPrice: 450,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "spa"],
    discount: 22,
  },

  {
    id: 12,
    name: "Bali Tropical Resort",
    location: "Bali, Indonesia",
    rating: 4.8,
    reviews: 1120,
    price: 160,
    originalPrice: 210,
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "restaurant", "pool", "spa"],
    discount: 24,
  },
    ];

    return mockHotels;
  });
  const [loading, setLoading] = useState(true);
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
          const nearbyHotels = (response.properties || []).map((hotel) => ({
            ...hotel,
            id: hotel._id,
            rating: hotel.rating || 0,
            reviews: hotel.reviews || 0,
            originalPrice: hotel.price,
            discount: 0,
            amenities: hotel.amenities || [],
          }));
          setHotels(nearbyHotels);
          setLocationStatus(`${nearbyHotels.length} stays found within ${radius} km.`);
        })
        .catch((error) => {
          if (!cancelled) setLocationStatus(error.message || "Unable to find nearby stays.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    fetchPublicProperties()
      .then((managedHotels) => {
        const formattedHotels = managedHotels.map((hotel) => ({
          ...hotel,
          id: hotel._id,
          rating: hotel.rating || 0,
          reviews: hotel.reviews || 0,
          originalPrice: hotel.price,
          discount: 0,
          amenities: hotel.amenities || [],
        }));
        if (!cancelled) setHotels((currentHotels) => [...formattedHotels, ...currentHotels]);
      })
      .catch((error) => console.error("Error loading managed hotels:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasUserLocation, latitude, longitude, radius]);

  const handleRadiusChange = (event) => {
    setLoading(true);
    setLocationStatus("Finding stays near your location...");
    setRadius(Number(event.target.value));
  };
  const [likedProperties, setLikedProperties] = useState(() => {
    try {
      const liked = localStorage.getItem("likedProperties");
      return liked ? new Set(JSON.parse(liked)) : new Set();
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

    switch (amenity) {
      case "wifi":
        return <Wifi size={18} className={iconClass} />;

      case "parking":
        return <Car size={18} className={iconClass} />;

      case "restaurant":
        return <Utensils size={18} className={iconClass} />;

      case "gym":
        return <Dumbbell size={18} className={iconClass} />;

      case "pool":
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
    const prediction = getPricePrediction({
      price: hotel.price,
      checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      availableRooms: hotel.availableRooms,
      totalRooms: hotel.totalRooms,
    });

    navigate("/payment", {
      state: {
        property: {
          ...hotel,
          price: prediction.predictedPrice,
          basePrice: hotel.price,
          type: "Hotel",
        },
        pricePrediction: prediction,

        searchParams: {
          location: hotel.location,

          dates: {
            startDate: new Date(),
            endDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
          },

          guests: {
            adults: 2,
            children: 0,
            rooms: 1,
          },
        },
      },
    });
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
                  <Map size={16} /> Map
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================
            Hotel Grid
        ========================= */}
        {view === "map" && hasUserLocation && hotels.length > 0 ? (
          <div className="relative min-h-120 overflow-hidden rounded-3xl border border-blue-100 bg-[#e7f0ea] bg-[linear-gradient(90deg,rgba(30,90,70,.12)_1px,transparent_1px),linear-gradient(rgba(30,90,70,.12)_1px,transparent_1px)] bg-size-[42px_42px] p-6">
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-[#082B5C]">
              <div className="rounded-full bg-[#082B5C] p-2 text-white shadow-lg"><LocateFixed size={18} /></div>
              <span className="mt-1 rounded bg-white/95 px-2 py-1 text-xs font-bold shadow">You</span>
            </div>
            {hotels.map((hotel, index) => (
              <button
                key={hotel.id}
                type="button"
                onClick={() => navigate(`/book?hotel=${hotel.id}`)}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-[#082B5C]"
                style={{ left: `${18 + ((index * 29) % 68)}%`, top: `${20 + ((index * 37) % 58)}%` }}
                title={`View ${hotel.name}`}
              >
                <MapPin className="fill-[#C58A18] text-[#082B5C] drop-shadow" size={30} />
                <span className="max-w-40 truncate rounded bg-white/95 px-2 py-1 text-xs font-bold shadow">{hotel.name}</span>
                <span className="rounded bg-white/90 px-2 py-0.5 text-[11px] shadow">{hotel.distanceKm} km</span>
              </button>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-[#082B5C]">
              No hotels found
            </h2>

            <p className="mt-2 text-slate-500">
              Please try again later.
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
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="
                      h-56
                      w-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />

                  {/* Dark image overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

                  {/* Discount */}
                  {hotel.discount > 0 && (
                    <div className="
                      absolute
                      left-3
                      top-3
                      rounded-full
                      bg-[#C58A18]
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-white
                      shadow-md
                    ">
                      {hotel.discount}% OFF
                    </div>
                  )}

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
                      {hotel.location}
                    </span>
                  </div>

                  {hotel.distanceKm !== undefined && (
                    <p className="mb-3 flex items-center gap-1 text-sm font-semibold text-[#082B5C]">
                      <MapPin size={15} className="text-[#C58A18]" />
                      {hotel.distanceKm.toFixed(1)} km from your location
                    </p>
                  )}

                  {/* Rating */}
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
                        {hotel.rating}
                      </span>
                    </div>

                    <span className="ml-2 text-sm text-slate-500">
                      ({hotel.reviews.toLocaleString()} reviews)
                    </span>
                  </div>

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
                  <div className="flex items-end justify-between gap-3">

                    <div>
                      {(() => {
                        const prediction = getPricePrediction({
                          price: hotel.price,
                          checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                          availableRooms: hotel.availableRooms,
                          totalRooms: hotel.totalRooms,
                        });

                        return (
                          <p className={`mb-1 text-xs font-semibold ${prediction.direction === "increase" ? "text-amber-700" : prediction.direction === "decrease" ? "text-green-700" : "text-slate-500"}`}>
                            {prediction.message}
                          </p>
                        );
                      })()}
                      <div className="flex items-baseline gap-1">
                        <span className="
                          text-2xl
                          font-bold
                          text-[#082B5C]
                        ">
                          ${hotel.price}
                        </span>

                        <span className="text-sm text-slate-500">
                          / night
                        </span>
                      </div>

                      {hotel.originalPrice && (
                        <span className="
                          text-sm
                          text-slate-400
                          line-through
                        ">
                          ${hotel.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={hotel.availableRooms === 0}
                      onClick={() => handleBookNow(hotel)}
                      className="
                        inline-flex
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
                      Book Now
                    </button>
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
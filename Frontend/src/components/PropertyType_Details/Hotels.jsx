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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());

  const navigate = useNavigate();

  // =========================
  // Hotel Data
  // =========================
  useEffect(() => {
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
    ];

    setHotels(mockHotels);
    setLoading(false);
  }, []);

  // =========================
  // Load liked properties
  // =========================
  useEffect(() => {
    try {
      const liked = localStorage.getItem("likedProperties");

      if (liked) {
        setLikedProperties(new Set(JSON.parse(liked)));
      }
    } catch (error) {
      console.error("Error loading liked properties:", error);
      setLikedProperties(new Set());
    }
  }, []);

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
    navigate("/payment", {
      state: {
        property: {
          ...hotel,
          type: "Hotel",
        },

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
      <section className="min-h-[400px] flex items-center justify-center bg-slate-50">
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
    <section className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            Header
        ========================= */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 rounded-full bg-[#C58A18]" />

            <div>
              <h1 className="text-2xl font-bold text-[#082B5C] sm:text-3xl md:text-4xl">
                Hotels
              </h1>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Find the perfect hotel for your stay
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            Hotel Grid
        ========================= */}
        {hotels.length === 0 ? (
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
                  border-blue-100
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

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
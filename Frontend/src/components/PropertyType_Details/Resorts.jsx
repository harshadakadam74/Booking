import React, { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Waves,
  Heart,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Resorts = () => {
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());

  const navigate = useNavigate();

  // =========================
  // Resort Data
  // =========================
  useEffect(() => {
    const mockResorts = [
      {
        id: 1,
        name: "Tropical Paradise Resort",
        location: "Hawaii, USA",
        rating: 4.9,
        reviews: 2100,
        price: 350,
        originalPrice: 450,
        image:
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800&h=600",
        amenities: ["wifi", "parking", "restaurant", "pool", "spa"],
        discount: 22,
      },
      {
        id: 2,
        name: "Mountain View Resort",
        location: "Colorado, USA",
        rating: 4.7,
        reviews: 1500,
        price: 280,
        originalPrice: 350,
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800&h=600",
        amenities: ["wifi", "parking", "restaurant", "spa"],
        discount: 20,
      },
      {
        id: 3,
        name: "Desert Oasis Resort",
        location: "Arizona, USA",
        rating: 4.5,
        reviews: 1200,
        price: 250,
        originalPrice: 320,
        image:
          "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800&h=600",
        amenities: ["wifi", "parking", "restaurant", "pool"],
        discount: 22,
      },
    ];

    setResorts(mockResorts);
    setLoading(false);
  }, []);

  // =========================
  // Load Favorites
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
  const handleBookNow = (resort) => {
    navigate("/payment", {
      state: {
        property: {
          ...resort,
          type: "Resort",
        },

        searchParams: {
          location: resort.location,

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
            Finding the best resorts...
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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 rounded-full bg-[#C58A18]" />

            <div>
              <h1 className="text-2xl font-bold text-[#082B5C] sm:text-3xl md:text-4xl">
                Resorts
              </h1>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Luxurious resorts for your dream vacation
              </p>
            </div>
          </div>
        </div>

        {/* Resort Grid */}
        {resorts.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-[#082B5C]">
              No resorts found
            </h2>

            <p className="mt-2 text-slate-500">
              Please try again later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resorts.map((resort) => (
              <div
                key={resort.id}
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
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={resort.image}
                    alt={resort.name}
                    className="
                      h-56
                      w-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  {/* Discount */}
                  {resort.discount > 0 && (
                    <div
                      className="
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
                      "
                    >
                      {resort.discount}% OFF
                    </div>
                  )}

                  {/* Favorite */}
                  <button
                    type="button"
                    onClick={() => toggleLike(resort.id)}
                    aria-label={
                      likedProperties.has(resort.id)
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
                        likedProperties.has(resort.id)
                          ? "fill-red-500 text-red-500"
                          : "text-[#082B5C]"
                      }
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">

                  {/* Name */}
                  <h2
                    className="
                      mb-2
                      line-clamp-1
                      text-xl
                      font-bold
                      text-[#082B5C]
                    "
                  >
                    {resort.name}
                  </h2>

                  {/* Location */}
                  <div className="mb-3 flex items-center">
                    <MapPin
                      size={16}
                      className="mr-1.5 shrink-0 text-[#C58A18]"
                    />

                    <span className="truncate text-sm text-slate-500">
                      {resort.location}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="mb-4 flex items-center">
                    <div
                      className="
                        flex
                        items-center
                        gap-1
                        rounded-md
                        bg-[#FFF8E7]
                        px-2
                        py-1
                      "
                    >
                      <Star
                        size={15}
                        className="fill-[#C58A18] text-[#C58A18]"
                      />

                      <span className="text-sm font-bold text-[#082B5C]">
                        {resort.rating}
                      </span>
                    </div>

                    <span className="ml-2 text-sm text-slate-500">
                      ({resort.reviews.toLocaleString()} reviews)
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="mb-4 h-px bg-slate-100" />

                  {/* Amenities */}
                  <div className="mb-5 flex items-center gap-2">
                    {resort.amenities.slice(0, 4).map((amenity) => (
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

                    {resort.amenities.length > 4 && (
                      <span className="text-xs text-slate-500">
                        +{resort.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Price + Book */}
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#082B5C]">
                          ${resort.price}
                        </span>

                        <span className="text-sm text-slate-500">
                          / night
                        </span>
                      </div>

                      {resort.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          ${resort.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookNow(resort)}
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
                <div
                  className="
                    h-1
                    w-0
                    bg-[#C58A18]
                    transition-all
                    duration-300
                    group-hover:w-full
                  "
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Resorts;
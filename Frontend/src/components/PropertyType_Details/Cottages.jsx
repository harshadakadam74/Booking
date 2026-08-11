import React, { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Flame,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cottages = () => {
  const [cottages, setCottages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());

  const navigate = useNavigate();

  // =====================================================
  // LOAD COTTAGES
  // =====================================================

  useEffect(() => {
    const mockCottages = [
      {
        id: 1,
        name: "Rustic Mountain Cottage",
        location: "Colorado, USA",
        rating: 4.7,
        reviews: 320,
        price: 180,
        originalPrice: 220,
        image:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=800",
        amenities: ["wifi", "parking", "kitchen", "fireplace"],
        discount: 18,
      },
      {
        id: 2,
        name: "Lakeview Cottage",
        location: "Maine, USA",
        rating: 4.5,
        reviews: 280,
        price: 160,
        originalPrice: 200,
        image:
          "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800",
        amenities: ["wifi", "parking", "kitchen", "fireplace"],
        discount: 20,
      },
      {
        id: 3,
        name: "Countryside Cottage",
        location: "Vermont, USA",
        rating: 4.6,
        reviews: 190,
        price: 140,
        originalPrice: 175,
        image:
          "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800",
        amenities: ["wifi", "parking", "kitchen"],
        discount: 20,
      },
    ];

    setCottages(mockCottages);
    setLoading(false);
  }, []);

  // =====================================================
  // LOAD FAVORITES
  // =====================================================

  useEffect(() => {
    try {
      const liked = localStorage.getItem("likedProperties");

      if (liked) {
        setLikedProperties(new Set(JSON.parse(liked)));
      }
    } catch (error) {
      console.error("Error loading liked properties:", error);
    }
  }, []);

  // =====================================================
  // TOGGLE FAVORITE
  // =====================================================

  const toggleLike = (propertyId) => {
    const newLiked = new Set(likedProperties);

    if (newLiked.has(propertyId)) {
      newLiked.delete(propertyId);
    } else {
      newLiked.add(propertyId);
    }

    setLikedProperties(newLiked);

    localStorage.setItem(
      "likedProperties",
      JSON.stringify([...newLiked])
    );
  };

  // =====================================================
  // AMENITY ICON
  // =====================================================

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <Wifi size={18} />;

      case "parking":
        return <Car size={18} />;

      case "kitchen":
        return <Utensils size={18} />;

      case "fireplace":
        return <Flame size={18} />;

      default:
        return null;
    }
  };

  // =====================================================
  // BOOK NOW
  // =====================================================

  const handleBookNow = (cottage) => {
    navigate("/payment", {
      state: {
        property: {
          ...cottage,
          type: "Cottage",
        },

        searchParams: {
          location: cottage.location,

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

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#C58A18]" />
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#082B5C] sm:text-3xl">
          Cottages
        </h2>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Charming cottages for a cozy retreat
        </p>
      </div>

      {/* Cottage Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {cottages.map((cottage) => (
          <div
            key={cottage.id}
            className="group overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C58A18]/40 hover:shadow-xl"
          >

            {/* Image */}
            <div className="relative overflow-hidden">

              <img
                src={cottage.image}
                alt={cottage.name}
                className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
              />

              {/* Discount */}
              {cottage.discount > 0 && (
                <div className="absolute left-3 top-3 rounded-full bg-[#C58A18] px-3 py-1 text-xs font-bold text-white shadow-md">
                  {cottage.discount}% OFF
                </div>
              )}

              {/* Favorite */}
              <button
                type="button"
                onClick={() => toggleLike(cottage.id)}
                aria-label={
                  likedProperties.has(cottage.id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2.5 shadow-md backdrop-blur transition hover:bg-white"
              >
                <Heart
                  size={20}
                  className={
                    likedProperties.has(cottage.id)
                      ? "fill-red-500 text-red-500"
                      : "text-[#082B5C]"
                  }
                />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">

              {/* Name */}
              <h3 className="text-xl font-bold text-[#082B5C]">
                {cottage.name}
              </h3>

              {/* Location */}
              <div className="mt-2 flex items-center gap-1.5">
                <MapPin
                  size={16}
                  className="text-[#C58A18]"
                />

                <span className="text-sm text-slate-500">
                  {cottage.location}
                </span>
              </div>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-1.5">

                <Star
                  size={16}
                  className="fill-[#C58A18] text-[#C58A18]"
                />

                <span className="text-sm font-semibold text-[#082B5C]">
                  {cottage.rating}
                </span>

                <span className="text-sm text-slate-400">
                  ({cottage.reviews} reviews)
                </span>

              </div>

              {/* Amenities */}
              <div className="mt-4 flex items-center gap-2">

                {cottage.amenities
                  .slice(0, 3)
                  .map((amenity) => (
                    <div
                      key={amenity}
                      title={amenity}
                      className="rounded-lg bg-blue-50 p-2 text-[#082B5C]"
                    >
                      {getAmenityIcon(amenity)}
                    </div>
                  ))}

                {cottage.amenities.length > 3 && (
                  <span className="text-xs text-slate-500">
                    +{cottage.amenities.length - 3} more
                  </span>
                )}

              </div>

              {/* Divider */}
              <div className="my-5 h-px bg-blue-100" />

              {/* Price */}
              <div className="flex items-center justify-between gap-3">

                <div>
                  <div className="flex items-baseline gap-2">

                    <span className="text-2xl font-bold text-[#082B5C]">
                      ${cottage.price}
                    </span>

                    {cottage.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        ${cottage.originalPrice}
                      </span>
                    )}

                  </div>

                  <span className="text-xs text-slate-500">
                    per night
                  </span>
                </div>

                {/* Book Button */}
                <button
                  type="button"
                  onClick={() => handleBookNow(cottage)}
                  className="rounded-xl bg-[#082B5C] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C58A18] hover:shadow-md"
                >
                  Book Now
                </button>

              </div>

            </div>

            {/* Bottom Accent */}
            <div className="h-1 bg-gradient-to-r from-[#082B5C] via-[#C58A18] to-[#082B5C]" />

          </div>
        ))}

      </div>
    </section>
  );
};

export default Cottages;
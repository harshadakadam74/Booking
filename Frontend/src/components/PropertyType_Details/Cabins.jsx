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

const Cabins = () => {
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());

  const navigate = useNavigate();

  // =====================================================
  // LOAD CABINS
  // =====================================================

  useEffect(() => {
   const mockCabins = [
  {
    id: 1,
    name: "Cozy Forest Cabin",
    location: "Oregon, USA",
    rating: 4.5,
    reviews: 480,
    price: 120,
    originalPrice: 150,
    image:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    discount: 20,
  },
  {
    id: 2,
    name: "Lakeview Cabin",
    location: "Maine, USA",
    rating: 4.7,
    reviews: 320,
    price: 140,
    originalPrice: 175,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    discount: 20,
  },
  {
    id: 3,
    name: "Mountain Cabin Retreat",
    location: "Colorado, USA",
    rating: 4.6,
    reviews: 550,
    price: 160,
    originalPrice: 200,
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    discount: 20,
  },

  // 4
  {
    id: 4,
    name: "Pinewood Hideaway",
    location: "Montana, USA",
    rating: 4.8,
    reviews: 690,
    price: 185,
    originalPrice: 230,
    image:
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "fireplace"],
    discount: 20,
  },

  // 5
  {
    id: 5,
    name: "Snowy Mountain Lodge",
    location: "Vermont, USA",
    rating: 4.9,
    reviews: 870,
    price: 210,
    originalPrice: 260,
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    discount: 19,
  },

  // 6
  {
    id: 6,
    name: "Woodland Escape",
    location: "Washington, USA",
    rating: 4.6,
    reviews: 410,
    price: 135,
    originalPrice: 165,
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "fireplace"],
    discount: 18,
  },

  // 7
  {
    id: 7,
    name: "Riverfront Cabin",
    location: "North Carolina, USA",
    rating: 4.7,
    reviews: 530,
    price: 155,
    originalPrice: 195,
    image:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen"],
    discount: 21,
  },

  // 8
  {
    id: 8,
    name: "Luxury Glass Cabin",
    location: "Alaska, USA",
    rating: 4.9,
    reviews: 760,
    price: 280,
    originalPrice: 350,
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    discount: 20,
  },

  // 9
  {
    id: 9,
    name: "Lakeside Wooden Cabin",
    location: "Minnesota, USA",
    rating: 4.5,
    reviews: 350,
    price: 125,
    originalPrice: 160,
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen"],
    discount: 22,
  },

  // 10
  {
    id: 10,
    name: "Romantic Cabin Retreat",
    location: "Tennessee, USA",
    rating: 4.8,
    reviews: 620,
    price: 175,
    originalPrice: 220,
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "fireplace"],
    discount: 20,
  },

  // 11
  {
    id: 11,
    name: "Forest View Chalet",
    location: "British Columbia, Canada",
    rating: 4.7,
    reviews: 480,
    price: 190,
    originalPrice: 240,
    image:
      "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    discount: 21,
  },

  // 12
  {
    id: 12,
    name: "Hilltop Cabin",
    location: "Utah, USA",
    rating: 4.6,
    reviews: 390,
    price: 145,
    originalPrice: 180,
    image:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen"],
    discount: 19,
  },

  // 13
  {
    id: 13,
    name: "Private Forest Retreat",
    location: "Idaho, USA",
    rating: 4.8,
    reviews: 510,
    price: 170,
    originalPrice: 215,
    image:
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "fireplace"],
    discount: 21,
  },

  // 14
  {
    id: 14,
    name: "Mountain View Cabin",
    location: "Wyoming, USA",
    rating: 4.9,
    reviews: 830,
    price: 225,
    originalPrice: 280,
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    discount: 20,
  },

  // 15
  {
    id: 15,
    name: "Luxury Woodland Cabin",
    location: "New Hampshire, USA",
    rating: 4.7,
    reviews: 570,
    price: 200,
    originalPrice: 250,
    image:
      "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    discount: 20,
  },
];

    setCabins(mockCabins);
    setLoading(false);
  }, []);

  // =====================================================
  // LOAD LIKED PROPERTIES
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
  // LIKE / UNLIKE
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

  const handleBookNow = (cabin) => {
    navigate("/payment", {
      state: {
        property: {
          ...cabin,
          type: "Cabin",
        },

        searchParams: {
          location: cabin.location,

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
          Cabins
        </h2>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Rustic cabins for your nature escape
        </p>
      </div>

      {/* Cabin Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {cabins.map((cabin) => (
          <div
            key={cabin.id}
            className="group overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C58A18]/40 hover:shadow-xl"
          >

            {/* Image */}
            <div className="relative overflow-hidden">

              <img
                src={cabin.image}
                alt={cabin.name}
                className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
              />

              {/* Discount */}
              {cabin.discount > 0 && (
                <div className="absolute left-3 top-3 rounded-full bg-[#C58A18] px-3 py-1 text-xs font-bold text-white shadow-md">
                  {cabin.discount}% OFF
                </div>
              )}

              {/* Like Button */}
              <button
                type="button"
                onClick={() => toggleLike(cabin.id)}
                aria-label={`${
                  likedProperties.has(cabin.id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }`}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2.5 shadow-md backdrop-blur transition hover:bg-white"
              >
                <Heart
                  size={20}
                  className={
                    likedProperties.has(cabin.id)
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
                {cabin.name}
              </h3>

              {/* Location */}
              <div className="mt-2 flex items-center gap-1.5">
                <MapPin
                  size={16}
                  className="text-[#C58A18]"
                />

                <span className="text-sm text-slate-500">
                  {cabin.location}
                </span>
              </div>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-1.5">

                <Star
                  size={16}
                  className="fill-[#C58A18] text-[#C58A18]"
                />

                <span className="text-sm font-semibold text-[#082B5C]">
                  {cabin.rating}
                </span>

                <span className="text-sm text-slate-400">
                  ({cabin.reviews} reviews)
                </span>

              </div>

              {/* Amenities */}
              <div className="mt-4 flex items-center gap-2">

                {cabin.amenities
                  .slice(0, 3)
                  .map((amenity) => (
                    <div
                      key={amenity}
                      className="rounded-lg bg-blue-50 p-2 text-[#082B5C]"
                      title={amenity}
                    >
                      {getAmenityIcon(amenity)}
                    </div>
                  ))}

                {cabin.amenities.length > 3 && (
                  <span className="text-xs text-slate-500">
                    +{cabin.amenities.length - 3} more
                  </span>
                )}

              </div>

              {/* Divider */}
              <div className="my-5 h-px bg-blue-100" />

              {/* Price + Button */}
              <div className="flex items-center justify-between gap-3">

                <div>
                  <div className="flex items-baseline gap-2">

                    <span className="text-2xl font-bold text-[#082B5C]">
                      ${cabin.price}
                    </span>

                    {cabin.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        ${cabin.originalPrice}
                      </span>
                    )}

                  </div>

                  <span className="text-xs text-slate-500">
                    per night
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookNow(cabin)}
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

export default Cabins;
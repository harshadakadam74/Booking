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
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());

  const navigate = useNavigate();

  // =====================================================
  // LOAD APARTMENTS
  // =====================================================

  useEffect(() => {
   const mockApartments = [
  {
    id: 1,
    name: "City Center Apartment",
    location: "Los Angeles, USA",
    rating: 4.6,
    reviews: 980,
    price: 120,
    originalPrice: 550,
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen"],
    discount: 20,
  },

  {
    id: 2,
    name: "Downtown Loft",
    location: "Chicago, USA",
    rating: 4.4,
    reviews: 720,
    price: 140,
    originalPrice: 775,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "gym"],
    discount: 20,
  },

  {
    id: 3,
    name: "Beachfront Studio",
    location: "San Diego, USA",
    rating: 4.7,
    reviews: 1100,
    price: 160,
    originalPrice: 280,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "pool"],
    discount: 20,
  },

  {
    id: 4,
    name: "Luxury Sea View Apartment",
    location: "Goa, India",
    rating: 4.8,
    reviews: 1450,
    price: 95,
    originalPrice: 385,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "pool"],
    discount: 24,
  },

  {
    id: 5,
    name: "Modern City Apartment",
    location: "Mumbai, India",
    rating: 4.5,
    reviews: 860,
    price: 80,
    originalPrice: 655,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "gym"],
    discount: 24,
  },

  {
    id: 6,
    name: "Premium Apartment",
    location: "Dubai, UAE",
    rating: 4.9,
    reviews: 2100,
    price: 220,
    originalPrice: 280,
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "gym", "pool"],
    discount: 21,
  },

  {
    id: 7,
    name: "Luxury Downtown Residence",
    location: "New York, USA",
    rating: 4.7,
    reviews: 1750,
    price: 250,
    originalPrice: 320,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "gym", "kitchen"],
    discount: 22,
  },

  {
    id: 8,
    name: "Elegant Park View Apartment",
    location: "London, UK",
    rating: 4.6,
    reviews: 1320,
    price: 190,
    originalPrice: 440,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen"],
    discount: 21,
  },

  {
    id: 9,
    name: "Luxury Marina Apartment",
    location: "Singapore",
    rating: 4.8,
    reviews: 1680,
    price: 180,
    originalPrice: 530,
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "gym", "pool"],
    discount: 22,
  },

  {
    id: 10,
    name: "Modern Apartment Stay",
    location: "Paris, France",
    rating: 4.5,
    reviews: 940,
    price: 170,
    originalPrice: 315,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "kitchen", "parking"],
    discount: 21,
  },

  {
    id: 11,
    name: "Royal Palace Apartment",
    location: "Abu Dhabi, UAE",
    rating: 4.9,
    reviews: 1890,
    price: 230,
    originalPrice: 890,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "gym", "pool"],
    discount: 20,
  },

  {
    id: 12,
    name: "Mountain View Apartment",
    location: "Manali, India",
    rating: 4.7,
    reviews: 780,
    price: 770,
    originalPrice: 95,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "kitchen"],
    discount: 26,
  },

  {
    id: 13,
    name: "Luxury Lake View Residence",
    location: "Udaipur, India",
    rating: 4.8,
    reviews: 1120,
    price: 310,
    originalPrice: 145,
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "pool", "kitchen"],
    discount: 24,
  },

  {
    id: 14,
    name: "Skyline Apartment",
    location: "Bangalore, India",
    rating: 4.6,
    reviews: 990,
    price: 475,
    originalPrice: 100,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "parking", "gym"],
    discount: 25,
  },

  {
    id: 15,
    name: "Ocean View Residence",
    location: "Miami, USA",
    rating: 4.8,
    reviews: 1540,
    price: 210,
    originalPrice: 270,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    amenities: ["wifi", "pool", "parking"],
    discount: 22,
  },

 
];

    setApartments(mockApartments);
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
      console.error("Unable to load liked properties:", error);
    }
  }, []);

  // =====================================================
  // LIKE / UNLIKE
  // =====================================================

  const toggleLike = (propertyId) => {
    setLikedProperties((prev) => {
      const updated = new Set(prev);

      if (updated.has(propertyId)) {
        updated.delete(propertyId);
      } else {
        updated.add(propertyId);
      }

      localStorage.setItem(
        "likedProperties",
        JSON.stringify([...updated])
      );

      return updated;
    });
  };

  // =====================================================
  // AMENITY ICON
  // =====================================================

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <Wifi size={17} />;

      case "parking":
        return <Car size={17} />;

      case "kitchen":
        return <Utensils size={17} />;

      case "gym":
        return <Dumbbell size={17} />;

      case "pool":
        return <Waves size={17} />;

      default:
        return null;
    }
  };

  // =====================================================
  // BOOK NOW
  // =====================================================

  const handleBookNow = (apartment) => {
    navigate("/payment", {
      state: {
        property: {
          ...apartment,
          type: "Apartment",
        },

        searchParams: {
          location: apartment.location,

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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={36}
            className="animate-spin text-[#082B5C]"
          />

          <p className="text-sm text-slate-500">
            Loading apartments...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#C58A18]">
          FastBooking Stays
        </p>

        <h1 className="text-3xl font-bold text-[#082B5C] sm:text-4xl">
          Apartments
        </h1>

        <p className="mt-2 text-slate-500">
          Comfortable apartments for your stay
        </p>
      </div>

      {/* Apartment Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {apartments.map((apartment) => (
          <div
            key={apartment.id}
            className="
              group
              overflow-hidden
              rounded-3xl
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
                src={apartment.image}
                alt={apartment.name}
                className="
                  h-52
                  w-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
              />

              {/* Discount */}
              {apartment.discount > 0 && (
                <div className="
                  absolute
                  left-3
                  top-3
                  rounded-full
                  bg-[#C58A18]
                  px-3
                  py-1
                  text-xs
                  font-bold
                  text-white
                  shadow-md
                ">
                  {apartment.discount}% OFF
                </div>
              )}

              {/* Like */}
              <button
                type="button"
                onClick={() => toggleLike(apartment.id)}
                aria-label={
                  likedProperties.has(apartment.id)
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
                  transition
                  hover:scale-110
                "
              >
                <Heart
                  size={20}
                  className={
                    likedProperties.has(apartment.id)
                      ? "fill-red-500 text-red-500"
                      : "text-slate-600"
                  }
                />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">

              {/* Name */}
              <h2 className="text-xl font-bold text-[#082B5C]">
                {apartment.name}
              </h2>

              {/* Location */}
              <div className="mt-2 flex items-center gap-1.5">
                <MapPin
                  size={16}
                  className="text-[#C58A18]"
                />

                <span className="text-sm text-slate-500">
                  {apartment.location}
                </span>
              </div>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-1.5">

                <Star
                  size={16}
                  className="fill-[#E3AE32] text-[#E3AE32]"
                />

                <span className="text-sm font-semibold text-[#082B5C]">
                  {apartment.rating}
                </span>

                <span className="text-sm text-slate-400">
                  ({apartment.reviews} reviews)
                </span>

              </div>

              {/* Amenities */}
              <div className="mt-4 flex items-center gap-2">

                {apartment.amenities
                  .slice(0, 3)
                  .map((amenity, index) => (
                    <div
                      key={`${amenity}-${index}`}
                      title={amenity}
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-[#082B5C]
                      "
                    >
                      {getAmenityIcon(amenity)}
                    </div>
                  ))}

                {apartment.amenities.length > 3 && (
                  <span className="text-xs text-slate-500">
                    +{apartment.amenities.length - 3} more
                  </span>
                )}

              </div>

              {/* Divider */}
              <div className="my-5 h-px bg-slate-100" />

              {/* Price + Button */}
              <div className="flex items-center justify-between gap-3">

                <div>

                  <div className="flex items-baseline gap-2">

                    <span className="text-2xl font-bold text-[#082B5C]">
                      ${apartment.price}
                    </span>

                    {apartment.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        ${apartment.originalPrice}
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
                  onClick={() => handleBookNow(apartment)}
                  className="
                    rounded-xl
                    bg-[#082B5C]
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#C58A18]
                    hover:shadow-lg
                  "
                >
                  Book Now
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>

    </section>
  );
};

export default Apartments;
import React, { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Heart,
  CookingPot,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ServicedApartments = () => {
  const [servicedApartments, setServicedApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());

  const navigate = useNavigate();

  // --------------------------------------------------
  // Mock Data
  // --------------------------------------------------
  useEffect(() => {
   const mockServicedApartments = [
  {
    id: 1,
    name: "Executive City Apartments",
    location: "London, UK",
    rating: 4.5,
    reviews: 680,
    price: 200,
    originalPrice: 250,
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "kitchen"],
    discount: 20,
  },

  {
    id: 2,
    name: "Business District Suites",
    location: "New York, USA",
    rating: 4.7,
    reviews: 520,
    price: 180,
    originalPrice: 225,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "restaurant"],
    discount: 20,
  },

  {
    id: 3,
    name: "Downtown Serviced Living",
    location: "Singapore",
    rating: 4.6,
    reviews: 410,
    price: 160,
    originalPrice: 200,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "kitchen"],
    discount: 20,
  },

  {
    id: 4,
    name: "Luxury Harbour Apartments",
    location: "Sydney, Australia",
    rating: 4.8,
    reviews: 890,
    price: 240,
    originalPrice: 300,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "restaurant"],
    discount: 20,
  },

  {
    id: 5,
    name: "Modern City Suites",
    location: "Dubai, UAE",
    rating: 4.9,
    reviews: 1250,
    price: 210,
    originalPrice: 280,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "kitchen"],
    discount: 25,
  },

  {
    id: 6,
    name: "Central Park Residences",
    location: "Toronto, Canada",
    rating: 4.6,
    reviews: 570,
    price: 175,
    originalPrice: 220,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "restaurant"],
    discount: 20,
  },

  {
    id: 7,
    name: "Elegant Business Suites",
    location: "Paris, France",
    rating: 4.7,
    reviews: 740,
    price: 230,
    originalPrice: 290,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "restaurant"],
    discount: 21,
  },

  {
    id: 8,
    name: "Skyline Serviced Apartments",
    location: "Tokyo, Japan",
    rating: 4.8,
    reviews: 920,
    price: 195,
    originalPrice: 250,
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "kitchen"],
    discount: 22,
  },

  {
    id: 9,
    name: "Royal City Residences",
    location: "Mumbai, India",
    rating: 4.5,
    reviews: 610,
    price: 120,
    originalPrice: 160,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "restaurant"],
    discount: 25,
  },

  {
    id: 10,
    name: "Premium Urban Suites",
    location: "Singapore",
    rating: 4.8,
    reviews: 830,
    price: 190,
    originalPrice: 240,
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "kitchen"],
    discount: 21,
  },

  {
    id: 11,
    name: "Beachside Serviced Suites",
    location: "Barcelona, Spain",
    rating: 4.7,
    reviews: 690,
    price: 185,
    originalPrice: 235,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "gym"],
    discount: 21,
  },

  {
    id: 12,
    name: "Luxury Riverside Apartments",
    location: "Amsterdam, Netherlands",
    rating: 4.6,
    reviews: 480,
    price: 205,
    originalPrice: 260,
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "gym"],
    discount: 21,
  },

  {
    id: 13,
    name: "Manhattan Executive Living",
    location: "New York, USA",
    rating: 4.9,
    reviews: 1380,
    price: 275,
    originalPrice: 350,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "restaurant"],
    discount: 21,
  },

  {
    id: 14,
    name: "Marina View Residences",
    location: "Abu Dhabi, UAE",
    rating: 4.8,
    reviews: 760,
    price: 225,
    originalPrice: 290,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "kitchen"],
    discount: 22,
  },

  {
    id: 15,
    name: "Central Luxury Apartments",
    location: "Melbourne, Australia",
    rating: 4.7,
    reviews: 540,
    price: 170,
    originalPrice: 215,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "restaurant", "gym"],
    discount: 21,
  },

  {
    id: 16,
    name: "Garden View Serviced Suites",
    location: "Bangalore, India",
    rating: 4.6,
    reviews: 430,
    price: 110,
    originalPrice: 145,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "gym"],
    discount: 24,
  },

  {
    id: 17,
    name: "Elite Business Apartments",
    location: "Berlin, Germany",
    rating: 4.7,
    reviews: 620,
    price: 165,
    originalPrice: 210,
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "restaurant"],
    discount: 21,
  },

  {
    id: 18,
    name: "Luxury Downtown Residence",
    location: "Bangkok, Thailand",
    rating: 4.8,
    reviews: 850,
    price: 140,
    originalPrice: 185,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "gym", "kitchen"],
    discount: 24,
  },
];

    setServicedApartments(mockServicedApartments);
    setLoading(false);
  }, []);

  // --------------------------------------------------
  // Load liked properties
  // --------------------------------------------------
  useEffect(() => {
    const liked = localStorage.getItem("likedProperties");

    if (liked) {
      try {
        setLikedProperties(new Set(JSON.parse(liked)));
      } catch (error) {
        console.error("Unable to load liked properties:", error);
      }
    }
  }, []);

  // --------------------------------------------------
  // Like / Unlike
  // --------------------------------------------------
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

  // --------------------------------------------------
  // Amenity Icons
  // --------------------------------------------------
  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <Wifi size={18} />;

      case "parking":
        return <Car size={18} />;

      case "gym":
        return <Dumbbell size={18} />;

      case "kitchen":
        return <CookingPot size={18} />;

      case "restaurant":
        return <Utensils size={18} />;

      default:
        return null;
    }
  };

  // --------------------------------------------------
  // Book Now
  // --------------------------------------------------
  const handleBookNow = (apartment) => {
    navigate("/payment", {
      state: {
        property: {
          ...apartment,
          type: "Serviced Apartment",
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

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#C58A18]" />

          <p className="font-medium text-[#082B5C]">
            Loading serviced apartments...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mx-auto mb-8 max-w-7xl">

        <div className="mb-2 flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-[#C58A18]" />

          <h1 className="text-2xl font-bold text-[#082B5C] sm:text-3xl md:text-4xl">
            Serviced Apartments
          </h1>
        </div>

        <p className="text-sm text-slate-500 sm:text-base">
          Fully serviced apartments with hotel amenities
        </p>
      </div>

      {/* Property Grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {servicedApartments.map((apartment) => (
          <div
            key={apartment.id}
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
              hover:border-[#C58A18]/50
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

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#082B5C]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Discount */}
              {apartment.discount > 0 && (
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
                  transition-all
                  duration-300
                  hover:scale-110
                "
              >
                <Heart
                  size={20}
                  className={
                    likedProperties.has(apartment.id)
                      ? "fill-red-500 text-red-500"
                      : "text-[#082B5C]"
                  }
                />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">

              {/* Name */}
              <h2 className="
                mb-2
                line-clamp-1
                text-xl
                font-bold
                text-[#082B5C]
              ">
                {apartment.name}
              </h2>

              {/* Location */}
              <div className="mb-3 flex items-center">
                <MapPin
                  size={17}
                  className="mr-1.5 shrink-0 text-[#C58A18]"
                />

                <span className="text-sm text-slate-500">
                  {apartment.location}
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
                    {apartment.rating}
                  </span>
                </div>

                <span className="ml-2 text-sm text-slate-500">
                  ({apartment.reviews} reviews)
                </span>
              </div>

              {/* Divider */}
              <div className="mb-4 h-px bg-slate-100" />

              {/* Amenities */}
              <div className="mb-5 flex flex-wrap gap-2">

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
                        rounded-lg
                        bg-[#F5F8FC]
                        text-[#082B5C]
                        transition-colors
                        hover:bg-[#FFF8E7]
                        hover:text-[#C58A18]
                      "
                    >
                      {getAmenityIcon(amenity)}
                    </div>
                  ))}

                {apartment.amenities.length > 3 && (
                  <span className="
                    flex
                    items-center
                    rounded-lg
                    bg-[#F5F8FC]
                    px-3
                    text-xs
                    font-medium
                    text-slate-500
                  ">
                    +{apartment.amenities.length - 3} more
                  </span>
                )}
              </div>

              {/* Price + Button */}
              <div className="flex items-end justify-between gap-3">

                <div>
                  <div className="flex items-baseline gap-2">

                    <span className="
                      text-2xl
                      font-bold
                      text-[#082B5C]
                    ">
                      ${apartment.price}
                    </span>

                    {apartment.originalPrice && (
                      <span className="
                        text-sm
                        text-slate-400
                        line-through
                      ">
                        ${apartment.originalPrice}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-500">
                    per night
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookNow(apartment)}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-[#082B5C]
                    px-4
                    py-3
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
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default ServicedApartments;
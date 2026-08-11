import React, { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  CookingPot,
  Waves,
  Flame,
  Heart,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Villas = () => {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());

  const navigate = useNavigate();

  // --------------------------------------------------
  // Mock Villa Data
  // --------------------------------------------------
  useEffect(() => {
    const mockVillas = [
      {
        id: "villa-1",
        name: "Luxury Beach Villa",
        location: "Malibu, USA",
        rating: 4.8,
        reviews: 850,
        price: 500,
        originalPrice: 650,
        image:
          "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&q=80&w=800&h=600",
        amenities: ["wifi", "parking", "kitchen", "pool"],
        discount: 23,
      },
      {
        id: "villa-2",
        name: "Mountain Villa Retreat",
        location: "Lake Tahoe, USA",
        rating: 4.6,
        reviews: 620,
        price: 400,
        originalPrice: 520,
        image:
          "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800&h=600",
        amenities: ["wifi", "parking", "kitchen", "fireplace"],
        discount: 23,
      },
      {
        id: "villa-3",
        name: "Tropical Villa Paradise",
        location: "Key West, USA",
        rating: 4.9,
        reviews: 950,
        price: 450,
        originalPrice: 580,
        image:
          "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600",
        amenities: ["wifi", "parking", "kitchen", "pool"],
        discount: 22,
      },
    ];

    setVillas(mockVillas);
    setLoading(false);
  }, []);

  // --------------------------------------------------
  // Load Favorites
  // --------------------------------------------------
  useEffect(() => {
    const liked = localStorage.getItem("likedProperties");

    if (liked) {
      try {
        setLikedProperties(new Set(JSON.parse(liked)));
      } catch (error) {
        console.error("Failed to load liked properties:", error);
      }
    }
  }, []);

  // --------------------------------------------------
  // Toggle Favorite
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

      case "kitchen":
        return <CookingPot size={18} />;

      case "pool":
        return <Waves size={18} />;

      case "fireplace":
        return <Flame size={18} />;

      default:
        return null;
    }
  };

  // --------------------------------------------------
  // Book Now
  // --------------------------------------------------
  const handleBookNow = (villa) => {
    navigate("/payment", {
      state: {
        property: {
          ...villa,
          type: "Villa",
        },

        searchParams: {
          location: villa.location,

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
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#C58A18]" />

          <p className="font-medium text-[#082B5C]">
            Loading villas...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mx-auto mb-8 max-w-7xl">

        <div className="mb-2 flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-[#C58A18]" />

          <h1 className="text-2xl font-bold text-[#082B5C] sm:text-3xl md:text-4xl">
            Villas
          </h1>
        </div>

        <p className="text-sm text-slate-500 sm:text-base">
          Spacious villas for your perfect getaway
        </p>
      </div>

      {/* Villas Grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {villas.map((villa) => (
          <div
            key={villa.id}
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
                src={villa.image}
                alt={villa.name}
                className="
                  h-52
                  w-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
              />

              {/* Image Overlay */}
              <div className="
                absolute
                inset-0
                bg-gradient-to-t
                from-[#082B5C]/40
                to-transparent
                opacity-0
                transition-opacity
                duration-300
                group-hover:opacity-100
              " />

              {/* Discount */}
              {villa.discount > 0 && (
                <span className="
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
                  {villa.discount}% OFF
                </span>
              )}

              {/* Favorite */}
              <button
                type="button"
                onClick={() => toggleLike(villa.id)}
                aria-label={
                  likedProperties.has(villa.id)
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
                    likedProperties.has(villa.id)
                      ? "fill-red-500 text-red-500"
                      : "text-[#082B5C]"
                  }
                />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">

              {/* Villa Name */}
              <h2 className="
                mb-2
                line-clamp-1
                text-xl
                font-bold
                text-[#082B5C]
              ">
                {villa.name}
              </h2>

              {/* Location */}
              <div className="mb-3 flex items-center">
                <MapPin
                  size={17}
                  className="mr-1.5 shrink-0 text-[#C58A18]"
                />

                <span className="text-sm text-slate-500">
                  {villa.location}
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
                    {villa.rating}
                  </span>
                </div>

                <span className="ml-2 text-sm text-slate-500">
                  ({villa.reviews} reviews)
                </span>
              </div>

              {/* Divider */}
              <div className="mb-4 h-px bg-slate-100" />

              {/* Amenities */}
              <div className="mb-5 flex flex-wrap gap-2">

                {villa.amenities
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

                {villa.amenities.length > 3 && (
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
                    +{villa.amenities.length - 3} more
                  </span>
                )}
              </div>

              {/* Price + Book */}
              <div className="flex items-end justify-between gap-3">

                <div>
                  <div className="flex items-baseline gap-2">

                    <span className="
                      text-2xl
                      font-bold
                      text-[#082B5C]
                    ">
                      ${villa.price}
                    </span>

                    {villa.originalPrice && (
                      <span className="
                        text-sm
                        text-slate-400
                        line-through
                      ">
                        ${villa.originalPrice}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-500">
                    per night
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookNow(villa)}
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

export default Villas;
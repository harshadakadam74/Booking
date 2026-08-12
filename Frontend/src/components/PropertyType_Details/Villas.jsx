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

  // -----------------------------------------
  // 4. Bali
  // -----------------------------------------
  {
    id: "villa-4",
    name: "Ubud Jungle Villa",
    location: "Bali, Indonesia",
    rating: 4.9,
    reviews: 1250,
    price: 220,
    originalPrice: 300,
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 27,
  },

  // -----------------------------------------
  // 5. Santorini
  // -----------------------------------------
  {
    id: "villa-5",
    name: "Santorini Sunset Villa",
    location: "Santorini, Greece",
    rating: 4.9,
    reviews: 980,
    price: 550,
    originalPrice: 700,
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 21,
  },

  // -----------------------------------------
  // 6. Dubai
  // -----------------------------------------
  {
    id: "villa-6",
    name: "Royal Palm Villa",
    location: "Dubai, UAE",
    rating: 4.8,
    reviews: 1450,
    price: 650,
    originalPrice: 850,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 24,
  },

  // -----------------------------------------
  // 7. Maldives
  // -----------------------------------------
  {
    id: "villa-7",
    name: "Maldives Ocean Villa",
    location: "Maldives",
    rating: 4.9,
    reviews: 1680,
    price: 750,
    originalPrice: 950,
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 21,
  },

  // -----------------------------------------
  // 8. Phuket
  // -----------------------------------------
  {
    id: "villa-8",
    name: "Phuket Private Pool Villa",
    location: "Phuket, Thailand",
    rating: 4.7,
    reviews: 890,
    price: 280,
    originalPrice: 360,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 22,
  },

  // -----------------------------------------
  // 9. Goa
  // -----------------------------------------
  {
    id: "villa-9",
    name: "Goa Beachside Villa",
    location: "Goa, India",
    rating: 4.6,
    reviews: 720,
    price: 180,
    originalPrice: 240,
    image:
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 25,
  },

  // -----------------------------------------
  // 10. Kerala
  // -----------------------------------------
  {
    id: "villa-10",
    name: "Kerala Backwater Villa",
    location: "Alappuzha, India",
    rating: 4.8,
    reviews: 640,
    price: 160,
    originalPrice: 220,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen"],
    discount: 27,
  },

  // -----------------------------------------
  // 11. Swiss Alps
  // -----------------------------------------
  {
    id: "villa-11",
    name: "Swiss Alpine Luxury Villa",
    location: "Zermatt, Switzerland",
    rating: 4.9,
    reviews: 530,
    price: 620,
    originalPrice: 800,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    discount: 23,
  },

  // -----------------------------------------
  // 12. Tuscany
  // -----------------------------------------
  {
    id: "villa-12",
    name: "Tuscan Countryside Villa",
    location: "Tuscany, Italy",
    rating: 4.8,
    reviews: 760,
    price: 390,
    originalPrice: 500,
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 22,
  },

  // -----------------------------------------
  // 13. Cape Town
  // -----------------------------------------
  {
    id: "villa-13",
    name: "Cliffside Ocean Villa",
    location: "Cape Town, South Africa",
    rating: 4.8,
    reviews: 920,
    price: 420,
    originalPrice: 550,
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 24,
  },

  // -----------------------------------------
  // 14. Seychelles
  // -----------------------------------------
  {
    id: "villa-14",
    name: "Seychelles Island Villa",
    location: "Mahé, Seychelles",
    rating: 4.9,
    reviews: 710,
    price: 580,
    originalPrice: 750,
    image:
      "https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 23,
  },

  // -----------------------------------------
  // 15. Mallorca
  // -----------------------------------------
  {
    id: "villa-15",
    name: "Mediterranean Sea Villa",
    location: "Mallorca, Spain",
    rating: 4.7,
    reviews: 680,
    price: 360,
    originalPrice: 470,
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 23,
  },

  // -----------------------------------------
  // 16. Bali Luxury
  // -----------------------------------------
  {
    id: "villa-16",
    name: "Seminyak Luxury Villa",
    location: "Bali, Indonesia",
    rating: 4.8,
    reviews: 1120,
    price: 310,
    originalPrice: 400,
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 22,
  },

  // -----------------------------------------
  // 17. Mauritius
  // -----------------------------------------
  {
    id: "villa-17",
    name: "Mauritius Beach Villa",
    location: "Grand Baie, Mauritius",
    rating: 4.8,
    reviews: 830,
    price: 340,
    originalPrice: 450,
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "pool"],
    discount: 24,
  },

  // -----------------------------------------
  // 18. Manali
  // -----------------------------------------
  {
    id: "villa-18",
    name: "Himalayan Valley Villa",
    location: "Manali, India",
    rating: 4.7,
    reviews: 580,
    price: 140,
    originalPrice: 190,
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800&h=600",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    discount: 26,
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
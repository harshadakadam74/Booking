import React, { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Heart,
  Tent,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const GlampingSites = () => {
  const navigate = useNavigate();

  const [likedProperties, setLikedProperties] = useState(new Set());

  const glampingSites = [
    {
      id: "glamping-1",
      name: "Luxury Safari Tent",
      location: "Kenya, Africa",
      rating: 4.8,
      reviews: 450,
      price: 250,
      originalPrice: 320,
      image:
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800&h=600",
      amenities: ["wifi", "parking", "restaurant"],
      discount: 22,
    },
    {
      id: "glamping-2",
      name: "Forest Dome Glamping",
      location: "Oregon, USA",
      rating: 4.6,
      reviews: 280,
      price: 180,
      originalPrice: 230,
      image:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=800&h=600",
      amenities: ["wifi", "parking", "kitchen"],
      discount: 22,
    },
    {
      id: "glamping-3",
      name: "Desert Glamping Resort",
      location: "Utah, USA",
      rating: 4.7,
      reviews: 320,
      price: 220,
      originalPrice: 280,
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800&h=600",
      amenities: ["wifi", "parking", "restaurant"],
      discount: 21,
    },
  ];

  // Load liked properties
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

  // Toggle wishlist
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

  // Amenity icons
  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <Wifi size={17} />;

      case "parking":
        return <Car size={17} />;

      case "restaurant":
        return <Utensils size={17} />;

      case "kitchen":
        return <Utensils size={17} />;

      default:
        return null;
    }
  };

  // Book Now
  const handleBookNow = (site) => {
    navigate("/payment", {
      state: {
        property: {
          ...site,
          type: "Glamping Site",
        },

        searchParams: {
          location: site.location,

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

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =========================
            HEADER
        ========================== */}
        <div className="mb-8 text-center sm:text-left">

          <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
            <Tent
              size={24}
              className="text-[#C58A18]"
            />

            <span className="text-sm font-bold uppercase tracking-wider text-[#C58A18]">
              FastBooking
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#082B5C] sm:text-3xl md:text-4xl">
            Glamping Sites
          </h2>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Luxury camping experiences surrounded by nature
          </p>

          {/* Gold Accent */}
          <div className="mt-4 h-1 w-16 rounded-full bg-[#C58A18] sm:mx-0 mx-auto" />
        </div>

        {/* =========================
            CARDS
        ========================== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {glampingSites.map((site) => (
            <div
              key={site.id}
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

              {/* =========================
                  IMAGE
              ========================== */}
              <div className="relative overflow-hidden">

                <img
                  src={site.image}
                  alt={site.name}
                  className="
                    h-56
                    w-full
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-105
                  "
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800";
                  }}
                />

                {/* Dark Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#061D3D]/50 via-transparent to-transparent" />

                {/* Discount */}
                {site.discount > 0 && (
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
                    shadow-lg
                  ">
                    {site.discount}% OFF
                  </div>
                )}

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => toggleLike(site.id)}
                  aria-label={
                    likedProperties.has(site.id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
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
                      likedProperties.has(site.id)
                        ? "fill-red-500 text-red-500"
                        : "text-[#082B5C]"
                    }
                  />
                </button>

                {/* Glamping Badge */}
                <div className="
                  absolute
                  bottom-3
                  left-3
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-[#082B5C]/90
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-white
                  backdrop-blur
                ">
                  <Tent size={14} className="text-[#E3AE32]" />
                  Glamping
                </div>
              </div>

              {/* =========================
                  CONTENT
              ========================== */}
              <div className="p-5">

                {/* Property Name */}
                <h3 className="
                  mb-2
                  line-clamp-1
                  text-xl
                  font-bold
                  text-[#082B5C]
                  transition-colors
                  group-hover:text-[#C58A18]
                ">
                  {site.name}
                </h3>

                {/* Location */}
                <div className="mb-3 flex items-center gap-1.5">
                  <MapPin
                    size={16}
                    className="shrink-0 text-[#C58A18]"
                  />

                  <span className="text-sm text-slate-500">
                    {site.location}
                  </span>
                </div>

                {/* Rating */}
                <div className="mb-4 flex items-center gap-2">

                  <div className="
                    flex
                    items-center
                    gap-1
                    rounded-md
                    bg-[#082B5C]
                    px-2
                    py-1
                    text-white
                  ">
                    <Star
                      size={14}
                      className="fill-[#E3AE32] text-[#E3AE32]"
                    />

                    <span className="text-xs font-bold">
                      {site.rating}
                    </span>
                  </div>

                  <span className="text-sm text-slate-500">
                    {site.reviews} reviews
                  </span>
                </div>

                {/* Amenities */}
                <div className="
                  mb-5
                  flex
                  items-center
                  gap-2
                  border-b
                  border-slate-100
                  pb-4
                ">

                  {site.amenities
                    .slice(0, 3)
                    .map((amenity) => (
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
                          text-[#082B5C]
                        "
                      >
                        {getAmenityIcon(amenity)}
                      </div>
                    ))}

                  <span className="ml-1 text-xs text-slate-400">
                    Great amenities
                  </span>
                </div>

                {/* =========================
                    PRICE + BUTTON
                ========================== */}
                <div className="flex items-end justify-between gap-3">

                  <div>

                    <div className="flex items-baseline gap-2">

                      <span className="
                        text-2xl
                        font-bold
                        text-[#082B5C]
                      ">
                        ${site.price}
                      </span>

                      {site.originalPrice && (
                        <span className="
                          text-sm
                          text-slate-400
                          line-through
                        ">
                          ${site.originalPrice}
                        </span>
                      )}

                    </div>

                    <p className="text-xs text-slate-500">
                      per night
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookNow(site)}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-[#082B5C]
                      px-4
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
                    <ArrowRight size={16} />
                  </button>

                </div>

                {/* Gold Accent */}
                <div className="
                  mt-5
                  h-0.5
                  w-full
                  bg-gradient-to-r
                  from-transparent
                  via-[#C58A18]
                  to-transparent
                  opacity-50
                " />

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default GlampingSites;
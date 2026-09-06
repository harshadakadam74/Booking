import React, { useState } from "react";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Heart,
  Tent,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const GlampingSites = () => {
  const navigate = useNavigate();

  const [likedProperties, setLikedProperties] = useState(() => {
    try {
      const liked = localStorage.getItem("likedProperties");
      return liked ? new Set(JSON.parse(liked)) : new Set();
    } catch (error) {
      console.error("Error loading liked properties:", error);
      return new Set();
    }
  });

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

    {
      id: "glamping-4",
      name: "Mountain View Camp",
      location: "Manali, India",
      rating: 4.9,
      reviews: 520,
      price: 140,
      originalPrice: 190,
      image:
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800&h=600",
      amenities: ["wifi", "parking", "restaurant"],
      discount: 26,
    },

    {
      id: "glamping-5",
      name: "Lakeview Luxury Tent",
      location: "Queenstown, New Zealand",
      rating: 4.8,
      reviews: 390,
      price: 210,
      originalPrice: 270,
      image:
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800&h=600",
      amenities: ["wifi", "parking", "kitchen"],
      discount: 22,
    },

    {
      id: "glamping-6",
      name: "Jungle Treehouse Camp",
      location: "Kerala, India",
      rating: 4.7,
      reviews: 340,
      price: 125,
      originalPrice: 170,
      image:
        "https://images.unsplash.com/photo-1520984032042-162d526883e0?auto=format&fit=crop&q=80&w=800&h=600",
      amenities: ["wifi", "restaurant", "parking"],
      discount: 26,
    },

    {
      id: "glamping-7",
      name: "Northern Lights Dome",
      location: "Lapland, Finland",
      rating: 4.9,
      reviews: 610,
      price: 320,
      originalPrice: 400,
      image:
        "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&q=80&w=800&h=600",
      amenities: ["wifi", "parking", "kitchen"],
      discount: 20,
    },

    {
      id: "glamping-8",
      name: "Beachside Glamping Tent",
      location: "Goa, India",
      rating: 4.6,
      reviews: 275,
      price: 110,
      originalPrice: 150,
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800&h=600",
      amenities: ["wifi", "restaurant", "parking"],
      discount: 27,
    },

    {
      id: "glamping-9",
      name: "African Wilderness Camp",
      location: "Tanzania, Africa",
      rating: 4.9,
      reviews: 480,
      price: 290,
      originalPrice: 360,
      image:
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800&h=600",
      amenities: ["wifi", "restaurant", "parking"],
      discount: 19,
    },
  ];

  // Load wishlist
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
    <section className="min-h-screen bg-[#F7F9FC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-[#082B5C] px-6 py-8 shadow-xl sm:px-10 sm:py-10">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[24px] border-[#E3AE32]/10" />
          <div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-[#C58A18]/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E3AE32]/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E3AE32]">
              <Sparkles size={15} />
              FastBooking escapes
            </div>
            <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              Sleep closer to nature
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Trade ordinary camping for thoughtful comfort and unforgettable
              outdoor stays.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {glampingSites.map((site) => (
            <div
              key={site.id}
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
                hover:border-[#C58A18]/50
                hover:shadow-xl
              "
            >

              {/* Image */}
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

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#061D3D]/60 via-transparent to-transparent" />

                {/* Discount */}
                {site.discount > 0 && (
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
                      shadow-lg
                    "
                  >
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

                {/* Badge */}
                <div
                  className="
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
                  "
                >
                  <Tent
                    size={14}
                    className="text-[#E3AE32]"
                  />

                  Glamping
                </div>
              </div>

              {/* Content */}
              <div className="p-5">

                <h3
                  className="
                    mb-2
                    line-clamp-1
                    text-xl
                    font-bold
                    text-[#082B5C]
                    transition-colors
                    group-hover:text-[#C58A18]
                  "
                >
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

                  <div
                    className="
                      flex
                      items-center
                      gap-1
                      rounded-md
                      bg-[#082B5C]
                      px-2
                      py-1
                      text-white
                    "
                  >
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
                <div
                  className="
                    mb-5
                    flex
                    items-center
                    gap-2
                    border-b
                    border-slate-100
                    pb-4
                  "
                >
                  {site.amenities.slice(0, 3).map((amenity) => (
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
                        text-[#C58A18]
                      "
                    >
                      {getAmenityIcon(amenity)}
                    </div>
                  ))}

                  <span className="ml-1 text-xs text-slate-400">
                    Great amenities
                  </span>
                </div>

                {/* Price + Button */}
                <div className="flex items-end justify-between gap-3">

                  <div>
                    <div className="flex items-baseline gap-2">

                      <span className="text-2xl font-bold text-[#082B5C]">
                        ${site.price}
                      </span>

                      <span className="text-sm text-slate-400 line-through">
                        ${site.originalPrice}
                      </span>

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
                <div
                  className="
                    mt-5
                    h-0.5
                    w-full
                    bg-gradient-to-r
                    from-transparent
                    via-[#C58A18]
                    to-transparent
                    opacity-50
                  "
                />

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default GlampingSites;
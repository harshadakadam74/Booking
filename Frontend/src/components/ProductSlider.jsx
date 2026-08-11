import React, { useEffect, useRef } from "react";
import {
  Star,
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const FEATURED_PROPERTIES = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    location: "New York, USA",
    rating: 4.5,
    reviews: 1250,
    price: 150,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800&h=600",
    type: "Hotel",
  },
  {
    id: 2,
    name: "Ocean View Resort",
    location: "Miami, USA",
    rating: 4.8,
    reviews: 890,
    price: 220,
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800&h=600",
    type: "Resort",
  },
  {
    id: 3,
    name: "Luxury Beach Villa",
    location: "Malibu, USA",
    rating: 4.9,
    reviews: 650,
    price: 500,
    image:
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&q=80&w=800&h=600",
    type: "Villa",
  },
  {
    id: 4,
    name: "City Center Apartment",
    location: "Los Angeles, USA",
    rating: 4.6,
    reviews: 980,
    price: 120,
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800&h=600",
    type: "Apartment",
  },
  {
    id: 5,
    name: "Cozy Forest Cabin",
    location: "Oregon, USA",
    rating: 4.5,
    reviews: 480,
    price: 120,
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800&h=600",
    type: "Cabin",
  },
  {
    id: 6,
    name: "Tropical Paradise Resort",
    location: "Hawaii, USA",
    rating: 4.9,
    reviews: 2100,
    price: 350,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800&h=600",
    type: "Resort",
  },
];

const ProductSlider = () => {
  const scrollRef = useRef(null);

  // Auto slider
  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const autoSlide = setInterval(() => {
      const card = container.querySelector(".property-card");

      if (!card) return;

      const cardWidth = card.offsetWidth + 24;

      const maxScroll =
        container.scrollWidth - container.clientWidth;

      if (container.scrollLeft + cardWidth >= maxScroll) {
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        container.scrollBy({
          left: cardWidth,
          behavior: "smooth",
        });
      }
    }, 4000);

    return () => clearInterval(autoSlide);
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const card = container.querySelector(".property-card");

    if (!card) return;

    const scrollAmount = card.offsetWidth + 24;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Section Heading */}
        <div className="text-center mb-10">

          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles
              size={20}
              className="text-[#d99a00]"
            />

            <span className="text-[#d99a00] font-bold tracking-[0.2em] uppercase text-sm">
              Featured Stays
            </span>

            <Sparkles
              size={20}
              className="text-[#d99a00]"
            />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#12335b]">
            Featured Properties
          </h2>

          <div className="flex justify-center mt-4">
            <div className="w-16 h-1 bg-[#d99a00] rounded-full" />
          </div>

          <p className="mt-5 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Discover our handpicked selection of amazing stays
            for your next unforgettable journey.
          </p>
        </div>

        {/* Slider */}
        <div className="relative">

          {/* Left Arrow */}
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Previous properties"
            className="
              absolute
              left-0
              sm:-left-4
              lg:-left-6
              top-1/2
              -translate-y-1/2
              z-20
              w-11
              h-11
              flex
              items-center
              justify-center
              rounded-full
              bg-white
              text-[#12335b]
              border
              border-gray-200
              shadow-lg
              hover:bg-[#12335b]
              hover:text-white
              hover:border-[#12335b]
              transition-all
              duration-300
            "
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Next properties"
            className="
              absolute
              right-0
              sm:-right-4
              lg:-right-6
              top-1/2
              -translate-y-1/2
              z-20
              w-11
              h-11
              flex
              items-center
              justify-center
              rounded-full
              bg-white
              text-[#12335b]
              border
              border-gray-200
              shadow-lg
              hover:bg-[#12335b]
              hover:text-white
              hover:border-[#12335b]
              transition-all
              duration-300
            "
          >
            <ChevronRight size={22} />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            className="
              flex
              gap-6
              overflow-x-auto
              scroll-smooth
              pb-6
              px-2
            "
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {FEATURED_PROPERTIES.map((property) => (
              <div
                key={property.id}
                className="
                  property-card
                  flex-shrink-0
                  w-[290px]
                  sm:w-[320px]
                  lg:w-[350px]
                  bg-white
                  rounded-2xl
                  overflow-hidden
                  border
                  border-gray-200
                  shadow-[0_5px_25px_rgba(18,51,91,0.08)]
                  hover:shadow-[0_12px_35px_rgba(18,51,91,0.16)]
                  hover:-translate-y-1
                  transition-all
                  duration-300
                  group
                "
              >

                {/* Image */}
                <div className="relative h-52 overflow-hidden">

                  <img
                    src={property.image}
                    alt={property.name}
                    loading="lazy"
                    className="
                      w-full
                      h-full
                      object-cover
                      group-hover:scale-110
                      transition-transform
                      duration-700
                    "
                  />

                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12335b]/50 via-transparent to-transparent" />

                  {/* Type */}
                  <div
                    className="
                      absolute
                      top-4
                      left-4
                      bg-[#12335b]
                      text-white
                      px-3
                      py-1.5
                      rounded-full
                      text-xs
                      font-bold
                      shadow-md
                    "
                  >
                    {property.type}
                  </div>

                  {/* Favorite */}
                  <button
                    type="button"
                    aria-label={`Save ${property.name}`}
                    className="
                      absolute
                      top-4
                      right-4
                      w-10
                      h-10
                      flex
                      items-center
                      justify-center
                      rounded-full
                      bg-white/95
                      backdrop-blur-sm
                      shadow-md
                      hover:bg-[#d99a00]
                      hover:text-white
                      transition-all
                      duration-300
                    "
                  >
                    <Heart size={18} />
                  </button>

                  {/* Rating Badge */}
                  <div
                    className="
                      absolute
                      bottom-4
                      left-4
                      flex
                      items-center
                      gap-1
                      bg-white
                      px-3
                      py-1.5
                      rounded-full
                      shadow-md
                    "
                  >
                    <Star
                      size={15}
                      className="text-[#d99a00] fill-[#d99a00]"
                    />

                    <span className="text-sm font-bold text-[#12335b]">
                      {property.rating}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">

                  {/* Property Name */}
                  <h3
                    className="
                      text-xl
                      font-bold
                      text-[#12335b]
                      mb-2
                      group-hover:text-[#d99a00]
                      transition-colors
                      duration-300
                    "
                  >
                    {property.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center mb-3">
                    <MapPin
                      size={16}
                      className="text-[#d99a00] mr-2 flex-shrink-0"
                    />

                    <span className="text-gray-500 text-sm">
                      {property.location}
                    </span>
                  </div>

                  {/* Reviews */}
                  <div className="flex items-center mb-5">

                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= Math.round(property.rating)
                              ? "text-[#d99a00] fill-[#d99a00]"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>

                    <span className="text-gray-500 text-xs ml-2">
                      ({property.reviews.toLocaleString()} reviews)
                    </span>
                  </div>

                  {/* Bottom */}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">

                    <div>
                      <span className="text-2xl font-bold text-[#12335b]">
                        ${property.price}
                      </span>

                      <span className="text-gray-500 text-xs">
                        {" "}
                        / night
                      </span>
                    </div>

                    <Link
                      to={`/${property.type.toLowerCase()}s`}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        bg-[#12335b]
                        text-white
                        px-4
                        py-2.5
                        rounded-lg
                        text-sm
                        font-semibold
                        hover:bg-[#d99a00]
                        hover:text-[#12335b]
                        transition-all
                        duration-300
                        shadow-sm
                      "
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Decorative Line */}
        <div className="flex justify-center mt-5">
          <div className="w-24 h-1 bg-[#d99a00] rounded-full opacity-80" />
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
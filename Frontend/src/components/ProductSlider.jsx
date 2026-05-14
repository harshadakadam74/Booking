import React, { useEffect, useRef } from 'react';
import { Star, MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from "react-router-dom";

const FEATURED_PROPERTIES = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    location: "New York, USA",
    rating: 4.5,
    reviews: 1250,
    price: 150,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400&h=400",
    type: "Hotel"
  },
  {
    id: 2,
    name: "Ocean View Resort",
    location: "Miami, USA",
    rating: 4.8,
    reviews: 890,
    price: 220,
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=400&h=400",
    type: "Resort"
  },
  {
    id: 3,
    name: "Luxury Beach Villa",
    location: "Malibu, USA",
    rating: 4.9,
    reviews: 650,
    price: 500,
    image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&q=80&w=400&h=400",
    type: "Villa"
  },
  {
    id: 4,
    name: "City Center Apartment",
    location: "Los Angeles, USA",
    rating: 4.6,
    reviews: 980,
    price: 120,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400&h=400",
    type: "Apartment"
  },
  {
    id: 5,
    name: "Cozy Forest Cabin",
    location: "Oregon, USA",
    rating: 4.5,
    reviews: 480,
    price: 120,
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=400&h=400",
    type: "Cabin"
  },
  {
    id: 6,
    name: "Tropical Paradise Resort",
    location: "Hawaii, USA",
    rating: 4.9,
    reviews: 2100,
    price: 350,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=400&h=400",
    type: "Resort"
  }
];

const ProductSlider = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const firstCard = container.children[0];
    if (!firstCard) return;

    const gap = 24; // gap-6
    const cardWidth = firstCard.getBoundingClientRect().width + gap;
    let index = 0;

    const autoSlide = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;

      container.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });

      index++;

      if (index * cardWidth > maxScroll) {
        index = 0;
      }
    }, 4000); // Auto slide every 4 seconds

    return () => clearInterval(autoSlide);
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const scrollAmount = 320; // Approximate card width + gap

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 md:py-14">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
          Featured Properties
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">
          Discover our handpicked selection of amazing stays
        </p>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={24} />
        </button>

        {/* Slider Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {FEATURED_PROPERTIES.map((property) => (
            <div
              key={property.id}
              className="shrink-0 w-80 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-3 right-3 bg-white/80 p-2 rounded-full hover:bg-white transition-colors">
                  <Heart size={16} className="text-gray-600" />
                </button>
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  {property.type}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {property.name}
                </h3>

                <div className="flex items-center mb-2">
                  <MapPin size={14} className="text-gray-500 mr-1" />
                  <span className="text-gray-600 text-sm">{property.location}</span>
                </div>

                <div className="flex items-center mb-3">
                  <Star className="text-yellow-400 fill-current" size={14} />
                  <span className="ml-1 text-sm">{property.rating}</span>
                  <span className="text-gray-500 text-sm ml-1">({property.reviews})</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-blue-600">${property.price}</span>
                    <span className="text-gray-500 text-sm"> / night</span>
                  </div>
                  <Link
                    to={`/${property.type.toLowerCase()}s`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;
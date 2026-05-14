import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, MapPin, Wifi, Car, Utensils, Heart, Filter, ArrowLeft, Calendar, Users } from 'lucide-react';

const BookPlace = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => location.state || {}, [location.state]);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    rating: 0,
    amenities: []
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const priceMatch = property.price >= filters.priceRange[0] && property.price <= filters.priceRange[1];
      const ratingMatch = property.rating >= filters.rating;
      return priceMatch && ratingMatch;
    });
  }, [properties, filters]);

  useEffect(() => {
    // Simulate loading delay

    setTimeout(() => {
      // Mock data for properties based on search location
      const baseProperties = [
        {
          id: 1,
          name: "Luxury Downtown Hotel",
          location: searchParams.location || "New York, USA",
          rating: 4.8,
          reviews: 1250,
          price: 250,
          originalPrice: 320,
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300",
          amenities: ["wifi", "parking", "restaurant", "pool", "gym"],
          type: "Hotel",
          description: "Modern luxury hotel in the heart of downtown"
        },
        {
          id: 2,
          name: "Cozy Boutique Hotel",
          location: searchParams.location || "New York, USA",
          rating: 4.6,
          reviews: 890,
          price: 180,
          originalPrice: 230,
          image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300",
          amenities: ["wifi", "restaurant", "spa"],
          type: "Hotel",
          description: "Charming boutique hotel with personalized service"
        },
        {
          id: 3,
          name: "City Center Apartment",
          location: searchParams.location || "New York, USA",
          rating: 4.4,
          reviews: 650,
          price: 150,
          originalPrice: 190,
          image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300",
          amenities: ["wifi", "parking", "kitchen"],
          type: "Apartment",
          description: "Spacious apartment with city views"
        },
        {
          id: 4,
          name: "Executive Suite",
          location: searchParams.location || "New York, USA",
          rating: 4.7,
          reviews: 420,
          price: 300,
          originalPrice: 380,
          image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300",
          amenities: ["wifi", "parking", "restaurant", "gym", "spa"],
          type: "Hotel",
          description: "Executive suite with premium amenities"
        },
        {
          id: 5,
          name: "Beachfront Resort",
          location: searchParams.location || "Miami, USA",
          rating: 4.9,
          reviews: 2100,
          price: 350,
          originalPrice: 450,
          image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300",
          amenities: ["wifi", "parking", "restaurant", "pool", "beach"],
          type: "Resort",
          description: "Luxurious beachfront resort with ocean views"
        },
        {
          id: 6,
          name: "Mountain View Cabin",
          location: searchParams.location || "Aspen, USA",
          rating: 4.5,
          reviews: 380,
          price: 220,
          originalPrice: 280,
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300",
          amenities: ["wifi", "parking", "kitchen", "fireplace"],
          type: "Cabin",
          description: "Cozy mountain cabin with stunning views"
        }
      ];

      // Filter properties based on location if specified
      let filteredByLocation = baseProperties;
      if (searchParams.location) {
        const searchLocation = searchParams.location.toLowerCase();
        filteredByLocation = baseProperties.filter(property =>
          property.location.toLowerCase().includes(searchLocation) ||
          searchLocation.includes(property.location.toLowerCase().split(',')[0])
        );

        // If no exact matches, show all properties but update their location to match search
        if (filteredByLocation.length === 0) {
          filteredByLocation = baseProperties.map(property => ({
            ...property,
            location: searchParams.location
          }));
        }
      }

      setProperties(filteredByLocation);
      setLoading(false);
    }, 800); // Simulate API delay
  }, [searchParams]);

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi': return <Wifi size={16} />;
      case 'parking': return <Car size={16} />;
      case 'restaurant': return <Utensils size={16} />;
      case 'pool': return <div className="w-4 h-4 bg-blue-500 rounded"></div>;
      case 'gym': return <div className="w-4 h-4 bg-green-500 rounded"></div>;
      case 'spa': return <div className="w-4 h-4 bg-purple-500 rounded"></div>;
      case 'kitchen': return <div className="w-4 h-4 bg-orange-500 rounded"></div>;
      default: return null;
    }
  };

  const handleBookNow = (property) => {
    navigate('/payment', {
      state: {
        property,
        searchParams
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/book')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Search
        </button>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold mb-2">
            {searchParams.location ? `Stays in ${searchParams.location}` : 'Available Properties'}
          </h1>

          {/* Search Summary */}
          <div className="flex flex-wrap gap-6 mt-4 text-gray-600">
            {searchParams.dates && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {new Date(searchParams.dates.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })} - {new Date(searchParams.dates.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}

            {searchParams.guests && (
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>
                  {searchParams.guests.adults + searchParams.guests.children} guest{searchParams.guests.adults + searchParams.guests.children !== 1 ? 's' : ''}, {searchParams.guests.rooms} room{searchParams.guests.rooms !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="text-sm">
              {filteredProperties.length} propert{filteredProperties.length !== 1 ? 'ies' : 'y'} found
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          <Filter size={20} />
          Filters
        </button>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full p-2 border rounded"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Price: ${filters.priceRange[1]}</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [0, Number(e.target.value)] }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => handleBookNow(property)}
          >
            <div className="relative">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle favorite toggle
                }}
                className="absolute top-3 right-3 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
              >
                <Heart size={16} className="text-gray-600 hover:text-red-500" />
              </button>
              <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                {property.type}
              </div>
              {property.originalPrice && (
                <div className="absolute bottom-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  Save ${(property.originalPrice - property.price).toLocaleString()}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                  {property.name}
                </h3>
                <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                  <Star className="text-green-600 fill-current" size={14} />
                  <span className="ml-1 text-sm font-medium text-green-700">{property.rating}</span>
                  <span className="ml-1 text-xs text-green-600">({property.reviews})</span>
                </div>
              </div>

              <div className="flex items-center mb-2">
                <MapPin size={14} className="text-gray-500 mr-1" />
                <span className="text-gray-600 text-sm">{property.location}</span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>

              <div className="flex items-center gap-2 mb-4">
                {property.amenities.slice(0, 4).map((amenity, index) => (
                  <div key={index} className="text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                    {getAmenityIcon(amenity)}
                    <span className="text-xs capitalize">{amenity}</span>
                  </div>
                ))}
                {property.amenities.length > 4 && (
                  <span className="text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded">
                    +{property.amenities.length - 4} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-600">${property.price}</span>
                    <span className="text-gray-500 text-sm">/ night</span>
                  </div>
                  {property.originalPrice && (
                    <span className="text-gray-500 line-through text-sm">${property.originalPrice}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle view details
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(property);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BookPlace;
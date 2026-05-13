import React, { useState, useEffect } from 'react';
import { Star, MapPin, Wifi, Car, Utensils, Tent } from 'lucide-react';

const GlampingSites = () => {
  const [glampingSites, setGlampingSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for glamping sites
    const mockGlampingSites = [
      {
        id: 1,
        name: "Luxury Safari Tent",
        location: "Kenya, Africa",
        rating: 4.8,
        reviews: 450,
        price: 250,
        originalPrice: 320,
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "restaurant"],
        discount: 22
      },
      {
        id: 2,
        name: "Forest Dome Glamping",
        location: "Oregon, USA",
        rating: 4.6,
        reviews: 280,
        price: 180,
        originalPrice: 230,
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "kitchen"],
        discount: 22
      },
      {
        id: 3,
        name: "Desert Glamping Resort",
        location: "Utah, USA",
        rating: 4.7,
        reviews: 320,
        price: 220,
        originalPrice: 280,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "restaurant"],
        discount: 21
      }
    ];
    setGlampingSites(mockGlampingSites);
    setLoading(false);
  }, []);

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi': return <Wifi size={16} />;
      case 'parking': return <Car size={16} />;
      case 'kitchen': return <Utensils size={16} />;
      case 'restaurant': return <div className="w-4 h-4 bg-orange-500 rounded"></div>; // Simple restaurant icon
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Glamping Sites</h1>
        <p className="text-gray-600">Luxury camping experiences in nature</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {glampingSites.map((site) => (
          <div key={site.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={site.image}
                alt={site.name}
                className="w-full h-48 object-cover"
              />
              {site.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  {site.discount}% OFF
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{site.name}</h3>

              <div className="flex items-center mb-2">
                <MapPin size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-600 text-sm">{site.location}</span>
              </div>

              <div className="flex items-center mb-3">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="ml-1 text-sm">{site.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({site.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {site.amenities.slice(0, 3).map((amenity, index) => (
                  <div key={index} className="text-gray-500">
                    {getAmenityIcon(amenity)}
                  </div>
                ))}
                {site.amenities.length > 3 && (
                  <span className="text-gray-500 text-sm">+{site.amenities.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${site.price}</span>
                  {site.originalPrice && (
                    <span className="text-gray-500 line-through ml-2">${site.originalPrice}</span>
                  )}
                  <span className="text-gray-500 text-sm"> / night</span>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlampingSites;
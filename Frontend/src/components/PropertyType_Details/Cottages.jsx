import React, { useState, useEffect } from 'react';
import { Star, MapPin, Wifi, Car, Utensils, Flame } from 'lucide-react';

const Cottages = () => {
  const [cottages, setCottages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for cottages
    const mockCottages = [
      {
        id: 1,
        name: "Rustic Mountain Cottage",
        location: "Colorado, USA",
        rating: 4.7,
        reviews: 320,
        price: 180,
        originalPrice: 220,
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "kitchen", "fireplace"],
        discount: 18
      },
      {
        id: 2,
        name: "Lakeview Cottage",
        location: "Maine, USA",
        rating: 4.5,
        reviews: 280,
        price: 160,
        originalPrice: 200,
        image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "kitchen", "fireplace"],
        discount: 20
      },
      {
        id: 3,
        name: "Countryside Cottage",
        location: "Vermont, USA",
        rating: 4.6,
        reviews: 190,
        price: 140,
        originalPrice: 175,
        image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "kitchen"],
        discount: 20
      }
    ];
    setCottages(mockCottages);
    setLoading(false);
  }, []);

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi': return <Wifi size={16} />;
      case 'parking': return <Car size={16} />;
      case 'kitchen': return <Utensils size={16} />;
      case 'fireplace': return <Flame size={16} />;
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
        <h1 className="text-3xl font-bold mb-2">Cottages</h1>
        <p className="text-gray-600">Charming cottages for a cozy retreat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cottages.map((cottage) => (
          <div key={cottage.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={cottage.image}
                alt={cottage.name}
                className="w-full h-48 object-cover"
              />
              {cottage.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  {cottage.discount}% OFF
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{cottage.name}</h3>

              <div className="flex items-center mb-2">
                <MapPin size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-600 text-sm">{cottage.location}</span>
              </div>

              <div className="flex items-center mb-3">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="ml-1 text-sm">{cottage.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({cottage.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {cottage.amenities.slice(0, 3).map((amenity, index) => (
                  <div key={index} className="text-gray-500">
                    {getAmenityIcon(amenity)}
                  </div>
                ))}
                {cottage.amenities.length > 3 && (
                  <span className="text-gray-500 text-sm">+{cottage.amenities.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${cottage.price}</span>
                  {cottage.originalPrice && (
                    <span className="text-gray-500 line-through ml-2">${cottage.originalPrice}</span>
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

export default Cottages;
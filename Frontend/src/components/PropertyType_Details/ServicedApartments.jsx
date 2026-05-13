import React, { useState, useEffect } from 'react';
import { Star, MapPin, Wifi, Car, Utensils, Dumbbell } from 'lucide-react';

const ServicedApartments = () => {
  const [servicedApartments, setServicedApartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for serviced apartments
    const mockServicedApartments = [
      {
        id: 1,
        name: "Executive City Apartments",
        location: "London, UK",
        rating: 4.5,
        reviews: 680,
        price: 200,
        originalPrice: 250,
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "gym", "kitchen"],
        discount: 20
      },
      {
        id: 2,
        name: "Business District Suites",
        location: "New York, USA",
        rating: 4.7,
        reviews: 520,
        price: 180,
        originalPrice: 225,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "gym", "restaurant"],
        discount: 20
      },
      {
        id: 3,
        name: "Downtown Serviced Living",
        location: "Singapore",
        rating: 4.6,
        reviews: 410,
        price: 160,
        originalPrice: 200,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "gym", "kitchen"],
        discount: 20
      }
    ];
    setServicedApartments(mockServicedApartments);
    setLoading(false);
  }, []);

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi': return <Wifi size={16} />;
      case 'parking': return <Car size={16} />;
      case 'kitchen': return <Utensils size={16} />;
      case 'gym': return <Dumbbell size={16} />;
      case 'restaurant': return <div className="w-4 h-4 bg-orange-500 rounded"></div>;
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
        <h1 className="text-3xl font-bold mb-2">Serviced Apartments</h1>
        <p className="text-gray-600">Fully serviced apartments with hotel amenities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicedApartments.map((apartment) => (
          <div key={apartment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={apartment.image}
                alt={apartment.name}
                className="w-full h-48 object-cover"
              />
              {apartment.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  {apartment.discount}% OFF
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{apartment.name}</h3>

              <div className="flex items-center mb-2">
                <MapPin size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-600 text-sm">{apartment.location}</span>
              </div>

              <div className="flex items-center mb-3">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="ml-1 text-sm">{apartment.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({apartment.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {apartment.amenities.slice(0, 3).map((amenity, index) => (
                  <div key={index} className="text-gray-500">
                    {getAmenityIcon(amenity)}
                  </div>
                ))}
                {apartment.amenities.length > 3 && (
                  <span className="text-gray-500 text-sm">+{apartment.amenities.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${apartment.price}</span>
                  {apartment.originalPrice && (
                    <span className="text-gray-500 line-through ml-2">${apartment.originalPrice}</span>
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

export default ServicedApartments;
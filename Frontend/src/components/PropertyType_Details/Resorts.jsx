import React, { useState, useEffect } from 'react';
import { Star, MapPin, Wifi, Car, Utensils, Waves, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Resorts = () => {
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data for resorts
    const mockResorts = [
      {
        id: 1,
        name: "Tropical Paradise Resort",
        location: "Hawaii, USA",
        rating: 4.9,
        reviews: 2100,
        price: 350,
        originalPrice: 450,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "restaurant", "pool", "spa"],
        discount: 22
      },
      {
        id: 2,
        name: "Mountain View Resort",
        location: "Colorado, USA",
        rating: 4.7,
        reviews: 1500,
        price: 280,
        originalPrice: 350,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "restaurant", "spa"],
        discount: 20
      },
      {
        id: 3,
        name: "Desert Oasis Resort",
        location: "Arizona, USA",
        rating: 4.5,
        reviews: 1200,
        price: 250,
        originalPrice: 320,
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "restaurant", "pool"],
        discount: 22
      }
    ];
    setResorts(mockResorts);
    setLoading(false);
  }, []);

  // Load liked properties from localStorage
  useEffect(() => {
    const liked = localStorage.getItem('likedProperties');
    if (liked) {
      setLikedProperties(new Set(JSON.parse(liked)));
    }
  }, []);

  const toggleLike = (propertyId) => {
    const newLiked = new Set(likedProperties);
    if (newLiked.has(propertyId)) {
      newLiked.delete(propertyId);
    } else {
      newLiked.add(propertyId);
    }
    setLikedProperties(newLiked);
    localStorage.setItem('likedProperties', JSON.stringify([...newLiked]));
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi': return <Wifi size={16} />;
      case 'parking': return <Car size={16} />;
      case 'restaurant': return <Utensils size={16} />;
      case 'pool': return <Waves size={16} />;
      case 'spa': return <div className="w-4 h-4 bg-purple-500 rounded-full"></div>; // Simple spa icon
      default: return null;
    }
  };

  const handleBookNow = (resort) => {
    // Navigate to payment page with resort details
    navigate('/payment', {
      state: {
        property: {
          ...resort,
          type: 'Resort'
        },
        searchParams: {
          location: resort.location,
          dates: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          },
          guests: {
            adults: 2,
            children: 0,
            rooms: 1
          }
        }
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resorts</h1>
        <p className="text-gray-600">Luxurious resorts for your dream vacation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resorts.map((resort) => (
          <div key={resort.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={resort.image}
                alt={resort.name}
                className="w-full h-48 object-cover"
              />
              {resort.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  {resort.discount}% OFF
                </div>
              )}
              <button
                onClick={() => toggleLike(resort.id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <Heart
                  size={20}
                  className={`${
                    likedProperties.has(resort.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{resort.name}</h3>

              <div className="flex items-center mb-2">
                <MapPin size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-600 text-sm">{resort.location}</span>
              </div>

              <div className="flex items-center mb-3">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="ml-1 text-sm">{resort.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({resort.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {resort.amenities.slice(0, 3).map((amenity, index) => (
                  <div key={index} className="text-gray-500">
                    {getAmenityIcon(amenity)}
                  </div>
                ))}
                {resort.amenities.length > 3 && (
                  <span className="text-gray-500 text-sm">+{resort.amenities.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${resort.price}</span>
                  {resort.originalPrice && (
                    <span className="text-gray-500 line-through ml-2">${resort.originalPrice}</span>
                  )}
                  <span className="text-gray-500 text-sm"> / night</span>
                </div>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  onClick={() => handleBookNow(resort)}
                >
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

export default Resorts;

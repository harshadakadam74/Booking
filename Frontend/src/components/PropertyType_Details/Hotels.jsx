import React, { useState, useEffect } from 'react';
import { Star, MapPin, Wifi, Car, Utensils, Dumbbell, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data for hotels
    const mockHotels = [
      {
        id: 1,
        name: "Grand Plaza Hotel",
        location: "New York, USA",
        rating: 4.5,
        reviews: 1250,
        price: 150,
        originalPrice: 200,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "restaurant", "gym"],
        discount: 25
      },
      {
        id: 2,
        name: "Ocean View Resort",
        location: "Miami, USA",
        rating: 4.8,
        reviews: 890,
        price: 220,
        originalPrice: 280,
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "restaurant", "pool"],
        discount: 21
      },
      {
        id: 3,
        name: "Mountain Lodge",
        location: "Aspen, USA",
        rating: 4.3,
        reviews: 650,
        price: 180,
        originalPrice: 230,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "restaurant", "spa"],
        discount: 22
      }
    ];
    setHotels(mockHotels);
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
      case 'gym': return <Dumbbell size={16} />;
      default: return null;
    }
  };

  const handleBookNow = (hotel) => {
    // Navigate to payment page with hotel details
    navigate('/payment', {
      state: {
        property: {
          ...hotel,
          type: 'Hotel'
        },
        searchParams: {
          location: hotel.location,
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
        <h1 className="text-3xl font-bold mb-2">Hotels</h1>
        <p className="text-gray-600">Find the perfect hotel for your stay</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-48 object-cover"
              />
              {hotel.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  {hotel.discount}% OFF
                </div>
              )}
              <button
                onClick={() => toggleLike(hotel.id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <Heart
                  size={20}
                  className={`${
                    likedProperties.has(hotel.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>

              <div className="flex items-center mb-2">
                <MapPin size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-600 text-sm">{hotel.location}</span>
              </div>

              <div className="flex items-center mb-3">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="ml-1 text-sm">{hotel.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({hotel.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {hotel.amenities.slice(0, 3).map((amenity, index) => (
                  <div key={index} className="text-gray-500">
                    {getAmenityIcon(amenity)}
                  </div>
                ))}
                {hotel.amenities.length > 3 && (
                  <span className="text-gray-500 text-sm">+{hotel.amenities.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${hotel.price}</span>
                  {hotel.originalPrice && (
                    <span className="text-gray-500 line-through ml-2">${hotel.originalPrice}</span>
                  )}
                  <span className="text-gray-500 text-sm"> / night</span>
                </div>
                <button
                  onClick={() => handleBookNow(hotel)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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

export default Hotels;

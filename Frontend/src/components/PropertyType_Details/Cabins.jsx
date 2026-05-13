import React, { useState, useEffect } from 'react';
import { Star, MapPin, Wifi, Car, Utensils, Flame, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cabins = () => {
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data for cabins
    const mockCabins = [
      {
        id: 1,
        name: "Cozy Forest Cabin",
        location: "Oregon, USA",
        rating: 4.5,
        reviews: 480,
        price: 120,
        originalPrice: 150,
        image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "kitchen", "fireplace"],
        discount: 20
      },
      {
        id: 2,
        name: "Lakeview Cabin",
        location: "Maine, USA",
        rating: 4.7,
        reviews: 320,
        price: 140,
        originalPrice: 175,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "kitchen", "fireplace"],
        discount: 20
      },
      {
        id: 3,
        name: "Mountain Cabin Retreat",
        location: "Colorado, USA",
        rating: 4.6,
        reviews: 550,
        price: 160,
        originalPrice: 200,
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "kitchen", "fireplace"],
        discount: 20
      }
    ];
    setCabins(mockCabins);
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
      case 'kitchen': return <Utensils size={16} />;
      case 'fireplace': return <Flame size={16} />;
      default: return null;
    }
  };

  const handleBookNow = (cabin) => {
    // Navigate to payment page with cabin details
    navigate('/payment', {
      state: {
        property: {
          ...cabin,
          type: 'Cabin'
        },
        searchParams: {
          location: cabin.location,
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
        <h1 className="text-3xl font-bold mb-2">Cabins</h1>
        <p className="text-gray-600">Rustic cabins for your nature escape</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cabins.map((cabin) => (
          <div key={cabin.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={cabin.image}
                alt={cabin.name}
                className="w-full h-48 object-cover"
              />
              {cabin.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  {cabin.discount}% OFF
                </div>
              )}
              <button
                onClick={() => toggleLike(cabin.id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <Heart
                  size={20}
                  className={`${
                    likedProperties.has(cabin.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{cabin.name}</h3>

              <div className="flex items-center mb-2">
                <MapPin size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-600 text-sm">{cabin.location}</span>
              </div>

              <div className="flex items-center mb-3">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="ml-1 text-sm">{cabin.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({cabin.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {cabin.amenities.slice(0, 3).map((amenity, index) => (
                  <div key={index} className="text-gray-500">
                    {getAmenityIcon(amenity)}
                  </div>
                ))}
                {cabin.amenities.length > 3 && (
                  <span className="text-gray-500 text-sm">+{cabin.amenities.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${cabin.price}</span>
                  {cabin.originalPrice && (
                    <span className="text-gray-500 line-through ml-2">${cabin.originalPrice}</span>
                  )}
                  <span className="text-gray-500 text-sm"> / night</span>
                </div>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  onClick={() => handleBookNow(cabin)}
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

export default Cabins;

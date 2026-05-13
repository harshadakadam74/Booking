import React, { useState, useEffect } from 'react';
import { Star, MapPin, Wifi, Car, Utensils, Home, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Villas = () => {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data for villas
    const mockVillas = [
      {
        id: 1,
        name: "Luxury Beach Villa",
        location: "Malibu, USA",
        rating: 4.8,
        reviews: 850,
        price: 500,
        originalPrice: 650,
        image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "kitchen", "pool"],
        discount: 23
      },
      {
        id: 2,
        name: "Mountain Villa Retreat",
        location: "Lake Tahoe, USA",
        rating: 4.6,
        reviews: 620,
        price: 400,
        originalPrice: 520,
        image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "kitchen", "fireplace"],
        discount: 23
      },
      {
        id: 3,
        name: "Tropical Villa Paradise",
        location: "Key West, USA",
        rating: 4.9,
        reviews: 950,
        price: 450,
        originalPrice: 580,
        image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=400&h=300",
        amenities: ["wifi", "parking", "kitchen", "pool"],
        discount: 22
      }
    ];
    setVillas(mockVillas);
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
      case 'pool': return <div className="w-4 h-4 bg-blue-500 rounded"></div>;
      case 'fireplace': return <div className="w-4 h-4 bg-orange-500 rounded"></div>; // Simple fireplace icon
      default: return null;
    }
  };

  const handleBookNow = (villa) => {
    // Navigate to payment page with villa details
    navigate('/payment', {
      state: {
        property: {
          ...villa,
          type: 'Villa'
        },
        searchParams: {
          location: villa.location,
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
        <h1 className="text-3xl font-bold mb-2">Villas</h1>
        <p className="text-gray-600">Spacious villas for your perfect getaway</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {villas.map((villa) => (
          <div key={villa.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={villa.image}
                alt={villa.name}
                className="w-full h-48 object-cover"
              />
              {villa.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  {villa.discount}% OFF
                </div>
              )}
              <button
                onClick={() => toggleLike(villa.id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <Heart
                  size={20}
                  className={`${
                    likedProperties.has(villa.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{villa.name}</h3>

              <div className="flex items-center mb-2">
                <MapPin size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-600 text-sm">{villa.location}</span>
              </div>

              <div className="flex items-center mb-3">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="ml-1 text-sm">{villa.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({villa.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {villa.amenities.slice(0, 3).map((amenity, index) => (
                  <div key={index} className="text-gray-500">
                    {getAmenityIcon(amenity)}
                  </div>
                ))}
                {villa.amenities.length > 3 && (
                  <span className="text-gray-500 text-sm">+{villa.amenities.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${villa.price}</span>
                  {villa.originalPrice && (
                    <span className="text-gray-500 line-through ml-2">${villa.originalPrice}</span>
                  )}
                  <span className="text-gray-500 text-sm"> / night</span>
                </div>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  onClick={() => handleBookNow(villa)}
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

export default Villas;

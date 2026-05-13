import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Flame } from 'lucide-react';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for deals
    const mockDeals = [
      {
        id: 1,
        name: "Luxury Beach Resort",
        location: "Cancun, Mexico",
        rating: 4.8,
        reviews: 2100,
        price: 180,
        originalPrice: 250,
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=400&h=300",
        discount: 28,
        timeLeft: "2 days left"
      },
      {
        id: 2,
        name: "City Center Hotel",
        location: "Paris, France",
        rating: 4.6,
        reviews: 1800,
        price: 120,
        originalPrice: 160,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400&h=300",
        discount: 25,
        timeLeft: "5 days left"
      },
      {
        id: 3,
        name: "Mountain Lodge",
        location: "Swiss Alps",
        rating: 4.9,
        reviews: 950,
        price: 200,
        originalPrice: 280,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=400&h=300",
        discount: 29,
        timeLeft: "1 day left"
      },
      {
        id: 4,
        name: "Tropical Villa",
        location: "Bali, Indonesia",
        rating: 4.7,
        reviews: 1200,
        price: 150,
        originalPrice: 200,
        image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&q=80&w=400&h=300",
        discount: 25,
        timeLeft: "3 days left"
      }
    ];
    setDeals(mockDeals);
    setLoading(false);
  }, []);

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
        <h1 className="text-3xl font-bold mb-2">Exclusive Deals</h1>
        <p className="text-gray-600">Limited-time offers on amazing properties</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={deal.image}
                alt={deal.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold flex items-center gap-1">
                <Flame size={14} />
                {deal.discount}% OFF
              </div>
              <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-sm font-semibold flex items-center gap-1">
                <Clock size={14} />
                {deal.timeLeft}
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{deal.name}</h3>

              <div className="flex items-center mb-2">
                <MapPin size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-600 text-sm">{deal.location}</span>
              </div>

              <div className="flex items-center mb-3">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="ml-1 text-sm">{deal.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({deal.reviews} reviews)</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-green-600">${deal.price}</span>
                  <span className="text-gray-500 line-through ml-2">${deal.originalPrice}</span>
                  <span className="text-gray-500 text-sm"> / night</span>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                  Book Deal
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deals;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

const AccountFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const liked = localStorage.getItem('likedProperties');
    setFavorites(liked ? JSON.parse(liked) : []);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/account')}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Account
        </button>

        <div className="bg-white rounded-3xl shadow-md p-8">
          <div className="flex items-center gap-4 mb-6">
            <Heart size={28} className="text-red-600" />
            <div>
              <h1 className="text-3xl font-bold">Favorites</h1>
              <p className="text-gray-600">Your favorite properties are saved here for quick access.</p>
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={56} className="mx-auto text-gray-300 mb-6" />
              <p className="text-gray-500 mb-6">You haven’t saved any favorites yet.</p>
              <Link
                to="/"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
              >
                Explore Properties
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">You have {favorites.length} favorite propert{favorites.length === 1 ? 'y' : 'ies'}.</p>
              <div className="grid gap-4 md:grid-cols-2">
                {favorites.map((propertyId) => (
                  <div
                    key={propertyId}
                    className="rounded-3xl border border-gray-200 p-5 bg-gray-50"
                  >
                    <p className="font-semibold text-gray-900">Property ID: {propertyId}</p>
                    <p className="text-gray-500 text-sm mt-2">Details for this favorite are coming soon.</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountFavorites;

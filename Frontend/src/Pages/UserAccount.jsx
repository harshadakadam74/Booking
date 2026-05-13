import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, Heart, Calendar, CreditCard, LogOut, LogIn, UserPlus } from 'lucide-react';import { fetchUserProfile } from '../services/authService';
const UserAccount = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [likedProperties, setLikedProperties] = useState(new Set());

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    setToken(authToken);

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }

    const savedBookings = localStorage.getItem('userBookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      setBookings([]);
    }

    const liked = localStorage.getItem('likedProperties');
    if (liked) {
      setLikedProperties(new Set(JSON.parse(liked)));
    }

    const loadProfile = async () => {
      if (!authToken) return;
      try {
        const profile = await fetchUserProfile(authToken);
        setUser(profile);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (error) {
        console.error('Failed to load profile', error);
      }
    };

    loadProfile();
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUser(null);
    setBookings([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <User size={64} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Account</h1>
            <p className="text-gray-600 text-lg">
              Sign in to access your bookings, favorites, and account settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Sign In Card */}
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <LogIn size={48} className="mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Already have an account?</h2>
              <p className="text-gray-600 mb-6">
                Sign in to view your bookings, manage your account, and access exclusive deals.
              </p>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            </div>

            {/* Register Card */}
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <UserPlus size={48} className="mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-4">New to FastBooking?</h2>
              <p className="text-gray-600 mb-6">
                Create an account to start booking amazing properties and enjoy member benefits.
              </p>
              <button
                onClick={handleRegister}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-16 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Why Create an Account?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Calendar size={40} className="mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Easy Booking Management</h3>
                <p className="text-gray-600">
                  View, modify, and cancel your bookings all in one place.
                </p>
              </div>
              <div className="text-center">
                <Heart size={40} className="mx-auto text-red-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Save Favorites</h3>
                <p className="text-gray-600">
                  Save your favorite properties and get notified of special deals.
                </p>
              </div>
              <div className="text-center">
                <CreditCard size={40} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quick Payments</h3>
                <p className="text-gray-600">
                  Save payment methods for faster checkout on future bookings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <nav className="space-y-2">
                <Link to="/account/bookings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition">
                  <Calendar size={20} />
                  <span>My Bookings</span>
                </Link>
                <Link to="/account/favorites" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition">
                  <Heart size={20} />
                  <span>Favorites</span>
                </Link>
                <Link to="/account/payments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition">
                  <CreditCard size={20} />
                  <span>Payment Methods</span>
                </Link>
                <Link to="/account/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition">
                  <Settings size={20} />
                  <span>Account Settings</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Bookings Section */}
            <div id="bookings" className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">My Bookings</h2>

              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No bookings yet</p>
                  <button
                    onClick={() => navigate('/book')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Start Booking
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-6 hover:shadow-md transition bg-gray-50">
                      <div className="flex gap-4 mb-4">
                        {booking.image && (
                          <img
                            src={booking.image}
                            alt={booking.property}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-xl text-gray-900">{booking.property}</h3>
                              <p className="text-gray-600 flex items-center gap-1">
                                <span className="text-sm">📍</span> {booking.location}
                              </p>
                              {booking.propertyType && (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                                  {booking.propertyType}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {booking.status}
                              </span>
                              <p className="text-2xl font-bold text-blue-600 mt-2">${booking.total}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-sm text-gray-500">Check-in</p>
                              <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-sm text-gray-500">Check-out</p>
                              <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-sm text-gray-500">Guests</p>
                              <p className="font-medium">
                                {booking.guests?.adults || 0} adults
                                {booking.guests?.children > 0 && `, ${booking.guests.children} children`}
                                {booking.guests?.rooms && ` • ${booking.guests.rooms} room${booking.guests.rooms !== 1 ? 's' : ''}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <div className="text-sm text-gray-500">
                              Booking ID: <span className="font-mono">{booking.id}</span>
                              {booking.bookedAt && (
                                <span className="ml-4">
                                  Booked on {new Date(booking.bookedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm">
                                View Details
                              </button>
                              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition text-sm">
                                Modify
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Liked Properties Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="text-red-600" size={24} />
                <h2 className="text-xl font-bold">Favorite Properties</h2>
              </div>

              {likedProperties.size === 0 ? (
                <div className="text-center py-8">
                  <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite properties yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start exploring properties and click the heart icon to save your favorites!
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Explore Properties
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">
                    You have {likedProperties.size} favorite propert{likedProperties.size === 1 ? 'y' : 'ies'}.
                    This feature is coming soon with full property details!
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <Calendar size={32} className="mx-auto text-blue-600 mb-2" />
                <h3 className="text-2xl font-bold">{bookings.length}</h3>
                <p className="text-gray-600">Total Bookings</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <Heart size={32} className="mx-auto text-red-600 mb-2" />
                <h3 className="text-2xl font-bold">{likedProperties.size}</h3>
                <p className="text-gray-600">Favorite Properties</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <CreditCard size={32} className="mx-auto text-green-600 mb-2" />
                <h3 className="text-2xl font-bold">0</h3>
                <p className="text-gray-600">Saved Cards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
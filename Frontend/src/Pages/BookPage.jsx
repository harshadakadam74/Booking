import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Search, X } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const BookPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);
  const locationInputRef = useRef(null);

  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      key: 'selection',
    },
  ]);

  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    rooms: 1,
  });

  // Popular destinations for suggestions
  const popularDestinations = [
    'New York, USA',
    'Los Angeles, USA',
    'Chicago, USA',
    'Houston, USA',
    'Phoenix, USA',
    'Philadelphia, USA',
    'San Antonio, USA',
    'San Diego, USA',
    'Dallas, USA',
    'San Jose, USA',
    'London, UK',
    'Paris, France',
    'Tokyo, Japan',
    'Sydney, Australia',
    'Toronto, Canada',
    'Berlin, Germany',
    'Rome, Italy',
    'Barcelona, Spain',
    'Amsterdam, Netherlands',
    'Vienna, Austria'
  ];

  // Handle location input change
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);

    if (value.trim()) {
      // Filter suggestions based on input
      const filtered = popularDestinations.filter(dest =>
        dest.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion);
    setShowSuggestions(false);
  };

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!location.trim()) {
      alert('Please enter a destination');
      return;
    }

    // Close any open dropdowns
    setOpenDate(false);
    setOpenGuests(false);
    setShowSuggestions(false);

    // Navigate to book place page with search parameters
    navigate('/book-place', {
      state: {
        location,
        dates: date[0],
        guests
      }
    });
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Search deals on hotels, homes, and much more...
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Location */}
            <div className="relative" ref={locationInputRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where are you going?
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter destination (e.g., New York, Paris, Tokyo)"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={location}
                  onChange={handleLocationChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => location.trim() && setShowSuggestions(true)}
                />
                {location && (
                  <button
                    onClick={() => {
                      setLocation('');
                      setLocationSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Location Suggestions */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                    >
                      <MapPin size={16} className="text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Check-in/Check-out */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in - Check-out
              </label>
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  setOpenDate(!openDate);
                  setOpenGuests(false);
                  setShowSuggestions(false);
                }}
              >
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <div className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors">
                  <span className="text-gray-700">
                    {format(date[0].startDate, 'MMM dd, yyyy')} - {format(date[0].endDate, 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              {openDate && (
                <div className="absolute top-full mt-2 z-50 bg-white rounded-xl shadow-xl p-4 border">
                  <DateRange
                    editableDateInputs={false}
                    onChange={(item) => setDate([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={date}
                    minDate={new Date()}
                    months={2}
                    direction="horizontal"
                    className="calendar-custom"
                  />
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {Math.ceil((date[0].endDate - date[0].startDate) / (1000 * 60 * 60 * 24))} nights selected
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOpenDate(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setOpenDate(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Guests & Rooms */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests & Rooms
              </label>
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  setOpenGuests(!openGuests);
                  setOpenDate(false);
                  setShowSuggestions(false);
                }}
              >
                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <div className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors">
                  <span className="text-gray-700">
                    {guests.adults + guests.children} guest{guests.adults + guests.children !== 1 ? 's' : ''}, {guests.rooms} room{guests.rooms !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {openGuests && (
                <div className="absolute top-full mt-2 z-50 bg-white rounded-xl shadow-xl p-4 border w-72">
                  <div className="space-y-6">
                    {/* Adults */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">Adults</div>
                        <div className="text-sm text-gray-500">Ages 13 or above</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => setGuests(prev => ({
                            ...prev,
                            adults: Math.max(1, prev.adults - 1)
                          }))}
                          disabled={guests.adults <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{guests.adults}</span>
                        <button
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          onClick={() => setGuests(prev => ({
                            ...prev,
                            adults: prev.adults + 1
                          }))}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">Children</div>
                        <div className="text-sm text-gray-500">Ages 0-12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => setGuests(prev => ({
                            ...prev,
                            children: Math.max(0, prev.children - 1)
                          }))}
                          disabled={guests.children <= 0}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{guests.children}</span>
                        <button
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          onClick={() => setGuests(prev => ({
                            ...prev,
                            children: prev.children + 1
                          }))}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">Rooms</div>
                        <div className="text-sm text-gray-500">Number of rooms needed</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => setGuests(prev => ({
                            ...prev,
                            rooms: Math.max(1, prev.rooms - 1)
                          }))}
                          disabled={guests.rooms <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{guests.rooms}</span>
                        <button
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          onClick={() => setGuests(prev => ({
                            ...prev,
                            rooms: prev.rooms + 1
                          }))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 pt-4 border-t">
                    <button
                      onClick={() => setOpenGuests(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center md:col-span-3">
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <Search size={20} />
              Search Places
            </button>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
              { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400' },
              { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
              { name: 'London', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' }
            ].map((destination) => (
              <div
                key={destination.name}
                className="relative rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setLocation(destination.name)}
              >
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white font-semibold text-lg">{destination.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;
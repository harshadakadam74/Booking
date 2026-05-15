import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { BedDouble, CalendarDays, Users, MapPin } from "lucide-react";
import { placeSuggestions } from "../../Data/Places";
import { ShieldCheck, UsersRound, Headphones, Search } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const Input_enter = () => {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);
  const [isWorkTrip, setIsWorkTrip] = useState(false);

  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);

    if (value.trim().length > 0) {
      const filtered = placeSuggestions.filter(
        (place) =>
          place.name.toLowerCase().includes(value.toLowerCase()) ||
          place.city.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPlace = (place) => {
    setLocation(place.name);
    setShowSuggestions(false);
    setSuggestions([]);

    const searchData = {
      location: place.name,
      dates: date[0],
      guests,
      workTrip: isWorkTrip,
    };

    navigate("/book-place", {
      state: searchData,
    });
  };

  const handleSearch = () => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) {
      alert("Please enter a destination to search.");
      return;
    }

    const searchData = {
      location: trimmedLocation,
      dates: date[0],
      guests,
      workTrip: isWorkTrip,
    };

    navigate("/book-place", {
      state: searchData,
    });
  };
  return (
    <div className="relative h-[420px] sm:h-[500px]  w-full">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
        alt="travel"
        className=" absolute inset-0 w-full h-full "
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* CONTENT */}
      <div className=" relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-60">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-5">
          Find your next stay
        </h1>

        <p className="text-lg sm:text-2xl text-gray-200 mb-14">
          Search low prices on hotels, homes and much more...
        </p>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 text-white mb-6">
          {/* Best Price */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/50 p-3 rounded-full">
              <ShieldCheck size={20} />
            </div>
            <span className="text-sm sm:text-base font-medium">
              Best Price Guarantee
            </span>
          </div>

          {/* Trusted */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/50 p-3 rounded-full">
              <UsersRound size={20} />
            </div>
            <span className="text-sm sm:text-base font-medium">
              Trusted by millions
            </span>
          </div>

          {/* Support */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/50 p-3 rounded-full">
              <Headphones size={20} />
            </div>
            <span className="text-sm sm:text-base font-medium">
              24/7 Support
            </span>
          </div>
        </div>

        {/* SEARCH BAR (MODERN) */}
        <div className="bg-white rounded-full  shadow-2xl flex flex-row p-1.5  items-center border border-gray-200  ">
          {/* LOCATION */}
          <div className="flex items-center gap-2 px-3 py-3 flex-1 min-w-40 border-r">
            <MapPin size={20} className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Where are you going?"
              className="w-full outline-none text-[11px] sm:text-sm truncate"
              value={location}
              onChange={handleLocationChange}
            />
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {suggestions.map((place) => (
                <div
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                >
                  <MapPin size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{place.name}</p>
                    <p className="text-xs text-gray-500">
                      {place.city}, {place.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DATE */}
          <div
            onClick={() => setOpenDate(!openDate)}
            className="flex items-center gap-2 px-3 py-3 flex-1 min-w-0 border-r cursor-pointer"
          >
            <CalendarDays size={20} className="flex-shrink-0" />
            <span className="text-[11px] sm:text-sm truncate">
              {/* MOBILE → short */}
              <span className="sm:hidden">
                {format(date[0].startDate, "dd MMM")}
              </span>

              {/* DESKTOP → full */}
              <span className="hidden sm:inline">
                {`${format(date[0].startDate, "dd MMM")} - ${format(
                  date[0].endDate,
                  "dd MMM",
                )}`}
              </span>
            </span>
          </div>

          {/* GUEST */}
          <div
            onClick={() => setOpenGuests(!openGuests)}
            className="flex items-center gap-2 px-3 py-3 flex-1 min-w-0 cursor-pointer"
          >
            <Users size={20} className="flex-shrink-0" />
            <span className="text-[11px] sm:text-sm truncate">
              {/* MOBILE */}
              <span className="sm:hidden">{guests.adults}</span>

              {/* DESKTOP */}
              <span className="hidden sm:inline">
                {`${guests.adults} guests · ${guests.rooms} rooms`}
              </span>
            </span>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSearch}
            className="bg-blue-700 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors
     text-[11px] sm:text-sm flex-shrink-0"
          >
            {/* MOBILE ICON */}
            <span className="sm:hidden">
              <Search />
            </span>

            {/* DESKTOP TEXT */}
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
        {/* DATE PICKER */}
        {openDate && (
          <div className="absolute mt-3 z-50">
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setDate([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={date}
            />
          </div>
        )}

        {/* GUEST DROPDOWN */}
        {openGuests && (
          <div className="absolute mt-3 right-0 bg-white p-4 rounded-xl shadow-xl  z-50 w-72">
            {["adults", "children", "rooms"].map((type) => (
              <div key={type} className="flex justify-between mb-3">
                <span className="capitalize">{type}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setGuests((prev) => ({
                        ...prev,
                        [type]: Math.max(0, prev[type] - 1),
                      }))
                    }
                    className="border px-2"
                  >
                    -
                  </button>
                  <span>{guests[type]}</span>
                  <button
                    onClick={() =>
                      setGuests((prev) => ({
                        ...prev,
                        [type]: prev[type] + 1,
                      }))
                    }
                    className="border px-2"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input_enter;

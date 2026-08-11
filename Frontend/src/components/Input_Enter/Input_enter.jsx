import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import {
  CalendarDays,
  Users,
  MapPin,
  Search,
  ShieldCheck,
  UsersRound,
  Headphones,
  Sparkles,
  Clock3,
} from "lucide-react";

import { placeSuggestions } from "../../Data/Places";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const STORAGE_KEY = "fastBookingRecentSearches";

const Input_enter = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [openDate, setOpenDate] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);

  const [isWorkTrip, setIsWorkTrip] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

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

  // =====================================================
  // LOAD RECENT SEARCHES
  // =====================================================

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      setRecentSearches(Array.isArray(stored) ? stored : []);
    } catch (error) {
      console.error("Recent search loading error:", error);
      setRecentSearches([]);
    }
  }, []);

  // =====================================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setOpenDate(false);
        setOpenGuests(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =====================================================
  // LOCATION SEARCH
  // =====================================================

  const handleLocationChange = (e) => {
    const value = e.target.value;

    setLocation(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const source = Array.isArray(placeSuggestions) ? placeSuggestions : [];

    const searchValue = value.toLowerCase().trim();

    const filtered = source.filter((place) => {
      const name = String(place?.name || "").toLowerCase();
      const city = String(place?.city || "").toLowerCase();
      const country = String(place?.country || "").toLowerCase();

      return (
        name.includes(searchValue) ||
        city.includes(searchValue) ||
        country.includes(searchValue)
      );
    });

    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  // =====================================================
  // SELECT LOCATION
  // =====================================================

  const handleSelectPlace = (place) => {
    const selectedLocation =
      place?.name || place?.city || place?.location || "";

    if (!selectedLocation) return;

    setLocation(selectedLocation);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // =====================================================
  // SAVE RECENT SEARCH
  // =====================================================

  const saveRecentSearch = (destination) => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      const existing = Array.isArray(stored) ? stored : [];

      const newSearch = {
        destination,
        savedAt: new Date().toISOString(),
      };

      const updated = [
        newSearch,
        ...existing.filter(
          (item) =>
            String(item?.destination || "").toLowerCase() !==
            destination.toLowerCase(),
        ),
      ].slice(0, 5);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setRecentSearches(updated);
    } catch (error) {
      console.error("Unable to save recent search:", error);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    const trimmedLocation = location.trim();

    if (!trimmedLocation) {
      alert("Please enter a destination.");
      return;
    }

    const searchData = {
      location: trimmedLocation,
      checkIn: date[0].startDate,
      checkOut: date[0].endDate,

      guests: {
        adults: guests.adults,
        children: guests.children,
        rooms: guests.rooms,
      },

      workTrip: isWorkTrip,
    };

    saveRecentSearch(trimmedLocation);

    setShowSuggestions(false);
    setOpenDate(false);
    setOpenGuests(false);

    navigate("/book-place", {
      state: searchData,
    });
  };

  // =====================================================
  // RECENT SEARCH CLICK
  // =====================================================

  const handleRecentSearch = (destination) => {
    setLocation(destination);
    setShowSuggestions(false);
  };

  // =====================================================
  // REMOVE RECENT SEARCH
  // =====================================================

  const removeRecentSearch = (destination) => {
    try {
      const updated = recentSearches.filter(
        (item) =>
          String(item?.destination || "").toLowerCase() !==
          String(destination || "").toLowerCase(),
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setRecentSearches(updated);
    } catch (error) {
      console.error("Unable to remove recent search:", error);
    }
  };

  // =====================================================
  // GUEST COUNTER
  // =====================================================

  const updateGuest = (type, amount) => {
    setGuests((prev) => {
      const minimum = type === "children" ? 0 : 1;

      const newValue = Math.max(minimum, prev[type] + amount);

      return {
        ...prev,
        [type]: newValue,
      };
    });
  };

  return (
    <section
      ref={searchRef}
      className="relative min-h-[600px] overflow-visible"
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
        alt="Beautiful travel destination"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Blue Overlay */}
      <div className="absolute inset-0 bg-[#061D3D]/65" />

      {/* Gold Glow */}
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#C58A18]/20 blur-3xl" />

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
        {/* Heading */}

        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E3AE32]/40 bg-[#082B5C]/80 px-4 py-2 text-sm font-semibold text-[#E3AE32] backdrop-blur">
            <Sparkles size={16} />
            FastBooking
          </div>

          <h1 className="mb-4 text-3xl font-bold text-white sm:text-5xl lg:text-6xl">
            Find your <span className="text-[#E3AE32]">next stay</span>
          </h1>

          <p className="text-base text-blue-100 sm:text-xl">
            Search low prices on hotels, homes and much more...
          </p>
        </div>

        {/* =================================================
            TRUST FEATURES
        ================================================= */}

        <div className="mb-6 mt-10 flex flex-wrap gap-5 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#E3AE32]" />
            <span className="text-sm">Best Price Guarantee</span>
          </div>

          <div className="flex items-center gap-2">
            <UsersRound size={20} className="text-[#E3AE32]" />
            <span className="text-sm">Trusted by millions</span>
          </div>

          <div className="flex items-center gap-2">
            <Headphones size={20} className="text-[#E3AE32]" />
            <span className="text-sm">24/7 Support</span>
          </div>
        </div>

        {/* =================================================
            SEARCH BOX
        ================================================= */}

        <div className="relative flex flex-col gap-2 rounded-[2rem] border border-[#E3AE32]/50 bg-white p-2 shadow-2xl lg:flex-row">
          {/* LOCATION */}

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-200 px-4 py-3 focus-within:border-[#C58A18]">
            <MapPin size={20} className="shrink-0 text-[#082B5C]" />

            <input
              type="text"
              value={location}
              onChange={handleLocationChange}
              onFocus={() => {
                if (location.trim()) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Where are you going?"
              autoComplete="off"
              className="w-full bg-transparent text-sm text-[#082B5C] outline-none placeholder:text-slate-400"
            />
          </div>

          {/* =================================================
              LOCATION SUGGESTIONS
          ================================================= */}

          {showSuggestions && (
            <div className="absolute left-2 right-2 top-[58px] z-[100] mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#E3AE32]/40 bg-white shadow-2xl lg:left-2 lg:right-auto lg:w-[420px]">
              {suggestions.length > 0 ? (
                suggestions.map((place, index) => (
                  <button
                    key={place?.id || `${place?.name || "place"}-${index}`}
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-blue-50"
                  >
                    <div className="rounded-full bg-blue-50 p-2">
                      <MapPin size={16} className="text-[#C58A18]" />
                    </div>

                    <div>
                      <p className="font-semibold text-[#082B5C]">
                        {place?.name || place?.city || "Destination"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {place?.city || ""}
                        {place?.country ? `, ${place.country}` : ""}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-5 text-center text-sm text-slate-500">
                  No destinations found.
                </div>
              )}
            </div>
          )}

          {/* =================================================
              DATE
          ================================================= */}

          <button
            type="button"
            onClick={() => {
              setOpenDate((prev) => !prev);
              setOpenGuests(false);
              setShowSuggestions(false);
            }}
            className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-left transition hover:border-[#C58A18]"
          >
            <CalendarDays size={20} className="shrink-0 text-[#082B5C]" />

            <span className="truncate text-sm font-medium text-[#082B5C]">
              {format(date[0].startDate, "dd MMM")}
              {" - "}
              {format(date[0].endDate, "dd MMM")}
            </span>
          </button>

          {/* =================================================
              GUESTS
          ================================================= */}

          <button
            type="button"
            onClick={() => {
              setOpenGuests((prev) => !prev);
              setOpenDate(false);
              setShowSuggestions(false);
            }}
            className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-left transition hover:border-[#C58A18]"
          >
            <Users size={20} className="shrink-0 text-[#082B5C]" />

            <span className="truncate text-sm font-medium text-[#082B5C]">
              {guests.adults + guests.children} guests · {guests.rooms} rooms
            </span>
          </button>

          {/* =================================================
              WORK TRIP
          ================================================= */}

          <label className="hidden cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-[#082B5C] lg:flex">
            <input
              type="checkbox"
              checked={isWorkTrip}
              onChange={(e) => setIsWorkTrip(e.target.checked)}
              className="h-4 w-4 accent-[#C58A18]"
            />
            Work trip
          </label>

          {/* =================================================
              SEARCH BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={handleSearch}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#082B5C] px-6 py-3 font-semibold text-white transition hover:bg-[#C58A18]"
          >
            <Search size={20} />
            <span>Search</span>
          </button>
        </div>

        {/* =================================================
    RECENT SEARCHES
================================================= */}

        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          {/* Title */}
          <div className="flex items-center gap-2 text-sm font-semibold text-[#E3AE32]">
            <Clock3 size={15} />
            Recent Searches
          </div>

          {recentSearches.length > 0 ? (
            recentSearches.map((item, index) => (
              <div
                key={`${item.destination}-${item.savedAt}-${index}`}
                className="flex items-center rounded-full border border-[#E3AE32]/50 bg-[#082B5C]/80 text-xs font-medium text-white shadow-md backdrop-blur transition hover:border-[#E3AE32]"
              >
                {/* Destination */}
                <button
                  type="button"
                  onClick={() => handleRecentSearch(item.destination)}
                  className="rounded-l-full px-3 py-2 transition hover:text-[#E3AE32]"
                >
                  {item.destination}
                </button>

                {/* Remove */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentSearch(item.destination);
                  }}
                  className="mr-1 flex h-6 w-6 items-center justify-center rounded-full text-blue-200 transition hover:text-red-500 "
                  aria-label={`Remove ${item.destination}`}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <span className="text-xs text-blue-100">No recent searches</span>
          )}
        </div>

        {/* =================================================
            DATE PICKER
        ================================================= */}

        {openDate && (
          <div className="absolute left-2 right-2 z-[100] mt-3 overflow-hidden rounded-2xl border-2 border-[#E3AE32]/50 bg-white shadow-2xl sm:left-auto sm:right-8">
            <DateRange
              editableDateInputs
              onChange={(item) => {
                const selection = item.selection;

                setDate([
                  {
                    ...selection,
                    endDate: selection.endDate || selection.startDate,
                  },
                ]);
              }}
              moveRangeOnFirstSelection={false}
              ranges={date}
              minDate={new Date()}
              rangeColors={["#C58A18"]}
            />
          </div>
        )}

        {/* =================================================
            GUEST DROPDOWN
        ================================================= */}

        {openGuests && (
          <div className="absolute right-2 z-[100] mt-3 w-[calc(100%-1rem)] max-w-sm rounded-2xl border border-[#E3AE32]/50 bg-white p-5 shadow-2xl sm:right-8">
            <h3 className="mb-4 border-b border-slate-100 pb-3 font-bold text-[#082B5C]">
              Guests & Rooms
            </h3>

            <GuestRow
              label="Adults"
              value={guests.adults}
              onMinus={() => updateGuest("adults", -1)}
              onPlus={() => updateGuest("adults", 1)}
            />

            <GuestRow
              label="Children"
              value={guests.children}
              onMinus={() => updateGuest("children", -1)}
              onPlus={() => updateGuest("children", 1)}
            />

            <GuestRow
              label="Rooms"
              value={guests.rooms}
              onMinus={() => updateGuest("rooms", -1)}
              onPlus={() => updateGuest("rooms", 1)}
            />
          </div>
        )}
      </div>
    </section>
  );
};

// =====================================================
// GUEST ROW
// =====================================================

const GuestRow = ({ label, value, onMinus, onPlus }) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0">
      <span className="font-medium text-[#082B5C]">{label}</span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMinus}
          disabled={value <= (label === "Children" ? 0 : 1)}
          className="h-8 w-8 rounded-full border border-[#C58A18] font-bold text-[#082B5C] transition hover:bg-[#C58A18] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          -
        </button>

        <span className="w-5 text-center font-semibold text-[#082B5C]">
          {value}
        </span>

        <button
          type="button"
          onClick={onPlus}
          className="h-8 w-8 rounded-full bg-[#082B5C] font-bold text-white transition hover:bg-[#C58A18]"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Input_enter;

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  MapPin,
  Search,
  X,
  Compass,
  ShieldCheck,
  Sparkles,
  Clock3,
  Star,
} from "lucide-react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const BookPage = () => {
  const navigate = useNavigate();
  const locationInputRef = useRef(null);

  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [openDate, setOpenDate] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem("fastBookingRecentSearches");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [date, setDate] = useState(() => {
    const startDate = new Date();
    const endDate = new Date();

    endDate.setDate(startDate.getDate() + 7);

    return [
      {
        startDate,
        endDate,
        key: "selection",
      },
    ];
  });

  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const popularDestinations = [
    "New York, USA",
    "Los Angeles, USA",
    "Chicago, USA",
    "Houston, USA",
    "Phoenix, USA",
    "Philadelphia, USA",
    "San Antonio, USA",
    "San Diego, USA",
    "Dallas, USA",
    "San Jose, USA",
    "London, UK",
    "Paris, France",
    "Tokyo, Japan",
    "Sydney, Australia",
    "Toronto, Canada",
    "Berlin, Germany",
    "Rome, Italy",
    "Barcelona, Spain",
    "Amsterdam, Netherlands",
    "Vienna, Austria",
    "Zurich, Switzerland",
    "Bali, Indonesia",
    "Bangkok, Thailand",
    "Dubai, UAE",
    
  ];

  const quickSearches = [
    {
      label: "Beach escape",
      destination: "Malibu, USA",
    },
    {
      label: "City break",
      destination: "Chicago, USA",
    },
    {
      label: "Weekend retreat",
      destination: "Asheville, USA",
    },
  ];

  const highlights = [
    {
      title: "Flexible stays",
      copy: "Free cancellation on many properties",
    },
    {
      title: "Verified comfort",
      copy: "Trusted hosts and spotless reviews",
    },
    {
      title: "Fast support",
      copy: "Help whenever your plans change",
    },
  ];

  const popularPlaces = [
    {
      name: "New York",
      location: "New York, USA",
      image:
        "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    },
    {
      name: "Paris",
      location: "Paris, France",
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    },
    {
      name: "Tokyo",
      location: "Tokyo, Japan",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    },
    {
      name: "London",
      location: "London, UK",
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    },
  ];

  useEffect(() => {
    try {
      localStorage.setItem(
        "fastBookingRecentSearches",
        JSON.stringify(recentSearches)
      );
    } catch (error) {
      console.error("Unable to save recent searches", error);
    }
  }, [recentSearches]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getGuestSummary = (value) => {
    const totalGuests = value.adults + value.children;

    return `${totalGuests} guest${
      totalGuests !== 1 ? "s" : ""
    }, ${value.rooms} room${value.rooms !== 1 ? "s" : ""}`;
  };

  const getDateLabel = (range) => {
    if (!range?.startDate || !range?.endDate) {
      return "Select dates";
    }

    return `${format(range.startDate, "MMM dd")} - ${format(
      range.endDate,
      "MMM dd, yyyy"
    )}`;
  };

  const getNights = () => {
    const start = date[0].startDate;
    const end = date[0].endDate;

    const nights = Math.ceil(
      (end - start) / (1000 * 60 * 60 * 24)
    );

    return Math.max(1, nights);
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;

    setLocation(value);

    if (!value.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = popularDestinations.filter((destination) =>
      destination.toLowerCase().includes(value.toLowerCase())
    );

    setLocationSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    const trimmedLocation = location.trim();

    if (!trimmedLocation) {
      alert("Please enter a destination.");
      return;
    }

    setOpenDate(false);
    setOpenGuests(false);
    setShowSuggestions(false);

    const searchItem = {
      location: trimmedLocation,
      datesLabel: getDateLabel(date[0]),
      guestsLabel: getGuestSummary(guests),
    };

    setRecentSearches((previous) => {
      const next = [
        searchItem,
        ...previous.filter(
          (item) => item.location !== trimmedLocation
        ),
      ];

      return next.slice(0, 4);
    });

    navigate("/book-place", {
      state: {
        location: trimmedLocation,
        dates: date[0],
        guests,
      },
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const updateGuests = (type, amount) => {
    setGuests((previous) => ({
      ...previous,
      [type]:
        type === "adults" || type === "rooms"
          ? Math.max(1, previous[type] + amount)
          : Math.max(0, previous[type] + amount),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-6 shadow-2xl sm:p-10 lg:p-12">

          {/* Decorative circles */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">

            {/* Hero content */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
                <Sparkles size={16} />
                Thoughtful travel planning, made simple
              </div>

              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find your next{" "}
                <span className="text-yellow-400">
                  favorite stay
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                Discover scenic escapes, big-city stays, and homes
                with flexible check-in in a few quick taps.
              </p>

              {/* Quick searches */}
              <div className="mt-7 flex flex-wrap gap-3">
                {quickSearches.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setLocation(item.destination)}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-yellow-300"
                  >
                    {item.label}: {item.destination}
                  </button>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="rounded-3xl border border-white/15 bg-slate-950/30 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-300">
                <ShieldCheck size={18} />
                Why travelers stay with us
              </div>

              <div className="mt-4 space-y-3">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4"
                  >
                    <div className="font-semibold text-white">
                      {item.title}
                    </div>

                    <div className="mt-1 text-sm text-blue-100/80">
                      {item.copy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH CARD */}
        <section className="-mt-5 relative z-20 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl sm:p-7 lg:p-8">

          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
                Search
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Plan your stay in seconds
              </h2>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock3
                size={16}
                className="text-yellow-500"
              />
              Book faster with a polished search flow
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.95fr_0.8fr_auto]">

            {/* LOCATION */}
            <div
              className="relative"
              ref={locationInputRef}
            >
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Where are you going?
              </label>

              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={20}
                />

                <input
                  type="text"
                  value={location}
                  onChange={handleLocationChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (location.trim()) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Enter destination"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                {location && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocation("");
                      setLocationSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {showSuggestions &&
                locationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    {locationSuggestions.map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() =>
                            handleSuggestionClick(
                              suggestion
                            )
                          }
                          className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition last:border-0 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <MapPin
                            size={16}
                            className="text-yellow-500"
                          />
                          {suggestion}
                        </button>
                      )
                    )}
                  </div>
                )}
            </div>

            {/* DATE */}
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Check-in - Check-out
              </label>

              <button
                type="button"
                onClick={() => {
                  setOpenDate((previous) => !previous);
                  setOpenGuests(false);
                  setShowSuggestions(false);
                }}
                className="relative w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-left text-sm text-slate-700 transition hover:border-blue-400 hover:bg-white"
              >
                <Calendar
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={20}
                />

                {getDateLabel(date[0])}
              </button>

              {openDate && (
                <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                  <DateRange
                    editableDateInputs={false}
                    onChange={(item) =>
                      setDate([item.selection])
                    }
                    moveRangeOnFirstSelection={false}
                    ranges={date}
                    minDate={new Date()}
                    months={2}
                    direction="horizontal"
                  />

                  <div className="flex items-center justify-between border-t border-slate-200 px-2 pt-4">
                    <span className="text-sm text-slate-500">
                      {getNights()} night
                      {getNights() !== 1 ? "s" : ""} selected
                    </span>

                    <button
                      type="button"
                      onClick={() => setOpenDate(false)}
                      className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* GUESTS */}
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Guests & rooms
              </label>

              <button
                type="button"
                onClick={() => {
                  setOpenGuests((previous) => !previous);
                  setOpenDate(false);
                  setShowSuggestions(false);
                }}
                className="relative w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-left text-sm text-slate-700 transition hover:border-blue-400 hover:bg-white"
              >
                <Users
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={20}
                />

                {getGuestSummary(guests)}
              </button>

              {openGuests && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">

                  {[
                    {
                      key: "adults",
                      title: "Adults",
                      description: "Ages 13 or above",
                      min: 1,
                    },
                    {
                      key: "children",
                      title: "Children",
                      description: "Ages 0-12",
                      min: 0,
                    },
                    {
                      key: "rooms",
                      title: "Rooms",
                      description: "Number of rooms",
                      min: 1,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.title}
                        </p>

                        <p className="text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={
                            guests[item.key] <= item.min
                          }
                          onClick={() =>
                            updateGuests(item.key, -1)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          -
                        </button>

                        <span className="w-6 text-center font-semibold">
                          {guests[item.key]}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateGuests(item.key, 1)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setOpenGuests(false)}
                    className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* SEARCH BUTTON */}
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-blue-800 lg:h-full"
            >
              <Search size={19} />
              Search stays
            </button>
          </div>

          {/* RECENT SEARCHES */}
          <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-blue-100 bg-blue-50/50 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Compass
                size={17}
                className="text-yellow-500"
              />
              Recent searches
            </div>

            <div className="flex flex-wrap gap-2">
              {recentSearches.length > 0 ? (
                recentSearches.map((item) => (
                  <button
                    key={`${item.location}-${item.datesLabel}`}
                    type="button"
                    onClick={() => {
                      setLocation(item.location);
                      setShowSuggestions(false);
                    }}
                    className="rounded-full border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
                  >
                    {item.location} • {item.datesLabel}
                  </button>
                ))
              ) : (
                <span className="text-sm text-slate-500">
                  Your recent searches will appear here.
                </span>
              )}
            </div>
          </div>

          {/* POPULAR DESTINATIONS */}
          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-600">
                  Explore
                </p>

                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  Popular destinations
                </h3>
              </div>

              <div className="hidden items-center gap-1 text-sm text-slate-500 sm:flex">
                <Star
                  size={15}
                  className="fill-yellow-400 text-yellow-400"
                />
                Top traveler picks
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {popularPlaces.map((destination) => (
                <button
                  key={destination.name}
                  type="button"
                  onClick={() =>
                    setLocation(destination.location)
                  }
                  className="group relative overflow-hidden rounded-2xl"
                >
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                    <h4 className="text-lg font-bold text-white">
                      {destination.name}
                    </h4>

                    <p className="mt-1 flex items-center gap-1 text-xs text-blue-100">
                      <MapPin size={12} />
                      {destination.location}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookPage;
import React, { useEffect, useState } from "react";
import {
  Compass,
  Sparkles,
  MapPin,
  ArrowRight,
  Clock3,
  Heart,
  Star,
  TrendingUp,
  Search,
  Trash2,
  Hotel,
  Percent,
  ChevronRight,
  Plane,
  X,
} from "lucide-react";

const STORAGE_KEY = "fastBookingRecentSearches";
const FAVORITES_KEY = "fastBookingFavorites";

const popularPlaces = [
  {
    name: "Mumbai",
    subtitle: "Hotels, beaches & city life",
    bookings: "2.4k+ bookings",
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Goa",
    subtitle: "Beaches, resorts & nightlife",
    bookings: "3.8k+ bookings",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Delhi",
    subtitle: "History, food & shopping",
    bookings: "2.1k+ bookings",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bangalore",
    subtitle: "Business & modern city stays",
    bookings: "1.9k+ bookings",
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=900&q=80",
  },
];

const popularHotels = [
  {
    name: "Luxury Downtown Hotel",
    location: "Mumbai",
    rating: 4.8,
    price: 250,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Beachfront Resort",
    location: "Goa",
    rating: 4.9,
    price: 350,
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "City Center Hotel",
    location: "Delhi",
    rating: 4.7,
    price: 180,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
  },
];

const TravelInsights = () => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    const loadData = () => {
      try {
        const searches = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );

        const savedFavorites = JSON.parse(
          localStorage.getItem(FAVORITES_KEY) || "[]"
        );

        setRecentSearches(
          Array.isArray(searches) ? searches : []
        );

        setFavorites(
          Array.isArray(savedFavorites)
            ? savedFavorites
            : []
        );
      } catch (error) {
        console.error("Failed to load Travel Insights:", error);

        setRecentSearches([]);
        setFavorites([]);
      }
    };

    loadData();

    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // =====================================================
  // REMOVE ONE SEARCH
  // =====================================================

  const removeRecentSearch = (destination) => {
    try {
      const updated = recentSearches.filter(
        (item) =>
          String(item?.destination || "").toLowerCase() !==
          String(destination || "").toLowerCase()
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );

      setRecentSearches(updated);
    } catch (error) {
      console.error("Unable to remove search:", error);
    }
  };

  // =====================================================
  // CLEAR SEARCHES
  // =====================================================

  const clearRecentSearches = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentSearches([]);
  };

  // =====================================================
  // SELECT DESTINATION
  // =====================================================

  const selectDestination = (place) => {
    setSelectedPlace(place);

    localStorage.setItem(
      "fastBookingSelectedDestination",
      JSON.stringify({
        destination: place.name,
        selectedAt: new Date().toISOString(),
      })
    );

    const searchSection =
      document.getElementById("hotel-search");

    if (searchSection) {
      searchSection.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // =====================================================
  // RECENT SEARCH CLICK
  // =====================================================

  const handleRecentSearch = (destination) => {
    const place = {
      name: destination,
      subtitle: "Recently searched destination",
    };

    selectDestination(place);
  };

  return (
    <section className="relative overflow-hidden bg-[#F7F9FC] px-4 py-16 sm:px-6 lg:px-8">

      {/* =================================================
          BACKGROUND DECORATION
      ================================================= */}

      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#E3AE32]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#082B5C]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* =================================================
            PREMIUM HEADER
        ================================================= */}

        <div className="mb-10 overflow-hidden rounded-[2rem] bg-[#082B5C] shadow-2xl">

          <div className="relative p-7 sm:p-10 lg:p-12">

            {/* Gold decoration */}

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[25px] border-[#E3AE32]/10" />

            <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-[#C58A18]/10 blur-2xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

              <div>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E3AE32]/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E3AE32]">

                  <Sparkles size={15} />

                  Travel Dashboard

                </div>

                <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">

                  Your journey starts
                  <span className="text-[#E3AE32]">
                    {" "}here.
                  </span>

                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">

                  Explore trending destinations, continue your
                  searches and discover handpicked stays for your
                  next adventure.

                </p>

                <div className="mt-6 flex flex-wrap gap-3">

                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">

                    <Plane
                      size={16}
                      className="text-[#E3AE32]"
                    />

                    Travel smarter

                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">

                    <ShieldIcon />

                    Secure booking

                  </div>

                </div>

              </div>

              {/* Dashboard Stats */}

              <div className="grid grid-cols-2 gap-3 lg:w-[260px]">

                <MiniStat
                  icon={<Clock3 size={18} />}
                  value={recentSearches.length}
                  label="Searches"
                />

                <MiniStat
                  icon={<Heart size={18} fill="currentColor" />}
                  value={favorites.length}
                  label="Favorites"
                />

                <MiniStat
                  icon={<Hotel size={18} />}
                  value="120+"
                  label="Hotels"
                />

                <MiniStat
                  icon={<TrendingUp size={18} />}
                  value="+24%"
                  label="Growth"
                />

              </div>

            </div>
          </div>
        </div>

        {/* =================================================
            RECENT SEARCHES
        ================================================= */}

        <div className="mb-10">

          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

            <div>

              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#C58A18]">

                <Clock3 size={17} />

                Continue Exploring

              </div>

              <h3 className="mt-1 text-2xl font-bold text-[#082B5C]">
                Recent searches
              </h3>

            </div>

            {recentSearches.length > 0 && (
              <button
                type="button"
                onClick={clearRecentSearches}
                className="flex items-center gap-2 self-start rounded-full border border-red-100 bg-white px-4 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            )}

          </div>

          {recentSearches.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-[#E3AE32]/40 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF8E7]">

                <Search
                  size={26}
                  className="text-[#C58A18]"
                />

              </div>

              <h4 className="mt-4 font-bold text-[#082B5C]">
                No recent searches
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                Your recent destinations will appear here.
              </p>

            </div>

          ) : (

            <div className="flex gap-4 overflow-x-auto pb-3">

              {recentSearches.map((search, index) => (

                <div
                  key={`${search.destination}-${search.savedAt || index}`}
                  className="group min-w-[250px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#E3AE32] hover:shadow-xl"
                >

                  <div className="flex items-center justify-between">

                    <button
                      type="button"
                      onClick={() =>
                        handleRecentSearch(search.destination)
                      }
                      className="flex min-w-0 items-center gap-3 text-left"
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#082B5C]">

                        <MapPin
                          size={19}
                          className="text-[#E3AE32]"
                        />

                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-bold text-[#082B5C]">
                          {search.destination}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Recently searched
                        </p>

                      </div>

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeRecentSearch(search.destination)
                      }
                      className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRecentSearch(search.destination)
                    }
                    className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#F4F7FB] px-3 py-2 text-xs font-semibold text-[#082B5C] transition hover:bg-[#082B5C] hover:text-white"
                  >

                    Search again

                    <ArrowRight size={15} />

                  </button>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* =================================================
            DESTINATIONS
        ================================================= */}

        <div className="mb-10">

          <div className="mb-6 flex items-end justify-between">

            <div>

              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#C58A18]">

                <Compass size={17} />

                Trending destinations

              </div>

              <h3 className="mt-1 text-2xl font-bold text-[#082B5C] sm:text-3xl">
                Where will you go next?
              </h3>

            </div>

            <div className="hidden items-center gap-1 text-sm font-semibold text-[#C58A18] sm:flex">

              Explore more
              <ChevronRight size={17} />

            </div>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {popularPlaces.map((place) => (

              <div
                key={place.name}
                className="group relative h-[280px] overflow-hidden rounded-[1.5rem] shadow-lg"
              >

                <img
                  src={place.image}
                  alt={place.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#061A35] via-[#061A35]/20 to-transparent" />

                {/* Gold badge */}

                <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-[#082B5C]/80 px-3 py-1.5 text-xs font-semibold text-[#E3AE32] backdrop-blur">
                  {place.bookings}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">

                  <div className="mb-2 flex items-center gap-1 text-xs text-[#E3AE32]">

                    <MapPin size={13} />

                    Popular destination

                  </div>

                  <h4 className="text-2xl font-bold text-white">
                    {place.name}
                  </h4>

                  <p className="mt-1 text-xs text-blue-100">
                    {place.subtitle}
                  </p>

                  <button
                    type="button"
                    onClick={() => selectDestination(place)}
                    className="mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#082B5C] transition hover:bg-[#E3AE32] hover:text-white"
                  >
                    Explore
                    <ArrowRight size={14} />
                  </button>

                </div>

              </div>
            ))}

          </div>
        </div>

        {/* =================================================
            POPULAR HOTELS
        ================================================= */}

        <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#C58A18]">

                <Hotel size={17} />

                Recommended stays

              </div>

              <h3 className="mt-1 text-2xl font-bold text-[#082B5C]">
                Hotels travelers love
              </h3>

            </div>

            <button
              type="button"
              className="flex items-center gap-2 self-start rounded-full bg-[#082B5C] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#C58A18] sm:self-auto"
            >
              View all
              <ArrowRight size={15} />
            </button>

          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">

            {popularHotels.map((hotel, index) => (

              <div
                key={hotel.name}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#E3AE32] hover:shadow-xl"
              >

                <div className="relative h-44 overflow-hidden">

                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#C58A18] shadow-md">

                    <Star
                      size={13}
                      fill="currentColor"
                    />

                    {hotel.rating}

                  </div>

                  <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#082B5C]/80 text-xs font-bold text-[#E3AE32] backdrop-blur">

                    #{index + 1}

                  </div>

                </div>

                <div className="p-4">

                  <h4 className="font-bold text-[#082B5C]">
                    {hotel.name}
                  </h4>

                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">

                    <MapPin size={13} />

                    {hotel.location}

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <div>

                      <span className="text-xl font-bold text-[#082B5C]">
                        ${hotel.price}
                      </span>

                      <span className="text-xs text-slate-500">
                        {" "}
                        / night
                      </span>

                    </div>

                    <button
                      type="button"
                      className="rounded-full bg-[#082B5C] p-2.5 text-white transition hover:bg-[#C58A18]"
                    >
                      <ArrowRight size={16} />
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

        {/* =================================================
            OFFER + TRAVEL TIP
        ================================================= */}

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">

          {/* Offer */}

          <div className="relative overflow-hidden rounded-[2rem] bg-[#082B5C] p-7 shadow-xl sm:p-9">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-[#E3AE32]/10" />

            <div className="relative">

              <div className="flex items-start justify-between">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C58A18]">

                  <Percent
                    size={26}
                    className="text-white"
                  />

                </div>

                <span className="rounded-full bg-[#E3AE32]/10 px-4 py-2 text-xs font-bold text-[#E3AE32]">
                  LIMITED OFFER
                </span>

              </div>

              <p className="mt-7 text-sm font-semibold uppercase tracking-widest text-[#E3AE32]">
                Exclusive FastBooking Deal
              </p>

              <h3 className="mt-2 max-w-lg text-3xl font-bold text-white">
                Save up to 25% on your next stay
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                Unlock special prices on selected hotels,
                resorts and premium stays.
              </p>

              <button
                type="button"
                className="mt-6 flex items-center gap-2 rounded-full bg-[#E3AE32] px-6 py-3 text-sm font-bold text-[#082B5C] transition hover:bg-white"
              >
                Explore offers
                <ArrowRight size={17} />
              </button>

            </div>

          </div>

          {/* Travel Tip */}

          <div className="rounded-[2rem] border border-[#E3AE32]/30 bg-[#FFFDF7] p-7 shadow-sm sm:p-9">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#082B5C]">

              <TrendingUp
                size={22}
                className="text-[#E3AE32]"
              />

            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#C58A18]">
              Smart Travel Tip
            </p>

            <h3 className="mt-2 text-2xl font-bold text-[#082B5C]">
              Book early, save more.
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Popular destinations fill quickly during weekends
              and holidays. Early booking gives you more choices,
              better prices and flexible cancellation options.
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#C58A18]">

              <Sparkles size={16} />

              Smart recommendation

            </div>

          </div>

        </div>

        {/* =================================================
            SELECTED DESTINATION
        ================================================= */}

        {selectedPlace && (

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#E3AE32]/40 bg-[#FFF9EC] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C58A18] text-white">

                <MapPin size={17} />

              </div>

              <div>

                <p className="text-sm font-bold text-[#082B5C]">
                  {selectedPlace.name} selected
                </p>

                <p className="text-xs text-slate-500">
                  Your destination has been saved for your next search.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() => setSelectedPlace(null)}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-[#082B5C]"
            >
              <X size={17} />
            </button>

          </div>

        )}

      </div>
    </section>
  );
};

// =====================================================
// MINI STAT
// =====================================================

const MiniStat = ({ icon, value, label }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

      <div className="flex items-center justify-between">

        <div className="text-[#E3AE32]">
          {icon}
        </div>

        <span className="text-lg font-bold text-white">
          {value}
        </span>

      </div>

      <p className="mt-2 text-xs text-blue-100">
        {label}
      </p>

    </div>
  );
};

// =====================================================
// SECURITY ICON
// =====================================================

const ShieldIcon = () => {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#E3AE32] text-[8px] text-[#E3AE32]">
      ✓
    </span>
  );
};

export default TravelInsights;
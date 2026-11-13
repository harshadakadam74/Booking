import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, MapPin, Search, Star } from "lucide-react";
import { listHotels } from "../services/destinationService";
import {
  HOTEL_FAVORITES_EVENT,
  readHotelFavoriteIds,
  writeHotelFavoriteIds,
} from "../utils/hotelFavorites";

const formatPrice = (price, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(price));
  } catch {
    return `${currency} ${Number(price).toLocaleString("en-IN")}`;
  }
};

const ratingDescription = (rating) => {
  if (rating >= 4.5) return "Exceptional";
  if (rating >= 4) return "Excellent";
  if (rating >= 3) return "Very Good";
  return "";
};

const getHotelImage = (hotel) => hotel.image || hotel.images?.find(Boolean) || "";

const HotelCarousel = () => {
  const carouselRef = useRef(null);
  const [hotels, setHotels] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [favorites, setFavorites] = useState(readHotelFavoriteIds);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateNavigation = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    setCanScrollPrevious(carousel.scrollLeft > 2);
    setCanScrollNext(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 2);
  }, []);

  const cities = useMemo(() => [...new Set(hotels
    .map((hotel) => String(hotel.city || hotel.location || "").split(",")[0].trim())
    .filter(Boolean))].sort((left, right) => left.localeCompare(right)), [hotels]);
  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredHotels = useMemo(() => hotels.filter((hotel) => {
    const city = String(hotel.city || hotel.location || "").split(",")[0].trim();
    const matchesCity = !selectedCity || city === selectedCity;
    const searchableText = `${hotel.name || ""} ${hotel.city || ""} ${hotel.location || ""}`.toLowerCase();
    return matchesCity && (!normalizedSearch || searchableText.includes(normalizedSearch));
  }), [hotels, normalizedSearch, selectedCity]);

  useEffect(() => {
    let active = true;
    const loadHotels = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await listHotels({
          country: "India",
          sortBy: "recommended",
          page: 1,
          limit: 30,
          ...(import.meta.env.DEV ? { includeDemo: true } : {}),
        });
        if (!Array.isArray(response?.properties)) {
          throw new Error("The hotel API returned an unexpected response. Check that the backend is running the current project version.");
        }
        const uniqueHotels = new Map();
        for (const hotel of response.properties) {
          if (
            !hotel?._id ||
            (hotel.isDemo && !import.meta.env.DEV) ||
            hotel.active === false ||
            (hotel.approvalStatus && hotel.approvalStatus !== "approved")
          ) continue;

          const identity = [
            String(hotel.name || "").trim().toLowerCase(),
            String(hotel.city || hotel.location || "").split(",")[0].trim().toLowerCase(),
          ].join("|");
          if (!uniqueHotels.has(identity)) uniqueHotels.set(identity, hotel);
        }

        const prioritizedHotels = [...uniqueHotels.values()].sort((left, right) => (
          Number(right.bookingCount || 0) - Number(left.bookingCount || 0) ||
          Number(right.ratingCount || 0) - Number(left.ratingCount || 0) ||
          Number(right.rating || 0) - Number(left.rating || 0) ||
          new Date(right.createdAt || 0) - new Date(left.createdAt || 0)
        ));
        if (active) setHotels(prioritizedHotels.slice(0, 12));
      } catch (requestError) {
        if (active) {
          setHotels([]);
          setError(
            requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load hotels right now."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHotels();
    return () => {
      active = false;
    };
  }, [retry]);

  useEffect(() => {
    const syncFavorites = () => setFavorites(readHotelFavoriteIds());
    window.addEventListener(HOTEL_FAVORITES_EVENT, syncFavorites);
    window.addEventListener("storage", syncFavorites);
    return () => {
      window.removeEventListener(HOTEL_FAVORITES_EVENT, syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return undefined;
    updateNavigation();
    carousel.addEventListener("scroll", updateNavigation, { passive: true });
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(carousel);
    return () => {
      carousel.removeEventListener("scroll", updateNavigation);
      observer.disconnect();
    };
  }, [filteredHotels, loading, updateNavigation]);

  useEffect(() => {
    if (carouselRef.current) carouselRef.current.scrollLeft = 0;
  }, [searchText, selectedCity]);

  const toggleFavorite = (hotelId) => {
    const next = favorites.includes(hotelId)
      ? favorites.filter((id) => id !== hotelId)
      : [...favorites, hotelId];
    try {
      setFavorites(writeHotelFavoriteIds(next));
    } catch (storageError) {
      console.error("Unable to save hotel favorite:", storageError);
    }
  };

  const scroll = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.9,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="homepage-hotels-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C58A18]">Handpicked stays</p>
            <h2 id="homepage-hotels-heading" className="mt-1 text-2xl font-extrabold text-[#082B5C] sm:text-3xl">
              Popular hotels &amp; stays
            </h2>
            <p className="mt-2 text-sm text-slate-600">Explore approved properties and guest-rated favorites across India.</p>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              disabled={!canScrollPrevious}
              aria-label="Previous hotels"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#082B5C] shadow-sm transition hover:border-[#E3AE32] hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={19} />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              disabled={!canScrollNext}
              aria-label="Next hotels"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#082B5C] shadow-sm transition hover:border-[#E3AE32] hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRight size={19} />
            </button>
          </div>
        </div>

        {hotels.length > 0 && !loading && !error && (
          <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_15rem]">
            <label className="relative block">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search hotel or destination"
                aria-label="Search hotels by name or destination"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#082B5C] focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              aria-label="Filter hotels by city"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#082B5C] focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All cities</option>
              {cities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div aria-live="polite" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-[390px] animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRetry((current) => current + 1)}
              className="mt-4 rounded-lg bg-[#082B5C] px-4 py-2 font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : hotels.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <h3 className="text-lg font-bold text-[#082B5C]">No approved hotels are available</h3>
            <p className="mt-2 text-sm text-slate-600">This section shows active, approved hotels saved in MongoDB. Listings still awaiting approval and demonstration listings in production are hidden.</p>
            {import.meta.env.DEV && (
              <p className="mt-2 text-sm text-slate-600">
                To create local demonstration listings, configure MongoDB and run <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[#082B5C]">npm run seed:hotels</code> from the Backend folder. Demo listings cannot be booked.
              </p>
            )}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <h3 className="text-lg font-bold text-[#082B5C]">No matching hotels</h3>
            <p className="mt-2 text-sm text-slate-600">Try another hotel name or destination, or choose all cities.</p>
          </div>
        ) : (
          <>
            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Hotel listings carousel"
            >
              {filteredHotels.map((hotel) => {
                const id = String(hotel._id);
                const image = getHotelImage(hotel);
                const rating = Number(hotel.rating);
                const ratingCount = Number(hotel.ratingCount);
                const hasRating = rating > 0 && rating <= 5 && ratingCount > 0;
                const location = [hotel.city || hotel.location, hotel.country || "India"]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article
                    key={id}
                    className="flex min-h-[520px] min-w-0 basis-[85%] snap-start flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition-shadow hover:shadow-xl sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-3.75rem)/4)]"
                  >
                    <div className="relative h-52 shrink-0 overflow-hidden bg-slate-100">
                      {image ? (
                        <Link to={`/hotels/${encodeURIComponent(id)}`} aria-label={`View ${hotel.name}`}>
                          <img
                            src={image}
                            alt={hotel.name}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              event.currentTarget.nextElementSibling?.classList.remove("hidden");
                            }}
                            className="h-52 w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="hidden h-52 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm text-slate-500">
                            Image unavailable
                          </div>
                        </Link>
                      ) : (
                        <div className="flex h-52 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm text-slate-500">
                          Image unavailable
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(id)}
                        aria-label={favorites.includes(id) ? `Remove ${hotel.name} from favorites` : `Add ${hotel.name} to favorites`}
                        aria-pressed={favorites.includes(id)}
                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#082B5C] shadow-md transition hover:scale-105 hover:text-rose-600"
                      >
                        <Heart size={19} fill={favorites.includes(id) ? "currentColor" : "none"} className={favorites.includes(id) ? "text-rose-600" : ""} />
                      </button>
                      {hotel.isDemo && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-950">
                          Demo · Not a real hotel
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <Link
                        to={`/hotels/${encodeURIComponent(id)}`}
                        className="line-clamp-1 text-lg font-bold text-[#082B5C] hover:text-[#C58A18]"
                      >
                        {hotel.name}
                      </Link>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-600">
                        <MapPin size={15} className="shrink-0 text-[#C58A18]" />
                        <span className="truncate">{location || "Location not provided"}</span>
                      </p>
                      {hotel.isDemo && (
                        <p className="mt-1 text-xs font-semibold text-amber-800">Sample listing · bookings disabled</p>
                      )}

                      {hasRating ? (
                        <div className="mt-4 flex items-center gap-2">
                          <span className="flex h-9 min-w-10 items-center justify-center gap-1 rounded-lg bg-[#082B5C] px-2 text-sm font-bold text-white">
                            <Star size={13} className="fill-[#E3AE32] text-[#E3AE32]" />
                            {rating.toFixed(1)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#082B5C]">{ratingDescription(rating)}</p>
                            {hotel.ratingSource && (
                              <p className="truncate text-xs text-slate-500">
                                {ratingCount.toLocaleString("en-IN")} ratings · {hotel.ratingSource}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-slate-500">Not yet rated</p>
                      )}

                      {!!hotel.amenities?.length && (
                        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Hotel amenities">
                          {hotel.amenities.slice(0, 3).map((amenity) => (
                            <span key={amenity} className="max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{amenity}</span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto border-t border-slate-100 pt-4">
                        <p className="text-xs text-slate-500">Starting from</p>
                        <p className="text-xl font-extrabold text-[#082B5C]">
                          {formatPrice(hotel.price, hotel.currency || "INR")}
                          <span className="ml-1 text-xs font-normal text-slate-500">/ night</span>
                        </p>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Link
                          to={`/hotels/${encodeURIComponent(id)}`}
                          className="rounded-lg border border-[#082B5C] px-3 py-2 text-center text-sm font-bold text-[#082B5C] transition hover:bg-blue-50"
                        >
                          View details
                        </Link>
                        {hotel.isDemo ? (
                          <button
                            type="button"
                            disabled
                            title="Demo listings cannot be booked."
                            className="cursor-not-allowed rounded-lg bg-slate-200 px-3 py-2 text-sm font-bold text-slate-500"
                          >
                            Book now
                          </button>
                        ) : (
                          <Link
                            to={`/hotels/${encodeURIComponent(id)}`}
                            className="rounded-lg bg-[#082B5C] px-3 py-2 text-center text-sm font-bold text-white transition hover:bg-[#123f77]"
                          >
                            Book now
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="mt-1 flex justify-center gap-3 sm:hidden">
              <button
                type="button"
                onClick={() => scroll(-1)}
                disabled={!canScrollPrevious}
                aria-label="Previous hotels"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-[#082B5C] disabled:opacity-40"
              >
                <ArrowLeft size={19} />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                disabled={!canScrollNext}
                aria-label="Next hotels"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-[#082B5C] disabled:opacity-40"
              >
                <ArrowRight size={19} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HotelCarousel;

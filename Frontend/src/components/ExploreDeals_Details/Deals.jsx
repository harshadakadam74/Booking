import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { listHotels } from "../../services/destinationService";

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

const Deals = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const loadHotels = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await listHotels({
          sortBy: "recommended",
          page: 1,
          limit: 12,
          ...(import.meta.env.DEV ? { includeDemo: true } : {}),
        });
        if (active) setHotels(response.properties || []);
      } catch (requestError) {
        if (active) {
          setHotels([]);
          setError(
            requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load available stays."
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-gradient-to-r from-[#082B5C] to-blue-800 p-7 text-white shadow-xl sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E3AE32]">FastBooking stays</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Discover stays for your next trip</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
            Browse current hotel listings and compare database-listed room rates. Availability and final pricing are confirmed when you choose your dates.
          </p>
        </header>

        {loading ? (
          <div aria-live="polite" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-white p-6 text-red-800">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRetry((current) => current + 1)}
              className="mt-4 rounded-lg bg-[#082B5C] px-4 py-2 text-sm font-bold text-white"
            >
              Retry
            </button>
          </div>
        ) : hotels.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => {
              const hotelId = String(hotel._id || "");
              const image = hotel.image || hotel.images?.[0];
              const address = [
                hotel.streetAddress || hotel.address,
                hotel.city || hotel.location,
                hotel.state,
                hotel.country,
              ].filter(Boolean).join(", ");

              return (
                <article key={hotelId} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  {image ? (
                    <img src={image} alt={hotel.name} loading="lazy" className="h-52 w-full object-cover" />
                  ) : (
                    <div className="h-52 bg-gradient-to-br from-[#082B5C] to-[#E3AE32]" aria-label="No hotel image available" />
                  )}
                  <div className="p-5">
                    {hotel.isDemo && (
                      <span className="mb-3 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-950">
                        DEMO · NOT A REAL HOTEL
                      </span>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold text-[#082B5C]">{hotel.name}</h2>
                        <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-600">
                          <MapPin size={16} className="mt-0.5 shrink-0 text-[#C58A18]" />
                          <span>{address || "Location not supplied"}</span>
                        </p>
                      </div>
                      {Number(hotel.ratingCount) > 0 && Number(hotel.rating) > 0 && Number.isFinite(Number(hotel.rating)) && (
                        <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold text-[#082B5C]">
                          <Star size={14} className="fill-[#E3AE32] text-[#E3AE32]" />
                          {Number(hotel.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 min-h-10 text-sm text-slate-500">
                      {hotel.amenities?.length
                        ? hotel.amenities.slice(0, 3).join(" · ")
                        : hotel.propertyType || hotel.type || "Hotel stay"}
                    </p>
                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xl font-extrabold text-[#082B5C]">
                          {formatPrice(hotel.price, hotel.currency || "INR")}
                        </p>
                        <p className="text-xs text-slate-500">per room, per night</p>
                      </div>
                      <Link
                        to={`/hotels/${encodeURIComponent(hotelId)}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#082B5C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#C58A18]"
                      >
                        View stay <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-[#082B5C]">No hotel listings available right now</h2>
            <p className="mt-2 text-sm text-slate-600">Approved properties will appear here when available.</p>
            <Link to="/book-place" className="mt-5 inline-flex items-center gap-2 font-bold text-[#082B5C]">
              Browse search results <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default Deals;

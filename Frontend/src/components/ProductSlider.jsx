import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { listHotels } from "../services/destinationService";

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

const HotelCard = ({ hotel }) => {
  const hotelId = String(hotel._id || "");
  const city = hotel.city || hotel.location || "";
  const address = [hotel.streetAddress || hotel.address, city, hotel.state]
    .filter(Boolean)
    .join(", ");
  const image = hotel.image || hotel.images?.[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {image ? (
        <img src={image} alt={hotel.name} loading="lazy" className="h-52 w-full object-cover" />
      ) : (
        <div className="h-52 bg-gradient-to-br from-[#082B5C] to-[#E3AE32]" aria-label="No hotel image available" />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-[#082B5C]">{hotel.name}</h3>
            <p className="mt-1 flex items-start gap-1 text-sm text-slate-600">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#E3AE32]" />
              <span>{address || "India"}</span>
            </p>
          </div>
          {Number(hotel.ratingCount) > 0 && Number.isFinite(Number(hotel.rating)) && (
            <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold text-[#082B5C]">
              <Star size={14} className="fill-[#E3AE32] text-[#E3AE32]" />
              {Number(hotel.rating).toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-3 min-h-10 text-sm text-slate-500">
          {hotel.amenities?.length ? hotel.amenities.slice(0, 3).join(" · ") : hotel.propertyType || hotel.type || "Hotel stay"}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xl font-extrabold text-[#082B5C]">{formatPrice(hotel.price, hotel.currency || "INR")}</p>
            <p className="text-xs text-slate-500">starting price · per room/night</p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/hotel/${encodeURIComponent(hotelId)}`}
              className="rounded-lg border border-[#082B5C] px-3 py-2 text-sm font-bold text-[#082B5C] transition hover:bg-blue-50"
            >
              View details
            </Link>
            <Link
              to={`/hotel/${encodeURIComponent(hotelId)}`}
              className="rounded-lg bg-[#082B5C] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#123f77]"
            >
              Book now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

const HotelSection = ({ title, subtitle, hotels }) => (
  <section className="mt-12">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-extrabold text-[#082B5C]">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
      <Link to="/book-place" className="text-sm font-bold text-[#082B5C] underline decoration-[#E3AE32] decoration-2 underline-offset-4">
        Browse all hotels
      </Link>
    </div>
    {hotels.length ? (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.slice(0, 6).map((hotel) => <HotelCard key={hotel._id} hotel={hotel} />)}
      </div>
    ) : (
      <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No hotels are currently available in this section.</p>
    )}
  </section>
);

const ProductSlider = () => {
  const [sections, setSections] = useState({ featured: [], popular: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const loadHotels = async () => {
      setLoading(true);
      setError("");
      try {
        const options = { country: "India", page: 1, limit: 12, includeDemo: false };
        const [featured, popular, recent] = await Promise.all([
          listHotels({ ...options, sortBy: "rating" }),
          listHotels({ ...options, sortBy: "popularity" }),
          listHotels({ ...options, sortBy: "newest" }),
        ]);
        if (active) {
          setSections({
            featured: featured.properties || [],
            popular: popular.properties || [],
            recent: recent.properties || [],
          });
        }
      } catch (requestError) {
        if (active) {
          setSections({ featured: [], popular: [], recent: [] });
          setError(requestError.response?.data?.message || requestError.message || "Unable to load hotels right now.");
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

  const cities = useMemo(() => {
    const seen = new Set();
    return [...sections.featured, ...sections.popular, ...sections.recent]
      .filter((hotel) => {
        const city = String(hotel.city || hotel.location || "").split(",")[0].trim();
        const key = city.toLocaleLowerCase();
        if (!city || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 10)
      .map((hotel) => String(hotel.city || hotel.location).split(",")[0].trim());
  }, [sections]);

  return (
    <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-[#082B5C] p-7 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E3AE32]">FastBooking stays</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Book your next stay directly</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
            Explore real, approved hotel listings from our database. Choose a hotel, confirm your dates and room, then continue to secure checkout.
          </p>
        </div>

        {loading ? (
          <div aria-live="polite" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />)}
          </div>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-white p-6 text-red-800">
            <p>{error}</p>
            <button type="button" onClick={() => setRetry((current) => current + 1)} className="mt-3 rounded-lg bg-[#082B5C] px-4 py-2 text-sm font-bold text-white">Retry</button>
          </div>
        ) : (
          <>
            <HotelSection title="Featured hotels" subtitle="Highly rated stays from real listings" hotels={sections.featured} />
            <HotelSection title="Popular hotels" subtitle="Places with the most recorded guest ratings" hotels={sections.popular} />
            <HotelSection title="Recently added" subtitle="The latest approved properties in our database" hotels={sections.recent} />
            {cities.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-extrabold text-[#082B5C]">Explore hotels across Indian cities</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {cities.map((city) => (
                    <Link
                      key={city}
                      to={`/book-place?destination=${encodeURIComponent(city)}`}
                      className="rounded-full border border-blue-100 bg-white px-5 py-2.5 text-sm font-bold text-[#082B5C] shadow-sm transition hover:border-[#E3AE32] hover:bg-amber-50"
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ProductSlider;

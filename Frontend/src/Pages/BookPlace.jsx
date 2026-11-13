import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react';
import HotelCardImage from '../components/HotelCardImage';
import DestinationAutocomplete from '../components/DestinationAutocomplete';
import { searchHotels } from '../services/destinationService';
import { IS_LOCAL_DEVELOPMENT } from '../services/apiClient';

const getDateValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const formatPrice = (price, currency = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(price);
  } catch {
    return `${currency} ${Number(price).toLocaleString('en-IN')}`;
  }
};

const BookPlace = () => {
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const searchParams = routeLocation.state || {};
  const urlParams = new URLSearchParams(routeLocation.search);
  const [destination, setDestination] = useState(searchParams.location || urlParams.get('destination') || '');
  const [filters, setFilters] = useState(() => ({
    checkIn: getDateValue(searchParams.checkIn || searchParams.dates?.startDate),
    checkOut: getDateValue(searchParams.checkOut || searchParams.dates?.endDate),
    adults: Number(searchParams.guests?.adults ?? 2),
    children: Number(searchParams.guests?.children ?? 0),
    rooms: Number(searchParams.guests?.rooms || 1),
    minPrice: '',
    maxPrice: searchParams.budget ? String(searchParams.budget) : '',
    propertyType: '',
    minRating: '',
    minStars: '',
    amenities: '',
    breakfastIncluded: false,
    workTrip: Boolean(searchParams.workTrip),
    sortBy: 'recommended',
    hotelName: '',
  }));
  const [results, setResults] = useState({ properties: [], pagination: null, alternatives: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fastBookingFavorites') || '[]');
      return Array.isArray(saved) ? saved.map(String) : [];
    } catch (storageError) {
      console.error('Unable to load saved favorites:', storageError);
      return [];
    }
  });
  const [page, setPage] = useState(1);
  const [detailsId, setDetailsId] = useState('');

  const query = useMemo(() => ({
    destination,
    ...(filters.checkIn && filters.checkOut ? { checkIn: filters.checkIn, checkOut: filters.checkOut } : {}),
    guests: Number(filters.adults) + Number(filters.children),
    rooms: filters.rooms,
    ...(filters.minPrice !== '' ? { minPrice: filters.minPrice } : {}),
    ...(filters.maxPrice !== '' ? { maxPrice: filters.maxPrice } : {}),
    ...(filters.propertyType ? { propertyType: filters.propertyType } : {}),
    ...(filters.minRating ? { minRating: filters.minRating } : {}),
    ...(filters.minStars ? { minStars: filters.minStars } : {}),
    ...(filters.amenities.trim() ? { amenities: filters.amenities } : {}),
    ...(filters.breakfastIncluded ? { breakfastIncluded: true } : {}),
    ...(filters.workTrip ? { workTrip: true } : {}),
    ...(filters.hotelName.trim() ? { hotelName: filters.hotelName.trim() } : {}),
    ...(IS_LOCAL_DEVELOPMENT ? { includeDemo: true } : {}),
    sortBy: filters.sortBy,
    page,
    limit: 12,
  }), [destination, filters, page]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await searchHotels(query);
        if (active) setResults(response);
      } catch (requestError) {
        if (active) {
          setResults({ properties: [], pagination: null, alternatives: [] });
          setError(requestError.response?.data?.message || requestError.message || 'Unable to load hotels.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    try {
      localStorage.setItem('fastBookingFavorites', JSON.stringify(favorites));
    } catch (storageError) {
      console.error('Unable to save favorites:', storageError);
    }
  }, [favorites]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const toggleFavorite = (hotelId) => {
    const id = String(hotelId);
    setFavorites((current) => (
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    ));
  };

  const toggleAmenity = (amenity) => {
    const selected = filters.amenities.split(',').map((item) => item.trim()).filter(Boolean);
    const next = selected.some((item) => item.toLowerCase() === amenity.toLowerCase())
      ? selected.filter((item) => item.toLowerCase() !== amenity.toLowerCase())
      : [...selected, amenity];
    updateFilter('amenities', next.join(','));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      minPrice: '',
      maxPrice: '',
      propertyType: '',
      minRating: '',
      minStars: '',
      amenities: '',
      breakfastIncluded: false,
      workTrip: false,
      sortBy: 'recommended',
    }));
  };

  const startBooking = (property) => {
    const propertyId = String(property?._id || '');
    if (!/^[a-f\d]{24}$/i.test(propertyId)) {
      setError('This hotel has an invalid database ID. Please search again.');
      return;
    }

    const bookingParams = new URLSearchParams({
      adults: String(filters.adults),
      children: String(filters.children),
      rooms: String(filters.rooms),
    });
    if (filters.checkIn && filters.checkOut) {
      bookingParams.set('checkIn', filters.checkIn);
      bookingParams.set('checkOut', filters.checkOut);
    }
    navigate(`/hotels/${encodeURIComponent(propertyId)}?${bookingParams.toString()}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-14 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 rounded-3xl bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">FastBooking stays</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            {destination ? `Stays in ${destination}` : 'Explore available stays'}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
            Results come from approved database listings. Demo records are marked and cannot be booked.
            Prices and room inventory are rechecked when you book.
          </p>
        </header>

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Hotel name
              <input value={filters.hotelName} onChange={(event) => updateFilter('hotelName', event.target.value)} placeholder="Search hotel name" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-2">
              Destination
              <DestinationAutocomplete
                value={destination}
                onChange={(value) => { setDestination(value); setPage(1); }}
                onSelect={(place) => { setDestination(place.name); setPage(1); }}
                inputClassName="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-700"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Check-in
              <input type="date" value={filters.checkIn} min={new Date().toISOString().slice(0, 10)} onChange={(event) => updateFilter('checkIn', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Check-out
              <input type="date" value={filters.checkOut} min={filters.checkIn || new Date().toISOString().slice(0, 10)} onChange={(event) => updateFilter('checkOut', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Adults
              <input type="number" min="1" max="20" value={filters.adults} onChange={(event) => updateFilter('adults', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Children
              <input type="number" min="0" max="20" value={filters.children} onChange={(event) => updateFilter('children', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Rooms
              <input type="number" min="1" max="10" value={filters.rooms} onChange={(event) => updateFilter('rooms', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
          </div>
        </section>

        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        <div className="grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h2 className="flex items-center gap-2 font-extrabold text-[#082B5C]"><SlidersHorizontal size={18} /> Filters</h2>
              <button type="button" onClick={resetFilters} className="text-xs font-bold text-[#082B5C] underline underline-offset-2">Reset</button>
            </div>
            <div className="space-y-5 pt-4">
              <fieldset>
                <legend className="text-sm font-bold text-slate-800">Price per night</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="text-xs text-slate-500">Minimum
                    <input type="number" min="0" value={filters.minPrice} onChange={(event) => updateFilter('minPrice', event.target.value)} placeholder="Any" className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-800" />
                  </label>
                  <label className="text-xs text-slate-500">Maximum
                    <input type="number" min="0" value={filters.maxPrice} onChange={(event) => updateFilter('maxPrice', event.target.value)} placeholder="Any" className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-800" />
                  </label>
                </div>
              </fieldset>
              <label className="block text-sm font-bold text-slate-800">Property type
                <select value={filters.propertyType} onChange={(event) => updateFilter('propertyType', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal">
                  <option value="">All types</option><option>Hotel</option><option>Resort</option><option>Apartment</option><option>Homestay</option><option>Villa</option><option>Hostel</option>
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-800">Hotel category
                <select value={filters.minStars} onChange={(event) => updateFilter('minStars', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal">
                  <option value="">Any category</option><option value="1">1+ stars</option><option value="2">2+ stars</option><option value="3">3+ stars</option><option value="4">4+ stars</option><option value="5">5 stars</option>
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-800">Guest rating
                <select value={filters.minRating} onChange={(event) => updateFilter('minRating', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal">
                  <option value="">Any / unrated</option><option value="3">3+ from guests</option><option value="4">4+ from guests</option><option value="4.5">4.5+ from guests</option>
                </select>
              </label>
              <fieldset className="space-y-2">
                <legend className="text-sm font-bold text-slate-800">Amenities</legend>
                {['Wi-Fi', 'Swimming pool', 'Parking', 'Restaurant', 'Air conditioning'].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={filters.amenities.split(',').some((item) => item.trim().toLowerCase() === amenity.toLowerCase())} onChange={() => toggleAmenity(amenity)} className="h-4 w-4 accent-[#082B5C]" />
                    {amenity}
                  </label>
                ))}
              </fieldset>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={filters.breakfastIncluded} onChange={(event) => updateFilter('breakfastIncluded', event.target.checked)} className="h-4 w-4 accent-[#082B5C]" />
                Breakfast included
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={filters.workTrip} onChange={(event) => updateFilter('workTrip', event.target.checked)} className="h-4 w-4 accent-[#082B5C]" />
                Suitable for work trips
              </label>
              <p className="flex items-center gap-2 text-xs leading-5 text-slate-500"><Search size={14} /> Results use current hotel records and update as you change filters.</p>
            </div>
          </aside>

          <section aria-label="Hotel search results" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <h2 className="font-extrabold text-[#082B5C]">{loading ? 'Searching hotels…' : `${results.pagination?.total || 0} stays found`}</h2>
                <p className="mt-1 text-xs text-slate-500">{destination || 'All destinations'} · Prices are per room, per night</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">Sort
                <select value={filters.sortBy} onChange={(event) => updateFilter('sortBy', event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal">
                  <option value="recommended">Recommended</option>
                  <option value="price">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                  <option value="rating">Guest rating</option>
                  <option value="popularity">Popularity</option>
                  <option value="newest">Recently added</option>
                </select>
              </label>
            </div>
        {loading ? (
          <div aria-live="polite" className="space-y-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />)}
          </div>
        ) : results.properties.length ? (
          <>
            <div className="space-y-4">
              {results.properties.map((property) => {
                const id = String(property._id);
                const image = property.image || property.images?.[0];
                const nights = filters.checkIn && filters.checkOut
                  ? Math.max(0, Math.ceil((
                    new Date(`${filters.checkOut}T00:00:00`) -
                    new Date(`${filters.checkIn}T00:00:00`)
                  ) / 86400000))
                  : 0;
                const stayEstimate = Number(property.price) * nights * Number(filters.rooms || 1);
                const address = [property.streetAddress, property.city || property.location, property.state, property.country]
                  .filter(Boolean).join(', ');
                return (
                  <article key={id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md sm:grid sm:grid-cols-[240px_minmax(0,1fr)]">
                    <div className="relative min-h-48 bg-slate-100 sm:min-h-full">
                      <HotelCardImage src={image} alt={property.name} className="h-52 w-full object-cover sm:h-full sm:min-h-64" />
                      {property.images?.length > 1 && <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-semibold text-white">{property.images.length} photos</span>}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-900">{property.propertyType || property.type || 'Stay'}</span>
                            {property.isDemo && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-950">DEMO · NOT A REAL HOTEL</span>}
                            {property.isVerified && !property.isDemo && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">Verified source</span>}
                            {property.breakfastIncluded && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">Breakfast included</span>}
                          </div>
                          <h2 className="mt-2 text-xl font-extrabold text-[#082B5C]">{property.name}</h2>
                          <p className="mt-1 flex items-start gap-1 text-sm text-slate-500"><MapPin size={15} className="mt-0.5 shrink-0" />{address}</p>
                        </div>
                        <button type="button" onClick={() => toggleFavorite(id)} aria-label={favorites.includes(id) ? 'Remove favorite' : 'Add favorite'} className="rounded-full border border-slate-200 p-2 text-rose-600 hover:bg-rose-50">
                          <Heart size={18} fill={favorites.includes(id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      {property.starRating > 0 && <p className="mt-3 text-sm font-bold tracking-wider text-amber-600">{'★'.repeat(Math.min(5, Number(property.starRating)))}</p>}
                      {property.ratingCount > 0 && Number.isFinite(property.rating) && (
                        <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-slate-700">
                          <Star size={15} className="fill-amber-400 text-amber-500" />{property.rating.toFixed(1)}
                          <span className="font-normal text-slate-500">from {property.ratingCount} recorded ratings</span>
                        </p>
                      )}
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{property.description || 'No description supplied.'}</p>
                      <p className="mt-3 text-sm text-slate-600">{property.amenities?.length ? property.amenities.slice(0, 5).join(' · ') : 'Amenities not supplied by the property'}</p>
                      {detailsId === id && (
                        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                          <p>Facilities: {property.facilities?.length ? property.facilities.join(', ') : 'Not listed'}</p>
                          <p>Check-in: {property.checkInTime || '15:00'} · Check-out: {property.checkOutTime || '11:00'}</p>
                          <p>Room types: {property.roomTypes?.length ? property.roomTypes.map((room) => `${room.name} (${room.availableRooms ?? 0} available)`).join(', ') : 'Contact property for room details'}</p>
                        </div>
                      )}
                      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xl font-extrabold text-[#082B5C]">{formatPrice(property.price, property.currency)}</p>
                          <p className="text-xs text-slate-500">per room, per night · listed rate</p>
                          {nights > 0 && <p className="mt-1 text-xs font-semibold text-slate-700">{formatPrice(stayEstimate, property.currency)} estimated for {nights} night{nights === 1 ? '' : 's'} · final price verified at checkout</p>}
                          <p className="mt-1 text-xs text-slate-500">
                            {filters.checkIn && filters.checkOut ? `${property.availableRoomsForStay} rooms for these dates before final recheck` : `${property.availableRooms} rooms listed; dates not checked`}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setDetailsId((current) => current === id ? '' : id)} className="rounded-xl border border-[#082B5C] px-4 py-3 text-sm font-bold text-[#082B5C]">
                            {detailsId === id ? 'Hide details' : 'Quick details'}
                          </button>
                          <button type="button" disabled={property.isDemo || (filters.checkIn && filters.checkOut && Number(property.availableRoomsForStay) < Number(filters.rooms))} onClick={() => startBooking(property)} className="rounded-xl bg-[#082B5C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123f77] disabled:cursor-not-allowed disabled:bg-slate-400">
                            Reserve now
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {(results.pagination?.pages || 0) > 1 && (
              <nav aria-label="Hotel results pages" className="mt-7 flex items-center justify-center gap-4">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40">Previous</button>
                <span className="text-sm text-slate-600">Page {page} of {results.pagination.pages}</span>
                <button type="button" disabled={page >= results.pagination.pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40">Next</button>
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-7 text-center">
            <h2 className="text-lg font-bold text-blue-950">{destination.length < 2 ? 'No hotels are currently available' : `No approved stays found for ${destination}`}</h2>
            <p className="mt-2 text-sm text-slate-700">There are no approved, active hotel listings matching this search in the database yet. Try another destination or adjust filters. An administrator can add and approve listings to make them appear here.</p>
            {IS_LOCAL_DEVELOPMENT && <p className="mt-3 text-sm text-slate-700">For local demo listings, restart the backend with <code className="font-semibold">npm run dev --prefix Backend</code> and verify that <code className="font-semibold">Backend/.env</code> uses the seeded MongoDB database.</p>}
            {results.alternatives?.length > 0 && <ul className="mt-3 space-y-1 text-sm text-slate-600">{results.alternatives.map((alternative) => <li key={alternative}>{alternative}</li>)}</ul>}
          </div>
        )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default BookPlace;

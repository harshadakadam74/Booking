import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Search, Star } from 'lucide-react';
import DestinationAutocomplete from '../components/DestinationAutocomplete';
import { searchHotels } from '../services/destinationService';

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
  const [destination, setDestination] = useState(searchParams.location || '');
  const [filters, setFilters] = useState(() => ({
    checkIn: getDateValue(searchParams.checkIn || searchParams.dates?.startDate),
    checkOut: getDateValue(searchParams.checkOut || searchParams.dates?.endDate),
    guests: Number(searchParams.guests?.adults || 2) + Number(searchParams.guests?.children || 0),
    rooms: Number(searchParams.guests?.rooms || 1),
    budget: searchParams.budget ? String(searchParams.budget) : '',
    propertyType: '',
    minRating: '',
    amenities: '',
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

  const query = useMemo(() => ({
    destination,
    ...(filters.checkIn && filters.checkOut ? { checkIn: filters.checkIn, checkOut: filters.checkOut } : {}),
    guests: filters.guests,
    rooms: filters.rooms,
    ...(filters.budget ? { budget: filters.budget } : {}),
    ...(filters.propertyType ? { propertyType: filters.propertyType } : {}),
    ...(filters.minRating ? { minRating: filters.minRating } : {}),
    ...(filters.amenities.trim() ? { amenities: filters.amenities } : {}),
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

  const startBooking = (property) => {
    const dates = filters.checkIn && filters.checkOut
      ? { startDate: new Date(filters.checkIn), endDate: new Date(filters.checkOut), key: 'selection' }
      : (() => {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        return { startDate, endDate, key: 'selection' };
      })();
    const bookingState = {
      property,
      searchParams: {
        location: destination,
        dates,
        guests: { adults: Number(filters.guests), children: 0, rooms: Number(filters.rooms) },
      },
    };
    if (!localStorage.getItem('authToken')) {
      navigate('/login', { state: { from: '/payment', ...bookingState } });
      return;
    }
    navigate('/payment', { state: bookingState });
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
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
              Guests
              <input type="number" min="1" max="20" value={filters.guests} onChange={(event) => updateFilter('guests', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Rooms
              <input type="number" min="1" max="10" value={filters.rooms} onChange={(event) => updateFilter('rooms', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Max nightly budget
              <input type="number" min="1" value={filters.budget} onChange={(event) => updateFilter('budget', event.target.value)} placeholder="Any budget" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Property type
              <select value={filters.propertyType} onChange={(event) => updateFilter('propertyType', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal">
                <option value="">All types</option><option>Hotel</option><option>Resort</option><option>Apartment</option><option>Homestay</option><option>Villa</option><option>Hostel</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Genuine minimum rating
              <select value={filters.minRating} onChange={(event) => updateFilter('minRating', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal">
                <option value="">Any / unrated</option><option value="3">3+</option><option value="4">4+</option><option value="4.5">4.5+</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-4">
              Amenities <span className="font-normal text-slate-500">(comma-separated)</span>
              <input value={filters.amenities} onChange={(event) => updateFilter('amenities', event.target.value)} placeholder="Wi-Fi, Parking" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Search size={14} /> Search updates as you change filters.</p>
        </section>

        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        {loading ? (
          <div aria-live="polite" className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl bg-white shadow-sm" />)}
          </div>
        ) : results.properties.length ? (
          <>
            <p className="mb-4 text-sm text-slate-600">{results.pagination?.total || results.properties.length} matching listings</p>
            <div className="grid gap-5 md:grid-cols-2">
              {results.properties.map((property) => {
                const id = String(property._id);
                const image = property.image || property.images?.[0];
                const address = [property.streetAddress, property.city || property.location, property.state, property.country]
                  .filter(Boolean).join(', ');
                return (
                  <article key={id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    {image ? <img src={image} alt="" loading="lazy" className="h-52 w-full object-cover" /> : <div className="h-52 bg-gradient-to-br from-blue-900 to-amber-500" />}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-900">{property.propertyType || property.type || 'Stay'}</span>
                            {property.isDemo && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">DEMO DATA · NOT A REAL LISTING</span>}
                            {property.isVerified && !property.isDemo && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">Verified source</span>}
                          </div>
                          <h2 className="mt-2 text-xl font-bold text-slate-900">{property.name}</h2>
                          <p className="mt-1 flex items-start gap-1 text-sm text-slate-500"><MapPin size={15} className="mt-0.5 shrink-0" />{address}</p>
                        </div>
                        <button type="button" onClick={() => toggleFavorite(id)} aria-label={favorites.includes(id) ? 'Remove favorite' : 'Add favorite'} className="rounded-full border border-slate-200 p-2 text-rose-600 hover:bg-rose-50">
                          <Heart size={18} fill={favorites.includes(id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      {property.ratingCount > 0 && Number.isFinite(property.rating) && (
                        <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-slate-700">
                          <Star size={15} className="fill-amber-400 text-amber-500" />{property.rating.toFixed(1)}
                          <span className="font-normal text-slate-500">from {property.ratingCount} recorded ratings</span>
                        </p>
                      )}
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{property.description || 'No description supplied.'}</p>
                      <p className="mt-3 text-sm text-slate-600">Amenities: {property.amenities?.length ? property.amenities.join(', ') : 'Not listed'}</p>
                      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xl font-extrabold text-blue-950">{formatPrice(property.price, property.currency)}</p>
                          <p className="text-xs text-slate-500">per room, per night · listing price</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {filters.checkIn && filters.checkOut ? `${property.availableRoomsForStay} rooms for these dates before final recheck` : `${property.availableRooms} rooms listed; dates not checked`}
                          </p>
                        </div>
                        <button type="button" disabled={property.isDemo} onClick={() => startBooking(property)} className="rounded-xl bg-blue-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400">
                          {property.isDemo ? 'Demo only · booking disabled' : 'Continue to booking'}
                        </button>
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
            <h2 className="text-lg font-bold text-blue-950">{destination.length < 2 ? 'Enter a destination to begin' : 'No hotels match those filters'}</h2>
            <p className="mt-2 text-sm text-slate-700">Try a nearby destination, increase your budget, or remove amenities, property type, or rating filters.</p>
            {results.alternatives?.length > 0 && <ul className="mt-3 space-y-1 text-sm text-slate-600">{results.alternatives.map((alternative) => <li key={alternative}>{alternative}</li>)}</ul>}
          </div>
        )}
      </div>
    </main>
  );
};

export default BookPlace;

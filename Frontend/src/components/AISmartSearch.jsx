import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle, MapPin, Search, Sparkles, Star } from 'lucide-react';
import { searchAIHotels } from '../services/aiService';

const AISmartSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const submitSearch = async (event) => {
    event.preventDefault();
    const request = query.trim();
    if (request.length < 3 || loading) return;

    setLoading(true);
    setError('');
    setResults(null);
    try {
      setResults(await searchAIHotels(request));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const searchNearby = (property) => {
    navigate('/book-place', {
      state: {
        location: property.city || property.location,
        ...(results.criteria.checkIn && results.criteria.checkOut
          ? {
            dates: {
              startDate: new Date(results.criteria.checkIn),
              endDate: new Date(results.criteria.checkOut),
              key: 'selection',
            },
          }
          : {}),
        guests: {
          adults: results.criteria.guests,
          children: 0,
          rooms: results.criteria.rooms,
        },
        workTrip: false,
      },
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Describe your stay</h2>
        <p className="mt-1 text-sm text-slate-500">
          Search real, active FastBooking listings in English, Hindi, or Marathi. AI extracts filters; the hotel matches come from the database.
        </p>
      </div>
      <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="ai-natural-hotel-search">Describe the hotel you want</label>
        <input
          id="ai-natural-hotel-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          maxLength={600}
          required
          minLength={3}
          placeholder="Hotels in Pune under ₹3,000 with Wi-Fi for 2 guests"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
        />
        <button disabled={loading || query.trim().length < 3} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60">
          {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}
          {loading ? 'Searching listings...' : 'Search hotels'}
        </button>
      </form>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {results && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Sparkles size={16} className="text-amber-700" />
            <span>Filters: {results.criteria.destination}</span>
            {results.criteria.budget && <span>· Up to INR {Number(results.criteria.budget).toLocaleString('en-IN')}/night</span>}
            <span>· {results.criteria.guests} guest{results.criteria.guests === 1 ? '' : 's'}</span>
            {results.criteria.minRating && <span>· Rating {results.criteria.minRating}+</span>}
            {results.criteria.propertyType && <span>· {results.criteria.propertyType}</span>}
            {results.criteria.checkIn && results.criteria.checkOut && <span>· {results.criteria.checkIn} to {results.criteria.checkOut}</span>}
            {results.criteria.amenities.length > 0 && <span>· {results.criteria.amenities.join(', ')}</span>}
          </div>

          {results.recommendations.length === 0 ? (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-bold">No matching listings found.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {(results.alternatives || []).map((alternative) => <li key={alternative}>{alternative}</li>)}
              </ul>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {results.recommendations.map(({ property, reason }) => (
                <article key={property._id} className="overflow-hidden rounded-2xl border border-slate-200">
                  {property.image && <img src={property.image} alt="" className="h-44 w-full object-cover" loading="lazy" />}
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">{property.type}</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">{property.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} />{property.location}</p>
                    <p className="mt-3 font-extrabold text-blue-900">
                      {property.currency || 'INR'} {Number(property.price).toLocaleString('en-IN')}
                      <span className="ml-1 text-xs font-normal text-slate-500">per room, per night</span>
                    </p>
                    {property.ratingCount > 0 && <p className="mt-2 flex items-center gap-1 text-sm text-slate-700"><Star size={14} className="fill-amber-400 text-amber-500" />{property.rating} from {property.ratingCount} recorded ratings</p>}
                    <p className="mt-3 text-sm leading-6 text-slate-600">{property.description}</p>
                    <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-950"><Sparkles size={15} className="mr-1 inline" />{reason}</p>
                    <p className="mt-3 text-xs text-slate-500">Amenities: {property.amenities?.length ? property.amenities.join(', ') : 'Not listed'}. {results.criteria.checkIn ? `${property.availableRooms} rooms matched these dates when searched; booking checks again.` : 'Dates and availability were not checked.'}</p>
                    <button type="button" onClick={() => searchNearby(property)} className="mt-4 w-full rounded-xl border border-blue-900 px-4 py-2.5 text-sm font-bold text-blue-900 transition hover:bg-blue-900 hover:text-white">Search stays in this area</button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{results.limitations}</p>
        </div>
      )}
    </section>
  );
};

export default AISmartSearch;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, CalendarDays, LoaderCircle, MapPin, MessageCircle, RefreshCw, Send, Sparkles, Star,
} from 'lucide-react';
import DestinationAutocomplete from '../components/DestinationAutocomplete';
import {
  fetchAIRecommendations,
  fetchAIReviewSummary,
  generateAITripPlan,
  sendAIChatMessage,
} from '../services/aiService';

const tabs = [
  { id: 'chat', label: 'Travel chat' },
  { id: 'hotels', label: 'Hotel matches' },
  { id: 'itinerary', label: 'Trip planner' },
];

const initialChat = [{
  role: 'assistant',
  content: 'Hi! Ask me about destinations, hotel amenities, or travel planning. ',
}];

const ReviewSummary = ({ hotelId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    setLoading(true);
    setError('');
    try {
      setSummary(await fetchAIReviewSummary(hotelId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      {!summary && (
        <button type="button" onClick={loadSummary} disabled={loading} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:text-amber-700 disabled:opacity-60">
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? 'Summarizing reviews...' : 'Summarize verified reviews'}
        </button>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {summary?.reviewCount === 0 && <p className="mt-2 text-sm text-slate-500">{summary.message}</p>}
      {summary?.summary && (
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">
            {summary.reviewCount} review{summary.reviewCount === 1 ? '' : 's'}
          </p>
          <p>{summary.summary.overview}</p>
          {summary.summary.positive.length > 0 && <p><span className="font-semibold">Often praised:</span> {summary.summary.positive.join(' · ')}</p>}
          {summary.summary.complaints.length > 0 && <p><span className="font-semibold">Common complaints:</span> {summary.summary.complaints.join(' · ')}</p>}
          <p className="text-xs text-slate-500">
            Cleanliness: {summary.summary.cleanliness} · Location: {summary.summary.location} · Service: {summary.summary.service} · Amenities: {summary.summary.amenities}
          </p>
          <p className="text-xs text-slate-500">Summary based on {summary.summarizedReviewCount} latest reviews.</p>
        </div>
      )}
    </div>
  );
};

const AIWorkspace = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState(initialChat);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [hotelForm, setHotelForm] = useState({
    destination: '',
    budget: '',
    guests: '2',
    rooms: '1',
    checkIn: '',
    checkOut: '',
    amenities: '',
    preferences: '',
  });
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelError, setHotelError] = useState('');
  const [hotelResults, setHotelResults] = useState(null);
  const [tripForm, setTripForm] = useState({ destination: '', days: '3', budget: '', interests: '', language: 'English' });
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState('');
  const [tripResult, setTripResult] = useState(null);

  const submitChat = async (event) => {
    event.preventDefault();
    const content = chatText.trim();
    if (!content || chatLoading) return;

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setChatText('');
    setChatError('');
    setChatLoading(true);
    try {
      const response = await sendAIChatMessage(nextMessages.slice(-12));
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }]);
    } catch (error) {
      setChatError(error.message);
    } finally {
      setChatLoading(false);
    }
  };

  const runHotelSearch = async () => {
    if (hotelLoading) return;
    const destination = hotelForm.destination.trim();
    const guests = Number(hotelForm.guests);
    const rooms = Number(hotelForm.rooms);
    const budget = hotelForm.budget === '' ? undefined : Number(hotelForm.budget);
    if (destination.length < 2) {
      setHotelError('Enter a destination with at least two characters.');
      setHotelResults(null);
      return;
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > 20 ||
      !Number.isInteger(rooms) || rooms < 1 || rooms > 10 || rooms > guests) {
      setHotelError('Enter 1–20 guests and 1–10 rooms; rooms cannot exceed guests.');
      setHotelResults(null);
      return;
    }
    if (budget !== undefined && (!Number.isFinite(budget) || budget <= 0 || budget > 100000000)) {
      setHotelError('Enter a positive nightly budget in INR, or leave it blank.');
      setHotelResults(null);
      return;
    }
    if (Boolean(hotelForm.checkIn) !== Boolean(hotelForm.checkOut) ||
      (hotelForm.checkIn && hotelForm.checkOut <= hotelForm.checkIn)) {
      setHotelError('Choose both check-in and check-out dates, with check-out after check-in, or leave both blank.');
      setHotelResults(null);
      return;
    }

    setHotelLoading(true);
    setHotelError('');
    setHotelResults(null);
    try {
      setHotelResults(await fetchAIRecommendations({
        destination,
        guests,
        rooms,
        ...(budget !== undefined ? { budget, currency: 'INR' } : {}),
        ...(hotelForm.checkIn && hotelForm.checkOut
          ? { checkIn: hotelForm.checkIn, checkOut: hotelForm.checkOut }
          : {}),
        amenities: hotelForm.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        preferences: hotelForm.preferences.split(',').map((item) => item.trim()).filter(Boolean),
      }));
    } catch (error) {
      setHotelError(error.message);
    } finally {
      setHotelLoading(false);
    }
  };

  const submitHotels = async (event) => {
    event.preventDefault();
    await runHotelSearch();
  };

  const resetHotelFilters = () => {
    setHotelForm((current) => ({
      ...current,
      budget: '',
      checkIn: '',
      checkOut: '',
      amenities: '',
      preferences: '',
    }));
    setHotelError('');
    setHotelResults(null);
  };

  const submitTripPlan = async (event) => {
    event.preventDefault();
    setTripLoading(true);
    setTripError('');
    setTripResult(null);
    try {
      setTripResult(await generateAITripPlan({
        destination: tripForm.destination,
        days: Number(tripForm.days),
        budget: Number(tripForm.budget),
        interests: tripForm.interests.split(',').map((item) => item.trim()).filter(Boolean),
        language: tripForm.language,
      }));
    } catch (error) {
      setTripError(error.message);
    } finally {
      setTripLoading(false);
    }
  };

  const bookAreaSearch = (property, guests, rooms) => {
    navigate('/book-place', {
      state: {
        location: property.city || property.location,
        ...(hotelForm.checkIn && hotelForm.checkOut
          ? { dates: { startDate: new Date(hotelForm.checkIn), endDate: new Date(hotelForm.checkOut), key: 'selection' } }
          : {}),
        guests: { adults: Number(guests), children: 0, rooms: Number(rooms) },
        workTrip: false,
      },
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-3xl bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-xl sm:p-9">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-400 p-3 text-blue-950"><Sparkles size={26} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">FastBooking AI</p>
              <h1 className="mt-1 text-3xl font-extrabold">Plan a better trip</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Get travel suggestions, hotel matches from our real inventory, and a flexible itinerary. AI suggestions are not confirmations.</p>
            </div>
          </div>
        </header>

        <div role="tablist" aria-label="AI travel tools" className="mb-6 flex flex-wrap gap-2">
          {tabs.map(({ id, label }) => (
            <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${activeTab === id ? 'bg-blue-900 text-white shadow' : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}>
              {id === 'chat' ? <MessageCircle size={17} /> : id === 'hotels' ? <MapPin size={17} /> : <CalendarDays size={17} />}
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'chat' && (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <Bot className="text-blue-800" size={22} />
              <div><h2 className="font-bold text-slate-900">Travel assistant</h2></div>
            </div>
            <div aria-live="polite" className="max-h-[55vh] min-h-72 space-y-4 overflow-y-auto p-4 sm:p-6">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-800'}`}>{message.content}</p>
                </div>
              ))}
              {chatLoading && <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin" />Thinking...</div>}
            </div>
            <form onSubmit={submitChat} className="border-t border-slate-100 p-4 sm:p-5">
              {chatError && <p role="alert" className="mb-3 text-sm text-red-700">{chatError}</p>}
              <div className="flex gap-2">
                <input aria-label="Message the travel assistant" maxLength={1200} value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Ask about a destination or hotel..." className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" />
                <button disabled={chatLoading || !chatText.trim()} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"><Send size={17} /><span className="hidden sm:inline">Send</span></button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'hotels' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Find matching hotels</h2><p className="mt-1 text-sm text-slate-500">The nightly budget is an amount in INR per room. It is compared as entered; no currency conversion is applied. Most existing FastBooking listings default to INR, and a budget of 2 means ₹2, not ₹2,000.</p></div>
            <form onSubmit={submitHotels} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">Destination<DestinationAutocomplete value={hotelForm.destination} onChange={(destination) => setHotelForm({ ...hotelForm, destination })} onSelect={(place) => setHotelForm({ ...hotelForm, destination: place.name })} inputClassName="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Maximum nightly budget in INR (optional)<input type="number" min="0.01" max="100000000" step="0.01" inputMode="decimal" value={hotelForm.budget} onChange={(event) => setHotelForm({ ...hotelForm, budget: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="e.g. 2000, 3000, 5000" /></label>
              <label className="text-sm font-semibold text-slate-700">Guests<input required type="number" min="1" max="20" value={hotelForm.guests} onChange={(event) => setHotelForm({ ...hotelForm, guests: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Rooms<input required type="number" min="1" max="10" value={hotelForm.rooms} onChange={(event) => setHotelForm({ ...hotelForm, rooms: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Check-in (optional)<input type="date" min={new Date().toISOString().slice(0, 10)} value={hotelForm.checkIn} onChange={(event) => setHotelForm({ ...hotelForm, checkIn: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Check-out (optional)<input type="date" min={hotelForm.checkIn || new Date().toISOString().slice(0, 10)} value={hotelForm.checkOut} onChange={(event) => setHotelForm({ ...hotelForm, checkOut: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">All required amenities <span className="font-normal text-slate-500">(comma-separated; every item must match, case-insensitively)</span><input value={hotelForm.amenities} onChange={(event) => setHotelForm({ ...hotelForm, amenities: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="Wi-Fi, Parking" /></label>
              <label className="text-sm font-semibold text-slate-700">Preferences<input value={hotelForm.preferences} onChange={(event) => setHotelForm({ ...hotelForm, preferences: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="Quiet, near transit" /></label>
              <button disabled={hotelLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-950 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60 sm:col-span-2 lg:col-span-3">
                {hotelLoading ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {hotelLoading ? 'Finding hotel matches...' : 'Get recommendations'}
              </button>
              <button type="button" onClick={resetHotelFilters} disabled={hotelLoading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:col-span-2 lg:col-span-3">
                <RefreshCw size={17} />Clear optional filters
              </button>
            </form>
            {hotelError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{hotelError}</p>}
            {hotelResults && (
              <div className="mt-7">
                {hotelResults.ai && !hotelResults.ai.available && <p className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">Showing database-ranked matches. {hotelResults.ai.message || 'AI ranking is not configured.'}</p>}
                {hotelResults.recommendations.length === 0 ? (
                  <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
                    <p className="font-bold">No eligible database listings matched these filters.</p>
                    <p className="mt-1">This is a genuine empty search result, not a Gemini failure. A very low budget such as ₹2 can exclude most hotels. Relax one filter at a time; no filter is silently removed.</p>
                    {hotelResults.alternatives?.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5">{hotelResults.alternatives.map((alternative) => <li key={alternative}>{alternative}</li>)}</ul>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setHotelForm((current) => ({ ...current, budget: '' }))} className="rounded-lg border border-amber-800 px-3 py-2 text-xs font-bold hover:bg-amber-100">Remove budget limit</button>
                      <button type="button" onClick={() => setHotelForm((current) => ({ ...current, amenities: '' }))} className="rounded-lg border border-amber-800 px-3 py-2 text-xs font-bold hover:bg-amber-100">Remove amenity requirements</button>
                      <button type="button" onClick={resetHotelFilters} className="rounded-lg border border-amber-800 px-3 py-2 text-xs font-bold hover:bg-amber-100">Clear optional filters</button>
                      <button type="button" onClick={runHotelSearch} disabled={hotelLoading} className="rounded-lg bg-amber-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Retry search</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {hotelResults.recommendations.map(({ property, reason }) => (
                      <article key={property._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        {property.image && <img src={property.image} alt="" className="h-44 w-full object-cover" loading="lazy" />}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div><p className="text-xs font-bold uppercase tracking-wide text-amber-700">{property.type}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{property.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} />{property.location}</p></div>
                            <div className="shrink-0 text-right"><p className="font-extrabold text-blue-900">{property.currency || 'INR'} {Number(property.price).toLocaleString('en-IN')}</p><p className="text-xs text-slate-500">per room, per night</p></div>
                          </div>
                          {property.isDemo && <p className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900">DEMO DATA — NOT A REAL HOTEL. Booking is disabled.</p>}
                          {property.isVerified && !property.isDemo && <p className="mt-2 text-xs font-semibold text-emerald-800">Listing data verified by source.</p>}
                          {property.ratingCount > 0 && <p className="mt-2 flex items-center gap-1 text-sm text-slate-700"><Star size={14} className="fill-amber-400 text-amber-500" />{property.rating} from {property.ratingCount} recorded ratings</p>}
                          <p className="mt-3 text-sm leading-6 text-slate-600">{property.description}</p>
                          <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-950"><Sparkles size={15} className="mr-1 inline" />{reason}</p>
                          <p className="mt-3 text-xs text-slate-500">Amenities: {property.amenities?.length ? property.amenities.join(', ') : 'Not listed'} · {hotelForm.checkIn && hotelForm.checkOut ? `${property.availableRooms} rooms matched these dates when searched; booking checks again.` : `${property.availableRooms} rooms listed; dates and availability were not checked.`}</p>
                          <button type="button" onClick={() => bookAreaSearch(property, hotelForm.guests, hotelForm.rooms)} className="mt-4 w-full rounded-xl border border-blue-900 px-4 py-2.5 text-sm font-bold text-blue-900 transition hover:bg-blue-900 hover:text-white">Search stays in this area</button>
                          <ReviewSummary hotelId={property._id} />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{hotelResults.limitations}</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'itinerary' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Build an itinerary</h2><p className="mt-1 text-sm text-slate-500">AI-generated ideas are not verified opening hours, prices, or bookings.</p></div>
            <form onSubmit={submitTripPlan} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">Destination<DestinationAutocomplete value={tripForm.destination} onChange={(destination) => setTripForm({ ...tripForm, destination })} onSelect={(place) => setTripForm({ ...tripForm, destination: place.name })} inputClassName="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Days<input required type="number" min="1" max="14" value={tripForm.days} onChange={(event) => setTripForm({ ...tripForm, days: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Total budget (estimate units)<input required type="number" min="1" value={tripForm.budget} onChange={(event) => setTripForm({ ...tripForm, budget: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Interests <span className="font-normal text-slate-500">(comma-separated)</span><input value={tripForm.interests} onChange={(event) => setTripForm({ ...tripForm, interests: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="Food, history, nature" /></label>
              <label className="text-sm font-semibold text-slate-700">Language<select value={tripForm.language} onChange={(event) => setTripForm({ ...tripForm, language: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal"><option>English</option><option>Hindi</option><option>Marathi</option></select></label>
              <button disabled={tripLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60 sm:col-span-2 lg:col-span-3">
                {tripLoading ? <LoaderCircle size={18} className="animate-spin" /> : <CalendarDays size={18} />}
                {tripLoading ? 'Creating itinerary...' : 'Generate itinerary'}
              </button>
            </form>
            {tripError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{tripError}</p>}
            {tripResult && (
              <div className="mt-7">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold text-slate-900">{tripResult.itinerary.title}</h3><button type="button" onClick={submitTripPlan} disabled={tripLoading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={15} />Regenerate</button></div>
                <div className="grid gap-4 md:grid-cols-2">
                  {tripResult.itinerary.days.map((day) => (
                    <article key={day.day} className="rounded-2xl border border-slate-200 p-5">
                      <h4 className="font-bold text-blue-900">Day {day.day}</h4>
                      <ul className="mt-3 space-y-3">{day.activities.map((activity, index) => <li key={`${day.day}-${index}`} className="border-l-2 border-amber-400 pl-3"><p className="text-xs font-bold text-slate-500">{activity.time}</p><p className="text-sm text-slate-800">{activity.activity}</p><p className="text-xs text-slate-500">Estimated cost: {activity.estimatedCost.toLocaleString()} units</p></li>)}</ul>
                      <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900"><Star size={15} className="mr-1 inline" />{day.budgetTip}</p>
                    </article>
                  ))}
                </div>
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{tripResult.notice}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default AIWorkspace;

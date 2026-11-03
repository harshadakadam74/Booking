import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, CalendarDays, LoaderCircle, MapPin, MessageCircle, RefreshCw, Send, Sparkles, Star,
} from 'lucide-react';
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
  content: 'Hi! Ask me about destinations, hotel amenities, or travel planning. I can chat in English, Hindi, or Marathi. Hotel facts are limited to verified FastBooking records.',
}];

const getInitialDates = () => {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
  return { startDate, endDate, key: 'selection' };
};

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
  const [hotelForm, setHotelForm] = useState({ destination: '', budget: '', guests: '2', amenities: '', preferences: '' });
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

  const submitHotels = async (event) => {
    event.preventDefault();
    setHotelLoading(true);
    setHotelError('');
    setHotelResults(null);
    try {
      setHotelResults(await fetchAIRecommendations({
        destination: hotelForm.destination,
        budget: Number(hotelForm.budget),
        guests: Number(hotelForm.guests),
        amenities: hotelForm.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        preferences: hotelForm.preferences.split(',').map((item) => item.trim()).filter(Boolean),
      }));
    } catch (error) {
      setHotelError(error.message);
    } finally {
      setHotelLoading(false);
    }
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

  const bookAreaSearch = (property, guests) => {
    navigate('/book-place', {
      state: {
        location: property.location,
        dates: getInitialDates(),
        guests: { adults: Number(guests), children: 0, rooms: 1 },
        workTrip: false,
      },
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 p-6 text-white shadow-xl sm:p-9">
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
              <div><h2 className="font-bold text-slate-900">Travel assistant</h2><p className="text-xs text-slate-500">English · हिंदी · मराठी</p></div>
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
            <div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Find matching hotels</h2><p className="mt-1 text-sm text-slate-500">Budget is the maximum nightly rate in the units stored by each property.</p></div>
            <form onSubmit={submitHotels} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">Destination<input required minLength={2} maxLength={100} value={hotelForm.destination} onChange={(event) => setHotelForm({ ...hotelForm, destination: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="City or area" /></label>
              <label className="text-sm font-semibold text-slate-700">Max nightly budget<input required type="number" min="1" value={hotelForm.budget} onChange={(event) => setHotelForm({ ...hotelForm, budget: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Guests<input required type="number" min="1" max="20" value={hotelForm.guests} onChange={(event) => setHotelForm({ ...hotelForm, guests: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Required amenities <span className="font-normal text-slate-500">(comma-separated, must match database)</span><input value={hotelForm.amenities} onChange={(event) => setHotelForm({ ...hotelForm, amenities: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="Wi-Fi, Parking" /></label>
              <label className="text-sm font-semibold text-slate-700">Preferences<input value={hotelForm.preferences} onChange={(event) => setHotelForm({ ...hotelForm, preferences: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="Quiet, near transit" /></label>
              <button disabled={hotelLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60 sm:col-span-2 lg:col-span-3">
                {hotelLoading ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {hotelLoading ? 'Finding hotel matches...' : 'Get recommendations'}
              </button>
            </form>
            {hotelError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{hotelError}</p>}
            {hotelResults && (
              <div className="mt-7">
                {hotelResults.recommendations.length === 0 ? (
                  <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No matching database hotels were found. Try a broader destination, budget, or amenity set.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {hotelResults.recommendations.map(({ property, reason }) => (
                      <article key={property._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        {property.image && <img src={property.image} alt="" className="h-44 w-full object-cover" loading="lazy" />}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div><p className="text-xs font-bold uppercase tracking-wide text-amber-700">{property.type}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{property.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} />{property.location}</p></div>
                            <div className="shrink-0 text-right"><p className="font-extrabold text-blue-900">{Number(property.price).toLocaleString()}</p><p className="text-xs text-slate-500">per night*</p></div>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">{property.description}</p>
                          <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-950"><Sparkles size={15} className="mr-1 inline" />{reason}</p>
                          <p className="mt-3 text-xs text-slate-500">Amenities: {property.amenities.length ? property.amenities.join(', ') : 'Not listed'} · Inventory snapshot: {property.availableRooms} rooms shown available</p>
                          <button type="button" onClick={() => bookAreaSearch(property, hotelForm.guests)} className="mt-4 w-full rounded-xl border border-blue-900 px-4 py-2.5 text-sm font-bold text-blue-900 transition hover:bg-blue-900 hover:text-white">Search stays in this area</button>
                          <ReviewSummary hotelId={property._id} />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">* Price uses the property's stored unit. {hotelResults.limitations}</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'itinerary' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Build an itinerary</h2><p className="mt-1 text-sm text-slate-500">AI-generated ideas are not verified opening hours, prices, or bookings.</p></div>
            <form onSubmit={submitTripPlan} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">Destination<input required minLength={2} maxLength={100} value={tripForm.destination} onChange={(event) => setTripForm({ ...tripForm, destination: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
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

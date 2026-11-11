import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { searchDestinations } from '../services/destinationService';

const DestinationAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search destinations worldwide',
  inputClassName = '',
  menuClassName = '',
}) => {
  const rootRef = useRef(null);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setResults([]);
      setError('');
      setLoading(false);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const destinations = await searchDestinations(query);
        if (active) setResults(destinations);
      } catch (requestError) {
        if (active) {
          setResults([]);
          setError(requestError.response?.data?.message || 'Unable to load destination suggestions.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <input
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={100}
        aria-label="Destination"
        aria-autocomplete="list"
        className={inputClassName}
      />
      {open && value.trim().length >= 2 && (
        <div className={`absolute left-0 right-0 top-full z-[110] mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl ${menuClassName}`}>
          {loading && <p className="px-4 py-3 text-sm text-slate-500">Searching destinations...</p>}
          {!loading && error && <p role="alert" className="px-4 py-3 text-sm text-red-700">{error}</p>}
          {!loading && !error && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-500">No destinations found. Try a city, state, or common alias.</p>
          )}
          {!loading && !error && results.map((destination) => (
            <button
              key={destination._id || `${destination.name}-${destination.state}`}
              type="button"
              onClick={() => {
                onSelect(destination);
                setOpen(false);
              }}
              className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-blue-50"
            >
              <MapPin size={17} className="mt-0.5 shrink-0 text-amber-600" />
              <span>
                <span className="block font-semibold text-blue-950">{destination.name}</span>
                <span className="block text-xs text-slate-500">
                  {destination.displayName || [destination.state, destination.country].filter(Boolean).join(', ')} · {destination.type}
                  {destination.aliases?.length ? ` · Also: ${destination.aliases.slice(0, 2).join(', ')}` : ''}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationAutocomplete;

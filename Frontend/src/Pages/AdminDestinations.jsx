import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  deleteAdminDestination,
  fetchAdminDestinations,
  saveAdminDestination,
  setAdminDestinationStatus,
} from '../services/destinationService';

const blankDestination = {
  name: '', state: '', country: 'India', type: 'city', description: '',
  image: '', aliases: '', latitude: '', longitude: '',
};

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState(blankDestination);
  const [editingId, setEditingId] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDestinations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchAdminDestinations({
        page, limit: 30, search, ...(status ? { status } : {}),
      });
      setDestinations(response.destinations || []);
      setPages(response.pagination?.pages || 0);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load destinations.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(loadDestinations, 200);
    return () => window.clearTimeout(timer);
  }, [loadDestinations]);

  const edit = (destination) => {
    setEditingId(destination._id);
    setForm({
      name: destination.name || '',
      state: destination.state || '',
      country: destination.country || 'India',
      type: destination.type || 'city',
      description: destination.description || '',
      image: destination.image || '',
      aliases: (destination.aliases || []).join(', '),
      latitude: destination.coordinates?.latitude ?? '',
      longitude: destination.coordinates?.longitude ?? '',
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    if ((form.latitude === '') !== (form.longitude === '')) {
      setError('Enter both latitude and longitude, or leave both blank.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    const hasCoordinates = form.latitude !== '' || form.longitude !== '';
    const payload = {
      name: form.name.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      type: form.type.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      aliases: form.aliases.split(',').map((alias) => alias.trim()).filter(Boolean),
      coordinates: hasCoordinates
        ? { latitude: Number(form.latitude), longitude: Number(form.longitude) }
        : {},
    };
    try {
      await saveAdminDestination(payload, editingId);
      setNotice(editingId ? 'Destination updated.' : 'Destination created.');
      setEditingId('');
      setForm(blankDestination);
      await loadDestinations();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to save destination.');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (destination) => {
    try {
      await setAdminDestinationStatus(destination._id, !destination.active);
      await loadDestinations();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    }
  };

  const remove = async (destination) => {
    if (!window.confirm(`Permanently delete destination "${destination.name}"?`)) return;
    try {
      await deleteAdminDestination(destination._id);
      setNotice('Destination deleted.');
      await loadDestinations();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    }
  };

  const field = (name, label, options = {}) => (
    <label className={`text-sm font-semibold text-slate-700 ${options.className || ''}`}>
      {label}
      <input
        required={options.required}
        type={options.type || 'text'}
        min={options.min}
        max={options.max}
        value={form[name]}
        onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
        className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal"
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 pt-28 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-3xl bg-gradient-to-r from-blue-950 to-blue-700 p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Administrator</p>
          <h1 className="mt-2 text-3xl font-extrabold">India destinations</h1>
          <p className="mt-2 text-sm text-blue-100">Maintain searchable destinations and aliases. Destination entries do not imply that hotel inventory exists there.</p>
        </header>
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">{editingId ? 'Edit destination' : 'Add destination'}</h2>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {field('name', 'Destination name', { required: true })}
            {field('state', 'State / union territory', { required: true })}
            {field('country', 'Country', { required: true })}
            {field('type', 'Destination type', { required: true })}
            {field('latitude', 'Latitude', { type: 'number', min: -90, max: 90 })}
            {field('longitude', 'Longitude', { type: 'number', min: -180, max: 180 })}
            {field('image', 'Image URL', { type: 'url', className: 'lg:col-span-2' })}
            {field('aliases', 'Aliases (comma-separated)', { className: 'lg:col-span-3' })}
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
              Description
              <textarea rows={2} maxLength={1000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}{editingId ? 'Save changes' : 'Create destination'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(''); setForm(blankDestination); }} className="rounded-xl border border-slate-300 px-4 py-3 text-sm">Cancel</button>}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-3 p-5">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, state, or alias" className="min-w-60 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </div>
          {loading ? <p className="flex items-center gap-2 p-6 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" />Loading destinations...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Destination</th><th className="px-4 py-3">State</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Aliases</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {destinations.map((destination) => <tr key={destination._id}>
                    <td className="px-4 py-3 font-semibold">{destination.name}</td><td className="px-4 py-3">{destination.state}</td><td className="px-4 py-3">{destination.type}</td><td className="px-4 py-3">{destination.aliases?.join(', ') || '—'}</td><td className="px-4 py-3">{destination.active ? 'Active' : 'Inactive'}</td>
                    <td className="px-4 py-3"><div className="flex gap-1"><button type="button" onClick={() => edit(destination)} aria-label={`Edit ${destination.name}`} className="rounded-lg p-2 text-blue-900 hover:bg-blue-50"><Pencil size={16} /></button><button type="button" onClick={() => changeStatus(destination)} className="rounded-lg px-2 py-1 text-xs font-semibold">{destination.active ? 'Deactivate' : 'Activate'}</button><button type="button" onClick={() => remove(destination)} aria-label={`Delete ${destination.name}`} className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 size={16} /></button></div></td>
                  </tr>)}
                  {!destinations.length && <tr><td colSpan="6" className="p-8 text-center text-slate-500">No destinations match this filter.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && <div className="flex items-center justify-between border-t border-slate-100 p-4 text-sm"><span>Page {page} of {pages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div></div>}
        </section>
      </div>
    </main>
  );
};

export default AdminDestinations;

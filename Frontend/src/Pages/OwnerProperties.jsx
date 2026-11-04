import { useCallback, useEffect, useState } from 'react';
import { Building2, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  deleteOwnProperty,
  fetchOwnProperties,
  setOwnPropertyStatus,
  submitOwnProperty,
  updateOwnProperty,
} from '../services/propertyOwnerService';

const emptyForm = {
  name: '', address: '', city: '', state: '', country: 'India',
  propertyType: 'Hotel', description: '', image: '', price: '',
  totalRooms: '', availableRooms: '', maxGuestsPerRoom: '4', amenities: '',
};

const OwnerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchOwnProperties();
      setProperties(response.properties || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const edit = (property) => {
    setEditingId(property._id);
    setForm({
      name: property.name || '',
      address: property.address || property.streetAddress || '',
      city: property.city || '',
      state: property.state || '',
      country: property.country || 'India',
      propertyType: property.propertyType || property.type || 'Hotel',
      description: property.description || '',
      image: property.image || property.images?.[0] || '',
      price: String(property.price ?? ''),
      totalRooms: String(property.totalRooms ?? ''),
      availableRooms: String(property.availableRooms ?? ''),
      maxGuestsPerRoom: String(property.maxGuestsPerRoom ?? 4),
      amenities: (property.amenities || []).join(', '),
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      name: form.name.trim(),
      location: `${form.city.trim()}, ${form.state.trim()}, ${form.country.trim()}`,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      propertyType: form.propertyType.trim(),
      type: form.propertyType.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      images: form.image.trim() ? [form.image.trim()] : [],
      price: Number(form.price),
      currency: 'INR',
      totalRooms: Number(form.totalRooms),
      availableRooms: Number(form.availableRooms),
      maxGuestsPerRoom: Number(form.maxGuestsPerRoom),
      amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await updateOwnProperty(editingId, payload);
        setNotice('Listing updated and sent for administrator approval.');
      } else {
        await submitOwnProperty(payload);
        setNotice('Listing submitted for administrator approval.');
      }
      setEditingId('');
      setForm(emptyForm);
      await loadProperties();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (property) => {
    try {
      await setOwnPropertyStatus(property._id, property.active === false);
      await loadProperties();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const remove = async (property) => {
    if (!window.confirm(`Delete "${property.name}"? Listings with booking history are deactivated instead.`)) return;
    try {
      const response = await deleteOwnProperty(property._id);
      setNotice(response.deactivated ? 'Booking history exists; the listing was deactivated.' : 'Listing deleted.');
      await loadProperties();
    } catch (requestError) {
      setError(requestError.message);
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
        className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-700"
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 pt-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 rounded-3xl bg-gradient-to-r from-blue-950 to-blue-700 p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Property owner</p>
          <h1 className="mt-2 text-3xl font-extrabold">Manage your listings</h1>
          <p className="mt-2 text-sm text-blue-100">New and edited listings require administrator approval before appearing in hotel search.</p>
        </header>

        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-xl font-bold text-slate-900">{editingId ? 'Edit listing' : 'Submit a property'}</h2>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {field('name', 'Property name', { required: true })}
            {field('propertyType', 'Property type', { required: true })}
            {field('address', 'Street address')}
            {field('city', 'City', { required: true })}
            {field('state', 'State / union territory', { required: true })}
            {field('country', 'Country', { required: true })}
            {field('price', 'Nightly price (INR)', { required: true, type: 'number', min: 0 })}
            {field('totalRooms', 'Total rooms', { required: true, type: 'number', min: 1 })}
            {field('availableRooms', 'Listed available rooms', { required: true, type: 'number', min: 0 })}
            {field('maxGuestsPerRoom', 'Max guests per room', { required: true, type: 'number', min: 1, max: 20 })}
            {field('image', 'Image URL (HTTP or HTTPS)', { type: 'url', className: 'lg:col-span-2' })}
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
              Amenities (comma-separated)
              <input value={form.amenities} onChange={(event) => setForm((current) => ({ ...current, amenities: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="Wi-Fi, Parking" />
            </label>
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
              Description
              <textarea rows={3} maxLength={4000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
              <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle size={17} className="animate-spin" /> : <Plus size={17} />}{editingId ? 'Save changes for review' : 'Submit for approval'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(''); setForm(emptyForm); }} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold">Cancel edit</button>}
            </div>
          </form>
          <p className="mt-4 text-xs leading-5 text-slate-500">Only submit listings you are authorized to represent. Prices, room counts, ratings, and images are supplied by the owner and are not independently verified at submission.</p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Your listings</h2>
          {loading ? <p className="flex items-center gap-2 text-slate-500"><LoaderCircle size={18} className="animate-spin" />Loading listings...</p> : properties.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {properties.map((property) => (
                <article key={property._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3"><Building2 className="mt-1 text-amber-600" size={20} /><div><h3 className="font-bold text-slate-900">{property.name}</h3><p className="mt-1 text-sm text-slate-500">{property.location}</p></div></div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${property.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>{property.approvalStatus || 'approved'}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{property.currency || 'INR'} {Number(property.price).toLocaleString('en-IN')} · {property.availableRooms}/{property.totalRooms} rooms listed</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => edit(property)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"><Pencil size={14} />Edit</button>
                    <button type="button" disabled={property.approvalStatus !== 'approved'} onClick={() => changeStatus(property)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-40">{property.active === false ? 'Activate' : 'Deactivate'}</button>
                    <button type="button" onClick={() => remove(property)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"><Trash2 size={14} />Delete</button>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">No property listings have been submitted.</p>}
        </section>
      </div>
    </main>
  );
};

export default OwnerProperties;

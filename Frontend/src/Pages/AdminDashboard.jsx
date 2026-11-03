import { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Users, LoaderCircle, Building2, BedDouble, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  createAdmin,
  createProperty,
  deleteProperty,
  fetchAdminProperties,
  fetchAdminUsers,
  updatePropertyAvailability,
} from '../services/authService';
import AIAnalyticsAssistant from '../components/admin/AIAnalyticsAssistant';

const emptyForm = { name: '', mobile: '', email: '', password: '' };
const emptyPropertyForm = {
  name: '', location: '', price: '', totalRooms: '', availableRooms: '', image: '', description: '', latitude: '', longitude: '',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [propertyForm, setPropertyForm] = useState(emptyPropertyForm);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [propertySaving, setPropertySaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (storedUser?.role !== 'ADMIN') {
      navigate('/', { replace: true });
      return;
    }

    Promise.all([fetchAdminUsers(), fetchAdminProperties()])
      .then(([loadedUsers, loadedProperties]) => {
        setUsers(loadedUsers);
        setProperties(loadedProperties);
      })
      .catch((error) => setMessage({ type: 'error', text: error.message }))
      .finally(() => {
        setLoading(false);
        setPropertiesLoading(false);
      });
  }, [navigate]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage({ type: '', text: '' });
  };

  const handlePropertyChange = (event) => {
    setPropertyForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const newAdmin = await createAdmin(form);
      setUsers((current) => [newAdmin, ...current]);
      setForm(emptyForm);
      setMessage({ type: 'success', text: 'Admin account created successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePropertySubmit = async (event) => {
    event.preventDefault();
    setPropertySaving(true);
    setMessage({ type: '', text: '' });

    try {
      const property = await createProperty({
        ...propertyForm,
        type: 'Hotel',
        price: Number(propertyForm.price),
        totalRooms: Number(propertyForm.totalRooms),
        availableRooms: Number(propertyForm.availableRooms),
      });
      setProperties((current) => [property, ...current]);
      setPropertyForm(emptyPropertyForm);
      setMessage({ type: 'success', text: 'Hotel added successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setPropertySaving(false);
    }
  };

  const handleAvailabilityChange = async (property, field, value) => {
    const nextValue = Math.max(0, Number(value));
    const nextProperty = { ...property, [field]: nextValue };
    if (nextProperty.availableRooms > nextProperty.totalRooms) return;

    setProperties((current) => current.map((item) => item._id === property._id ? nextProperty : item));
    try {
      const updated = await updatePropertyAvailability(property._id, { [field]: nextValue });
      setProperties((current) => current.map((item) => item._id === property._id ? updated : item));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Delete this hotel and its room inventory?')) return;
    try {
      await deleteProperty(propertyId);
      setProperties((current) => current.filter((property) => property._id !== propertyId));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-linear-to-r from-blue-950 via-blue-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-slate-950">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">FastBooking</p>
              <h1 className="text-2xl font-extrabold sm:text-3xl">Admin dashboard</h1>
              <p className="mt-1 text-sm text-blue-200">Manage application users and administrator access.</p>
            </div>
          </div>
        </div>

        <AIAnalyticsAssistant />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <UserPlus className="text-blue-800" size={23} />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add administrator</h2>
                <p className="text-sm text-slate-500">Create an account with full admin access.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                ['name', 'Full name', 'text'],
                ['mobile', 'Mobile number', 'tel'],
                ['email', 'Email address', 'email'],
                ['password', 'Temporary password', 'password'],
              ].map(([name, label, type]) => (
                <label key={name} className="block text-sm font-semibold text-slate-700">
                  {label}
                  <input
                    required
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              ))}

              {message.text && (
                <p className={`rounded-xl px-4 py-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message.text}
                </p>
              )}

              <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3 font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? <LoaderCircle className="animate-spin" size={18} /> : <UserPlus size={18} />}
                {saving ? 'Creating...' : 'Create admin'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="text-blue-800" size={23} />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">All users</h2>
                  <p className="text-sm text-slate-500">{users.length} registered account{users.length === 1 ? '' : 's'}</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18} /> Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-125 text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <tr><th className="px-3 py-3">Name</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Role</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-3 py-4 font-semibold text-slate-800">{user.name}</td>
                        <td className="px-3 py-4 text-slate-600">{user.email}</td>
                        <td className="px-3 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${user.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'}`}>{user.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Building2 className="text-blue-800" size={23} />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Hotels and room availability</h2>
              <p className="text-sm text-slate-500">Add hotels and keep the rooms available for booking up to date.</p>
            </div>
          </div>

          <form onSubmit={handlePropertySubmit} className="mb-8 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-6">
            {[
              ['name', 'Hotel name', 'text'],
              ['location', 'Location', 'text'],
              ['price', 'Nightly price', 'number'],
              ['totalRooms', 'Total rooms', 'number'],
              ['availableRooms', 'Available rooms', 'number'],
              ['image', 'Image URL', 'url'],
              ['latitude', 'Latitude (optional)', 'number'],
              ['longitude', 'Longitude (optional)', 'number'],
            ].map(([name, label, type]) => (
              <label key={name} className="text-sm font-semibold text-slate-700 lg:col-span-1">
                {label}
                <input required={name !== 'image'} min={type === 'number' ? 0 : undefined} name={name} type={type} value={propertyForm[name]} onChange={handlePropertyChange} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" />
              </label>
            ))}
            <button disabled={propertySaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-3 font-bold text-white transition hover:bg-blue-900 disabled:opacity-60 lg:col-span-2">
              {propertySaving ? <LoaderCircle className="animate-spin" size={18} /> : <Building2 size={18} />}
              {propertySaving ? 'Adding...' : 'Add hotel'}
            </button>
          </form>

          {propertiesLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18} /> Loading hotel inventory...</div>
          ) : properties.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">No managed hotels yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-175 text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <tr><th className="px-3 py-3">Hotel</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Total rooms</th><th className="px-3 py-3">Available</th><th className="px-3 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties.map((property) => (
                    <tr key={property._id}>
                      <td className="px-3 py-4"><p className="font-semibold text-slate-800">{property.name}</p><p className="text-xs text-slate-500">{property.location}</p></td>
                      <td className="px-3 py-4 text-slate-600">${property.price}</td>
                      <td className="px-3 py-4"><input aria-label={`${property.name} total rooms`} type="number" min="1" value={property.totalRooms} onChange={(event) => handleAvailabilityChange(property, 'totalRooms', event.target.value)} className="w-24 rounded-lg border border-slate-300 px-2 py-2" /></td>
                      <td className="px-3 py-4"><div className="flex items-center gap-2"><BedDouble size={16} className={property.availableRooms === 0 ? 'text-red-500' : 'text-green-600'} /><input aria-label={`${property.name} available rooms`} type="number" min="0" max={property.totalRooms} value={property.availableRooms} onChange={(event) => handleAvailabilityChange(property, 'availableRooms', event.target.value)} className="w-24 rounded-lg border border-slate-300 px-2 py-2" /></div></td>
                      <td className="px-3 py-4"><button type="button" title="Delete hotel" onClick={() => handleDeleteProperty(property._id)} className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"><Trash2 size={18} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
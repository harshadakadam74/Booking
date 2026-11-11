import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity, BedDouble, Building2, CalendarDays, Check, ChevronLeft, ChevronRight,
  CircleDollarSign, DoorOpen, LayoutDashboard, LoaderCircle, LogOut, Pencil,
  MapPin, Plus, Search, ShieldCheck, Trash2, Users, X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AIAnalyticsAssistant from '../components/admin/AIAnalyticsAssistant';
import {
  createAdminAccount,
  createAdminHotel,
  deleteAdminHotel,
  fetchAdminBookings,
  fetchAdminDashboard,
  fetchAdminHotels,
  fetchAdminUsers,
  logoutAdmin,
  setAdminBookingStatus,
  setAdminHotelApproval,
  setAdminHotelStatus,
  setAdminUserRole,
  exportAdminHotels,
  importAdminHotels,
  uploadAdminHotelImage,
  updateAdminHotel,
} from '../services/adminService';

const emptyHotel = {
  name: '', location: '', address: '', city: '', state: '', country: 'India',
  currency: 'INR', type: 'Hotel', category: 'Hotel', description: '', image: '', images: '',
  price: '', totalRooms: '', availableRooms: '', amenities: '', facilities: '',
  roomTypes: '[]', checkInTime: '15:00', checkOutTime: '11:00',
  maxGuestsPerRoom: '4', rating: '', ratingCount: '', ratingSource: '',
  workTripFriendly: false, active: true,
  latitude: '', longitude: '',
};
const emptyAdmin = { name: '', mobile: '', email: '', password: '' };
const bookingStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'];
const PAGE_SIZE = 10;

const numberText = (value) => Number(value || 0).toLocaleString();
const dateText = (value) => value ? new Date(value).toLocaleDateString() : '—';

const Pagination = ({ page, pages, onChange }) => (
  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
    <span>Page {pages ? page : 0} of {pages}</span>
    <div className="flex gap-2">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page" className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"><ChevronLeft size={17} /></button>
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page" className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"><ChevronRight size={17} /></button>
    </div>
  </div>
);

const HotelEditor = ({ hotel, saving, onClose, onSave, onUploadImage }) => {
  const [form, setForm] = useState(() => hotel ? {
    name: hotel.name || '',
    location: hotel.location || '',
    address: hotel.streetAddress || hotel.address || '',
    city: hotel.city || '',
    state: hotel.state || '',
    country: hotel.country || 'India',
    currency: hotel.currency || 'INR',
    type: hotel.type || 'Hotel',
    category: hotel.category || hotel.propertyType || hotel.type || 'Hotel',
    description: hotel.description || '',
    image: hotel.image || '',
    images: (hotel.images || []).join('\n'),
    price: String(hotel.price ?? ''),
    totalRooms: String(hotel.totalRooms ?? ''),
    availableRooms: String(hotel.availableRooms ?? ''),
    maxGuestsPerRoom: String(hotel.maxGuestsPerRoom ?? 4),
    rating: hotel.rating === null || hotel.rating === undefined ? '' : String(hotel.rating),
    ratingCount: String(hotel.ratingCount ?? 0),
    ratingSource: hotel.ratingSource || '',
    amenities: (hotel.amenities || []).join(', '),
    facilities: (hotel.facilities || []).join(', '),
    roomTypes: JSON.stringify(hotel.roomTypes || [], null, 2),
    checkInTime: hotel.checkInTime || '15:00',
    checkOutTime: hotel.checkOutTime || '11:00',
    workTripFriendly: Boolean(hotel.workTripFriendly),
    active: hotel.active !== false,
    longitude: hotel.geoLocation?.coordinates?.[0] ?? '',
    latitude: hotel.geoLocation?.coordinates?.[1] ?? '',
  } : emptyHotel);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const totalRooms = Number(form.totalRooms);
    const availableRooms = Number(form.availableRooms);
    const price = Number(form.price);
    const maxGuestsPerRoom = Number(form.maxGuestsPerRoom);
    const rating = Number(form.rating);
    const ratingCount = Number(form.ratingCount);
    const hasRatingData = form.rating.trim() !== '' || ratingCount > 0 || form.ratingSource.trim() !== '';
    if (!form.name.trim() || !form.location.trim()) {
      setError('Hotel name and location are required.');
      return;
    }
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(totalRooms) ||
      totalRooms < 1 || !Number.isInteger(availableRooms) || availableRooms < 0 ||
      availableRooms > totalRooms) {
      setError('Enter a non-negative price and valid room counts.');
      return;
    }
    if (!/^[A-Za-z]{3}$/.test(form.currency.trim()) ||
      !Number.isInteger(maxGuestsPerRoom) || maxGuestsPerRoom < 1 || maxGuestsPerRoom > 20) {
      setError('Enter a three-letter currency and room capacity from 1 to 20 guests.');
      return;
    }
    if (hasRatingData && (
      !Number.isFinite(rating) || rating < 0 || rating > 5 ||
      !Number.isInteger(ratingCount) || ratingCount < 1 || !form.ratingSource.trim()
    )) {
      setError('Ratings need a value from 0 to 5, a positive rating count, and a documented source.');
      return;
    }
    if (form.image.trim()) {
      try {
        const url = new URL(form.image);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      } catch {
        setError('Image must be an HTTP or HTTPS URL.');
        return;
      }
    }
    if ((form.latitude && !form.longitude) || (!form.latitude && form.longitude) ||
      (form.latitude && (Number(form.latitude) < -90 || Number(form.latitude) > 90)) ||
      (form.longitude && (Number(form.longitude) < -180 || Number(form.longitude) > 180))) {
      setError('Enter both valid latitude and longitude coordinates.');
      return;
    }
    let roomTypes;
    try {
      roomTypes = JSON.parse(form.roomTypes || '[]');
      if (!Array.isArray(roomTypes)) throw new Error();
    } catch {
      setError('Room types must be a valid JSON array.');
      return;
    }

    setError('');
    const images = [...new Set(form.images.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean))];
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      currency: form.currency.trim().toUpperCase(),
      type: form.type.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      images,
      price,
      totalRooms,
      availableRooms,
      maxGuestsPerRoom,
      ...(hasRatingData ? { rating, ratingCount, ratingSource: form.ratingSource.trim() } : {}),
      amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
      facilities: form.facilities.split(',').map((item) => item.trim()).filter(Boolean),
      roomTypes,
      checkInTime: form.checkInTime,
      checkOutTime: form.checkOutTime,
      workTripFriendly: form.workTripFriendly,
      active: form.active,
    };
    if (form.latitude && form.longitude) {
      payload.latitude = Number(form.latitude);
      payload.longitude = Number(form.longitude);
    }
    await onSave(payload);
  };

  const uploadImage = async (event) => {
    const image = event.target.files?.[0];
    if (!image) return;
    setUploadingImage(true);
    setError('');
    try {
      const { url } = await onUploadImage(image);
      setForm((current) => ({
        ...current,
        image: current.image || url,
        images: [...new Set([...current.images.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean), url])].join('\n'),
      }));
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload the image.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const field = (name, label, options = {}) => (
    <label className={`block text-sm font-semibold text-slate-700 ${options.className || ''}`}>
      {label}
      <input
        required={options.required}
        type={options.type || 'text'}
        min={options.min}
        max={options.max}
        value={form[name]}
        onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
        className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="hotel-form-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:px-7">
          <div><h2 id="hotel-form-title" className="text-xl font-extrabold text-slate-900">{hotel ? 'Edit hotel' : 'Add hotel'}</h2><p className="mt-1 text-sm text-slate-500">Fields match the current Property schema.</p></div>
          <button type="button" onClick={onClose} aria-label="Close hotel form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            {field('name', 'Hotel name', { required: true })}
            {field('location', 'City / location', { required: true })}
            {field('address', 'Complete street address')}
            {field('city', 'City')}
            {field('state', 'State / province')}
            {field('country', 'Country')}
            {field('currency', 'Currency code')}
            {field('type', 'Property type')}
            {field('category', 'Hotel category')}
            {field('price', 'Price per night (stored units)', { required: true, type: 'number', min: 0 })}
            {field('totalRooms', 'Total rooms', { required: true, type: 'number', min: 1 })}
            {field('availableRooms', 'Available rooms', { required: true, type: 'number', min: 0 })}
            {field('maxGuestsPerRoom', 'Maximum guests per room', { required: true, type: 'number', min: 1, max: 20 })}
            {field('rating', 'Rating (0–5, source required)', { type: 'number', min: 0, max: 5, className: 'sm:col-span-1' })}
            {field('ratingCount', 'Rating count', { type: 'number', min: 0 })}
            {field('ratingSource', 'Rating source')}
            {field('checkInTime', 'Check-in time')}
            {field('checkOutTime', 'Check-out time')}
            {field('latitude', 'Latitude (optional)', { type: 'number', min: -90, max: 90 })}
            {field('longitude', 'Longitude (optional)', { type: 'number', min: -180, max: 180 })}
            {field('image', 'Hotel image URL', { type: 'url', className: 'sm:col-span-2' })}
            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Hotel image files (Cloudinary must be configured)
              <input type="file" accept="image/*" onChange={uploadImage} disabled={uploadingImage} className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
              {uploadingImage && <span className="mt-1 block text-xs text-slate-500">Uploading image…</span>}
            </label>
            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Additional image URLs (one per line)
              <textarea rows={2} value={form.images} onChange={(event) => setForm((current) => ({ ...current, images: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Amenities (comma-separated)
              <input value={form.amenities} onChange={(event) => setForm((current) => ({ ...current, amenities: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-700" placeholder="Wi-Fi, Parking, Restaurant" />
            </label>
            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Facilities (comma-separated)
              <input value={form.facilities} onChange={(event) => setForm((current) => ({ ...current, facilities: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-700" placeholder="Restaurant, Meeting room, Gym" />
            </label>
            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Room types (JSON array)
              <textarea rows={4} value={form.roomTypes} onChange={(event) => setForm((current) => ({ ...current, roomTypes: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-xs font-normal" placeholder={'[{"name":"Standard","price":2500,"maxGuests":2,"totalRooms":10,"availableRooms":8}]'} />
            </label>
            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Description
              <textarea rows={3} maxLength={4000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-700" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} className="h-4 w-4 accent-blue-900" />
            Hotel listing is active
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={form.workTripFriendly} onChange={(event) => setForm((current) => ({ ...current, workTripFriendly: event.target.checked }))} className="h-4 w-4 accent-blue-900" />
            Suitable for work trips
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700">Cancel</button>
            <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
              {saving && <LoaderCircle size={16} className="animate-spin" />}{hotel ? 'Save changes' : 'Create hotel'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [listPages, setListPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [hotelEditor, setHotelEditor] = useState(undefined);
  const [adminForm, setAdminForm] = useState(emptyAdmin);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [hotelStatus, setHotelStatus] = useState('all');
  const [approvalStatus, setApprovalStatus] = useState('all');
  const [bookingStatus, setBookingStatus] = useState('all');
  const [bookingFrom, setBookingFrom] = useState('');
  const [bookingTo, setBookingTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const latestRequest = useRef(0);

  const loadData = useCallback(async () => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    setLoading(true);
    setError('');
    const listParams = { page, limit: PAGE_SIZE, search: search.trim() };
    let listRequest = null;
    if (section === 'hotels') {
      listRequest = fetchAdminHotels({
        ...listParams,
        city: city.trim(),
        ...(hotelStatus !== 'all' ? { status: hotelStatus } : {}),
        ...(approvalStatus !== 'all' ? { approvalStatus } : {}),
      });
    } else if (section === 'bookings') {
      listRequest = fetchAdminBookings({
        ...listParams,
        ...(bookingStatus !== 'all' ? { status: bookingStatus } : {}),
        ...(bookingFrom ? { from: bookingFrom } : {}),
        ...(bookingTo ? { to: bookingTo } : {}),
      });
    } else if (section === 'users') {
      listRequest = fetchAdminUsers(listParams);
    }

    const results = await Promise.allSettled([
      fetchAdminDashboard(),
      ...(listRequest ? [listRequest] : []),
    ]);
    if (requestId !== latestRequest.current) return;
    if (results[0].status === 'fulfilled') setDashboard(results[0].value);
    const listResult = results[1];
    if (listResult?.status === 'fulfilled') {
      const { value } = listResult;
      if (section === 'hotels') setHotels(value.properties || []);
      if (section === 'bookings') setBookings(value.bookings || []);
      if (section === 'users') setUsers(value.users || []);
      const nextPages = value.pagination?.pages || 0;
      setListPages(nextPages);
      if (page > Math.max(1, nextPages)) setPage(Math.max(1, nextPages));
    } else if (listResult?.status === 'rejected') {
      setListPages(0);
    } else {
      setListPages(0);
    }
    const rejected = results.filter((result) => result.status === 'rejected');
    if (rejected.length) setError(rejected.map((result) => result.reason.message).join(' '));
    setLoading(false);
  }, [approvalStatus, bookingFrom, bookingStatus, bookingTo, city, hotelStatus, page, search, section]);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 250);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const metrics = dashboard?.metrics || {};
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'hotels', label: 'Hotels', icon: Building2 },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const pageItems = section === 'hotels' ? hotels : section === 'bookings' ? bookings : users;

  const changeSection = (nextSection) => {
    setSection(nextSection);
    setSearch('');
    setCity('');
    setPage(1);
    setNotice('');
  };

  const notifyError = (requestError) => {
    setError(requestError.message || 'The request could not be completed.');
    setNotice('');
  };

  const saveHotel = async (payload) => {
    setSaving(true);
    try {
      if (hotelEditor?._id) {
        await updateAdminHotel(hotelEditor._id, payload);
        setNotice('Hotel updated successfully.');
      } else {
        await createAdminHotel(payload);
        setNotice('Hotel created successfully.');
      }
      setHotelEditor(undefined);
      await loadData();
    } catch (requestError) {
      notifyError(requestError);
    } finally {
      setSaving(false);
    }
  };

  const importHotelFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const records = JSON.parse(await file.text());
      if (!Array.isArray(records)) throw new Error('The JSON file must contain an array of hotel records.');
      const result = await importAdminHotels(records);
      setNotice(`${result.imported} hotel record${result.imported === 1 ? '' : 's'} imported.`);
      await loadData();
    } catch (requestError) {
      notifyError(requestError);
    } finally {
      setSaving(false);
      event.target.value = '';
    }
  };

  const downloadHotelExport = async () => {
    try {
      const blob = await exportAdminHotels();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fastbooking-hotels.json';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Hotel records exported.');
      setError('');
    } catch (requestError) {
      notifyError(requestError);
    }
  };

  const changeHotelStatus = async (hotel) => {
    try {
      await setAdminHotelStatus(hotel._id, hotel.active === false);
      setNotice(`Hotel ${hotel.active === false ? 'activated' : 'deactivated'}.`);
      await loadData();
    } catch (requestError) {
      notifyError(requestError);
    }
  };

  const changeHotelApproval = async (hotel, nextApprovalStatus) => {
    try {
      await setAdminHotelApproval(hotel._id, nextApprovalStatus);
      setNotice(`Hotel listing ${nextApprovalStatus}.`);
      await loadData();
    } catch (requestError) {
      notifyError(requestError);
    }
  };

  const removeHotel = async (hotel) => {
    if (!window.confirm(`Delete "${hotel.name}"? Hotels with booking history will be deactivated instead.`)) return;
    try {
      const response = await deleteAdminHotel(hotel._id);
      setNotice(response.deactivated ? 'Hotel has booking history, so it was safely deactivated.' : 'Hotel deleted.');
      await loadData();
    } catch (requestError) {
      notifyError(requestError);
    }
  };

  const changeBookingStatus = async (booking, nextStatus) => {
    try {
      const response = await setAdminBookingStatus(booking._id, nextStatus);
      setBookings((items) => items.map((item) => item._id === booking._id ? { ...item, ...response.booking } : item));
      setNotice('Booking status updated. Payment records were not changed.');
    } catch (requestError) {
      notifyError(requestError);
      await loadData();
    }
  };

  const createAdmin = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await createAdminAccount(adminForm);
      setUsers((items) => [response.user, ...items]);
      setAdminForm(emptyAdmin);
      setNotice('Administrator account created.');
    } catch (requestError) {
      notifyError(requestError);
    } finally {
      setSaving(false);
    }
  };

  const changeUserRole = async (user, role) => {
    try {
      await setAdminUserRole(user._id, role);
      setNotice(`${user.name}'s role changed to ${role}.`);
      await loadData();
    } catch (requestError) {
      notifyError(requestError);
    }
  };

  const logout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const cardData = [
    { label: 'Registered users', value: metrics.totalUsers, icon: Users },
    { label: 'Total hotels', value: metrics.totalHotels, icon: Building2 },
    { label: 'Active hotels', value: metrics.activeHotels, icon: DoorOpen },
    { label: 'Inactive hotels', value: metrics.inactiveHotels, icon: BedDouble },
    { label: 'Total bookings', value: metrics.totalBookings, icon: CalendarDays },
    { label: 'Pending bookings', value: metrics.pendingBookings, icon: Activity },
    { label: 'Confirmed bookings', value: metrics.confirmedBookings, icon: Check },
    { label: 'Cancelled bookings', value: metrics.cancelledBookings, icon: X },
    { label: 'Paid revenue (stored units)', value: numberText(metrics.paidRevenue), icon: CircleDollarSign },
  ];

  const header = (title, description, action) => (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><h2 className="text-2xl font-extrabold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>
      {action}
    </div>
  );

  const searchBar = (placeholder) => (
    <label className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-slate-300 bg-white px-3">
      <Search size={17} className="text-slate-400" />
      <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="w-full py-2.5 text-sm outline-none" placeholder={placeholder} />
    </label>
  );

  return (
    <main className="min-h-screen bg-slate-100 md:flex">
      <aside className="bg-blue-950 text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="rounded-xl bg-amber-400 p-2 text-blue-950"><ShieldCheck size={22} /></span>
          <div><p className="font-extrabold">FastBooking</p><p className="text-xs text-blue-200">Admin console</p></div>
        </div>
        <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto p-3 md:flex-col">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => changeSection(id)} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${section === id ? 'bg-white text-blue-950' : 'text-blue-100 hover:bg-white/10'}`}>
              {createElement(Icon, { size: 18 })}{label}
            </button>
          ))}
          <Link to="/admin/destinations" className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-blue-100 hover:bg-white/10">
            <MapPin size={18} />Destinations
          </Link>
        </nav>
        <button type="button" onClick={logout} className="mt-auto hidden items-center gap-3 border-t border-white/10 px-7 py-5 text-sm font-semibold text-blue-100 hover:text-white md:flex"><LogOut size={18} />Sign out</button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-7">
          <div><p className="text-xs font-bold uppercase tracking-widest text-amber-700">Administration</p><h1 className="text-lg font-extrabold text-blue-950">{navItems.find((item) => item.id === section)?.label}</h1></div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={loadData} disabled={loading} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh data'}</button>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-sm font-semibold text-white md:hidden"><LogOut size={16} />Logout</button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-7">
          {error && <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={17} /></button></div>}
          {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message"><X size={17} /></button></div>}
          {loading && !dashboard && <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-16 text-slate-600"><LoaderCircle size={20} className="animate-spin" />Loading admin data…</div>}

          {section === 'overview' && (
            <>
              {header('Dashboard overview', 'Live counts and recent activity from the application database.')}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cardData.map(({ label, value, icon: Icon }) => (
                  <article key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="rounded-xl bg-blue-50 p-3 text-blue-900">{createElement(Icon, { size: 21 })}</span>
                    <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{loading && value === undefined ? '—' : numberText(value)}</p></div>
                  </article>
                ))}
              </div>
              <AIAnalyticsAssistant />
              <div className="grid gap-6 xl:grid-cols-2">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 p-5"><h3 className="font-extrabold text-slate-900">Recent bookings</h3></div>
                  {dashboard?.recentBookings?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Hotel</th><th className="px-4 py-3">Stay</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{dashboard.recentBookings.map((booking) => <tr key={booking._id}><td className="px-4 py-3">{booking.user?.name || booking.guestName || 'Guest'}</td><td className="px-4 py-3">{booking.property}</td><td className="px-4 py-3">{dateText(booking.checkInDate)}</td><td className="px-4 py-3">{booking.bookingStatus}</td></tr>)}</tbody></table></div> : <p className="p-6 text-sm text-slate-500">No recent bookings.</p>}
                </section>
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 p-5"><h3 className="font-extrabold text-slate-900">Recently registered users</h3></div>
                  {dashboard?.recentUsers?.length ? <div className="divide-y divide-slate-100">{dashboard.recentUsers.map((user) => <div key={user._id} className="flex items-center justify-between gap-4 px-5 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{user.role}</span></div>)}</div> : <p className="p-6 text-sm text-slate-500">No registered users.</p>}
                </section>
              </div>
            </>
          )}

          {section === 'hotels' && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="p-5 sm:p-6">
                {header('Hotel management', 'Create, edit, import, export, activate, or safely remove property listings.', <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={downloadHotelExport} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-700">Export JSON</button>
                  <label className="cursor-pointer rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-700">
                    Import JSON
                    <input type="file" accept=".json,application/json" onChange={importHotelFile} className="sr-only" />
                  </label>
                  <button type="button" onClick={() => setHotelEditor(null)} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} />Add hotel</button>
                </div>)}
                <div className="flex flex-wrap gap-3">
                  {searchBar('Search name, location or type')}
                  <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-600">
                    City
                    <input aria-label="Filter hotels by city" value={city} onChange={(event) => { setCity(event.target.value); setPage(1); }} className="w-36 py-2.5 text-sm text-slate-900 outline-none" placeholder="Any city" />
                  </label>
                  <select value={hotelStatus} onChange={(event) => { setHotelStatus(event.target.value); setPage(1); }} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
                  <select aria-label="Filter by hotel approval" value={approvalStatus} onChange={(event) => { setApprovalStatus(event.target.value); setPage(1); }} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="all">All approval states</option><option value="pending">Pending approval</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Hotel</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Price/night</th><th className="px-4 py-3">Rooms available</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageItems.map((hotel) => <tr key={hotel._id}>
                      <td className="px-4 py-3"><div className="flex items-center gap-3">{hotel.image ? <img src={hotel.image} alt="" className="h-11 w-14 rounded-lg object-cover" /> : <span className="flex h-11 w-14 items-center justify-center rounded-lg bg-slate-100"><Building2 size={18} /></span>}<div><p className="font-bold text-slate-800">{hotel.name}</p><p className="text-xs text-slate-500">{hotel.type || 'Hotel'}</p></div></div></td>
                      <td className="px-4 py-3 text-slate-600">{hotel.location}</td><td className="px-4 py-3">{numberText(hotel.price)}</td><td className="px-4 py-3">{hotel.availableRooms} / {hotel.totalRooms}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${hotel.active === false ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-800'}`}>{hotel.active === false ? 'Inactive' : 'Active'}</span><p className="mt-1 text-xs capitalize text-slate-500">Approval: {hotel.approvalStatus || 'approved'}</p></td>
                      <td className="px-4 py-3"><div className="flex flex-wrap items-center gap-1"><button type="button" title="Edit hotel" onClick={() => setHotelEditor(hotel)} className="rounded-lg p-2 text-blue-900 hover:bg-blue-50"><Pencil size={17} /></button><button type="button" onClick={() => changeHotelStatus(hotel)} className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50">{hotel.active === false ? 'Activate' : 'Deactivate'}</button>{(hotel.approvalStatus || 'approved') !== 'approved' && <button type="button" onClick={() => changeHotelApproval(hotel, 'approved')} className="rounded-lg px-2 py-1 text-xs font-semibold text-green-800 hover:bg-green-50">Approve</button>}{hotel.approvalStatus !== 'rejected' && <button type="button" onClick={() => changeHotelApproval(hotel, 'rejected')} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-800 hover:bg-red-50">Reject</button>}<button type="button" title="Delete hotel" onClick={() => removeHotel(hotel)} className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 size={17} /></button></div></td>
                    </tr>)}
                    {!pageItems.length && <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">{loading ? 'Loading hotels…' : 'No hotels match this search.'}</td></tr>}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pages={listPages} onChange={setPage} />
            </section>
          )}

          {section === 'bookings' && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="p-5 sm:p-6">
                {header('Booking management', 'Search bookings and update booking status without changing payment records.')}
                <div className="flex flex-wrap gap-3">
                  {searchBar('Search booking ID, customer or hotel')}
                  <select value={bookingStatus} onChange={(event) => { setBookingStatus(event.target.value); setPage(1); }} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="all">All booking statuses</option>{bookingStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">Created from<input aria-label="Bookings created from" type="date" value={bookingFrom} onChange={(event) => { setBookingFrom(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-2 py-2 text-sm" /></label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">Created to<input aria-label="Bookings created to" type="date" value={bookingTo} onChange={(event) => { setBookingTo(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-2 py-2 text-sm" /></label>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Booking / guest</th><th className="px-4 py-3">Hotel</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Booking status</th><th className="px-4 py-3">Details</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageItems.map((booking) => <tr key={booking._id}>
                      <td className="px-4 py-3"><p className="font-semibold">{booking.user?.name || booking.guestName || 'Guest'}</p><p className="font-mono text-xs text-slate-500">{booking._id}</p><p className="text-xs text-slate-500">{booking.user?.email || booking.guestEmail || ''}</p></td>
                      <td className="px-4 py-3">{booking.property}</td><td className="px-4 py-3">{dateText(booking.checkInDate)} – {dateText(booking.checkOutDate)}</td><td className="px-4 py-3 font-semibold">{numberText(booking.totalPrice)}</td>
                      <td className="px-4 py-3">{booking.paymentStatus || '—'}</td>
                      <td className="px-4 py-3"><select aria-label={`Booking status for ${booking._id}`} value={booking.bookingStatus} onChange={(event) => changeBookingStatus(booking, event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs">{bookingStatuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                      <td className="px-4 py-3"><button type="button" onClick={() => setSelectedBooking(booking)} className="font-semibold text-blue-800 hover:underline">View</button></td>
                    </tr>)}
                    {!pageItems.length && <tr><td colSpan="7" className="px-4 py-12 text-center text-slate-500">{loading ? 'Loading bookings…' : 'No bookings match this search.'}</td></tr>}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pages={listPages} onChange={setPage} />
            </section>
          )}

          {section === 'users' && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                {header('User management', 'Browse registered accounts. Password and credential fields are never returned.')}
                <div className="mb-4">{searchBar('Search by name or email')}</div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Mobile</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
                    {pageItems.map((user) => <tr key={user._id}><td className="px-4 py-3 font-semibold">{user.name}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3">{user.mobile || '—'}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}`}>{user.role}</span></td><td className="px-4 py-3">{dateText(user.createdAt)}</td><td className="px-4 py-3">{user.role !== 'ADMIN' && <button type="button" onClick={() => changeUserRole(user, user.role === 'OWNER' ? 'CUSTOMER' : 'OWNER')} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50">{user.role === 'OWNER' ? 'Make customer' : 'Make owner'}</button>}</td></tr>)}
                    {!pageItems.length && <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">{loading ? 'Loading users…' : 'No users match this search.'}</td></tr>}
                  </tbody></table>
                </div>
                <Pagination page={page} pages={listPages} onChange={setPage} />
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="mb-1 text-lg font-extrabold text-slate-900">Create administrator</h3>
                <p className="mb-4 text-sm text-slate-500">This endpoint is admin-only. Regular registration cannot choose an administrator role.</p>
                <form onSubmit={createAdmin} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ['name', 'Full name', 'text'],
                    ['mobile', 'Mobile number', 'tel'],
                    ['email', 'Email address', 'email'],
                    ['password', 'Temporary password', 'password'],
                  ].map(([name, label, type]) => <label key={name} className="text-sm font-semibold text-slate-700">{label}<input required minLength={name === 'password' ? 8 : undefined} type={type} value={adminForm[name]} onChange={(event) => setAdminForm((form) => ({ ...form, [name]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>)}
                  <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 font-bold text-white disabled:opacity-60 sm:col-span-2 lg:col-span-4">{saving ? <LoaderCircle size={17} className="animate-spin" /> : <Plus size={17} />}Create administrator</button>
                </form>
              </section>
            </div>
          )}
        </div>
      </div>

      {hotelEditor !== undefined && <HotelEditor hotel={hotelEditor} saving={saving} onClose={() => setHotelEditor(undefined)} onSave={saveHotel} onUploadImage={uploadAdminHotelImage} />}
      {selectedBooking && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedBooking(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="booking-detail-title" className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-700">Booking details</p><h2 id="booking-detail-title" className="mt-1 text-xl font-extrabold">{selectedBooking.property}</h2></div><button type="button" onClick={() => setSelectedBooking(null)} aria-label="Close booking details" className="rounded-lg p-2 hover:bg-slate-100"><X size={19} /></button></div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ['Booking ID', selectedBooking._id],
                ['Customer', selectedBooking.user?.name || selectedBooking.guestName || 'Guest'],
                ['Email', selectedBooking.user?.email || selectedBooking.guestEmail || '—'],
                ['Phone', selectedBooking.guestPhone || selectedBooking.user?.mobile || '—'],
                ['Check-in', dateText(selectedBooking.checkInDate)],
                ['Check-out', dateText(selectedBooking.checkOutDate)],
                ['Guests / rooms', `${selectedBooking.numberOfGuests} / ${selectedBooking.numberOfRooms}`],
                ['Booking status', selectedBooking.bookingStatus],
                ['Payment status', selectedBooking.paymentStatus],
                ['Payment method', selectedBooking.paymentDetails?.paymentMethod || '—'],
                ['Transaction reference', selectedBooking.paymentDetails?.transactionId || selectedBooking.paymentDetails?.paymentId || '—'],
                ['Total amount (stored units)', numberText(selectedBooking.totalPrice)],
              ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 break-all font-medium text-slate-900">{value}</dd></div>)}
            </dl>
            <p className="mt-4 text-xs text-slate-500">Payment fields are shown read-only. This panel never processes refunds or changes payment status.</p>
          </section>
        </div>
      )}
    </main>
  );
};

export default AdminPanel;

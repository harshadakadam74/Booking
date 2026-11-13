import { useState } from 'react';
import { Download, FileSpreadsheet, Plus, Trash2, Upload, X } from 'lucide-react';
import { hotelImportTemplate, parseHotelImportFile } from '../../utils/hotelImport';

const createEntry = () => ({
  name: '',
  city: '',
  state: '',
  address: '',
  postalCode: '',
  price: '',
  totalRooms: '',
  availableRooms: '',
  images: '',
  description: '',
  amenities: '',
  facilities: '',
  roomTypes: '[]',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  contactPhone: '',
  contactEmail: '',
  rating: '',
  ratingCount: '',
  ratingSource: '',
  starRating: '',
  policies: '{"cancellation":"","children":"","pets":"","general":""}',
  active: true,
  approvalStatus: 'approved',
});

const splitList = (value) => value.split(/[|,\n]+/).map((item) => item.trim()).filter(Boolean);
const splitImages = (value) => value.split(/[|\n]+/).map((item) => item.trim()).filter(Boolean);

const entryToRecord = (entry) => {
  const record = {
    name: entry.name.trim(),
    city: entry.city.trim(),
    state: entry.state.trim(),
    country: 'India',
    location: [entry.city.trim(), entry.state.trim(), 'India'].filter(Boolean).join(', '),
    address: entry.address.trim(),
    streetAddress: entry.address.trim(),
    postalCode: entry.postalCode.trim(),
    price: entry.price === '' ? '' : Number(entry.price),
    totalRooms: entry.totalRooms === '' ? '' : Number(entry.totalRooms),
    availableRooms: entry.availableRooms === '' ? '' : Number(entry.availableRooms),
    images: splitImages(entry.images),
    image: splitImages(entry.images)[0] || '',
    description: entry.description.trim(),
    amenities: splitList(entry.amenities),
    facilities: splitList(entry.facilities),
    checkInTime: entry.checkInTime,
    checkOutTime: entry.checkOutTime,
    contactPhone: entry.contactPhone.trim(),
    contactEmail: entry.contactEmail.trim(),
    active: entry.active,
    approvalStatus: entry.approvalStatus,
    currency: 'INR',
    type: 'Hotel',
    category: 'Hotel',
  };
  if (entry.roomTypes.trim()) record.roomTypes = JSON.parse(entry.roomTypes);
  if (entry.policies.trim()) record.policies = JSON.parse(entry.policies);
  if (entry.rating !== '') record.rating = Number(entry.rating);
  if (entry.ratingCount !== '') record.ratingCount = Number(entry.ratingCount);
  if (entry.ratingSource.trim()) record.ratingSource = entry.ratingSource.trim();
  if (entry.starRating !== '') record.starRating = Number(entry.starRating);
  return record;
};

const downloadTemplate = () => {
  const url = URL.createObjectURL(new Blob([hotelImportTemplate()], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fastbooking-hotel-import-template.csv';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100';

const BulkHotelManager = ({ saving, onClose, onPreview, onImport, onUploadImages }) => {
  const [mode, setMode] = useState('manual');
  const [entries, setEntries] = useState([createEntry()]);
  const [records, setRecords] = useState([]);
  const [results, setResults] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [finished, setFinished] = useState(false);

  const updateEntry = (index, field, value) => {
    setEntries((current) => current.map((entry, itemIndex) => (
      itemIndex === index ? { ...entry, [field]: value } : entry
    )));
    setResults([]);
    setFinished(false);
  };

  const previewRecords = async (nextRecords) => {
    setWorking(true);
    setError('');
    setFinished(false);
    try {
      const response = await onPreview(nextRecords);
      setRecords(nextRecords);
      setResults(response.results || []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to validate these hotel records.');
    } finally {
      setWorking(false);
    }
  };

  const previewManualEntries = async () => {
    try {
      const nextRecords = entries.map(entryToRecord);
      await previewRecords(nextRecords);
    } catch (parseError) {
      setError(parseError.message || 'Check the room types and hotel policies JSON fields.');
    }
  };

  const uploadImages = async (index, event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadingImages(true);
    setError('');
    try {
      const uploaded = await onUploadImages(files);
      const imageUrls = uploaded.urls || [uploaded.url].filter(Boolean);
      updateEntry(index, 'images', [...new Set([...splitImages(entries[index].images), ...imageUrls])].join(' | '));
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload hotel images.');
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const loadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setResults([]);
    setFinished(false);
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Choose a file smaller than 5 MB.');
      const nextRecords = await parseHotelImportFile(file);
      if (nextRecords.length > 500) throw new Error('Import up to 500 hotel records at a time.');
      setFileName(file.name);
      setRecords(nextRecords);
    } catch (parseError) {
      setRecords([]);
      setFileName('');
      setError(parseError.message || 'Unable to read this import file.');
    } finally {
      event.target.value = '';
    }
  };

  const importReadyRecords = async () => {
    const readyIndexes = results
      .map((result, index) => result.status === 'ready' ? index : -1)
      .filter((index) => index >= 0);
    const accepted = readyIndexes
      .map((index) => records[results[index].row - 1])
      .filter(Boolean);
    if (!accepted.length) return;
    setWorking(true);
    setError('');
    try {
      const response = await onImport(accepted);
      const completed = response.results || [];
      setResults((current) => current.map((result, index) => {
        const outcomeIndex = readyIndexes.indexOf(index);
        if (outcomeIndex < 0 || !completed[outcomeIndex]) return result;
        return { ...result, ...completed[outcomeIndex], row: result.row };
      }));
      setFinished(true);
    } catch (requestError) {
      setError(requestError.message || 'Unable to import these hotels.');
    } finally {
      setWorking(false);
    }
  };

  const validCount = results.filter((result) => result.status === 'ready').length;
  const successCount = results.filter((result) => result.status === 'imported').length;
  const failedCount = results.filter((result) => result.status === 'failed').length;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving && !working) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="bulk-hotel-title" className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:px-7">
          <div>
            <h2 id="bulk-hotel-title" className="text-xl font-extrabold text-blue-950">Bulk add hotels</h2>
            <p className="mt-1 text-sm text-slate-600">Add multiple listings or import a CSV / Excel workbook. Only admin-authorized records are saved.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving || working} aria-label="Close bulk hotel manager" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={20} /></button>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3 sm:px-7">
          <button type="button" onClick={() => { setMode('manual'); setError(''); }} className={`rounded-lg px-4 py-2 text-sm font-bold ${mode === 'manual' ? 'bg-blue-950 text-white' : 'bg-slate-100 text-slate-700'}`}>Multiple hotel forms</button>
          <button type="button" onClick={() => { setMode('file'); setError(''); }} className={`rounded-lg px-4 py-2 text-sm font-bold ${mode === 'file' ? 'bg-blue-950 text-white' : 'bg-slate-100 text-slate-700'}`}>CSV / Excel import</button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-7">
          {mode === 'manual' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">{entries.length} hotel entr{entries.length === 1 ? 'y' : 'ies'} · add as many as needed (up to 500).</p>
                <button type="button" disabled={entries.length >= 500 || uploadingImages} onClick={() => setEntries((current) => [...current, createEntry()])} className="inline-flex items-center gap-2 rounded-lg border border-blue-900 px-3 py-2 text-sm font-bold text-blue-950 disabled:opacity-50"><Plus size={16} />Add another hotel</button>
              </div>
              {entries.map((entry, index) => (
                <article key={index} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-extrabold text-blue-950">Hotel {index + 1}</h3>
                    {entries.length > 1 && <button type="button" onClick={() => { setEntries((current) => current.filter((_, itemIndex) => itemIndex !== index)); setResults([]); }} aria-label={`Remove hotel ${index + 1}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 size={15} />Remove</button>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ['name', 'Hotel name *', 'text'],
                      ['city', 'City *', 'text'],
                      ['state', 'State', 'text'],
                      ['address', 'Complete street address *', 'text'],
                      ['postalCode', 'PIN / postal code', 'text'],
                      ['price', 'Price per night (INR) *', 'number'],
                      ['totalRooms', 'Total rooms *', 'number'],
                      ['availableRooms', 'Available rooms *', 'number'],
                      ['contactPhone', 'Contact phone', 'tel'],
                      ['contactEmail', 'Contact email', 'email'],
                      ['checkInTime', 'Check-in (HH:mm)', 'text'],
                      ['checkOutTime', 'Check-out (HH:mm)', 'text'],
                      ['rating', 'Rating (only with source)', 'number'],
                      ['ratingCount', 'Rating count', 'number'],
                      ['ratingSource', 'Rating source', 'text'],
                      ['starRating', 'Star category (verified)', 'number'],
                    ].map(([field, label, type]) => (
                      <label key={field} className="block text-sm font-semibold text-slate-700">
                        {label}
                        <input type={type} min={type === 'number' ? 0 : undefined} value={entry[field]} onChange={(event) => updateEntry(index, field, event.target.value)} className={inputClass} />
                      </label>
                    ))}
                    <label className="block text-sm font-semibold text-slate-700">
                      Approval status
                      <select value={entry.approvalStatus} onChange={(event) => updateEntry(index, 'approvalStatus', event.target.value)} className={inputClass}>
                        <option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-slate-700">
                      <input type="checkbox" checked={entry.active} onChange={(event) => updateEntry(index, 'active', event.target.checked)} className="h-4 w-4 accent-blue-900" />
                      Active listing
                    </label>
                    <label className="block text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">Hotel image URLs (separate with |)
                      <input value={entry.images} onChange={(event) => updateEntry(index, 'images', event.target.value)} className={inputClass} placeholder="https://.../hotel.jpg | https://.../room.jpg" />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">Upload hotel images (Cloudinary must be configured)
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => uploadImages(index, event)} disabled={uploadingImages} className={inputClass} />
                      {uploadingImages && <span className="mt-1 block text-xs text-slate-500">Uploading images…</span>}
                    </label>
                    {[
                      ['description', 'Description'],
                      ['amenities', 'Amenities (separate with |)'],
                      ['facilities', 'Facilities (separate with |)'],
                      ['roomTypes', 'Room types (JSON array)'],
                      ['policies', 'Policies (JSON object)'],
                    ].map(([field, label]) => (
                      <label key={field} className="block text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
                        {label}
                        <textarea rows={field === 'description' ? 2 : 3} value={entry[field]} onChange={(event) => updateEntry(index, field, event.target.value)} className={`${inputClass} ${['roomTypes', 'policies'].includes(field) ? 'font-mono text-xs' : ''}`} />
                      </label>
                    ))}
                  </div>
                </article>
              ))}
              <button type="button" onClick={previewManualEntries} disabled={working || saving} className="rounded-xl bg-blue-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{working ? 'Validating…' : 'Validate and preview hotels'}</button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <FileSpreadsheet size={28} className="mx-auto text-blue-900" />
                <h3 className="mt-2 font-bold text-blue-950">Import a CSV or .xlsx workbook</h3>
                <p className="mt-1 text-sm text-slate-600">Use the first worksheet for Excel files. A maximum of 500 hotels is accepted per import.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-950 px-4 py-2.5 text-sm font-bold text-white">
                    <Upload size={16} />Choose file
                    <input type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={loadFile} className="sr-only" />
                  </label>
                  <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"><Download size={16} />Download CSV template</button>
                </div>
                {fileName && <p className="mt-3 text-sm font-semibold text-slate-700">Selected: {fileName} · {records.length} rows</p>}
              </div>
              {!!records.length && (
                <>
                  <p className="text-xs text-slate-500">List fields use | separators. Room types and policies use JSON. Required: name, city, complete address, price, total rooms and available rooms.</p>
                  <button type="button" onClick={() => previewRecords(records)} disabled={working || saving} className="rounded-xl bg-blue-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{working ? 'Validating…' : 'Validate and preview import'}</button>
                </>
              )}
            </div>
          )}

          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

          {!!results.length && (
            <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-blue-950">{finished ? 'Import complete' : 'Import preview'}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {finished
                      ? `${successCount} imported · ${failedCount} failed`
                      : `${validCount} ready · ${failedCount} invalid or duplicate`}
                  </p>
                </div>
                {!finished && (
                  <button type="button" onClick={importReadyRecords} disabled={!validCount || working || saving} className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-extrabold text-blue-950 disabled:opacity-50">
                    {working ? 'Importing…' : `Import ${validCount} valid hotel${validCount === 1 ? '' : 's'}`}
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Row</th><th className="px-3 py-2">Hotel</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Details</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((result) => (
                      <tr key={result.row}>
                        <td className="px-3 py-2">{result.row}</td>
                        <td className="px-3 py-2">{result.name || '—'}</td>
                        <td className={`px-3 py-2 font-bold ${result.status === 'failed' ? 'text-red-700' : result.status === 'imported' ? 'text-green-700' : 'text-blue-900'}`}>{result.status}</td>
                        <td className="px-3 py-2 text-slate-600">{result.error || 'Ready to import'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
        <footer className="flex justify-end border-t border-slate-100 p-4 sm:px-7">
          <button type="button" onClick={onClose} disabled={saving || working} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">Close</button>
        </footer>
      </section>
    </div>
  );
};

export default BulkHotelManager;

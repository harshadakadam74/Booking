import { useState } from 'react';
import { Camera, LoaderCircle, Send, Star } from 'lucide-react';
import { createBookingReview } from '../../services/bookingService';

const BookingReview = ({ bookingId, canReview, existingReview }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [photos, setPhotos] = useState((existingReview?.photos || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (existingReview) {
    return (
      <section className="rounded-3xl border border-yellow-200 bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-[#082B5C]">Your review</h2>
        <div className="mt-3 flex gap-1 text-[#C58A18]">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={18} fill={index < existingReview.rating ? 'currentColor' : 'none'} />)}</div>
        <p className="mt-3 text-slate-600">{existingReview.comment || 'No comment added.'}</p>
      </section>
    );
  }

  if (!canReview) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await createBookingReview({
        bookingId,
        rating,
        comment,
        photos: photos.split('\n').map((photo) => photo.trim()).filter(Boolean),
      });
      setMessage('Thanks, your review was submitted.');
    } catch (error) {
      setMessage(error?.message || error?.error || 'Unable to submit review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-md sm:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-yellow-50 p-3 text-[#C58A18]"><Camera size={22} /></div>
        <div><h2 className="text-xl font-bold text-[#082B5C]">Review your stay</h2><p className="text-sm text-slate-500">Share your experience after checkout.</p></div>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Rating</p>
          <div className="flex gap-2" aria-label="Choose a rating">
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1;
              return <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star${value > 1 ? 's' : ''}`}><Star size={28} className={value <= rating ? 'fill-[#C58A18] text-[#C58A18]' : 'text-slate-300'} /></button>;
            })}
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700">Comment<textarea required minLength={5} value={comment} onChange={(event) => setComment(event.target.value)} rows="4" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" placeholder="How was your stay?" /></label>
        <label className="block text-sm font-semibold text-slate-700">Photo URLs <span className="font-normal text-slate-400">(one per line, up to 5)</span><textarea value={photos} onChange={(event) => setPhotos(event.target.value)} rows="3" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" placeholder="https://example.com/room-photo.jpg" /></label>
        {message && <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}
        <button disabled={saving || rating === 0} className="inline-flex items-center gap-2 rounded-xl bg-[#082B5C] px-5 py-3 font-bold text-white transition hover:bg-[#C58A18] disabled:cursor-not-allowed disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />}{saving ? 'Submitting...' : 'Submit review'}</button>
      </form>
    </section>
  );
};

export default BookingReview;
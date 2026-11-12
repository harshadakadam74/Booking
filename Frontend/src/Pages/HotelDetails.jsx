import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Star, Users } from "lucide-react";
import { getHotelAvailability, getHotelById } from "../services/destinationService";

const dateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dateValue(date);
};

const followingDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateOffset(1);
  date.setDate(date.getDate() + 1);
  return dateValue(date);
};

const HotelDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || dateOffset(1));
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || dateOffset(2));
  const [guests, setGuests] = useState(searchParams.get("adults") || "2");
  const [rooms, setRooms] = useState(searchParams.get("rooms") || "1");
  const [roomTypeId, setRoomTypeId] = useState(searchParams.get("roomTypeId") || "");
  const [availability, setAvailability] = useState(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const roomTypes = useMemo(
    () => (Array.isArray(hotel?.roomTypes) ? hotel.roomTypes : []),
    [hotel]
  );
  const address = useMemo(() => [
    hotel?.streetAddress || hotel?.address,
    hotel?.city || hotel?.location,
    hotel?.state,
    hotel?.country,
  ].filter(Boolean).join(", "), [hotel]);
  const isValidHotelId = /^[a-f\d]{24}$/i.test(id);

  useEffect(() => {
    let active = true;
    const loadHotel = async () => {
      if (!isValidHotelId) {
        setHotel(null);
        setLoadError("This hotel link does not contain a valid database ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError("");
      try {
        const result = await getHotelById(id);
        if (!result || String(result._id) !== id) {
          throw new Error("The hotel service returned a different listing.");
        }
        if (active) setHotel(result);
      } catch (requestError) {
        if (active) {
          setHotel(null);
          setLoadError(
            requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load this hotel right now."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHotel();
    return () => {
      active = false;
    };
  }, [id, isValidHotelId, retry]);

  useEffect(() => {
    if (!hotel) return;
    const requestedRoomType = searchParams.get("roomTypeId");
    setRoomTypeId((current) => {
      if (requestedRoomType && roomTypes.some((room) => String(room._id) === requestedRoomType)) {
        return requestedRoomType;
      }
      if (current && roomTypes.some((room) => String(room._id) === current)) return current;
      return String(roomTypes[0]?._id || "");
    });
  }, [hotel, roomTypes, searchParams]);

  const resetAvailability = () => {
    setAvailability(null);
    setAvailabilityError("");
  };

  const updateBookingParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
    navigate(
      { pathname: location.pathname, search: `?${nextParams.toString()}` },
      { replace: true }
    );
  };

  const checkAvailability = async (event) => {
    event.preventDefault();
    resetAvailability();
    setCheckingAvailability(true);
    try {
      const result = await getHotelAvailability(id, {
        checkIn,
        checkOut,
        guests,
        rooms,
        ...(roomTypeId ? { roomTypeId } : {}),
      });
      setAvailability(result || {
        eligible: false,
        reasons: [{ message: "The server did not return availability details." }],
      });
    } catch (requestError) {
      setAvailabilityError(
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to check availability. Please retry."
      );
    } finally {
      setCheckingAvailability(false);
    }
  };

  const continueToCheckout = () => {
    if (!availability?.eligible) return;
    const checkoutParams = new URLSearchParams({
      hotelId: id,
      checkIn,
      checkOut,
      adults: String(guests),
      children: "0",
      rooms: String(rooms),
    });
    if (roomTypeId) checkoutParams.set("roomTypeId", roomTypeId);
    navigate(`/payment?${checkoutParams.toString()}`);
  };

  if (loading) {
    return (
      <main className="min-h-[60vh] bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-5xl animate-pulse rounded-3xl bg-white p-8 text-slate-500">Loading hotel details…</div>
      </main>
    );
  }

  if (!hotel) {
    return (
      <main className="min-h-[60vh] bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#082B5C]">Hotel details unavailable</h1>
          <p role="alert" className="mt-3 text-sm text-slate-600">{loadError}</p>
          <div className="mt-6 flex justify-center gap-3">
            {isValidHotelId && <button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-xl bg-[#082B5C] px-5 py-3 font-semibold text-white">Retry</button>}
            <Link to="/book-place" className="rounded-xl border border-[#082B5C] px-5 py-3 font-semibold text-[#082B5C]">Browse hotels</Link>
          </div>
        </div>
      </main>
    );
  }

  const selectedRoom = roomTypes.find((room) => String(room._id) === roomTypeId);
  const image = hotel.image || hotel.images?.[0];
  const listedPrice = Number(selectedRoom?.price ?? hotel.price);
  const pricing = availability?.pricing;

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-14 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/book-place" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#082B5C]">
          <ArrowLeft size={17} /> Browse hotels
        </Link>
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="grid lg:grid-cols-2">
            {image ? (
              <img src={image} alt={hotel.name} className="h-72 w-full object-cover sm:h-96 lg:h-full lg:min-h-[480px]" />
            ) : (
              <div className="h-72 bg-gradient-to-br from-[#082B5C] to-[#E3AE32] sm:h-96 lg:h-full lg:min-h-[480px]" aria-label="No hotel image available" />
            )}
            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E3AE32]">Hotel details</p>
              <h1 className="mt-2 text-3xl font-extrabold text-[#082B5C]">{hotel.name}</h1>
              <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                <MapPin size={17} className="mt-0.5 shrink-0 text-[#E3AE32]" />
                {address || hotel.location}
              </p>
              {Number(hotel.ratingCount) > 0 && Number.isFinite(Number(hotel.rating)) && (
                <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-slate-700">
                  <Star size={16} className="fill-[#E3AE32] text-[#E3AE32]" />
                  {Number(hotel.rating).toFixed(1)} ({hotel.ratingCount} ratings)
                </p>
              )}
              {hotel.description && <p className="mt-4 leading-6 text-slate-600">{hotel.description}</p>}
              {!!hotel.amenities?.length && <p className="mt-4 text-sm text-slate-600"><strong className="text-[#082B5C]">Amenities:</strong> {hotel.amenities.join(" · ")}</p>}

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-2xl font-extrabold text-[#082B5C]">
                  {formatPrice(listedPrice, hotel.currency || "INR")}
                  <span className="ml-1 text-sm font-normal text-slate-500">/ room, per night</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">Final availability and price are verified by the booking service.</p>
              </div>

              <form onSubmit={checkAvailability} className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-4 sm:p-5">
                <h2 className="font-bold text-[#082B5C]">Choose your stay</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Check-in
                    <span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
                      <CalendarDays size={16} className="text-[#082B5C]" />
                      <input required type="date" min={dateOffset(0)} value={checkIn} disabled={checkingAvailability} onChange={(event) => { setCheckIn(event.target.value); updateBookingParam("checkIn", event.target.value); resetAvailability(); }} className="min-w-0 flex-1 py-2.5 outline-none" />
                    </span>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Check-out
                    <input required type="date" min={checkIn ? followingDate(checkIn) : dateOffset(1)} value={checkOut} disabled={checkingAvailability} onChange={(event) => { setCheckOut(event.target.value); updateBookingParam("checkOut", event.target.value); resetAvailability(); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Guests
                    <span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
                      <Users size={16} className="text-[#082B5C]" />
                      <input required type="number" min="1" max="20" value={guests} disabled={checkingAvailability} onChange={(event) => { setGuests(event.target.value); updateBookingParam("adults", event.target.value); resetAvailability(); }} className="w-full py-2.5 outline-none" />
                    </span>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Rooms
                    <input required type="number" min="1" max="10" value={rooms} disabled={checkingAvailability} onChange={(event) => { setRooms(event.target.value); updateBookingParam("rooms", event.target.value); resetAvailability(); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal" />
                  </label>
                </div>
                {roomTypes.length > 0 && (
                  <label className="block text-sm font-semibold text-slate-700">
                    Room type
                    <select required value={roomTypeId} disabled={checkingAvailability} onChange={(event) => { setRoomTypeId(event.target.value); updateBookingParam("roomTypeId", event.target.value); resetAvailability(); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal">
                      <option value="">Select a room type</option>
                      {roomTypes.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.name} · {formatPrice(room.price ?? hotel.price, hotel.currency || "INR")} / night
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <button type="submit" disabled={checkingAvailability} className="w-full rounded-xl bg-[#082B5C] px-5 py-3 font-bold text-white transition hover:bg-[#123f77] disabled:cursor-wait disabled:opacity-60">
                  {checkingAvailability ? "Checking availability…" : "Check availability"}
                </button>
              </form>

              {availabilityError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{availabilityError}</p>}
              {availability && (
                <div className={`mt-4 rounded-xl border p-4 ${availability.eligible ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                  {availability.eligible ? (
                    <>
                      <p className="font-bold text-emerald-900">Available for your dates</p>
                      <p className="mt-1 text-sm text-emerald-800">
                        {pricing?.nights} night{pricing?.nights === 1 ? "" : "s"} · {rooms} room{Number(rooms) === 1 ? "" : "s"} · {formatPrice(pricing?.totalPrice, pricing?.currency || hotel.currency || "INR")}
                      </p>
                      <button type="button" onClick={continueToCheckout} className="mt-3 w-full rounded-xl bg-[#E3AE32] px-5 py-3 font-extrabold text-[#082B5C] transition hover:bg-amber-400">
                        Continue to checkout
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-amber-900">This stay cannot be booked yet</p>
                      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-900">
                        {(availability.reasons || []).map((reason, index) => <li key={`${reason.code || reason.message}-${index}`}>{reason.message}</li>)}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
};

const formatPrice = (price, currency = "INR") => {
  const value = Number(price);
  if (!Number.isFinite(value)) return "Price unavailable";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("en-IN")}`;
  }
};

export default HotelDetails;

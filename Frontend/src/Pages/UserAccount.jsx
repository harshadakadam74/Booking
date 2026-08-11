import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  Heart,
  Calendar,
  CreditCard,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Hotel,
  Clock,
  CheckCircle,
} from "lucide-react";

import { fetchUserProfile } from "../services/authService";

// ==================================================
// SAFE LOCAL STORAGE PARSER
// ==================================================

const safeParse = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    localStorage.removeItem(key);
    return fallback;
  }
};

// ==================================================
// USER ACCOUNT
// ==================================================

const UserAccount = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => safeParse("user", null));

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("authToken")
  );

  const [isLoading, setIsLoading] = useState(
    () =>
      !!localStorage.getItem("authToken") &&
      !localStorage.getItem("user")
  );

  const [bookings, setBookings] = useState(() =>
    safeParse("userBookings", [])
  );

  const [likedProperties] = useState(() => {
    const liked = safeParse("likedProperties", []);

    return new Set(Array.isArray(liked) ? liked : []);
  });

  // ==================================================
  // LOAD USER PROFILE
  // ==================================================

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);

      try {
        const profile = await fetchUserProfile();

        setUser(profile);
        setIsLoggedIn(true);

        localStorage.setItem("user", JSON.stringify(profile));
      } catch (error) {
        console.error("Profile loading error:", error);

        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        setUser(null);
        setIsLoggedIn(false);

        navigate("/login", {
          replace: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // ==================================================
  // LOAD BOOKINGS
  // ==================================================

  useEffect(() => {
    const loadBookings = () => {
      const storedBookings = safeParse("userBookings", []);

      setBookings(
        Array.isArray(storedBookings) ? storedBookings : []
      );
    };

    loadBookings();

    window.addEventListener("storage", loadBookings);

    return () => {
      window.removeEventListener("storage", loadBookings);
    };
  }, []);

  // ==================================================
  // USER NAME
  // ==================================================

  const profileName = useMemo(() => {
    if (user?.name) {
      return user.name;
    }

    const fullName =
      `${user?.firstname || ""} ${user?.lastname || ""}`.trim();

    return fullName || "Traveler";
  }, [user]);

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");

    setIsLoggedIn(false);
    setUser(null);
    setBookings([]);

    navigate("/login", {
      replace: true,
    });
  };

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = () => {
    navigate("/login");
  };

  // ==================================================
  // REGISTER
  // ==================================================

  const handleRegister = () => {
    navigate("/register");
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
              <User size={30} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Loading your profile...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we fetch your account.
            </p>

            <div className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // NOT LOGGED IN
  // ==================================================

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-800 to-indigo-950 text-white shadow-xl shadow-blue-200">
              <User size={30} />
            </div>

            <div className="mb-2 flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-yellow-500" />

              <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-800">
                FastBooking
              </span>

              <Sparkles size={16} className="text-yellow-500" />
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900">
              My Account
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
              Sign in to access your bookings, favorites, payments,
              and account settings.
            </p>
          </div>

          {/* Login / Register */}
          <div className="grid gap-6 md:grid-cols-2">

            {/* Login */}
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-800 transition group-hover:bg-blue-800 group-hover:text-white">
                <LogIn size={30} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to manage your reservations, view your trips,
                and access your saved properties.
              </p>

              <button
                type="button"
                onClick={handleLogin}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-800 hover:to-indigo-950"
              >
                Sign In
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Register */}
            <div className="group rounded-3xl border border-yellow-200 bg-white p-8 text-center shadow-lg shadow-yellow-100/50 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600 transition group-hover:bg-yellow-500 group-hover:text-white">
                <UserPlus size={30} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                New to FastBooking?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Create an account to book amazing properties and
                enjoy a faster booking experience.
              </p>

              <button
                type="button"
                onClick={handleRegister}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-yellow-100 transition hover:from-yellow-400 hover:to-yellow-500"
              >
                Create Account
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Why Create an Account?
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Everything you need for a better booking experience.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Benefit
                icon={<Calendar size={24} />}
                title="Easy Booking"
                description="View, manage, and track all your reservations in one place."
              />

              <Benefit
                icon={<Heart size={24} />}
                title="Save Favorites"
                description="Keep your favorite hotels and properties ready for your next trip."
              />

              <Benefit
                icon={<ShieldCheck size={24} />}
                title="Secure Checkout"
                description="Enjoy a secure and reliable booking experience."
              />
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==================================================
  // LOGGED-IN ACCOUNT
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* PROFILE HEADER */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white shadow-xl">
          <div className="relative overflow-hidden p-6 sm:p-8">

            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-400/10" />

            <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-yellow-400/5" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-yellow-400 shadow-lg ring-1 ring-white/20 backdrop-blur">
                  <User size={30} />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles size={15} className="text-yellow-400" />

                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                      FastBooking Account
                    </span>
                  </div>

                  <h1 className="text-2xl font-extrabold sm:text-3xl">
                    Welcome back, {profileName}!
                  </h1>

                  <p className="mt-1 text-sm text-blue-200">
                    {user?.email || "Welcome to your account"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <LogOut size={17} />
                Sign Out
              </button>

            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">

          <StatCard
            icon={<ShieldCheck size={22} />}
            label="Profile Status"
            value="Active"
            description="Your account is ready for bookings."
            primary
          />

          <StatCard
            icon={<Calendar size={22} />}
            label="Trips Saved"
            value={bookings.length}
            description="Upcoming and recent stays"
          />

          <StatCard
            icon={<Heart size={22} />}
            label="Favorites"
            value={likedProperties.size}
            description="Saved property picks"
          />

        </div>

        {/* MAIN */}
        <div className="grid gap-8 lg:grid-cols-4">

          {/* SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/50 lg:sticky lg:top-6">

              <div className="mb-4 px-3 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Account Menu
                </p>
              </div>

              <nav className="space-y-1">

                <AccountLink
                  to="/account/bookings"
                  icon={<Calendar size={19} />}
                  text="My Bookings"
                />

                <AccountLink
                  to="/account/favorites"
                  icon={<Heart size={19} />}
                  text="Favorites"
                />

                <AccountLink
                  to="/account/payments"
                  icon={<CreditCard size={19} />}
                  text="Payment Methods"
                />

                <AccountLink
                  to="/account/settings"
                  icon={<Settings size={19} />}
                  text="Account Settings"
                />

              </nav>

              <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 text-white">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Member Benefits
                    </p>

                    <p className="text-xs text-slate-500">
                      Exclusive FastBooking deals
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-3">

            {/* BOOKINGS */}
            <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    My Bookings
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage your upcoming and previous stays.
                  </p>
                </div>

                <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800 sm:flex">
                  <Calendar size={21} />
                </div>
              </div>

              {bookings.length === 0 ? (
                <EmptyState
                  icon={<Calendar size={30} />}
                  title="No bookings yet"
                  description="You haven't made any reservations. Start exploring hotels and plan your next stay."
                  buttonText="Start Booking"
                  onClick={() => navigate("/book")}
                />
              ) : (
                <div className="space-y-5">
                 {bookings.map((booking, index) => (
  <BookingCard
    key={`${booking.id || booking._id || "booking"}-${index}`}
    booking={booking}
    navigate={navigate}
  />
))}
                </div>
              )}

            </section>

            {/* FAVORITES */}
            <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                  <Heart size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Favorite Properties
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your saved hotel selections.
                  </p>
                </div>

              </div>

              {likedProperties.size === 0 ? (
                <EmptyState
                  icon={<Heart size={30} />}
                  title="No favorite properties yet"
                  description="Start exploring properties and click the heart icon to save your favorites."
                  buttonText="Explore Properties"
                  onClick={() => navigate("/")}
                />
              ) : (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                  <div className="flex items-center gap-3">

                    <CheckCircle
                      size={22}
                      className="text-yellow-600"
                    />

                    <p className="text-sm text-slate-700">
                      You have{" "}
                      <strong>{likedProperties.size}</strong>{" "}
                      favorite propert
                      {likedProperties.size === 1 ? "y" : "ies"}.
                    </p>

                  </div>
                </div>
              )}

            </section>

            {/* QUICK ACTIONS */}
            <div className="grid gap-5 md:grid-cols-3">

              <QuickAction
                icon={<Hotel size={25} />}
                title="Book a Hotel"
                value={bookings.length}
                label="Total Bookings"
                onClick={() => navigate("/book")}
              />

              <QuickAction
                icon={<Heart size={25} />}
                title="Favorites"
                value={likedProperties.size}
                label="Saved Properties"
                onClick={() => navigate("/account/favorites")}
              />

              <QuickAction
                icon={<Settings size={25} />}
                title="Profile"
                value="Manage"
                label="Account Settings"
                onClick={() => navigate("/account/settings")}
              />

            </div>

          </main>
        </div>

      </div>
    </div>
  );
};

// ==================================================
// BENEFIT
// ==================================================

const Benefit = ({ icon, title, description }) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center transition hover:-translate-y-1 hover:shadow-md">

      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
        {icon}
      </div>

      <h3 className="font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
};

// ==================================================
// STAT CARD
// ==================================================

const StatCard = ({
  icon,
  label,
  value,
  description,
  primary = false,
}) => {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-lg ${
        primary
          ? "border-blue-800 bg-gradient-to-br from-blue-950 to-blue-800 text-white shadow-blue-200/60"
          : "border-slate-200 bg-white text-slate-900 shadow-slate-200/50"
      }`}
    >

      <div className="flex items-start justify-between gap-4">

        <div>
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              primary ? "text-blue-200" : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <h3 className="mt-2 text-2xl font-extrabold">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            primary
              ? "bg-white/10 text-yellow-400"
              : "bg-blue-50 text-blue-800"
          }`}
        >
          {icon}
        </div>

      </div>

      <p
        className={`mt-3 text-sm ${
          primary ? "text-blue-200" : "text-slate-500"
        }`}
      >
        {description}
      </p>

    </div>
  );
};

// ==================================================
// SIDEBAR LINK
// ==================================================

const AccountLink = ({ to, icon, text }) => {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-800"
    >

      <span className="text-blue-700">
        {icon}
      </span>

      <span>{text}</span>

      <ArrowRight
        size={15}
        className="ml-auto opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
      />

    </Link>
  );
};

// ==================================================
// EMPTY STATE
// ==================================================

const EmptyState = ({
  icon,
  title,
  description,
  buttonText,
  onClick,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-800 hover:to-indigo-950"
      >
        {buttonText}
        <ArrowRight size={17} />
      </button>

    </div>
  );
};

// ==================================================
// QUICK ACTION
// ==================================================

const QuickAction = ({
  icon,
  title,
  value,
  label,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/40 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
    >

      <div className="flex items-center justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800 transition group-hover:bg-blue-800 group-hover:text-white">
          {icon}
        </div>

        <ArrowRight
          size={18}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700"
        />

      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-2xl font-extrabold text-blue-800">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {label}
      </p>

    </button>
  );
};

// ==================================================
// BOOKING CARD
// ==================================================

const BookingCard = ({ booking, navigate }) => {
  const bookingId =
    booking.id ||
    booking._id ||
    "N/A";

  const checkIn =
    booking.checkIn ||
    booking.checkInDate;

  const checkOut =
    booking.checkOut ||
    booking.checkOutDate;

  const adults =
    booking.guests?.adults ??
    booking.numberOfGuests ??
    1;

  const children =
    booking.guests?.children ??
    0;

  const rooms =
    booking.guests?.rooms ??
    booking.numberOfRooms ??
    1;

  const propertyName =
    booking.property ||
    booking.propertyName ||
    booking.hotelName ||
    "Hotel Reservation";

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md">

      {/* Booking Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2">

            <CheckCircle
              size={18}
              className="text-green-600"
            />

            <h3 className="font-bold text-slate-900">
              {propertyName}
            </h3>

          </div>

          <p className="mt-1 text-xs text-slate-400">
            Booking ID:{" "}
            <span className="font-mono text-slate-600">
              {bookingId}
            </span>
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
          <CheckCircle size={14} />
          Confirmed
        </span>

      </div>

      {/* Booking Details */}
      <div className="grid gap-4 p-5 md:grid-cols-3">

        <BookingDetail
          icon={<Calendar size={17} />}
          label="Check-in"
          value={formatDate(checkIn)}
        />

        <BookingDetail
          icon={<Clock size={17} />}
          label="Check-out"
          value={formatDate(checkOut)}
        />

        <BookingDetail
          icon={<User size={17} />}
          label="Guests"
          value={`${adults} adult${
            adults !== 1 ? "s" : ""
          }${
            children > 0
              ? `, ${children} children`
              : ""
          }`}
          extra={`${rooms} room${
            rooms !== 1 ? "s" : ""
          }`}
        />

      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">

        <div className="text-xs text-slate-400">
          {booking.bookedAt && (
            <span>
              Booked on{" "}
              {formatDate(booking.bookedAt)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/account/bookings/${bookingId}`
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            View Details
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/account/bookings/${bookingId}/modify`
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
          >
            Modify
          </button>

        </div>
      </div>

    </div>
  );
};

// ==================================================
// BOOKING DETAIL
// ==================================================

const BookingDetail = ({
  icon,
  label,
  value,
  extra,
}) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-blue-700">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-bold text-slate-800">
        {value}
      </p>

      {extra && (
        <p className="mt-1 text-xs text-slate-400">
          {extra}
        </p>
      )}

    </div>
  );
};

export default UserAccount;
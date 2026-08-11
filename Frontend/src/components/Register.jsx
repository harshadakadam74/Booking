import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
} from "lucide-react";

import {
  setUser,
  setToken,
  setError,
  setLoading,
} from "../authSlice";

import { registerUser } from "../services/authApi";
import { toast } from "react-toastify";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE REGISTER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.mobile.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Password length
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    // Mobile validation
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        mobile: formData.mobile,
      });

      // Save authentication data
      if (response?.jwt) {
        dispatch(setToken(response.jwt));
        localStorage.setItem("authToken", response.jwt);
      }

      if (response?.user) {
        dispatch(setUser(response.user));
        localStorage.setItem(
          "user",
          JSON.stringify(response.user)
        );
      }

      toast.success("Registration successful!");

      navigate("/");
    } catch (error) {
      const errorMsg =
        error?.message || "Registration failed. Please try again.";

      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC]">

      {/* =================================================
          TOP BLUE HEADER
      ================================================= */}

      <div className="relative overflow-hidden bg-[#082B5C]">

        {/* Gold Glow */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#E3AE32]/10 blur-3xl" />

        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#C58A18]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-5">

          <Link
            to="/"
            className="inline-flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
              <UserPlus
                size={22}
                className="text-[#C58A18]"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold text-white">
                Fast<span className="text-[#E3AE32]">Booking</span>
              </h1>

              <p className="text-[10px] tracking-wider text-blue-200">
                BOOK • STAY • ENJOY
              </p>
            </div>
          </Link>

        </div>
      </div>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 sm:px-6">

        {/* Background Glow */}

        <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-[#E3AE32]/10 blur-3xl" />

        <div className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-[#082B5C]/10 blur-3xl" />

        {/* =================================================
            REGISTER CARD
        ================================================= */}

        <div className="relative z-10 w-full max-w-lg">

          <div className="overflow-hidden rounded-3xl border border-[#E3AE32]/30 bg-white shadow-[0_20px_60px_rgba(8,43,92,0.15)]">

            {/* Gold Top Line */}

            <div className="h-1.5 bg-[#C58A18]" />

            <div className="p-6 sm:p-8">

              {/* =================================================
                  TITLE
              ================================================= */}

              <div className="mb-7 text-center">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF8E7]">

                  <UserPlus
                    size={30}
                    className="text-[#C58A18]"
                  />

                </div>

                <h2 className="text-3xl font-bold text-[#082B5C]">
                  Create Account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Join FastBooking and start your journey
                </p>

              </div>

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* FULL NAME */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[#082B5C]"
                  >
                    Full Name
                  </label>

                  <div className="relative">

                    <User
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C58A18]"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-[#082B5C] outline-none transition placeholder:text-slate-400 focus:border-[#C58A18] focus:bg-white focus:ring-2 focus:ring-[#E3AE32]/20"
                    />

                  </div>
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#082B5C]"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C58A18]"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-[#082B5C] outline-none transition placeholder:text-slate-400 focus:border-[#C58A18] focus:bg-white focus:ring-2 focus:ring-[#E3AE32]/20"
                    />

                  </div>
                </div>

                {/* MOBILE */}

                <div>
                  <label
                    htmlFor="mobile"
                    className="mb-2 block text-sm font-semibold text-[#082B5C]"
                  >
                    Mobile Number
                  </label>

                  <div className="relative">

                    <Phone
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C58A18]"
                    />

                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter 10-digit mobile number"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-[#082B5C] outline-none transition placeholder:text-slate-400 focus:border-[#C58A18] focus:bg-white focus:ring-2 focus:ring-[#E3AE32]/20"
                    />

                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#082B5C]"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C58A18]"
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-[#082B5C] outline-none transition placeholder:text-slate-400 focus:border-[#C58A18] focus:bg-white focus:ring-2 focus:ring-[#E3AE32]/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-[#FFF8E7] hover:text-[#C58A18]"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Password must contain at least 6 characters.
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#082B5C]"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C58A18]"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-[#082B5C] outline-none transition placeholder:text-slate-400 focus:border-[#C58A18] focus:bg-white focus:ring-2 focus:ring-[#E3AE32]/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-[#FFF8E7] hover:text-[#C58A18]"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>
                </div>

                {/* SECURITY MESSAGE */}

                <div className="flex items-start gap-3 rounded-xl border border-[#E3AE32]/25 bg-[#FFF9EC] p-3">

                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-[#C58A18]"
                  />

                  <p className="text-xs leading-5 text-[#082B5C]">
                    Your information is protected and
                    securely stored with FastBooking.
                  </p>

                </div>

                {/* REGISTER BUTTON */}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#082B5C] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#082B5C]/20 transition duration-300 hover:bg-[#C58A18] hover:shadow-[#C58A18]/30 active:scale-[0.98]"
                >
                  <UserPlus size={19} />
                  Create Account
                </button>

              </form>

              {/* =================================================
                  LOGIN
              ================================================= */}

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">

                <p className="text-sm text-slate-500">
                  Already have an account?
                </p>

                <Link
                  to="/login"
                  className="mt-1 inline-block font-semibold text-[#082B5C] transition hover:text-[#C58A18]"
                >
                  Login to FastBooking
                </Link>

              </div>

            </div>
          </div>

          {/* Bottom text */}

          <p className="mt-5 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} FastBooking. All
            rights reserved.
          </p>

        </div>
      </div>
    </div>
  );
}
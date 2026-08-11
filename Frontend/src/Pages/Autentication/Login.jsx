import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import {
  loginUser,
  fetchUserProfile,
} from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --------------------------------------------------
  // REDIRECT IF ALREADY LOGGED IN
  // --------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      navigate("/account", { replace: true });
    }
  }, [navigate]);

  // --------------------------------------------------
  // HANDLE INPUT
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
        general: "",
      }));
    }
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!data?.jwt) {
        throw new Error(
          "Login failed. Authentication token was not received."
        );
      }

      // Save token
      localStorage.setItem("authToken", data.jwt);

      // Save user
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      } else {
        const profile = await fetchUserProfile(data.jwt);

        localStorage.setItem(
          "user",
          JSON.stringify(profile)
        );
      }

      // Redirect
      navigate("/account", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Invalid email or password. Please try again.";

      setErrors({
        general:
          typeof message === "string"
            ? message
            : "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF9EC] px-4 pb-12 pt-28 sm:px-6">
      {/* Decorative background */}
      <div className="pointer-events-none fixed left-0 top-20 h-72 w-72 rounded-full bg-[#C58A18]/10 blur-3xl" />

      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-[#082B5C]/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#E3AE32]/20 bg-white shadow-2xl lg:grid-cols-2">

        {/* =================================================
            LEFT BRAND PANEL
        ================================================== */}

        <div className="relative hidden overflow-hidden bg-[#082B5C] p-10 text-white lg:flex lg:flex-col lg:justify-between">

          {/* Gold decoration */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#E3AE32]/20 blur-3xl" />

          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative">

            {/* Logo */}
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C58A18] shadow-lg">
                <Sparkles size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  FastBooking
                </h2>

                <p className="text-xs text-blue-200">
                  Smart stays. Better journeys.
                </p>
              </div>
            </div>

            <div className="max-w-md">

              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E3AE32]/30 bg-white/10 px-4 py-2 text-xs font-semibold text-[#E3AE32] backdrop-blur">
                <Sparkles size={14} />
                Welcome Back
              </span>

              <h1 className="text-4xl font-bold leading-tight">
                Your next
                <span className="block text-[#E3AE32]">
                  adventure starts here.
                </span>
              </h1>

              <p className="mt-5 leading-7 text-blue-100">
                Sign in to manage your bookings, save your
                favorite hotels and discover better stays
                with FastBooking.
              </p>
            </div>
          </div>

          {/* Features */}

          <div className="relative mt-10 space-y-4">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2">
                <ShieldCheck
                  size={18}
                  className="text-[#E3AE32]"
                />
              </div>

              <span className="text-sm text-blue-100">
                Secure account & booking management
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2">
                <Sparkles
                  size={18}
                  className="text-[#E3AE32]"
                />
              </div>

              <span className="text-sm text-blue-100">
                Personalized travel experience
              </span>
            </div>

          </div>
        </div>

        {/* =================================================
            RIGHT LOGIN PANEL
        ================================================== */}

        <div className="p-6 sm:p-8 md:p-10">

          {/* Mobile logo */}

          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#082B5C] text-[#E3AE32]">
              <Sparkles size={22} />
            </div>

            <div>
              <h2 className="font-bold text-[#082B5C]">
                FastBooking
              </h2>

              <p className="text-xs text-slate-500">
                Smart stays. Better journeys.
              </p>
            </div>
          </div>

          {/* Heading */}

          <div className="mb-8">

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#C58A18]">
              Account Login
            </p>

            <h1 className="text-3xl font-bold text-[#082B5C]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to your FastBooking account to
              continue your journey.
            </p>

            <div className="mt-4 h-1 w-16 rounded-full bg-[#C58A18]" />
          </div>

          {/* General Error */}

          {errors.general && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-600">
                {errors.general}
              </p>
            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#082B5C]"
              >
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                    errors.email
                      ? "text-red-400"
                      : "text-slate-400"
                  }`}
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm text-[#082B5C] outline-none transition ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-[#C58A18] focus:bg-white"
                  }`}
                />

              </div>

              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-[#082B5C]"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#C58A18] transition hover:text-[#082B5C]"
                >
                  Forgot Password?
                </Link>

              </div>

              <div className="relative">

                <Lock
                  size={18}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                    errors.password
                      ? "text-red-400"
                      : "text-slate-400"
                  }`}
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-12 text-sm text-[#082B5C] outline-none transition ${
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-[#C58A18] focus:bg-white"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#082B5C]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.password}
                </p>
              )}

            </div>

            {/* Remember */}

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-[#082B5C]"
              />
              Remember me
            </label>

            {/* Login Button */}

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#082B5C] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition duration-300 hover:bg-[#0B3B7A] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

          </form>

          {/* Divider */}

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs text-slate-400">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Register */}

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-[#C58A18] transition hover:text-[#082B5C]"
            >
              Create Account
            </Link>
          </p>

          {/* Bottom note */}

          <div className="mt-7 rounded-2xl border border-[#E3AE32]/20 bg-[#FFF9EC] p-4 text-center">
            <p className="text-xs leading-5 text-slate-500">
              By signing in, you agree to FastBooking's
              terms and privacy policy.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
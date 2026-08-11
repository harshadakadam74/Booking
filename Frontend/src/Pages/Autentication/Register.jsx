import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  registerUser,
  fetchUserProfile,
} from "../../services/authService";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      navigate("/account");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms =
        "You must agree to the terms and conditions";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        mobile: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const data = await registerUser(payload);

      if (!data?.jwt) {
        throw new Error("Registration succeeded but no authentication token was received.");
      }

      localStorage.setItem("authToken", data.jwt);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        const profile = await fetchUserProfile(data.jwt);
        localStorage.setItem("user", JSON.stringify(profile));
      }

      navigate("/account");
    } catch (error) {
      console.error("Registration error:", error);

      setErrors({
        general:
          error?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white px-4 py-3 pl-11 pr-10 text-sm text-slate-900 outline-none transition ${
      errors[field]
        ? "border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-yellow-50/30 px-4 pb-12 pt-28 sm:px-6">

      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-2xl shadow-blue-100/50 lg:grid-cols-[0.85fr_1.15fr]">

        {/* LEFT PREMIUM PANEL */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">

          {/* Decorative circles */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-400/10" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-blue-400/10" />

          <div className="relative">

            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200">
              <Sparkles size={16} />
              FastBooking
            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Your next
              <span className="block text-yellow-300">
                unforgettable stay
              </span>
              starts here.
            </h2>

            <p className="mt-5 leading-7 text-blue-100">
              Create your FastBooking account and discover amazing hotels,
              resorts and stays at the best available prices.
            </p>

          </div>

          <div className="relative mt-12 space-y-4">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2">
                <CheckCircle2
                  size={19}
                  className="text-yellow-300"
                />
              </div>
              <span className="text-sm text-blue-50">
                Easy and secure booking
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2">
                <CheckCircle2
                  size={19}
                  className="text-yellow-300"
                />
              </div>
              <span className="text-sm text-blue-50">
                Manage all your trips in one place
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2">
                <CheckCircle2
                  size={19}
                  className="text-yellow-300"
                />
              </div>
              <span className="text-sm text-blue-50">
                Exclusive travel experiences
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="p-6 sm:p-8 lg:p-10">

          {/* Mobile Brand */}
          <div className="mb-6 flex items-center justify-center lg:hidden">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 font-bold text-blue-700">
              <Sparkles size={17} className="text-yellow-600" />
              FastBooking
            </div>
          </div>

          {/* Header */}
          <div className="mb-7 text-center">

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Join us to start booking amazing properties
            </p>

          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-600">
                {errors.general}
              </p>
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >

            {/* First Name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                First Name
              </label>

              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClass("firstName")}
                />

                <User
                  size={18}
                  className="absolute left-3.5 top-3.5 text-blue-500"
                />
              </div>

              {errors.firstName && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Last Name
              </label>

              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClass("lastName")}
                />

                <User
                  size={18}
                  className="absolute left-3.5 top-3.5 text-blue-500"
                />
              </div>

              {errors.lastName && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass("email")}
                />

                <Mail
                  size={18}
                  className="absolute left-3.5 top-3.5 text-blue-500"
                />
              </div>

              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Phone Number
              </label>

              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass("phone")}
                />

                <Phone
                  size={18}
                  className="absolute left-3.5 top-3.5 text-yellow-600"
                />
              </div>

              {errors.phone && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass("password")}
                />

                <Lock
                  size={18}
                  className="absolute left-3.5 top-3.5 text-blue-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-3 text-slate-400 transition hover:text-blue-600"
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
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass("confirmPassword")}
                />

                <Lock
                  size={18}
                  className="absolute left-3.5 top-3.5 text-blue-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-3 text-slate-400 transition hover:text-blue-600"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="sm:col-span-2">

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-blue-200">

                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-blue-600"
                />

                <span className="text-sm text-slate-600">
                  I agree to the{" "}
                  <span className="font-semibold text-blue-700">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-blue-700">
                    Privacy Policy
                  </span>
                </span>

              </label>

              {errors.agreeToTerms && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.agreeToTerms}
                </p>
              )}

            </div>

            {/* Submit */}
            <div className="sm:col-span-2">

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Create Account
                  </>
                )}
              </button>

            </div>

          </form>

          {/* Security */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={15} className="text-yellow-600" />
            Your information is securely protected
          </div>

          {/* Footer */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">

            <p className="text-sm text-slate-500">
              Already have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-blue-700 transition hover:text-yellow-600"
              >
                Sign in
              </button>
            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
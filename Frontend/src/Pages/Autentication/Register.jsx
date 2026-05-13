import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerUser } from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
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

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
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
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
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
        name: `${formData.firstName} ${formData.lastName}`,
        mobile: formData.phone,
        email: formData.email,
        password: formData.password,
      };

      const data = await registerUser(payload);
      localStorage.setItem('authToken', data.jwt);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      navigate('/account');
    } catch (error) {
      setErrors({ general: error.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 py-8">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-lg">

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center">
          Create Account
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mb-6 text-center">
          Join us to start booking amazing properties
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none text-sm pl-9 ${
                    errors.firstName ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                  }`}
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <User
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
              </div>
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none text-sm pl-9 ${
                    errors.lastName ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                  }`}
                  value={formData.lastName}
                  onChange={handleChange}
                />
                <User
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
              </div>
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                className={`w-full px-4 py-2.5 border rounded-lg outline-none text-sm pl-9 ${
                  errors.email ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              <Mail
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                placeholder="+1 (555) 123-4567"
                className={`w-full px-4 py-2.5 border rounded-lg outline-none text-sm pl-9 ${
                  errors.phone ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
                value={formData.phone}
                onChange={handleChange}
              />
              <Phone
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                className={`w-full px-4 py-2.5 border rounded-lg outline-none text-sm pl-9 pr-9 ${
                  errors.password ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              <Lock
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                className={`w-full px-4 py-2.5 border rounded-lg outline-none text-sm pl-9 pr-9 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <Lock
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreeToTerms"
              id="agreeToTerms"
              className="mt-1"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
              I agree to the{" "}
              <span className="text-blue-600 cursor-pointer">Terms & Conditions</span>{" "}
              and{" "}
              <span className="text-blue-600 cursor-pointer">Privacy Policy</span>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-red-500 text-xs">
              {errors.agreeToTerms}
            </p>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 mt-6 rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

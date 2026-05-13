import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginUser, fetchUserProfile } from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('authToken', data.jwt);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        const profile = await fetchUserProfile(data.jwt);
        localStorage.setItem('user', JSON.stringify(profile));
      }

      navigate('/account');
    } catch (error) {
      setErrors({ general: error.message || "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-lg">

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center">
          Welcome Back
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mb-6 text-center">
          Sign in to your account to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm sm:text-base font-medium mb-1">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg outline-none text-sm sm:text-base pl-10 ${
                  errors.email ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              <Mail
                size={18}
                className="absolute left-3 top-2.5 sm:top-3 text-gray-400"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm sm:text-base font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg outline-none text-sm sm:text-base pl-10 pr-10 ${
                  errors.password ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              <Lock
                size={18}
                className="absolute left-3 top-2.5 sm:top-3 text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Forgot Password */}
        <div className="text-center mt-4">
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            Forgot your password?
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-5 sm:my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-xs sm:text-sm text-gray-500">
            or continue with
          </span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Social Buttons */}
        <div className="flex justify-center gap-4 sm:gap-6">
          <button className="border p-3 rounded-lg w-12 sm:w-14 text-sm hover:bg-gray-50 transition">
            G
          </button>
          <button className="border p-3 rounded-lg w-12 sm:w-14 text-sm hover:bg-gray-50 transition">
            A
          </button>
          <button className="border p-3 rounded-lg w-12 sm:w-14 text-sm hover:bg-gray-50 transition">
            F
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-[11px] sm:text-xs text-gray-500 text-center mt-6">
          By signing in, you agree with our{" "}
          <span className="text-blue-600 cursor-pointer">
            Terms & Conditions
          </span>{" "}
          and{" "}
          <span className="text-blue-600 cursor-pointer">
            Privacy Statement
          </span>.
        </p>
      </div>
    </div>
  );
};

export default Login;

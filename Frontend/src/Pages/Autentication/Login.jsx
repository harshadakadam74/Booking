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
  <div className="min-h-screen bg-gray-100">

    {/* Add spacing for fixed header */}
    <div className="pt-28 flex justify-center px-4 sm:px-6">

      {/* Main Container */}
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-lg">

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
            <label className="block text-sm font-medium mb-1">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                className={`w-full px-4 py-2.5 border rounded-lg outline-none text-sm pl-10 ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
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
                placeholder="Enter your password"
                className={`w-full px-4 py-2.5 border rounded-lg outline-none text-sm pl-10 pr-10 ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 flex justify-center items-center gap-2"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-4">
          <button className="text-blue-600 text-sm">
            Forgot your password?
          </button>
        </div>

        <div className="text-center mt-5">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer"
            >
              Sign up
            </span>
          </p>
        </div>

      </div>
    </div>
  </div>
);
};

export default Login;

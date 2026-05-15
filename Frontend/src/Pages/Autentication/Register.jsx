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
  <div className="min-h-screen bg-gray-100">

    {/* Space for header */}
    <div className="pt-24 flex justify-center px-4">

      {/* Wider Container */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg">

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Create Account
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Join us to start booking amazing properties
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* First Name */}
          <div>
            <label className="text-sm font-medium">First Name</label>
            <div className="relative">
              <input
                type="text"
                name="firstName"
                className="w-full px-3 py-2 border rounded-lg pl-9 text-sm"
                value={formData.firstName}
                onChange={handleChange}
              />
              <User className="absolute left-2 top-2.5 text-gray-400" size={16} />
            </div>
            {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <div className="relative">
              <input
                type="text"
                name="lastName"
                className="w-full px-3 py-2 border rounded-lg pl-9 text-sm"
                value={formData.lastName}
                onChange={handleChange}
              />
              <User className="absolute left-2 top-2.5 text-gray-400" size={16} />
            </div>
            {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 border rounded-lg pl-9 text-sm"
                value={formData.email}
                onChange={handleChange}
              />
              <Mail className="absolute left-2 top-2.5 text-gray-400" size={16} />
            </div>
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium">Phone</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                className="w-full px-3 py-2 border rounded-lg pl-9 text-sm"
                value={formData.phone}
                onChange={handleChange}
              />
              <Phone className="absolute left-2 top-2.5 text-gray-400" size={16} />
            </div>
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full px-3 py-2 border rounded-lg pl-9 pr-9 text-sm"
                value={formData.password}
                onChange={handleChange}
              />
              <Lock className="absolute left-2 top-2.5 text-gray-400" size={16} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="w-full px-3 py-2 border rounded-lg pl-9 pr-9 text-sm"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <Lock className="absolute left-2 top-2.5 text-gray-400" size={16} />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2.5"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
          </div>

          {/* Terms (full width) */}
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            <span className="text-sm">
              I agree to Terms & Conditions
            </span>
          </div>

          {errors.agreeToTerms && (
            <p className="text-red-500 text-xs md:col-span-2">
              {errors.agreeToTerms}
            </p>
          )}

          {/* Button full width */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </div>

        </form>

        {/* Footer */}
        <p className="text-center text-sm mt-5">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer"
          >
            Sign in
          </span>
        </p>

      </div>
    </div>
  </div>
);
};

export default Register;

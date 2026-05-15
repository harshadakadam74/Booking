import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser, setToken, setError, setLoading } from "../authSlice";
import { loginUser } from "../services/authApi";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
      const response = await loginUser(email, password);
      dispatch(setToken(response.jwt));
      dispatch(setUser(response.user));
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      const errorMsg = error.message || "Login failed";
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

return (
  <div className="min-h-screen flex">

    {/* LEFT SIDE (Image) */}
    <div className="hidden md:flex w-1/2 relative">
      <img
        src="https://images.unsplash.com/photo-1501117716987-c8e1ecb21041"
        alt="travel"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-blue-900/50"></div>

      <div className="absolute bottom-10 left-10 text-white">
        <h1 className="text-3xl font-bold">Welcome Back ✈</h1>
        <p className="text-sm mt-2">
          Discover amazing places around the world
        </p>
      </div>
    </div>

    {/* RIGHT SIDE (Form) */}
    <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 px-6">

      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Sign In
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right text-sm">
            <a href="#" className="text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>

      </div>
    </div>
  </div>
);
}

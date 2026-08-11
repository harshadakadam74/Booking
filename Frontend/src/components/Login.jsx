import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setUser,
  setToken,
  setError,
  setLoading,
} from "../authSlice";
import { loginUser } from "../services/authApi";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector((state) => state.auth?.loading || false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await loginUser(email, password);

      if (!response?.jwt || !response?.user) {
        throw new Error("Invalid login response");
      }

      // Redux
      dispatch(setToken(response.jwt));
      dispatch(setUser(response.user));

      // Local Storage
      localStorage.setItem("token", response.jwt);
      localStorage.setItem("user", JSON.stringify(response.user));

      toast.success("Login successful!");

      navigate("/");
    } catch (error) {
      console.error("Login Error:", error);

      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password";

      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] flex flex-col">

      {/* =====================================================
          TOP BRAND BAR
      ====================================================== */}
      <header className="h-[76px] bg-white border-b border-[#e6ebf2] flex items-center justify-between px-6 md:px-12 shadow-sm">

        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-lg bg-[#0b376d] flex items-center justify-center shadow-sm">
            <span className="text-lg">✈</span>
          </div>

          <div className="text-left">
            <h1 className="text-[#0b376d] font-bold text-lg leading-none">
              FastBooking
            </h1>

            <p className="text-[8px] text-[#c99100] font-semibold tracking-[2px] uppercase">
              Travel & Stay
            </p>
          </div>
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-6 md:gap-10">

          <button
            onClick={() => navigate("/")}
            className="
              hidden sm:block
              text-[#243b5a]
              font-semibold
              hover:text-[#c99100]
              transition
            "
          >
            Home
          </button>

          <span className="text-gray-300 hidden sm:block">|</span>

          <span className="text-[#243b5a] text-sm md:text-base">
            Don't have an account?
          </span>

          <button
            onClick={() => navigate("/register")}
            className="
              bg-[#0b376d]
              hover:bg-[#082c58]
              text-white
              px-5 md:px-7
              py-2.5
              rounded-lg
              font-semibold
              shadow-md
              transition-all
              duration-300
              border-b-2
              border-[#d6a21d]
            "
          >
            Register
          </button>

        </div>
      </header>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="flex-1 flex items-center justify-center px-5 py-10 md:py-14">

        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 lg:gap-16 items-center">


          {/* =================================================
              LEFT CONTENT
          ================================================== */}
          <div className="hidden md:block">

            {/* Gold label */}
            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-[3px] bg-[#d49a00] rounded-full"></div>

              <span className="
                text-[#c18a00]
                text-sm
                font-bold
                tracking-[3px]
                uppercase
              ">
                Welcome Back
              </span>

            </div>


            {/* Heading */}
            <h2 className="
              text-4xl
              lg:text-5xl
              font-bold
              text-[#0b376d]
              leading-tight
            ">
              Your next
              <br />

              <span className="text-[#c99100]">
                journey starts here.
              </span>
            </h2>


            {/* Description */}
            <p className="
              text-[#5b6b80]
              text-lg
              leading-relaxed
              mt-6
              max-w-lg
            ">
              Sign in to FastBooking and discover beautiful
              hotels, comfortable stays and unforgettable
              destinations around the world.
            </p>


            {/* Gold line */}
            <div className="flex items-center gap-3 mt-8">

              <div className="w-16 h-1 bg-[#d49a00] rounded-full"></div>

              <div className="w-2 h-2 rounded-full bg-[#d49a00]"></div>

              <div className="w-8 h-[2px] bg-[#d49a00]/40 rounded-full"></div>

            </div>


            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mt-10 max-w-lg">

              <div className="
                bg-white
                border
                border-[#e1e8f0]
                rounded-2xl
                p-5
                shadow-sm
              ">
                <div className="
                  w-11
                  h-11
                  rounded-xl
                  bg-[#fff7e3]
                  flex
                  items-center
                  justify-center
                  mb-3
                ">
                  <span className="text-xl">🏨</span>
                </div>

                <h3 className="font-bold text-[#0b376d]">
                  Best Hotels
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Find comfortable stays
                </p>
              </div>


              <div className="
                bg-white
                border
                border-[#e1e8f0]
                rounded-2xl
                p-5
                shadow-sm
              ">
                <div className="
                  w-11
                  h-11
                  rounded-xl
                  bg-[#fff7e3]
                  flex
                  items-center
                  justify-center
                  mb-3
                ">
                  <span className="text-xl">✈️</span>
                </div>

                <h3 className="font-bold text-[#0b376d]">
                  Easy Booking
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Book your stay easily
                </p>
              </div>

            </div>

          </div>


          {/* =================================================
              LOGIN CARD
          ================================================== */}
          <div className="w-full max-w-md mx-auto">

            <div className="
              bg-white
              rounded-3xl
              border
              border-[#dfe7f0]
              shadow-[0_15px_45px_rgba(11,55,109,0.12)]
              overflow-hidden
            ">

              {/* Gold top border */}
              <div className="h-1.5 bg-[#d49a00]"></div>


              <div className="p-7 sm:p-9">


                {/* Logo */}
                <div className="text-center mb-8">

                  <div className="
                    inline-flex
                    items-center
                    justify-center
                    w-16
                    h-16
                    rounded-2xl
                    bg-[#0b376d]
                    shadow-lg
                    mb-4
                  ">
                    <span className="text-2xl">
                      ✈️
                    </span>
                  </div>


                  <h2 className="
                    text-3xl
                    font-bold
                    text-[#0b376d]
                  ">
                    Sign In
                  </h2>


                  <p className="
                    text-gray-500
                    text-sm
                    mt-2
                  ">
                    Login to continue your journey
                  </p>

                </div>


                {/* =================================================
                    FORM
                ================================================== */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >


                  {/* Email */}
                  <div>

                    <label
                      htmlFor="email"
                      className="
                        block
                        text-sm
                        font-semibold
                        text-[#243b5a]
                        mb-2
                      "
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="
                        w-full
                        px-4
                        py-3.5
                        rounded-xl
                        border
                        border-[#dce4ed]
                        bg-[#f8fafc]
                        text-[#243b5a]
                        placeholder-gray-400
                        outline-none
                        transition-all
                        duration-200
                        focus:bg-white
                        focus:border-[#0b376d]
                        focus:ring-4
                        focus:ring-[#0b376d]/10
                      "
                    />

                  </div>


                  {/* Password */}
                  <div>

                    <label
                      htmlFor="password"
                      className="
                        block
                        text-sm
                        font-semibold
                        text-[#243b5a]
                        mb-2
                      "
                    >
                      Password
                    </label>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="
                        w-full
                        px-4
                        py-3.5
                        rounded-xl
                        border
                        border-[#dce4ed]
                        bg-[#f8fafc]
                        text-[#243b5a]
                        placeholder-gray-400
                        outline-none
                        transition-all
                        duration-200
                        focus:bg-white
                        focus:border-[#0b376d]
                        focus:ring-4
                        focus:ring-[#0b376d]/10
                      "
                    />

                  </div>


                  {/* Forgot Password */}
                  <div className="flex justify-end">

                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          "Password reset feature coming soon."
                        )
                      }
                      className="
                        text-sm
                        font-semibold
                        text-[#0b376d]
                        hover:text-[#c99100]
                        transition
                      "
                    >
                      Forgot password?
                    </button>

                  </div>


                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      w-full
                      bg-[#0b376d]
                      hover:bg-[#082c58]
                      disabled:bg-[#7991ad]
                      text-white
                      py-3.5
                      rounded-xl
                      font-bold
                      shadow-lg
                      hover:shadow-xl
                      transition-all
                      duration-300
                      border-b-4
                      border-[#d49a00]
                      hover:border-[#e0aa18]
                      disabled:cursor-not-allowed
                    "
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>

                </form>


                {/* Divider */}
                <div className="
                  flex
                  items-center
                  gap-3
                  my-7
                ">

                  <div className="flex-1 h-px bg-[#e3e8ef]"></div>

                  <span className="
                    text-[10px]
                    font-bold
                    tracking-[1.5px]
                    text-gray-400
                  ">
                    NEW TO FASTBOOKING?
                  </span>

                  <div className="flex-1 h-px bg-[#e3e8ef]"></div>

                </div>


                {/* Register */}
                <p className="
                  text-center
                  text-sm
                  text-gray-600
                ">
                  Don't have an account?{" "}

                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="
                      text-[#0b376d]
                      font-bold
                      hover:text-[#c99100]
                      transition
                    "
                  >
                    Create Account
                  </button>

                </p>

              </div>

            </div>


            {/* Bottom text */}
            <p className="
              text-center
              text-xs
              text-gray-400
              mt-6
            ">
              © 2026 FastBooking. All rights reserved.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}
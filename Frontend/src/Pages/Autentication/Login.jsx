import { useState } from "react";
import { Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");

    const loginData = {
      email,
      loginType: "email",
    };

    console.log("🔐 Login Data:", loginData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded shadow">

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Sign in or create an account
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mb-6">
          You can sign in using your account to access our services.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm sm:text-base font-medium mb-1">
            Email address
          </label>

          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email address"
              className={`w-full px-4 py-2.5 sm:py-3 border rounded outline-none text-sm sm:text-base ${error ? "border-red-500" : "border-gray-300"
                }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Mail
              size={18}
              className="absolute right-3 top-2.5 sm:top-3 text-gray-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 mt-4 rounded font-semibold text-sm sm:text-base hover:bg-blue-700"
          >
            Continue with email
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5 sm:my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-xs sm:text-sm text-gray-500">
            or use one of these options
          </span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Social Buttons */}
        <div className="flex justify-center gap-4 sm:gap-6">
          <button className="border p-3 rounded w-12 sm:w-14 text-sm">G</button>
          <button className="border p-3 rounded w-12 sm:w-14 text-sm">A</button>
          <button className="border p-3 rounded w-12 sm:w-14 text-sm">F</button>
        </div>

        {/* Footer */}
        <p className="text-[11px] sm:text-xs text-gray-500 text-center mt-6">
          By signing in or creating an account, you agree with our{" "}
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

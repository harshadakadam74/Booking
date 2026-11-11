import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../services/authService";

const PasswordReset = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isReset = location.pathname === "/reset-password";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (isReset) {
        const token = searchParams.get("token");
        if (!token) throw new Error("The password reset link is missing its token.");
        await resetPassword({ token, newPassword: password, confirmPassword });
        setMessage("Your password has been reset. You can now sign in.");
      } else {
        await requestPasswordReset(email);
        setMessage("If an account exists for that email, a reset link will be sent.");
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to complete the request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">
          {isReset ? "Reset your password" : "Forgot your password?"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isReset
            ? "Choose a new password with at least 8 characters, an uppercase letter, a number, and a symbol."
            : "Enter your account email and we will send a password reset link."}
        </p>

        {message ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {message}
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {isReset ? (
              <>
                <label className="block text-sm font-medium text-slate-700">
                  New password
                  <input
                    className={inputClass}
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Confirm new password
                  <input
                    className={inputClass}
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                  />
                </label>
              </>
            ) : (
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  className={inputClass}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
            )}

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Please wait…" : isReset ? "Reset password" : "Send reset link"}
            </button>
          </form>
        )}

        <Link className="mt-6 inline-block text-sm font-semibold text-blue-700" to="/login">
          Back to sign in
        </Link>
      </section>
    </main>
  );
};

export default PasswordReset;

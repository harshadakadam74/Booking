import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { loginUser } from '../services/authService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      localStorage.removeItem('user');
    }

    if (token && user?.role === 'ADMIN') navigate('/admin', { replace: true });
    else if (token && user) navigate('/account', { replace: true });
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ email: email.trim(), password });
      if (response.user?.role !== 'ADMIN') {
        navigate('/account', { replace: true });
        return;
      }

      const requestedPath = location.state?.from?.pathname;
      navigate(requestedPath?.startsWith('/admin') ? requestedPath : '/admin', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-50 via-white to-amber-50 px-4 py-12">
      <section className="mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-gradient-to-r from-blue-950 to-blue-800 px-7 py-8 text-white">
          <div className="mb-4 inline-flex rounded-2xl bg-amber-400 p-3 text-blue-950"><ShieldCheck size={26} /></div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">FastBooking</p>
          <h1 className="mt-1 text-2xl font-extrabold">Administrator sign in</h1>
          <p className="mt-2 text-sm text-blue-100">Use your existing FastBooking admin account.</p>
        </div>

        <form onSubmit={submit} className="space-y-5 p-7">
          <label className="block text-sm font-semibold text-slate-700">
            Email address
            <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-100">
              <Mail size={17} className="text-slate-400" />
              <input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border-0 py-3 outline-none" />
            </span>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-100">
              <LockKeyhole size={17} className="text-slate-400" />
              <input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border-0 py-3 outline-none" />
            </span>
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60">
            {loading ? <LoaderCircle size={18} className="animate-spin" /> : <KeyRound size={18} />}
            {loading ? 'Signing in...' : 'Sign in securely'}
          </button>
          <Link to="/login" className="block text-center text-sm font-semibold text-blue-800 hover:underline">Go to customer sign in</Link>
        </form>
      </section>
    </main>
  );
};

export default AdminLogin;

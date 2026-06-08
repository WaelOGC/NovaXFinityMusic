import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Sign in to MyMusic" subtitle="Welcome back">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 12, padding: '12px' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <a href="/api/auth/google" className="btn btn-ghost" style={{ width: '100%', marginBottom: 16, justifyContent: 'center', gap: 10, textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '10px' }}>
        <GoogleIcon /> Continue with Google
      </a>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Sign up</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', display_name: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.email, form.password, form.display_name);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AuthLayout title="Create your account" subtitle="Start listening for free">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Name</label>
          <input className="input" type="text" placeholder="Your name" value={form.display_name} onChange={set('display_name')} />
        </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required />
        </div>
        <div className="form-group">
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="At least 6 characters" value={form.password} onChange={set('password')} minLength={6} required />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 12, padding: '12px' }} disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      <a href="/api/auth/google" className="btn btn-ghost" style={{ width: '100%', marginBottom: 16, justifyContent: 'center', gap: 10, textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '10px' }}>
        <GoogleIcon /> Sign up with Google
      </a>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>{title}</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{subtitle}</p>
        </div>
        <div className="card" style={{ padding: 28 }}>{children}</div>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-3)' }}>
          <Link to="/" style={{ color: 'var(--text-3)' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

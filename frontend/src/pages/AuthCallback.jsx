import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error('Google sign-in failed');
      navigate('/login');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      authAPI.me().then(({ data }) => {
        loginWithToken(token, data.user);
        toast.success('Signed in with Google!');
        navigate('/');
      }).catch(() => {
        toast.error('Authentication failed');
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Signing you in...</div>
      </div>
    </div>
  );
}

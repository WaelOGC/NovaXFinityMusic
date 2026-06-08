import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Crown, Check, X, Zap, Music, Download, Volume2 } from 'lucide-react';

export default function Premium() {
  const [billing, setBilling] = useState('yearly');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const plans = {
    monthly: { price: 4.99, period: 'month', save: null },
    yearly: { price: 39.99, period: 'year', save: 'Save 33%' },
  };

  const features = [
    { icon: Music, text: 'Access all Premium tracks', free: false, premium: true },
    { icon: Volume2, text: 'High quality audio', free: false, premium: true },
    { icon: Download, text: 'Offline listening', free: false, premium: true },
    { icon: Zap, text: 'Ad-free experience', free: false, premium: true },
    { icon: Music, text: 'Basic streaming', free: true, premium: true },
    { icon: Music, text: 'Search & browse', free: true, premium: true },
  ];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Crown size={28} style={{ color: 'var(--accent)' }} />
        </div>
        <h1 style={{ fontSize: 32, marginBottom: 10 }}>Upgrade to Premium</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Unlock the full Nova XFinity Music experience</p>
      </div>

      {/* Billing Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, gap: 4 }}>
          {['monthly', 'yearly'].map((b) => (
            <button key={b} onClick={() => setBilling(b)}
              style={{ padding: '8px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, background: billing === b ? 'var(--accent)' : 'transparent', color: billing === b ? '#fff' : 'var(--text-2)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              {b === 'yearly' ? 'Yearly' : 'Monthly'}
              {b === 'yearly' && <span style={{ fontSize: 11, background: billing === 'yearly' ? 'rgba(255,255,255,0.2)' : 'var(--accent-dim)', color: billing === 'yearly' ? '#fff' : 'var(--accent)', padding: '2px 6px', borderRadius: 20 }}>Save 33%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
        {/* Free Plan */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Free</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 36, fontFamily: 'Syne', fontWeight: 800 }}>$0</span>
              <span style={{ fontSize: 14, color: 'var(--text-2)', paddingBottom: 6 }}>/forever</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {features.map(({ icon: Icon, text, free }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {free
                  ? <Check size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                  : <X size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                }
                <span style={{ fontSize: 13, color: free ? 'var(--text)' : 'var(--text-3)' }}>{text}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ width: '100%' }} disabled>
            Current Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div style={{ background: 'var(--bg-1)', borderRadius: 12, padding: 28, border: '2px solid var(--accent)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
            POPULAR
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Premium</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 36, fontFamily: 'Syne', fontWeight: 800 }}>${plans[billing].price}</span>
              <span style={{ fontSize: 14, color: 'var(--text-2)', paddingBottom: 6 }}>/{plans[billing].period}</span>
            </div>
            {billing === 'yearly' && (
              <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>= $3.33/month — Save 33%</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Check size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{text}</span>
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 15, fontWeight: 600 }}
            onClick={() => alert('Stripe payment coming soon! 🚀')}>
            <Crown size={16} /> Get Premium
          </button>
        </div>
      </div>

      {/* Footer note */}
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
        🔒 Secure payment powered by Stripe • Cancel anytime • No hidden fees
      </div>
    </div>
  );
}
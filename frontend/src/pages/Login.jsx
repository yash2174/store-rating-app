import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  function fillAdmin() {
    setForm({ email: 'admin@storerating.com', password: 'Admin@123' });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);

      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'user') navigate('/user/stores');
      else if (role === 'store_owner') navigate('/owner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.brandMark}>R</div>
          <h1 style={styles.brandName}>RateHub</h1>
          <p style={styles.brandTagline}>
            The platform where customers rate stores and businesses grow through honest feedback.
          </p>
          <div style={styles.featureList}>
            {['Browse & rate stores', 'Role-based dashboards', 'Real-time analytics'].map(f => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureCheck}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Welcome back</h2>
            <p style={styles.cardSubtitle}>Sign in to your account to continue</p>
          </div>

          {/* Admin quick login hint */}
          <div style={styles.adminHint}>
            <div style={styles.adminHintLeft}>
              <span style={styles.adminBadge}>Admin</span>
              <div>
                <p style={styles.adminHintEmail}>admin@storerating.com</p>
                <p style={styles.adminHintPass}>Password: Admin@123</p>
              </div>
            </div>
            <button style={styles.fillBtn} onClick={fillAdmin} type="button">
              Use credentials
            </button>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                style={styles.input}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  style={{ ...styles.input, paddingRight: 44 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingRow}>
                  <span style={styles.spinner} /> Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={styles.footer}>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.link}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(145deg, #1e3a5f 0%, #2563eb 60%, #3b82f6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 48px',
  },
  leftContent: {
    maxWidth: 380,
    color: 'white',
  },
  brandMark: {
    width: 52,
    height: 52,
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 20,
    border: '1px solid rgba(255,255,255,0.2)',
  },
  brandName: {
    fontSize: 36,
    fontWeight: 800,
    margin: '0 0 12px',
    letterSpacing: '-0.5px',
  },
  brandTagline: {
    fontSize: 16,
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 36,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
  featureCheck: {
    width: 24,
    height: 24,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  rightPanel: {
    width: 480,
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: '36px 32px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 6px',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: 0,
  },
  adminHint: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 10,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  adminHintLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  adminBadge: {
    background: '#2563eb',
    color: 'white',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 6,
    flexShrink: 0,
  },
  adminHintEmail: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1e40af',
    margin: 0,
  },
  adminHintPass: {
    fontSize: 11,
    color: '#3b82f6',
    margin: 0,
  },
  fillBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: 7,
    padding: '7px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  errorIcon: {
    fontSize: 15,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
    background: 'white',
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
  },
  submitBtn: {
    width: '100%',
    padding: '11px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
    transition: 'background 0.15s',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: '#6b7280',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
};

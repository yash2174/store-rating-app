import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { validateName, validateEmail, validatePassword, validateAddress } from '../utils/validators';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: null });
    setServerError('');
  }

  function runValidation() {
    const errors = {};
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);
    const addrErr = validateAddress(form.address);
    if (nameErr) errors.name = nameErr;
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;
    if (addrErr) errors.address = addrErr;
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = runValidation();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      login(res.data.token, res.data.user);
      navigate('/user/stores');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Signup failed. Please try again.');
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
            Join thousands of users discovering and rating the best stores in their area.
          </p>
          <div style={styles.stepList}>
            {[
              { num: '1', text: 'Create your free account' },
              { num: '2', text: 'Browse registered stores' },
              { num: '3', text: 'Submit honest ratings' },
            ].map(s => (
              <div key={s.num} style={styles.stepItem}>
                <span style={styles.stepNum}>{s.num}</span>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Create account</h2>
            <p style={styles.cardSubtitle}>Fill in your details to get started</p>
          </div>

          {serverError && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠</span>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Full Name
                <span style={styles.hint}>min 20 characters</span>
              </label>
              <input
                type="text"
                name="name"
                style={{ ...styles.input, ...(fieldErrors.name ? styles.inputError : {}) }}
                placeholder="e.g. Yash Prakash Sharma"
                value={form.name}
                onChange={handleChange}
              />
              {fieldErrors.name && <p style={styles.fieldError}>{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                style={{ ...styles.input, ...(fieldErrors.email ? styles.inputError : {}) }}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {fieldErrors.email && <p style={styles.fieldError}>{fieldErrors.email}</p>}
            </div>

            {/* Address */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <input
                type="text"
                name="address"
                style={{ ...styles.input, ...(fieldErrors.address ? styles.inputError : {}) }}
                placeholder="Your full address"
                value={form.address}
                onChange={handleChange}
              />
              {fieldErrors.address && <p style={styles.fieldError}>{fieldErrors.address}</p>}
            </div>

            {/* Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Password
                <span style={styles.hint}>8–16 chars, 1 uppercase, 1 special</span>
              </label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  style={{ ...styles.input, ...(fieldErrors.password ? styles.inputError : {}), paddingRight: 44 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
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
              {fieldErrors.password && <p style={styles.fieldError}>{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingRow}>
                  <span style={styles.spinner} /> Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div style={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
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
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
  stepNum: {
    width: 28,
    height: 28,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.3)',
  },
  rightPanel: {
    width: 500,
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
    marginBottom: 16,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  },
  hint: {
    fontSize: 11,
    fontWeight: 400,
    color: '#94a3b8',
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
    background: 'white',
  },
  inputError: {
    border: '1px solid #f87171',
    background: '#fff8f8',
  },
  fieldError: {
    fontSize: 12,
    color: '#dc2626',
    margin: '5px 0 0',
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
    marginTop: 8,
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

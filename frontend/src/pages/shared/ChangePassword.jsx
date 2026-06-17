import React, { useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { validatePassword } from '../../utils/validators';

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: null });
    setServerError('');
    setSuccess('');
  }

  function validate() {
    const errors = {};
    if (!form.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    const newPassErr = validatePassword(form.newPassword);
    if (newPassErr) errors.newPassword = newPassErr;

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password changed successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout pageTitle="Change Password">
      <div className="page-header">
        <h2>Change Password</h2>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-body">
          {serverError && <div className="alert alert-error">{serverError}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                className={`form-input ${fieldErrors.currentPassword ? 'error' : ''}`}
                placeholder="Enter your current password"
                value={form.currentPassword}
                onChange={handleChange}
                autoComplete="current-password"
              />
              {fieldErrors.currentPassword && (
                <p className="form-error">{fieldErrors.currentPassword}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                className={`form-input ${fieldErrors.newPassword ? 'error' : ''}`}
                placeholder="8–16 chars, 1 uppercase, 1 special character"
                value={form.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {fieldErrors.newPassword && (
                <p className="form-error">{fieldErrors.newPassword}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p className="form-error">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--gray-50)', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
            <p style={{ fontSize: 12, color: 'var(--gray-600)', fontWeight: 600, marginBottom: 6 }}>Password Requirements</p>
            <ul style={{ fontSize: 12, color: 'var(--gray-500)', paddingLeft: 16, lineHeight: 1.8 }}>
              <li>8 to 16 characters long</li>
              <li>At least one uppercase letter (A–Z)</li>
              <li>At least one special character (!@#$% etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

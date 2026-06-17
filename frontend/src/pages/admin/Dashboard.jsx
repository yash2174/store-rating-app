import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout pageTitle="Dashboard">
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="page-header">
            <h2>Overview</h2>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value blue">{stats?.totalUsers ?? '—'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Stores</div>
              <div className="stat-value green">{stats?.totalStores ?? '—'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Ratings</div>
              <div className="stat-value">{stats?.totalRatings ?? '—'}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ color: 'var(--gray-500)', fontSize: 14 }}>
              <p>Use the sidebar to manage <strong>Users</strong> and <strong>Stores</strong>.</p>
              <p style={{ marginTop: 6 }}>
                Default admin login: <code>admin@storerating.com</code> / <code>Password:-Admin@123</code>
              </p>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

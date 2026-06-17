import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { StarDisplay } from '../../components/StarRating';
import { SortableTh, useSortParams } from '../../components/SortableTable';
import api from '../../utils/api';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { sortBy, order, handleSort } = useSortParams('name');

  useEffect(() => {
    api.get('/stores/my-store')
      .then(res => setData(res.data))
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load store data.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Client-side sort of raters table
  function getSortedRaters(raters) {
    if (!raters) return [];
    return [...raters].sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  if (loading) return <Layout pageTitle="My Store"><div className="spinner" /></Layout>;
  if (error) return <Layout pageTitle="My Store"><div className="alert alert-error">{error}</div></Layout>;

  const { store, raters } = data;
  const sortedRaters = getSortedRaters(raters);

  return (
    <Layout pageTitle="My Store">
      <div className="page-header">
        <h2>My Store</h2>
      </div>

      {/* Store summary card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                Store Name
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>{store.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                Address
              </div>
              <div style={{ fontSize: 15, color: 'var(--gray-700)' }}>{store.address || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                Average Rating
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {store.avg_rating ? (
                  <>
                    <StarDisplay value={store.avg_rating} />
                    <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                      from {store.total_ratings} rating{store.total_ratings !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 14, color: 'var(--gray-400)' }}>No ratings yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: 480, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Total Ratings</div>
          <div className="stat-value blue">{store.total_ratings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Score</div>
          <div className="stat-value green">
            {store.avg_rating ? parseFloat(store.avg_rating).toFixed(1) : '—'}
          </div>
        </div>
      </div>

      {/* Raters table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Users Who Rated Your Store</span>
        </div>
        <div className="table-wrapper">
          {sortedRaters.length === 0 ? (
            <div className="empty-state">
              <p>No ratings submitted yet.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <SortableTh label="Name" field="name" sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortableTh label="Email" field="email" sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortableTh label="Rating" field="rating" sortBy={sortBy} order={order} onSort={handleSort} />
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {sortedRaters.map(rater => (
                  <tr key={rater.id}>
                    <td style={{ fontWeight: 500 }}>{rater.name}</td>
                    <td>{rater.email}</td>
                    <td><StarDisplay value={rater.rating} showNumber={false} /></td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                      {new Date(rater.updated_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}

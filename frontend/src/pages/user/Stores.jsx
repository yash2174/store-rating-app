import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { StarRatingInput, StarDisplay } from '../../components/StarRating';
import { SortableTh, useSortParams } from '../../components/SortableTable';
import api from '../../utils/api';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const { sortBy, order, handleSort } = useSortParams('name');

  const [ratingModal, setRatingModal] = useState(null); // { store, pendingRating }
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchStores = useCallback(() => {
    setLoading(true);
    api.get('/stores', { params: { ...filters, sortBy, order } })
      .then(res => setStores(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  function openRatingModal(store) {
    setSubmitError('');
    setRatingModal({ store, pendingRating: store.user_rating || 0 });
  }

  async function handleSubmitRating() {
    if (!ratingModal.pendingRating) {
      setSubmitError('Please select a star rating before submitting.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post(`/stores/${ratingModal.store.id}/ratings`, {
        rating: ratingModal.pendingRating,
      });
      const verb = ratingModal.store.user_rating ? 'updated' : 'submitted';
      setToastMsg(`Rating ${verb} successfully!`);
      setRatingModal(null);
      fetchStores();
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout pageTitle="Browse Stores">
      <div className="page-header">
        <h2>Stores</h2>
      </div>

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>{toastMsg}</div>
      )}

      {/* Search filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ paddingBottom: 16 }}>
          <div className="filter-bar">
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name..."
                value={filters.name}
                onChange={e => setFilters({ ...filters, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search by address..."
                value={filters.address}
                onChange={e => setFilters({ ...filters, address: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="spinner" />
          ) : stores.length === 0 ? (
            <div className="empty-state">
              <p>No stores found.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <SortableTh label="Store Name" field="name" sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortableTh label="Address" field="address" sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortableTh label="Overall Rating" field="avg_rating" sortBy={sortBy} order={order} onSort={handleSort} />
                  <th>Your Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id}>
                    <td style={{ fontWeight: 500 }}>{store.name}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {store.address || '—'}
                    </td>
                    <td>
                      {store.avg_rating
                        ? <StarDisplay value={store.avg_rating} />
                        : <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>No ratings yet</span>}
                    </td>
                    <td>
                      {store.user_rating
                        ? <StarDisplay value={store.user_rating} showNumber={false} />
                        : <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>Not rated</span>}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openRatingModal(store)}
                      >
                        {store.user_rating ? 'Update Rating' : 'Rate Store'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Rating modal */}
      {ratingModal && (
        <Modal
          title={ratingModal.store.user_rating ? 'Update Your Rating' : 'Rate This Store'}
          onClose={() => setRatingModal(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setRatingModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitRating} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </>
          }
        >
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--gray-900)', marginBottom: 4 }}>
              {ratingModal.store.name}
            </p>
            <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{ratingModal.store.address}</p>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="form-label">Your Rating</label>
            <StarRatingInput
              value={ratingModal.pendingRating}
              onChange={val => {
                setRatingModal({ ...ratingModal, pendingRating: val });
                setSubmitError('');
              }}
            />
          </div>

          {ratingModal.pendingRating > 0 && (
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 8 }}>
              You selected <strong>{ratingModal.pendingRating} star{ratingModal.pendingRating > 1 ? 's' : ''}</strong>
            </p>
          )}

          {submitError && <div className="alert alert-error" style={{ marginTop: 12 }}>{submitError}</div>}
        </Modal>
      )}
    </Layout>
  );
}

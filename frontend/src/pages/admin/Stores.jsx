import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { SortableTh, useSortParams } from '../../components/SortableTable';
import { StarDisplay } from '../../components/StarRating';
import api from '../../utils/api';
import { validateName, validateEmail, validateAddress } from '../../utils/validators';

const emptyForm = { name: '', email: '', address: '', owner_id: '' };

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const { sortBy, order, handleSort } = useSortParams('name');

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // For owner_id lookup - list of store_owner users
  const [owners, setOwners] = useState([]);

  const fetchStores = useCallback(() => {
    setLoading(true);
    const params = { ...filters, sortBy, order };
    api.get('/admin/stores', { params })
      .then(res => setStores(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  function openAdd() {
    setForm(emptyForm);
    setFieldErrors({});
    setServerError('');
    setSuccessMsg('');
    // Load store owner users for dropdown
    api.get('/admin/users', { params: { role: 'store_owner' } })
      .then(res => setOwners(res.data))
      .catch(() => setOwners([]));
    setShowAddModal(true);
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    setServerError('');
  }

  function validateForm() {
    const errors = {};
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const addrErr = validateAddress(form.address);
    if (nameErr) errors.name = nameErr;
    if (emailErr) errors.email = emailErr;
    if (addrErr) errors.address = addrErr;
    return errors;
  }

  async function handleAddStore(e) {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/admin/stores', {
        ...form,
        owner_id: form.owner_id ? parseInt(form.owner_id) : null,
      });
      setSuccessMsg('Store created successfully.');
      setForm(emptyForm);
      fetchStores();
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <Layout pageTitle="Stores">
      <div className="page-header">
        <h2>Stores</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Store</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ paddingBottom: 16 }}>
          <div className="filter-bar">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" name="name" className="form-input" placeholder="Search name..." value={filters.name} onChange={handleFilterChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="text" name="email" className="form-input" placeholder="Search email..." value={filters.email} onChange={handleFilterChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" name="address" className="form-input" placeholder="Search address..." value={filters.address} onChange={handleFilterChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
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
                  <SortableTh label="Name" field="name" sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortableTh label="Email" field="email" sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortableTh label="Address" field="address" sortBy={sortBy} order={order} onSort={handleSort} />
                  <th>Owner</th>
                  <th>Rating</th>
                  <th>Total Ratings</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td>{s.email}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.address || '—'}
                    </td>
                    <td>{s.owner_name || <span style={{ color: 'var(--gray-400)' }}>Unassigned</span>}</td>
                    <td>
                      {s.avg_rating
                        ? <StarDisplay value={s.avg_rating} />
                        : <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>No ratings</span>}
                    </td>
                    <td>{s.total_ratings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <Modal
          title="Add New Store"
          onClose={() => setShowAddModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddStore} disabled={submitLoading}>
                {submitLoading ? 'Creating...' : 'Create Store'}
              </button>
            </>
          }
        >
          {serverError && <div className="alert alert-error">{serverError}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              name="name"
              className={`form-input ${fieldErrors.name ? 'error' : ''}`}
              placeholder="Min 20 characters"
              value={form.name}
              onChange={handleFormChange}
            />
            {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={`form-input ${fieldErrors.email ? 'error' : ''}`}
              placeholder="store@example.com"
              value={form.email}
              onChange={handleFormChange}
            />
            {fieldErrors.email && <p className="form-error">{fieldErrors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              className={`form-input ${fieldErrors.address ? 'error' : ''}`}
              placeholder="Store address"
              value={form.address}
              onChange={handleFormChange}
            />
            {fieldErrors.address && <p className="form-error">{fieldErrors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Assign Owner <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
            <select name="owner_id" className="form-select" value={form.owner_id} onChange={handleFormChange}>
              <option value="">— None —</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
              ))}
            </select>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
              You can also assign a normal user — they'll become a store owner.
            </p>
          </div>
        </Modal>
      )}
    </Layout>
  );
}

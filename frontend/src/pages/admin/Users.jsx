import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { SortableTh, useSortParams } from '../../components/SortableTable';
import api from '../../utils/api';
import { validateName, validateEmail, validatePassword, validateAddress } from '../../utils/validators';

const ROLE_LABELS = { admin: 'Admin', user: 'User', store_owner: 'Store Owner' };
const ROLE_BADGE = { admin: 'badge-blue', user: 'badge-gray', store_owner: 'badge-green' };

const emptyForm = { name: '', email: '', password: '', address: '', role: 'user' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const { sortBy, order, handleSort } = useSortParams('name');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = { ...filters, sortBy, order };
    api.get('/admin/users', { params })
      .then(res => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, sortBy, order]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    setServerError('');
  }

  function openDetail(user) {
    setSelectedUser(user);
    setShowDetailModal(true);
  }

  function openAdd() {
    setForm(emptyForm);
    setFieldErrors({});
    setServerError('');
    setSuccessMsg('');
    setShowAddModal(true);
  }

  function validateForm() {
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

  async function handleAddUser(e) {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/admin/users', form);
      setSuccessMsg('User created successfully.');
      setForm(emptyForm);
      fetchUsers();
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <Layout pageTitle="Users">
      <div className="page-header">
        <h2>Users</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
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
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-select" value={filters.role} onChange={handleFilterChange}>
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="spinner" />
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>No users found.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <SortableTh label="Name" field="name" sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortableTh label="Email" field="email" sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortableTh label="Address" field="address" sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortableTh label="Role" field="role" sortBy={sortBy} order={order} onSort={handleSort} />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                    <td>
                      <span className={`badge ${ROLE_BADGE[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openDetail(u)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <Modal
          title="Add New User"
          onClose={() => setShowAddModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddUser} disabled={submitLoading}>
                {submitLoading ? 'Creating...' : 'Create User'}
              </button>
            </>
          }
        >
          {serverError && <div className="alert alert-error">{serverError}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" name="name" className={`form-input ${fieldErrors.name ? 'error' : ''}`} placeholder="Min 20 characters" value={form.name} onChange={handleFormChange} />
            {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className={`form-input ${fieldErrors.email ? 'error' : ''}`} placeholder="user@example.com" value={form.email} onChange={handleFormChange} />
            {fieldErrors.email && <p className="form-error">{fieldErrors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input type="text" name="address" className={`form-input ${fieldErrors.address ? 'error' : ''}`} placeholder="Address" value={form.address} onChange={handleFormChange} />
            {fieldErrors.address && <p className="form-error">{fieldErrors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className={`form-input ${fieldErrors.password ? 'error' : ''}`} placeholder="8–16 chars, 1 uppercase, 1 special" value={form.password} onChange={handleFormChange} />
            {fieldErrors.password && <p className="form-error">{fieldErrors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={form.role} onChange={handleFormChange}>
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
        </Modal>
      )}

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <Modal title="User Details" onClose={() => setShowDetailModal(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <DetailRow label="Name" value={selectedUser.name} />
            <DetailRow label="Email" value={selectedUser.email} />
            <DetailRow label="Address" value={selectedUser.address || '—'} />
            <DetailRow
              label="Role"
              value={
                <span className={`badge ${ROLE_BADGE[selectedUser.role]}`}>
                  {ROLE_LABELS[selectedUser.role]}
                </span>
              }
            />
            {selectedUser.role === 'store_owner' && (
              <DetailRow
                label="Store Rating"
                value={selectedUser.store_rating ? `${parseFloat(selectedUser.store_rating).toFixed(1)} / 5` : 'No ratings yet'}
              />
            )}
          </div>
        </Modal>
      )}
    </Layout>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ width: 110, flexShrink: 0, fontSize: 13, fontWeight: 600, color: 'var(--gray-500)' }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: 'var(--gray-800)' }}>{value}</span>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const LeadModal = ({ open, onClose, lead, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'New',
    assignedTo: '',
    company: '',
    notes: '',
  });

  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch users and companies for dropdowns
  useEffect(() => {
    if (open) {
      const loadLookups = async () => {
        setLoadingLookups(true);
        try {
          const [usersRes, companiesRes] = await Promise.all([
            api.get('/auth/users'),
            api.get('/companies'),
          ]);
          setUsers(usersRes.data.data || []);
          setCompanies(companiesRes.data.data || []);
        } catch (err) {
          console.error('Failed to load users or companies', err);
        } finally {
          setLoadingLookups(false);
        }
      };

      loadLookups();

      if (lead) {
        setFormData({
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          status: lead.status || 'New',
          assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
          company: lead.company?._id || lead.company || '',
          notes: lead.notes || '',
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          status: 'New',
          assignedTo: '',
          company: '',
          notes: '',
        });
      }
      setError('');
    }
  }, [open, lead]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in Name, Email, and Phone number.');
      return;
    }
    if (!formData.assignedTo) {
      setError('Please select an assigned user.');
      return;
    }
    if (!formData.company) {
      setError('Please select an associated company.');
      return;
    }

    setSubmitting(true);
    try {
      if (lead?._id) {
        await api.put(`/leads/${lead._id}`, formData);
      } else {
        await api.post('/leads', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save lead', err);
      setError(err.response?.data?.message || 'Failed to save lead');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="modal-content shadow">
          {/* Header matching Wireframe 5 */}
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {lead ? 'Edit Lead' : 'Add Lead'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                  {error}
                </div>
              )}

              {loadingLookups ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                  <span className="ms-2 small text-muted">Loading options...</span>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {/* Name */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g. Ravi"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="e.g. r@mail.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Status: [ New | Contacted | Qualified | Lost ] */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>

                  {/* Assigned To [ User Dropdown ] */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">
                      Assigned To <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select User --</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Company [ Company Dropdown ] */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">
                      Company <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Company --</option>
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Notes</label>
                    <textarea
                      className="form-control"
                      name="notes"
                      rows="2"
                      placeholder="Optional notes or details..."
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons matching Wireframe 5: [ Save ] [ Cancel ] */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || loadingLookups}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadModal;

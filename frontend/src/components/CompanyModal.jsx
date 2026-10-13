import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CompanyModal = ({ open, onClose, company, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    phone: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (company) {
        setFormData({
          name: company.name || '',
          industry: company.industry || '',
          location: company.location || '',
          website: company.website || '',
          phone: company.phone || '',
          notes: company.notes || '',
        });
      } else {
        setFormData({
          name: '',
          industry: '',
          location: '',
          website: '',
          phone: '',
          notes: '',
        });
      }
      setError('');
    }
  }, [open, company]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.industry.trim() || !formData.location.trim()) {
      setError('Please provide company name, industry, and location.');
      return;
    }

    setSubmitting(true);
    try {
      if (company?._id) {
        await api.put(`/companies/${company._id}`, formData);
      } else {
        await api.post('/companies', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save company', err);
      setError(err.response?.data?.message || 'Failed to save company');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {company ? 'Edit Company' : 'Add Company'}
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

              <div className="d-flex flex-column gap-3">
                {/* Company Name */}
                <div>
                  <label className="form-label small fw-semibold text-secondary">
                    Company Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="e.g. ABC Corp"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="form-label small fw-semibold text-secondary">
                    Industry <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="industry"
                    placeholder="e.g. IT"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="form-label small fw-semibold text-secondary">
                    Location <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    placeholder="e.g. Chennai"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="form-label small fw-semibold text-secondary">Website</label>
                  <input
                    type="url"
                    className="form-control"
                    name="website"
                    placeholder="https://company.example.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="form-label small fw-semibold text-secondary">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    placeholder="+91 44 2828 0001"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="form-label small fw-semibold text-secondary">Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    rows="2"
                    placeholder="Company overview or key details..."
                    value={formData.notes}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

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
                disabled={submitting}
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

export default CompanyModal;

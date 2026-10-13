import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CompanyModal from '../components/CompanyModal';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Detail Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailedCompany, setDetailedCompany] = useState(null);
  const [associatedLeads, setAssociatedLeads] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies', {
        params: { search: search.trim() || undefined },
      });
      setCompanies(res.data.data || []);
    } catch (err) {
      console.error('Failed to load companies', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to load companies',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const handleOpenAdd = () => {
    setSelectedCompany(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (company) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };

  const handleOpenDetails = async (company) => {
    setDetailModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/companies/${company._id}`);
      setDetailedCompany(res.data.data.company);
      setAssociatedLeads(res.data.data.associatedLeads || []);
    } catch (err) {
      console.error('Failed to fetch company details', err);
      setMessage({
        text: 'Failed to load company details and associated leads',
        type: 'danger',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenDelete = (company) => {
    setCompanyToDelete(company);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!companyToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/companies/${companyToDelete._id}`);
      setMessage({
        text: `Company "${companyToDelete.name}" deleted successfully.`,
        type: 'success',
      });
      setDeleteModalOpen(false);
      setCompanyToDelete(null);
      fetchCompanies();
    } catch (err) {
      console.error('Failed to delete company', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to delete company',
        type: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold m-0 text-dark">Companies</h4>
          <p className="text-muted small m-0">
            Organizations and accounts associated with your leads
          </p>
        </div>
      </div>

      {/* Alert */}
      {message.text && (
        <div
          className={`alert alert-${message.type} alert-dismissible fade show py-2 small`}
          role="alert"
        >
          {message.text}
          <button
            type="button"
            className="btn-close py-2"
            onClick={() => setMessage({ text: '', type: '' })}
          ></button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="card shadow-sm mb-3">
        <div className="card-body py-2 px-3">
          <form
            onSubmit={handleSearchSubmit}
            className="row g-2 align-items-center justify-content-between"
          >
            <div className="col-12 col-md-5 d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search company name, industry, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-secondary btn-sm px-3">
                <i className="bi bi-search"></i>
              </button>
            </div>

            <div className="col-12 col-md-auto text-end">
              <button
                type="button"
                className="btn btn-primary btn-sm fw-semibold"
                onClick={handleOpenAdd}
              >
                <i className="bi bi-plus-lg me-1"></i>
                + Add Company
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Companies Table matching Wireframe 6: Company Name | Industry | Location */}
      <div className="table-responsive bg-white rounded shadow-sm border">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3 px-3">Company Name</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Associated Leads</th>
              <th className="text-end px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  <span className="text-muted small">Loading companies...</span>
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                  No companies found. Click "+ Add Company" to create one.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company._id}>
                  {/* Company Name */}
                  <td className="px-3">
                    <span
                      className="fw-bold text-primary role-button"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleOpenDetails(company)}
                      title="Click to view details"
                    >
                      {company.name}
                    </span>
                    {company.website && (
                      <div className="small text-muted">{company.website}</div>
                    )}
                  </td>

                  {/* Industry */}
                  <td>
                    <span className="badge bg-light text-dark border">
                      {company.industry}
                    </span>
                  </td>

                  {/* Location */}
                  <td>
                    <span className="text-secondary">{company.location}</span>
                  </td>

                  {/* Associated Leads count */}
                  <td>
                    <span className="badge bg-secondary rounded-pill">
                      {company.leadCount || 0} leads
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="text-end px-3">
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-info"
                        onClick={() => handleOpenDetails(company)}
                        title="View Company Details & Leads"
                      >
                        <i className="bi bi-eye me-1"></i>
                        Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => handleOpenEdit(company)}
                        title="Edit Company"
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleOpenDelete(company)}
                        title="Delete Company"
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Company Detail Modal matching Wireframe 6 requirement:
          Company Detail:
          - Company info
          - Associated Leads list */}
      {detailModalOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '680px', width: '100%' }}>
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-building me-2 text-primary"></i>
                  Company Details & Leads
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDetailModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body">
                {loadingDetails ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : detailedCompany ? (
                  <div>
                    {/* 1. Company Info */}
                    <div className="card bg-light border-0 mb-4">
                      <div className="card-body">
                        <h5 className="fw-bold text-dark mb-3">{detailedCompany.name}</h5>
                        <div className="row g-2 small">
                          <div className="col-sm-6">
                            <span className="text-muted fw-semibold">Industry: </span>
                            <span className="fw-medium">{detailedCompany.industry}</span>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted fw-semibold">Location: </span>
                            <span className="fw-medium">{detailedCompany.location}</span>
                          </div>
                          {detailedCompany.phone && (
                            <div className="col-sm-6">
                              <span className="text-muted fw-semibold">Phone: </span>
                              <span>{detailedCompany.phone}</span>
                            </div>
                          )}
                          {detailedCompany.website && (
                            <div className="col-sm-6">
                              <span className="text-muted fw-semibold">Website: </span>
                              <span>{detailedCompany.website}</span>
                            </div>
                          )}
                          {detailedCompany.notes && (
                            <div className="col-12 mt-2">
                              <span className="text-muted fw-semibold">Notes: </span>
                              <p className="m-0 text-secondary">{detailedCompany.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 2. Associated Leads List */}
                    <h6 className="fw-bold mb-2 text-secondary">
                      Associated Leads ({associatedLeads.length})
                    </h6>

                    {associatedLeads.length === 0 ? (
                      <div className="alert alert-info py-2 small" role="alert">
                        No active leads currently associated with this company.
                      </div>
                    ) : (
                      <div className="table-responsive border rounded bg-white">
                        <table className="table table-sm table-striped align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Lead Name</th>
                              <th>Email</th>
                              <th>Status</th>
                              <th>Assigned To</th>
                            </tr>
                          </thead>
                          <tbody>
                            {associatedLeads.map((lead) => (
                              <tr key={lead._id}>
                                <td className="fw-semibold">{lead.name}</td>
                                <td className="text-muted small">{lead.email}</td>
                                <td>
                                  <span className="badge bg-secondary">{lead.status}</span>
                                </td>
                                <td>{lead.assignedTo?.name || 'Unassigned'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Company Modal */}
      <CompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        company={selectedCompany}
        onSaved={() => {
          fetchCompanies();
          setMessage({
            text: selectedCompany ? 'Company updated successfully' : 'Company created successfully',
            type: 'success',
          });
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px', width: '100%' }}>
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-danger">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete company <strong>{companyToDelete?.name}</strong>?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Company'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;

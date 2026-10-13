import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LeadModal from '../components/LeadModal';

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Soft delete confirm modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Alerts
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        search: search.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      };

      const res = await api.get('/leads', { params });
      setLeads(res.data.data || []);
      setTotalPages(res.data.pagination.pages || 1);
      setTotalLeads(res.data.pagination.total || 0);
    } catch (err) {
      console.error('Failed to fetch leads', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to load leads',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleOpenAdd = () => {
    setSelectedLead(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const handleOpenDelete = (lead) => {
    setLeadToDelete(lead);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    setDeleting(true);
    try {
      // Soft-delete lead per PDF requirement (must not appear in normal queries)
      await api.delete(`/leads/${leadToDelete._id}`);
      setMessage({
        text: `Lead "${leadToDelete.name}" soft-deleted successfully and excluded from queries.`,
        type: 'success',
      });
      setDeleteModalOpen(false);
      setLeadToDelete(null);
      fetchLeads();
    } catch (err) {
      console.error('Failed to delete lead', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to delete lead',
        type: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
      setMessage({
        text: `Status updated to ${newStatus}`,
        type: 'success',
      });
      fetchLeads();
    } catch (err) {
      console.error('Failed to update status', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to update status',
        type: 'danger',
      });
    }
  };

  // Helper for status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-info text-dark';
      case 'Contacted':
        return 'bg-warning text-dark';
      case 'Qualified':
        return 'bg-success';
      case 'Lost':
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  };

  return (
    <div>
      {/* Top Header matching Wireframe 4 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold m-0 text-dark">Leads</h4>
          <p className="text-muted small m-0">
            Total active leads: {totalLeads} (Soft-deleted leads excluded)
          </p>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Filter Bar matching Wireframe 4: Search [_____] Status [Dropdown] [+ Add Lead ] */}
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
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-secondary btn-sm px-3">
                <i className="bi bi-search"></i>
              </button>
            </div>

            <div className="col-12 col-md-4 d-flex align-items-center gap-2">
              <label className="small text-secondary fw-semibold m-0 text-nowrap">
                Status:
              </label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="col-12 col-md-auto text-end">
              <button
                type="button"
                className="btn btn-primary btn-sm fw-semibold"
                onClick={handleOpenAdd}
              >
                <i className="bi bi-plus-lg me-1"></i>
                + Add Lead
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table matching Wireframe 4: Name | Email | Status | Assigned To | Actions */}
      <div className="table-responsive bg-white rounded shadow-sm border">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3 px-3">Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th className="text-end px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  <span className="text-muted small">Loading leads...</span>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  No leads found matching your criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id}>
                  {/* Name */}
                  <td className="px-3">
                    <div className="fw-semibold text-dark">{lead.name}</div>
                    <small className="text-muted">{lead.phone}</small>
                  </td>

                  {/* Email */}
                  <td>
                    <span className="text-secondary">{lead.email}</span>
                  </td>

                  {/* Company */}
                  <td>
                    <span className="fw-medium">{lead.company?.name || '—'}</span>
                  </td>

                  {/* Status with quick change */}
                  <td>
                    <select
                      className={`form-select form-select-sm border-0 fw-semibold text-center ${getStatusBadge(
                        lead.status
                      )}`}
                      style={{ width: '120px' }}
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>

                  {/* Assigned To */}
                  <td>
                    <span className="text-dark">{lead.assignedTo?.name || 'Unassigned'}</span>
                  </td>

                  {/* Actions: Edit | Delete */}
                  <td className="text-end px-3">
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => handleOpenEdit(lead)}
                        title="Edit Lead"
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleOpenDelete(lead)}
                        title="Soft Delete"
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

      {/* Pagination matching Wireframe 4: < 1 2 3 > */}
      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination pagination-sm justify-content-center">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &laquo; Prev
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <li key={num} className={`page-item ${page === num ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(num)}>
                  {num}
                </button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next &raquo;
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Add / Edit Lead Modal */}
      <LeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        lead={selectedLead}
        onSaved={() => {
          fetchLeads();
          setMessage({
            text: selectedLead ? 'Lead updated successfully' : 'Lead created successfully',
            type: 'success',
          });
        }}
      />

      {/* Soft Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px', width: '100%' }}>
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
                <p className="mb-2">
                  Are you sure you want to delete lead <strong>{leadToDelete?.name}</strong>?
                </p>
                <div className="alert alert-warning py-2 small m-0">
                  <i className="bi bi-info-circle-fill me-1"></i>
                  This lead will be soft-deleted and will not appear in normal queries or reports.
                </div>
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
                  {deleting ? 'Deleting...' : 'Delete Lead'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;

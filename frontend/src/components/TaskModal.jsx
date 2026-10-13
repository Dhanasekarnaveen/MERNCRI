import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TaskModal = ({ open, onClose, task, onSaved }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lead: '',
    assignedTo: '',
    dueDate: '',
    status: 'Pending',
  });

  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      const loadLookups = async () => {
        setLoadingLookups(true);
        try {
          const [leadsRes, usersRes] = await Promise.all([
            api.get('/leads?limit=100'),
            api.get('/auth/users'),
          ]);
          setLeads(leadsRes.data.data || []);
          setUsers(usersRes.data.data || []);
        } catch (err) {
          console.error('Failed to load lookup data for task form', err);
        } finally {
          setLoadingLookups(false);
        }
      };

      loadLookups();

      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          lead: task.lead?._id || task.lead || '',
          assignedTo: task.assignedTo?._id || task.assignedTo || '',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          status: task.status || 'Pending',
        });
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        setFormData({
          title: '',
          description: '',
          lead: '',
          assignedTo: '',
          dueDate: todayStr,
          status: 'Pending',
        });
      }
      setError('');
    }
  }, [open, task]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.lead || !formData.assignedTo || !formData.dueDate) {
      setError('Please provide title, lead, assigned user, and due date.');
      return;
    }

    setSubmitting(true);
    try {
      if (task?._id) {
        await api.put(`/tasks/${task._id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save task', err);
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {task ? 'Edit Task' : 'Create Task'}
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
                  {/* Task Title */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">
                      Task Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      placeholder="e.g. Call, Send Proposal, Demo"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Lead Dropdown */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">
                      Lead <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="lead"
                      value={formData.lead}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Lead --</option>
                      {leads.map((l) => (
                        <option key={l._id} value={l._id}>
                          {l.name} ({l.company?.name || 'No company'}) - Status: {l.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assigned To User Dropdown */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">
                      Assign To User <span className="text-danger">*</span>
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

                  {/* Due Date */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">
                      Due Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Initial Status */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="2"
                      placeholder="Task instructions or notes..."
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              )}
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
                disabled={submitting || loadingLookups}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Saving...
                  </>
                ) : (
                  'Save Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;

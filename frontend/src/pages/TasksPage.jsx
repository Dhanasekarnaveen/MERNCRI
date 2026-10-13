import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status updating indicator
  const [updatingId, setUpdatingId] = useState(null);

  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks', {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: search.trim() || undefined,
        },
      });
      setTasks(res.data.data || []);
    } catch (err) {
      console.error('Failed to load tasks', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to load tasks',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleOpenAdd = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  // Wireframe Requirement: "Only assigned users can update task status."
  const handleToggleTaskStatus = async (task) => {
    const isAssigned = user && task.assignedTo && user._id === task.assignedTo._id;

    if (!isAssigned) {
      setMessage({
        text: `Forbidden: Only the assigned user (${task.assignedTo?.name || 'assigned rep'}) can update this task's status.`,
        type: 'danger',
      });
      return;
    }

    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setUpdatingId(task._id);

    try {
      await api.patch(`/tasks/${task._id}/status`, { status: nextStatus });
      setMessage({
        text: `Task "${task.title}" updated to ${nextStatus}`,
        type: 'success',
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to update task status',
        type: 'danger',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDelete = (task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${taskToDelete._id}`);
      setMessage({
        text: 'Task deleted successfully',
        type: 'success',
      });
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to delete task',
        type: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Format date helper matching Wireframe 7: "22 Jan"
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h4 className="fw-bold m-0 text-dark">Tasks</h4>
          <p className="text-muted small m-0">
            Follow-up actions and customer touchpoints
          </p>
        </div>
      </div>

      {/* Authorization Policy Note */}
      <div className="alert alert-info py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
        <i className="bi bi-shield-lock-fill fs-6"></i>
        <span>
          <strong>Authorization Policy:</strong> Only assigned users can update task status. Currently signed in as:{' '}
          <strong>{user?.name}</strong> ({user?.role}).
        </span>
      </div>

      {/* Message Alert */}
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
                placeholder="Search tasks by title..."
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
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="col-12 col-md-auto text-end">
              <button
                type="button"
                className="btn btn-primary btn-sm fw-semibold"
                onClick={handleOpenAdd}
              >
                <i className="bi bi-plus-lg me-1"></i>
                + Add Task
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tasks Table matching Wireframe 7: Title | Lead | Due Date | Status | Actions */}
      <div className="table-responsive bg-white rounded shadow-sm border">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3 px-3">Title</th>
              <th>Lead</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Status</th>
              <th className="text-end px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  <span className="text-muted small">Loading tasks...</span>
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  No tasks found. Click "+ Add Task" to schedule one.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isAssigned = user && task.assignedTo && user._id === task.assignedTo._id;
                const isCompleted = task.status === 'Completed';

                return (
                  <tr key={task._id}>
                    {/* Title */}
                    <td className="px-3">
                      <div className="fw-semibold text-dark">{task.title}</div>
                      {task.description && (
                        <small className="text-muted">{task.description}</small>
                      )}
                    </td>

                    {/* Lead */}
                    <td>
                      <div className="fw-medium">{task.lead?.name || '—'}</div>
                      <small className="text-muted">{task.lead?.email}</small>
                    </td>

                    {/* Assigned To */}
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <span>{task.assignedTo?.name || 'Unassigned'}</span>
                        {isAssigned && (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.65rem' }}>
                            You
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Due Date (Wireframe format: e.g. 22 Jan) */}
                    <td>
                      <span className="text-secondary fw-medium">
                        {formatDateDisplay(task.dueDate)}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td>
                      <span
                        className={`badge ${
                          task.status === 'Completed'
                            ? 'bg-success'
                            : task.status === 'In Progress'
                            ? 'bg-info text-dark'
                            : 'bg-warning text-dark'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>

                    {/* Actions matching wireframe: [ Done ] + Edit & Delete */}
                    <td className="text-end px-3">
                      <div className="d-inline-flex align-items-center gap-2">
                        {/* Wireframe Action Button: Done / Pending */}
                        {isAssigned ? (
                          <button
                            type="button"
                            className={`btn btn-sm ${
                              isCompleted ? 'btn-outline-secondary' : 'btn-success'
                            }`}
                            style={{ minWidth: '85px' }}
                            disabled={updatingId === task._id}
                            onClick={() => handleToggleTaskStatus(task)}
                          >
                            {updatingId === task._id ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : isCompleted ? (
                              <>
                                <i className="bi bi-arrow-counterclockwise me-1"></i>Reopen
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check2 me-1"></i>Done
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            style={{ minWidth: '85px', opacity: 0.6 }}
                            disabled
                            title="Only the assigned user can update this task"
                          >
                            <i className="bi bi-lock-fill me-1"></i>
                            {isCompleted ? 'Done' : 'Pending'}
                          </button>
                        )}

                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => handleOpenEdit(task)}
                            title="Edit Task"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleOpenDelete(task)}
                            title="Delete Task"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Task Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={selectedTask}
        onSaved={() => {
          fetchTasks();
          setMessage({
            text: selectedTask ? 'Task updated successfully' : 'Task created successfully',
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
                Are you sure you want to delete task <strong>{taskToDelete?.title}</strong>?
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
                  {deleting ? 'Deleting...' : 'Delete Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;

import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch metrics strictly from backend MongoDB aggregation APIs
  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/metrics');
      setMetrics(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
      setError(
        err.response?.data?.message || 'Failed to load aggregation metrics from server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold m-0 text-dark">Dashboard</h4>
          <p className="text-muted small m-0">
            Real-time metrics calculated from MongoDB Aggregation APIs
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise"></i>
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-x-circle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* 4 Metric Cards matching Wireframe 3 */}
      <div className="row g-3 mb-4">
        {/* Total Leads */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-card h-100 border-start border-primary border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center text-muted mb-2">
                <span className="small fw-semibold">Total Leads</span>
                <i className="bi bi-people text-primary fs-5"></i>
              </div>
              <h2 className="fw-bold mb-1 text-dark">{metrics?.totalLeads ?? 0}</h2>
              <span className="badge bg-light text-secondary border">Active Pipeline</span>
            </div>
          </div>
        </div>

        {/* Qualified Leads */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-card h-100 border-start border-success border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center text-muted mb-2">
                <span className="small fw-semibold">Qualified Leads</span>
                <i className="bi bi-patch-check text-success fs-5"></i>
              </div>
              <h2 className="fw-bold mb-1 text-dark">{metrics?.qualifiedLeads ?? 0}</h2>
              <span className="badge bg-light text-secondary border">High Potential</span>
            </div>
          </div>
        </div>

        {/* Tasks Due Today */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-card h-100 border-start border-warning border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center text-muted mb-2">
                <span className="small fw-semibold">Tasks Due Today</span>
                <i className="bi bi-calendar-event text-warning fs-5"></i>
              </div>
              <h2 className="fw-bold mb-1 text-dark">{metrics?.tasksDueToday ?? 0}</h2>
              <span className="badge bg-light text-secondary border">Requires Follow-up</span>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-card h-100 border-start border-info border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center text-muted mb-2">
                <span className="small fw-semibold">Completed Tasks</span>
                <i className="bi bi-check2-circle text-info fs-5"></i>
              </div>
              <h2 className="fw-bold mb-1 text-dark">{metrics?.completedTasks ?? 0}</h2>
              <span className="badge bg-light text-secondary border">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Breakdown Cards */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card stat-card">
            <div className="card-header bg-white fw-semibold text-secondary">
              <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
              Leads Pipeline Status
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>New Leads</span>
                  <span className="badge bg-info rounded-pill">{metrics?.newLeads ?? 0}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Contacted Leads</span>
                  <span className="badge bg-warning text-dark rounded-pill">
                    {metrics?.contactedLeads ?? 0}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Qualified Leads</span>
                  <span className="badge bg-success rounded-pill">
                    {metrics?.qualifiedLeads ?? 0}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Lost Leads</span>
                  <span className="badge bg-secondary rounded-pill">{metrics?.lostLeads ?? 0}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card stat-card">
            <div className="card-header bg-white fw-semibold text-secondary">
              <i className="bi bi-list-task me-2 text-primary"></i>
              Tasks Overview
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Pending Tasks</span>
                  <span className="badge bg-warning text-dark rounded-pill">
                    {metrics?.pendingTasks ?? 0}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Tasks Due Today</span>
                  <span className="badge bg-danger rounded-pill">
                    {metrics?.tasksDueToday ?? 0}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Completed Tasks</span>
                  <span className="badge bg-success rounded-pill">
                    {metrics?.completedTasks ?? 0}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>Total Scheduled Tasks</span>
                  <span className="badge bg-primary rounded-pill">
                    {metrics?.totalTasks ?? 0}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

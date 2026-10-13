import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    // Required fields validation per wireframe
    if (!email.trim() || !password.trim()) {
      setValidationError('Please enter both Email and Password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      // Show API error messages per wireframe
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  // Helper for quick testing
  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setValidationError('');
    setApiError('');
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light p-3">
      <div className="card shadow-sm" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-4">
          {/* Wireframe Header: MINI CRM */}
          <div className="text-center mb-4">
            <div className="mb-2">
              <i className="bi bi-kanban-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <h3 className="card-title fw-bold m-0 text-dark">MINI CRM</h3>
            <p className="text-muted small mt-1">Sign in to your account</p>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="alert alert-warning py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-1"></i>
              {validationError}
            </div>
          )}

          {/* Show API error messages */}
          {apiError && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-x-circle-fill me-1"></i>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email input */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            {/* Password input */}
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Login Button matching Wireframe */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                'Login Button'
              )}
            </button>
          </form>

          {/* Demo account autofill buttons for evaluation */}
          <div className="mt-4 pt-3 border-top text-center">
            <p className="text-muted small mb-2 fw-semibold">Quick Demo Login:</p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleQuickLogin('john@crm.com', 'password123')}
              >
                John (Sales Rep)
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleQuickLogin('sarah@crm.com', 'password123')}
              >
                Sarah (Sales Rep)
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleQuickLogin('admin@crm.com', 'password123')}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

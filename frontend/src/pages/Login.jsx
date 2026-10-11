import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { setCustomer } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.post("/customers/login", form);
      setCustomer(response.data.customer);
      navigate("/home");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleFillDemo = () => {
    setForm({ email: "john@gmail.com", password: "john123" });
    setError("");
  };

  return (
    <main className="auth-split-page">
      <div className="auth-ambient-orb orb-1"></div>
      <div className="auth-ambient-orb orb-2"></div>

      <div className="auth-split-wrapper">
        {/* Left: Premium Brand Showcase */}
        <div className="auth-showcase-panel">
          <div className="showcase-content">
            <div className="showcase-brand-header">
              <span className="brand-icon-lg">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </span>
              <span className="showcase-brand-text">Shop<span className="brand-highlight">Kart</span></span>
              <span className="showcase-edition-pill">PRIME</span>
            </div>

            <div className="showcase-hero-text">
              <div className="showcase-mini-badge">
                <span className="sparkle-icon">✨</span> Welcome Back
              </div>
              <h1 className="showcase-title">
                Your Exclusive Cart & <br />
                <span className="showcase-gradient-text">Wishlist Await.</span>
              </h1>
              <p className="showcase-description">
                Sign in to seamlessly access your orders, track deliveries in real time, and continue your elevated shopping journey.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="showcase-features-grid">
              <div className="showcase-feature-card">
                <div className="feature-card-icon">⚡</div>
                <div>
                  <h4>1-Click Checkout</h4>
                  <p>Save shipping details for rapid orders</p>
                </div>
              </div>
              <div className="showcase-feature-card">
                <div className="feature-card-icon">❤️</div>
                <div>
                  <h4>Synced Wishlist</h4>
                  <p>Your saved favorites on any device</p>
                </div>
              </div>
              <div className="showcase-feature-card">
                <div className="feature-card-icon">📦</div>
                <div>
                  <h4>Live Tracking</h4>
                  <p>Instant status notifications on dispatch</p>
                </div>
              </div>
              <div className="showcase-feature-card">
                <div className="feature-card-icon">🔒</div>
                <div>
                  <h4>Bank-Grade Security</h4>
                  <p>Encrypted sessions & safe transactions</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="showcase-social-proof">
              <div className="avatar-stack">
                <span className="avatar-circle">AS</span>
                <span className="avatar-circle">RK</span>
                <span className="avatar-circle">NP</span>
                <span className="avatar-circle">+5k</span>
              </div>
              <div className="social-proof-text">
                <div className="stars-row">★★★★★ <span>4.9 / 5</span></div>
                <p>Over 50,000 satisfied shoppers nationwide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <section className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <div className="mobile-brand-row">
                <span className="brand-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </span>
                <span className="brand-text">Shop<span className="brand-highlight">Kart</span></span>
              </div>
              <h2>Welcome Back</h2>
              <p>Enter your credentials to access your account.</p>
            </div>

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <label className="input-label-text" htmlFor="login-email">
                  Email Address
                </label>
                <div className="input-with-icon">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. john@gmail.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label-text" htmlFor="login-password">
                  Password
                </label>
                <div className="input-with-icon">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Demo 1-Click Credentials Chip */}
              <div className="demo-credentials-chip" onClick={handleFillDemo} role="button" tabIndex="0">
                <span className="demo-chip-icon">💡</span>
                <span><strong>Quick Demo:</strong> Auto-fill (john@gmail.com)</span>
              </div>

              <button className="main-button auth-submit-btn" disabled={saving}>
                {saving ? (
                  <span className="btn-loading-flex">
                    <span className="spinner-sm"></span> Signing In...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <p className="switch-text">
                New to ShopKart? <Link to="/register" className="switch-link">Create an account</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;

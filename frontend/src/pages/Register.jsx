import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    if (error) setError("");
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: "", color: "" };
    if (pwd.length < 6) return { score: 1, text: "Too short", color: "#f43f5e" };
    const hasNum = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    if (pwd.length >= 8 && (hasNum || hasSpecial)) {
      return { score: 3, text: "Strong password", color: "#10b981" };
    }
    return { score: 2, text: "Medium strength", color: "#f59e0b" };
  };

  const pwdStrength = getPasswordStrength(form.password);

  const validate = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password || !form.phone.trim()) {
      return "Please fill in all required fields.";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      return "Please enter a valid 10-digit phone number.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = validate();
    setError(message);

    if (message) {
      return;
    }

    setSaving(true);

    try {
      await api.post("/customers/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSaving(false);
    }
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
                <span className="sparkle-icon">✨</span> Experience Next-Gen Retail
              </div>
              <h1 className="showcase-title">
                Uncompromising Quality. <br />
                <span className="showcase-gradient-text">Delivered Instantly.</span>
              </h1>
              <p className="showcase-description">
                Join over 50,000 discerning shoppers enjoying hand-curated lifestyle products, verified authentic electronics, and seamless one-click payments.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="showcase-features-grid">
              <div className="showcase-feature-card">
                <div className="feature-card-icon">⚡</div>
                <div>
                  <h4>Priority Shipping</h4>
                  <p>Express doorstep dispatch nationwide</p>
                </div>
              </div>
              <div className="showcase-feature-card">
                <div className="feature-card-icon">🛡️</div>
                <div>
                  <h4>100% Genuine</h4>
                  <p>Direct from verified manufacturers</p>
                </div>
              </div>
              <div className="showcase-feature-card">
                <div className="feature-card-icon">🔒</div>
                <div>
                  <h4>Razorpay Shield</h4>
                  <p>256-bit bank encrypted transactions</p>
                </div>
              </div>
              <div className="showcase-feature-card">
                <div className="feature-card-icon">🎁</div>
                <div>
                  <h4>Welcome Perks</h4>
                  <p>₹500 voucher on your first order</p>
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
                <p>Rated best shopping experience in 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Registration Form */}
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
              <h2>Create Your Account</h2>
              <p>Start your curated shopping experience in seconds.</p>
            </div>

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <label className="input-label-text" htmlFor="reg-fullname">
                  Full Name <span className="req-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    id="reg-fullname"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label-text" htmlFor="reg-email">
                  Email Address <span className="req-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    id="reg-email"
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
                <label className="input-label-text" htmlFor="reg-password">
                  Password <span className="req-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
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
                {form.password && (
                  <div className="pwd-strength-container">
                    <div className="pwd-strength-bars">
                      <div className={`pwd-bar ${pwdStrength.score >= 1 ? "active" : ""}`} style={{ backgroundColor: pwdStrength.color }}></div>
                      <div className={`pwd-bar ${pwdStrength.score >= 2 ? "active" : ""}`} style={{ backgroundColor: pwdStrength.color }}></div>
                      <div className={`pwd-bar ${pwdStrength.score >= 3 ? "active" : ""}`} style={{ backgroundColor: pwdStrength.color }}></div>
                    </div>
                    <span className="pwd-strength-label" style={{ color: pwdStrength.color }}>{pwdStrength.text}</span>
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label-text" htmlFor="reg-phone">
                  Phone Number (10 Digits) <span className="req-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <button className="main-button auth-submit-btn" disabled={saving}>
                {saving ? (
                  <span className="btn-loading-flex">
                    <span className="spinner-sm"></span> Creating Account...
                  </span>
                ) : (
                  <>
                    <span>Create Account</span>
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
                Already have an account? <Link to="/login" className="switch-link">Login here</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;

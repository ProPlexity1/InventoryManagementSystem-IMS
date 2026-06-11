import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  * { user-select: none; }
  :root {
    --bg:      #030303;
    --surface: #0F0F0F;
    --border:  #2A2A2A;
    --text:    #FFFFFF;
    --muted:   #A1A1AA;
    --cyan:    #00B4D8;
    --purple:  #C77DFF;
    --radius:  8px;
    --error:   #FF6B6B;
  }
  body {
    background: var(--bg); color: var(--text);
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow-x: hidden;
  }
  .auth-orb-container { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
  .auth-orb {
    position: absolute; border-radius: 50%;
    filter: blur(100px); opacity: 0.35;
  }
  .auth-orb-1 {
    width: 500px; height: 500px; top: -150px; left: -100px;
    background: radial-gradient(circle, #00B4D8 0%, transparent 70%);
    animation: authDrift1 14s ease-in-out infinite;
  }
  .auth-orb-2 {
    width: 400px; height: 400px; bottom: -100px; right: -80px;
    background: radial-gradient(circle, #C77DFF 0%, transparent 70%);
    animation: authDrift2 17s ease-in-out infinite;
  }
  @keyframes authDrift1 {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(40px, 50px); }
  }
  @keyframes authDrift2 {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(-40px, -40px); }
  }
  .auth-vignette {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(3,3,3,0.92) 100%);
  }
  .auth-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 24px; position: relative; z-index: 1;
  }
  .auth-card {
    width: 100%; max-width: 420px;
    background: rgba(15,15,15,0.8);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 40px 36px;
    backdrop-filter: blur(20px);
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,180,216,0.06);
    animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .auth-logo {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; font-size: 1rem; color: var(--text);
    margin-bottom: 32px; display: inline-block;
  }
  .auth-logo span { color: var(--cyan); }
  .auth-heading {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500; font-size: 1.6rem;
    letter-spacing: -0.02em; line-height: 1.2;
    margin-bottom: 8px;
  }
  .auth-sub {
    font-size: 0.88rem; color: var(--muted); margin-bottom: 32px; line-height: 1.5;
  }
  .auth-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .auth-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted);
  }
  .auth-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 11px 14px;
    font-size: 0.9rem; font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--text); outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    user-select: text;
  }
  .auth-input::placeholder { color: #444; }
  .auth-input:focus {
    border-color: var(--cyan);
    box-shadow: 0 0 0 3px rgba(0,180,216,0.1);
  }
  .auth-error {
    font-size: 0.8rem; color: var(--error);
    background: rgba(255,107,107,0.08);
    border: 1px solid rgba(255,107,107,0.2);
    border-radius: var(--radius); padding: 10px 14px;
    margin-bottom: 20px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.02em;
  }
  .auth-btn {
    width: 100%; padding: 12px;
    background: var(--cyan); color: #000;
    border: none; border-radius: var(--radius);
    font-size: 0.9rem; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; margin-top: 8px;
    transition: opacity 0.2s, transform 0.15s;
  }
  .auth-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .auth-footer {
    margin-top: 24px; text-align: center;
    font-size: 0.82rem; color: var(--muted);
  }
  .auth-footer a {
    color: var(--cyan); text-decoration: none; font-weight: 600;
    transition: color 0.2s;
  }
  .auth-footer a:hover { color: #fff; }
  .auth-divider {
    height: 1px; background: var(--border); margin: 28px 0;
  }
  .auth-back {
    display: flex; align-items: center; gap: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--muted); text-decoration: none;
    transition: color 0.2s; margin-bottom: 28px;
  }
  .auth-back:hover { color: var(--text); }
`;

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "https://inventorymanagementsystem-ims-production.up.railway.app/api/users/login",
        form
      );
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className="auth-orb-container">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
      <div className="auth-vignette" />
      <div className="auth-page">
        <div className="auth-card">
          <Link to="/" className="auth-logo">Stock<span>Ease</span></Link>
          <Link to="/" className="auth-back">← Back to home</Link>
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-sub">Sign in to your inventory dashboard</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="auth-input"
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={handleKey}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="auth-input"
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={handleKey}
            />
          </div>

          <button className="auth-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign in →"}
          </button>

          <div className="auth-divider" />
          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
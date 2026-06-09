import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ── Skeleton shimmer card ──────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <div className="skeleton-row">
            <div className="skel skel-name" />
            <div className="skel skel-price" />
            <div className="skel skel-qty" />
            <div className="skel skel-val" />
        </div>
    );
}

// ── Floating dashboard mockup ──────────────────────────────────────────────
function DashboardMockup({ tiltX, tiltY }) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 1800);
        return () => clearTimeout(t);
    }, []);

    const items = [
        { name: "Laptop Stand", price: "Rs 2,400", qty: 14, val: "Rs 33,600" },
        { name: "USB Cables", price: "Rs 320", qty: 80, val: "Rs 25,600" },
        { name: "Notebooks", price: "Rs 150", qty: 200, val: "Rs 30,000" },
    ];

    return (
        <div
            className="mockup-wrapper"
            style={{
                transform: `perspective(900px) rotateX(${tiltY}deg) rotateY(${tiltX}deg)`,
            }}
        >
            {/* window chrome */}
            <div className="mockup-chrome">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
                <span className="mockup-title">StockEase — Dashboard</span>
            </div>

            {/* navbar */}
            <div className="mockup-nav">
                <span className="mockup-brand">📦 StockEase</span>
                <span className="mockup-logout">Logout</span>
            </div>

            {/* stats row */}
            <div className="mockup-stats">
                <div className="stat-card">
                    <p className="stat-label">Total Items</p>
                    {loaded ? <p className="stat-val blue">294</p> : <div className="skel skel-stat" />}
                </div>
                <div className="stat-card">
                    <p className="stat-label">Total Value</p>
                    {loaded ? <p className="stat-val green">Rs 89,200</p> : <div className="skel skel-stat" />}
                </div>
            </div>

            {/* table */}
            <div className="mockup-table">
                <div className="table-header">
                    <span>Name</span><span>Price</span><span>Qty</span><span>Value</span>
                </div>
                {loaded
                    ? items.map((it, i) => (
                        <div className="table-row" key={i} style={{ animationDelay: `${i * 120}ms` }}>
                            <span>{it.name}</span>
                            <span className="muted">{it.price}</span>
                            <span className="muted">{it.qty}</span>
                            <span className="green-text">{it.val}</span>
                        </div>
                    ))
                    : [0, 1, 2].map(i => <SkeletonRow key={i} />)
                }
            </div>
        </div>
    );
}

// ── Feature card ──────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
            { threshold: 0.2 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} className="feature-card fade-up" style={{ transitionDelay: `${delay}ms` }}>
            <div className="feature-icon">{icon}</div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-desc">{desc}</p>
        </div>
    );
}

// ── Step ──────────────────────────────────────────────────────────────────
function Step({ num, title, desc, delay }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
            { threshold: 0.2 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} className="step fade-up" style={{ transitionDelay: `${delay}ms` }}>
            <div className="step-num">{num}</div>
            <div>
                <h3 className="step-title">{title}</h3>
                <p className="step-desc">{desc}</p>
            </div>
        </div>
    );
}

// ── Main Landing ──────────────────────────────────────────────────────────
export default function Landing() {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const heroRef = useRef(null);
    const headlineRef = useRef(null);

    // pointer tilt
    useEffect(() => {
        const hero = heroRef.current;
        const onMove = (e) => {
            const rect = hero.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            setTilt({ x: dx * 6, y: -dy * 4 });
        };
        const onLeave = () => setTilt({ x: 0, y: 0 });
        hero.addEventListener("mousemove", onMove);
        hero.addEventListener("mouseleave", onLeave);
        return () => {
            hero.removeEventListener("mousemove", onMove);
            hero.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    // headline reveal
    useEffect(() => {
        const el = headlineRef.current;
        setTimeout(() => el.classList.add("visible"), 100);
    }, []);

    const features = [
        { icon: "⚡", title: "Instant Updates", desc: "Add, edit, or remove stock in seconds. Changes reflect immediately across your account." },
        { icon: "🔍", title: "Smart Search", desc: "Find any item instantly by name. No more scrolling through long lists." },
        { icon: "📊", title: "Live Value Tracking", desc: "See total inventory value update automatically as you manage your stock." },
        { icon: "📱", title: "Works on Mobile", desc: "Full mobile-responsive design. Manage your stock from your phone, anywhere." },
        { icon: "🔐", title: "Secure by Default", desc: "JWT-based authentication keeps your data private. Every account is fully isolated." },
        { icon: "🆓", title: "Completely Free", desc: "No subscriptions, no hidden fees. Built for small businesses that deserve better tools." },
    ];

    const steps = [
        { num: "01", title: "Create your account", desc: "Sign up in under 30 seconds. No credit card, no subscription." },
        { num: "02", title: "Add your inventory", desc: "Enter your items with price and quantity. Takes minutes." },
        { num: "03", title: "Track and manage", desc: "Search, edit, delete — your stock is always up to date." },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #0A0A0F;
          --surface:  #13131A;
          --card:     #1A1A26;
          --border:   #2A2A3D;
          --violet:   #7C3AED;
          --violet2:  #9F67FF;
          --text:     #F0F0F5;
          --muted:    #8888A0;
          --green:    #34D399;
          --blue:     #60A5FA;
          --radius:   14px;
        }

        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 6vw;
          background: rgba(10,10,15,0.7);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; color: var(--text); letter-spacing: -0.02em; }
        .nav-logo span { color: var(--violet2); }
        .nav-actions { display: flex; gap: 12px; align-items: center; }
        .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--muted); padding: 8px 18px; border-radius: 8px; font-size: 0.85rem; font-family: 'Inter', sans-serif; cursor: pointer; transition: border-color 0.2s, color 0.2s; text-decoration: none; }
        .btn-ghost:hover { border-color: var(--violet2); color: var(--text); }
        .btn-primary { background: var(--violet); color: #fff; padding: 8px 20px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; border: none; transition: background 0.2s, transform 0.15s; text-decoration: none; }
        .btn-primary:hover { background: var(--violet2); transform: translateY(-1px); }

        /* ── HERO ── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 120px 6vw 80px;
          position: relative; overflow: hidden;
          gap: 56px;
          cursor: crosshair;
        }
        .hero-glow {
          position: absolute; top: -120px; left: 50%; transform: translateX(-50%);
          width: 700px; height: 500px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-text { text-align: center; max-width: 680px; position: relative; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.3);
          color: var(--violet2); padding: 5px 14px; border-radius: 999px;
          font-size: 0.78rem; font-weight: 500; margin-bottom: 24px; letter-spacing: 0.04em;
        }
        .hero-headline {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(2.4rem, 5.5vw, 4rem);
          line-height: 1.08; letter-spacing: -0.03em;
          color: var(--text);
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .hero-headline.visible { opacity: 1; transform: translateY(0); }
        .hero-headline em { font-style: normal; color: var(--violet2); }
        .hero-sub {
          margin-top: 20px; color: var(--muted); font-size: 1.05rem; line-height: 1.65;
          font-weight: 400;
        }
        .hero-cta { margin-top: 36px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn-large { padding: 13px 32px; font-size: 0.95rem; border-radius: 10px; }

        /* ── MOCKUP ── */
        .mockup-wrapper {
          width: min(560px, 90vw);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1);
          transition: transform 0.08s ease-out;
          will-change: transform;
          flex-shrink: 0;
        }
        .mockup-chrome {
          background: #111118; padding: 10px 14px;
          display: flex; align-items: center; gap: 7px;
          border-bottom: 1px solid var(--border);
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot-red { background: #FF5F57; }
        .dot-yellow { background: #FFBD2E; }
        .dot-green { background: #28CA41; }
        .mockup-title { font-size: 0.72rem; color: var(--muted); margin-left: 8px; font-family: 'Inter', sans-serif; }
        .mockup-nav {
          background: #fff; padding: 10px 14px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .mockup-brand { font-size: 0.8rem; font-weight: 700; color: #2563EB; }
        .mockup-logout { font-size: 0.72rem; color: #EF4444; }
        .mockup-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px; background: #F3F4F6; }
        .stat-card { background: #fff; border-radius: 10px; padding: 10px 12px; }
        .stat-label { font-size: 0.65rem; color: #6B7280; margin-bottom: 4px; }
        .stat-val { font-size: 1.3rem; font-weight: 700; }
        .stat-val.blue { color: #2563EB; }
        .stat-val.green { color: #16A34A; }
        .mockup-table { background: #fff; }
        .table-header {
          display: grid; grid-template-columns: 2fr 1fr 0.6fr 1.2fr;
          padding: 7px 12px; background: #F9FAFB;
          font-size: 0.62rem; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;
          border-top: 1px solid #F3F4F6; border-bottom: 1px solid #F3F4F6;
        }
        .table-row {
          display: grid; grid-template-columns: 2fr 1fr 0.6fr 1.2fr;
          padding: 8px 12px; font-size: 0.72rem; color: #111827;
          border-bottom: 1px solid #F3F4F6;
          animation: rowFadeIn 0.35s ease both;
        }
        @keyframes rowFadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        .table-row .muted { color: #6B7280; }
        .table-row .green-text { color: #16A34A; font-weight: 500; }

        /* skeleton */
        .skeleton-row {
          display: grid; grid-template-columns: 2fr 1fr 0.6fr 1.2fr;
          padding: 8px 12px; border-bottom: 1px solid #F3F4F6; align-items: center; gap: 8px;
        }
        .skel {
          height: 10px; border-radius: 6px;
          background: linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .skel-name  { width: 80%; }
        .skel-price { width: 60%; }
        .skel-qty   { width: 40%; }
        .skel-val   { width: 70%; }
        .skel-stat  { height: 28px; border-radius: 6px; margin-top: 4px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── SECTIONS ── */
        .section { padding: 96px 6vw; }
        .section-label {
          font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--violet2); font-weight: 600; margin-bottom: 14px;
        }
        .section-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          letter-spacing: -0.025em; line-height: 1.15;
          max-width: 560px;
        }
        .section-sub { color: var(--muted); margin-top: 14px; font-size: 1rem; line-height: 1.6; max-width: 480px; }

        /* ── FEATURES ── */
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px; margin-top: 56px;
        }
        .feature-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 28px 24px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .feature-card:hover {
          border-color: rgba(124,58,237,0.4);
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }
        .feature-icon { font-size: 1.6rem; margin-bottom: 14px; }
        .feature-title { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 1rem; margin-bottom: 8px; }
        .feature-desc { color: var(--muted); font-size: 0.88rem; line-height: 1.6; }

        /* ── HOW IT WORKS ── */
        .steps { display: flex; flex-direction: column; gap: 0; margin-top: 56px; max-width: 560px; }
        .step {
          display: flex; gap: 24px; align-items: flex-start;
          padding: 28px 0; border-bottom: 1px solid var(--border);
        }
        .step:last-child { border-bottom: none; }
        .step-num {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.4rem;
          color: var(--violet2); min-width: 40px; opacity: 0.7;
        }
        .step-title { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 1rem; margin-bottom: 6px; }
        .step-desc { color: var(--muted); font-size: 0.88rem; line-height: 1.6; }

        /* ── CTA ── */
        .cta-section {
          padding: 96px 6vw; text-align: center;
          background: linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.06) 50%, transparent 100%);
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
        }
        .cta-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(1.8rem, 4vw, 3rem); letter-spacing: -0.03em;
        }
        .cta-title em { font-style: normal; color: var(--violet2); }
        .cta-sub { color: var(--muted); margin-top: 14px; font-size: 1rem; }
        .cta-buttons { margin-top: 36px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ── FOOTER ── */
        .footer {
          padding: 40px 6vw; display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px;
        }
        .footer-logo { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem; }
        .footer-logo span { color: var(--violet2); }
        .footer-text { color: var(--muted); font-size: 0.82rem; }

        /* ── FADE UP ── */
        .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }

        /* ── DIVIDER ── */
        .divider { width: 100%; height: 1px; background: var(--border); }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .nav-actions .btn-ghost { display: none; }
          .hero { padding-top: 100px; gap: 40px; }
          .mockup-wrapper { width: 100%; }
          .table-header, .table-row, .skeleton-row { grid-template-columns: 2fr 1fr 1fr; }
          .table-header span:nth-child(3),
          .table-row span:nth-child(3),
          .skeleton-row .skel-qty { display: none; }
        }
      `}</style>

            {/* NAV */}
            <nav className="nav">
                <div className="nav-logo">Stock<span>Ease</span></div>
                <div className="nav-actions">
                    <Link to="/login" className="btn-ghost">Sign in</Link>
                    <Link to="/register" className="btn-primary">Get started free</Link>
                </div>
            </nav>

            {/* HERO */}
            <section className="hero" ref={heroRef}>
                <div className="hero-glow" />
                <div className="hero-text">
                    <div className="hero-badge">✦ Free for small businesses</div>
                    <h1 className="hero-headline" ref={headlineRef}>
                        Inventory that works<br />as hard as <em>you do</em>
                    </h1>
                    <p className="hero-sub">
                        StockEase gives small businesses a clean, fast way to track stock,
                        monitor value, and stay on top of inventory — completely free.
                    </p>
                    <div className="hero-cta">
                        <Link to="/register" className="btn-primary btn-large">Start for free →</Link>
                        <Link to="/login" className="btn-ghost btn-large">Sign in</Link>
                    </div>
                </div>

                <DashboardMockup tiltX={tilt.x} tiltY={tilt.y} />
            </section>

            <div className="divider" />

            {/* FEATURES */}
            <section className="section">
                <p className="section-label">Features</p>
                <h2 className="section-title">Everything you need, nothing you don't</h2>
                <p className="section-sub">Built for shop owners, vendors, and small teams who just need it to work.</p>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} delay={i * 80} />
                    ))}
                </div>
            </section>

            <div className="divider" />

            {/* HOW IT WORKS */}
            <section className="section">
                <p className="section-label">How it works</p>
                <h2 className="section-title">Up and running in minutes</h2>
                <p className="section-sub">No setup headaches. No tutorials. Just sign up and start tracking.</p>
                <div className="steps">
                    {steps.map((s, i) => (
                        <Step key={i} num={s.num} title={s.title} desc={s.desc} delay={i * 100} />
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <h2 className="cta-title">Your stock, <em>under control</em></h2>
                <p className="cta-sub">Join businesses already using StockEase to manage their inventory.</p>
                <div className="cta-buttons">
                    <Link to="/register" className="btn-primary btn-large">Create free account →</Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-logo">Stock<span>Ease</span></div>
                <p className="footer-text">Built by ProPlexity · Free forever for small businesses</p>
            </footer>
        </>
    );
}

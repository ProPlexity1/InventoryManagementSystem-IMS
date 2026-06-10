import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

// ─────────────────────────────────────────────
//  THREE.JS BACKGROUND CANVAS
// ─────────────────────────────────────────────
function ThreeBackground() {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        const W = mount.clientWidth;
        const H = mount.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 100);
        camera.position.z = 3;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        // Particles
        const count = 1800;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const cyan = new THREE.Color("#00B4D8");
        const purple = new THREE.Color("#C77DFF");

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

            const mix = Math.random();
            const c = cyan.clone().lerp(purple, mix);
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.022,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
        });

        const particles = new THREE.Points(geo, mat);
        scene.add(particles);

        // Two large glowing spheres for depth
        const addGlow = (color, x, y, z, r) => {
            const g = new THREE.SphereGeometry(r, 32, 32);
            const m = new THREE.MeshBasicMaterial({
                color, transparent: true, opacity: 0.04,
            });
            const mesh = new THREE.Mesh(g, m);
            mesh.position.set(x, y, z);
            scene.add(mesh);
            return mesh;
        };
        const glow1 = addGlow(0x00B4D8, -2, 1, -1, 2.5);
        const glow2 = addGlow(0xC77DFF, 2, -1, -1, 2);

        // Mouse
        const mouse = { x: 0, y: 0 };
        const onMouseMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", onMouseMove);

        // Resize
        const onResize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        // Animate
        let frame;
        const clock = new THREE.Clock();
        const animate = () => {
            frame = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            particles.rotation.y = t * 0.025;
            particles.rotation.x = t * 0.01;

            // Subtle mouse parallax on particles
            particles.rotation.y += mouse.x * 0.0008;
            particles.rotation.x += mouse.y * 0.0005;

            // Glows breathe
            glow1.position.x = -2 + Math.sin(t * 0.4) * 0.5;
            glow1.position.y = 1 + Math.cos(t * 0.3) * 0.4;
            glow2.position.x = 2 + Math.cos(t * 0.35) * 0.4;
            glow2.position.y = -1 + Math.sin(t * 0.45) * 0.3;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("resize", onResize);
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
            renderer.dispose();
            geo.dispose();
            mat.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: "absolute", inset: 0,
                zIndex: 0, pointerEvents: "none",
            }}
        />
    );
}

// ─────────────────────────────────────────────
//  TICKER
// ─────────────────────────────────────────────
function Ticker() {
    const items = ["INVENTORY", "TRACKING", "STOCK CONTROL", "ANALYTICS", "FREE FOREVER", "SMALL BUSINESS"];
    const doubled = [...items, ...items];
    return (
        <div className="ticker-wrap">
            <div className="ticker-track">
                {doubled.map((t, i) => (
                    <span key={i} className="ticker-item">
                        {t} <span className="ticker-dot">✦</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  DASHBOARD MOCKUP (scroll section)
// ─────────────────────────────────────────────
function DashboardMockup() {
    const [loaded, setLoaded] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setTimeout(() => setLoaded(true), 600); obs.disconnect(); } },
            { threshold: 0.3 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    const items = [
        { name: "Laptop Stand", price: "Rs 2,400", qty: 14, val: "Rs 33,600" },
        { name: "USB Cables", price: "Rs 320", qty: 80, val: "Rs 25,600" },
        { name: "Notebooks", price: "Rs 150", qty: 200, val: "Rs 30,000" },
        { name: "Phone Holders", price: "Rs 850", qty: 35, val: "Rs 29,750" },
    ];

    return (
        <div className="mockup-outer" ref={ref}>
            {/* glow behind mockup */}
            <div className="mockup-glow" />
            <div className="mockup-shell">
                {/* chrome bar */}
                <div className="m-chrome">
                    <span className="m-dot" style={{ background: "#FF5F57" }} />
                    <span className="m-dot" style={{ background: "#FFBD2E" }} />
                    <span className="m-dot" style={{ background: "#28CA41" }} />
                    <span className="m-url">stockease.app — dashboard</span>
                </div>
                {/* app navbar */}
                <div className="m-nav">
                    <span className="m-brand">📦 StockEase</span>
                    <span className="m-navlinks">
                        <span>Dashboard</span><span>Items</span><span>Reports</span>
                    </span>
                    <span className="m-user">UK</span>
                </div>
                {/* stats */}
                <div className="m-stats">
                    {[
                        { label: "Total Items", val: "294", color: "#00B4D8" },
                        { label: "Total Value", val: "Rs 89,200", color: "#C77DFF" },
                        { label: "Low Stock", val: "3", color: "#F59E0B" },
                    ].map((s, i) => (
                        <div className="m-stat" key={i}>
                            <p className="m-stat-label">{s.label}</p>
                            {loaded
                                ? <p className="m-stat-val" style={{ color: s.color }}>{s.val}</p>
                                : <div className="skel" style={{ height: 28, width: "70%", marginTop: 6 }} />
                            }
                        </div>
                    ))}
                </div>
                {/* search bar */}
                <div className="m-search-row">
                    <div className="m-search">🔍 Search items...</div>
                    <div className="m-add-btn">+ Add Item</div>
                </div>
                {/* table */}
                <div className="m-table">
                    <div className="m-thead">
                        <span>Name</span><span>Price</span><span>Qty</span><span>Value</span><span>Actions</span>
                    </div>
                    {loaded
                        ? items.map((it, i) => (
                            <div className="m-trow" key={i} style={{ animationDelay: `${i * 100}ms` }}>
                                <span className="m-name">{it.name}</span>
                                <span className="m-muted">{it.price}</span>
                                <span className="m-muted">{it.qty}</span>
                                <span className="m-green">{it.val}</span>
                                <span className="m-actions">
                                    <span className="m-edit">✏</span>
                                    <span className="m-del">🗑</span>
                                </span>
                            </div>
                        ))
                        : [0, 1, 2, 3].map(i => (
                            <div className="m-trow" key={i}>
                                {[80, 60, 40, 70, 40].map((w, j) => (
                                    <div key={j} className="skel" style={{ width: `${w}%`, height: 10 }} />
                                ))}
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  FEATURE CARD
// ─────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent, delay }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return (
        <div ref={ref} className="feat-card fade-up" style={{ transitionDelay: `${delay}ms` }}>
            <div className="feat-icon" style={{ color: accent }}>{icon}</div>
            <h3 className="feat-title">{title}</h3>
            <p className="feat-desc">{desc}</p>
            <div className="feat-line" style={{ background: accent }} />
        </div>
    );
}

// ─────────────────────────────────────────────
//  REVEAL wrapper
// ─────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return (
        <div ref={ref} className={`fade-up ${className}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────
//  MAIN LANDING
// ─────────────────────────────────────────────
export default function Landing() {
    const features = [
        { icon: "⚡", title: "Instant Updates", desc: "Add, edit, or remove stock in seconds. Changes reflect immediately.", accent: "#00B4D8" },
        { icon: "🔍", title: "Smart Search", desc: "Find any item by name instantly. No scrolling, no wasted time.", accent: "#C77DFF" },
        { icon: "📊", title: "Live Value Tracking", desc: "Total inventory value recalculates automatically as you work.", accent: "#00B4D8" },
        { icon: "📱", title: "Works on Mobile", desc: "Full mobile-responsive design. Manage stock from anywhere.", accent: "#C77DFF" },
        { icon: "🔐", title: "Secure by Default", desc: "JWT auth keeps your data private. Every account is fully isolated.", accent: "#00B4D8" },
    ];

    const steps = [
        { num: "01", title: "Create your account", desc: "Sign up in under 30 seconds. No credit card, no subscription required." },
        { num: "02", title: "Add your inventory", desc: "Enter items with name, price, and quantity. Takes minutes to set up." },
        { num: "03", title: "Track and manage", desc: "Search, edit, delete — your stock is always accurate and up to date." },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        * { user-select: none; }

        :root {
          --bg:      #030303;
          --surface: #1A1A1A;
          --border:  #2A2A2A;
          --text:    #FFFFFF;
          --muted:   #A1A1AA;
          --cyan:    #00B4D8;
          --purple:  #C77DFF;
          --radius:  8px;
        }

        html { scroll-behavior: smooth; }
        body {
          background: var(--bg); color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ── NAV ─────────────────────────── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 6vw;
          background: rgba(3,3,3,0.75);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700; font-size: 1.1rem; color: var(--text);
          letter-spacing: -0.01em;
        }
        .nav-logo span { color: var(--cyan); }
        .nav-links {
          display: flex; gap: 32px; list-style: none;
        }
        .nav-links a {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem; font-weight: 600;
          color: var(--muted); text-decoration: none;
          letter-spacing: 0.06em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-actions { display: flex; gap: 10px; align-items: center; }
        .btn-ghost {
          background: transparent; border: 1px solid var(--border);
          color: var(--muted); padding: 8px 18px; border-radius: var(--radius);
          font-size: 0.82rem; font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500; cursor: pointer; text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
          display: inline-block;
        }
        .btn-ghost:hover { border-color: var(--cyan); color: var(--text); }
        .btn-primary {
          background: var(--cyan); color: #000;
          padding: 8px 20px; border-radius: var(--radius);
          font-size: 0.82rem; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; border: none; text-decoration: none;
          transition: opacity 0.2s, transform 0.15s;
          display: inline-block;
        }
        .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
        .btn-large { padding: 13px 32px; font-size: 0.92rem; border-radius: var(--radius); }

        /* ── HERO ─────────────────────────── */
        .hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 6vw 100px;
          overflow: hidden;
        }
        .hero-vignette {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 35%, rgba(3,3,3,0.92) 100%);
        }
        .hero-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          max-width: 860px;
        }
        .hero-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--cyan); margin-bottom: 28px;
          opacity: 0; animation: fadeUp 0.6s ease 0.2s forwards;
        }
        .hero-eyebrow span { color: var(--purple); margin: 0 6px; }

        /* masked headline reveal */
        .hero-headline-wrap {
          overflow: hidden;
          opacity: 0; animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s forwards;
        }
        .hero-headline {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
          font-size: clamp(2.8rem, 7vw, 5rem);
          line-height: 1.04; letter-spacing: -0.02em;
          color: var(--text);
        }
        .hero-headline .cyan  { color: var(--cyan); }
        .hero-headline .purple { color: var(--purple); }

        .hero-sub {
          margin-top: 24px; max-width: 520px;
          color: var(--muted); font-size: 1rem; line-height: 1.7; font-weight: 400;
          opacity: 0; animation: fadeUp 0.7s ease 0.65s forwards;
        }
        .hero-cta {
          margin-top: 44px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
          opacity: 0; animation: fadeUp 0.7s ease 0.85s forwards;
        }
        .hero-stat-row {
          margin-top: 64px; display: flex; gap: 48px; justify-content: center; flex-wrap: wrap;
          opacity: 0; animation: fadeUp 0.7s ease 1.05s forwards;
          border-top: 1px solid var(--border); padding-top: 40px; width: 100%;
        }
        .hero-stat { text-align: center; }
        .hero-stat-val {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700; font-size: 1.8rem; letter-spacing: -0.02em;
        }
        .hero-stat-val.c { color: var(--cyan); }
        .hero-stat-val.p { color: var(--purple); }
        .hero-stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem; color: var(--muted);
          letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px;
        }

        /* scroll indicator */
        .scroll-hint {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: 0; animation: fadeUp 0.6s ease 1.4s forwards;
        }
        .scroll-hint-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase;
        }
        .scroll-line {
          width: 1px; height: 36px;
          background: linear-gradient(to bottom, var(--cyan), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%,100% { opacity:0.3; transform:scaleY(1); }
          50%      { opacity:1;   transform:scaleY(1.15); }
        }

        /* ── TICKER ───────────────────────── */
        .ticker-wrap {
          overflow: hidden; border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 14px 0; background: rgba(255,255,255,0.015);
        }
        .ticker-track {
          display: flex; width: max-content;
          animation: tickerScroll 30s linear infinite;
        }
        .ticker-track:hover { animation-play-state: paused; }
        .ticker-item {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--muted); padding: 0 24px; white-space: nowrap;
          transition: color 0.2s;
        }
        .ticker-item:hover { color: var(--cyan); }
        .ticker-dot { color: var(--purple); margin-left: 8px; }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── DASHBOARD SECTION ────────────── */
        .dash-section {
          padding: 120px 6vw; position: relative;
          display: flex; flex-direction: column; align-items: center;
        }
        .dash-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--cyan); margin-bottom: 16px;
        }
        .dash-section-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500; font-size: clamp(1.8rem, 4vw, 2.8rem);
          letter-spacing: -0.02em; line-height: 1.1;
          text-align: center; max-width: 560px; margin-bottom: 12px;
        }
        .dash-section-sub {
          color: var(--muted); font-size: 0.95rem; line-height: 1.65;
          text-align: center; max-width: 440px; margin-bottom: 64px;
        }

        /* mockup */
        .mockup-outer {
          position: relative; width: min(860px, 92vw);
        }
        .mockup-glow {
          position: absolute; inset: -40px; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse at center,
            rgba(0,180,216,0.12) 0%,
            rgba(199,125,255,0.08) 50%,
            transparent 70%);
          border-radius: 24px;
        }
        .mockup-shell {
          position: relative; z-index: 1;
          background: #0F0F0F; border: 1px solid #2A2A2A;
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,180,216,0.08);
        }
        .m-chrome {
          background: #111; padding: 10px 16px;
          display: flex; align-items: center; gap: 7px;
          border-bottom: 1px solid #222;
        }
        .m-dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
        .m-url {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem; color: #555; margin-left: 10px;
        }
        .m-nav {
          background: #0A0A0A; padding: 12px 16px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #1E1E1E;
        }
        .m-brand { font-weight: 700; font-size: 0.82rem; color: var(--cyan); }
        .m-navlinks { display: flex; gap: 20px; }
        .m-navlinks span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem; color: #555; letter-spacing: 0.06em;
        }
        .m-navlinks span:first-child { color: var(--cyan); }
        .m-user {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, var(--cyan), var(--purple));
          font-size: 0.65rem; font-weight: 700; color: #000;
          display: flex; align-items: center; justify-content: center;
        }
        .m-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: #1A1A1A;
          border-bottom: 1px solid #1A1A1A;
        }
        .m-stat {
          background: #0A0A0A; padding: 16px 20px;
        }
        .m-stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem; color: #555; letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 6px;
        }
        .m-stat-val { font-weight: 700; font-size: 1.3rem; }
        .m-search-row {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; background: #0A0A0A; border-bottom: 1px solid #1A1A1A;
        }
        .m-search {
          flex: 1; background: #111; border: 1px solid #222; border-radius: 6px;
          padding: 7px 12px; font-size: 0.72rem; color: #444;
          font-family: 'JetBrains Mono', monospace;
        }
        .m-add-btn {
          background: var(--cyan); color: #000;
          padding: 7px 14px; border-radius: 6px;
          font-size: 0.72rem; font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }
        .m-table { background: #080808; }
        .m-thead {
          display: grid; grid-template-columns: 2fr 1fr 0.7fr 1.2fr 0.8fr;
          padding: 8px 16px; background: #0F0F0F;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem; color: #444; text-transform: uppercase; letter-spacing: 0.08em;
          border-bottom: 1px solid #1A1A1A;
        }
        .m-trow {
          display: grid; grid-template-columns: 2fr 1fr 0.7fr 1.2fr 0.8fr;
          padding: 10px 16px; font-size: 0.72rem;
          border-bottom: 1px solid #111;
          align-items: center; gap: 8px;
          animation: rowIn 0.3s ease both;
        }
        @keyframes rowIn { from { opacity:0; transform:translateY(3px); } to { opacity:1; transform:none; } }
        .m-name  { color: #E5E5E5; font-weight: 500; }
        .m-muted { color: #555; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; }
        .m-green { color: #34D399; font-weight: 600; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; }
        .m-actions { display: flex; gap: 8px; }
        .m-edit { cursor: pointer; font-size: 0.75rem; opacity: 0.5; }
        .m-del  { cursor: pointer; font-size: 0.75rem; opacity: 0.5; }

        /* skeleton in dark mockup */
        .skel {
          border-radius: 4px;
          background: linear-gradient(90deg, #1A1A1A 25%, #242424 50%, #1A1A1A 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── FEATURES ─────────────────────── */
        .feat-section { padding: 120px 6vw; }
        .feat-header { margin-bottom: 64px; }
        .feat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--purple); margin-bottom: 16px;
        }
        .feat-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500; font-size: clamp(1.8rem, 4vw, 2.8rem);
          letter-spacing: -0.02em; line-height: 1.1; max-width: 500px;
        }
        .feat-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1px; background: var(--border);
          border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;
        }
        .feat-card {
          background: var(--bg); padding: 32px 28px;
          position: relative; overflow: hidden;
          transition: background 0.3s;
        }
        .feat-card:hover { background: #0D0D0D; }
        .feat-icon { font-size: 1.5rem; margin-bottom: 16px; }
        .feat-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 10px; color: var(--text); }
        .feat-desc { color: var(--muted); font-size: 0.85rem; line-height: 1.65; }
        .feat-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          opacity: 0; transition: opacity 0.3s;
        }
        .feat-card:hover .feat-line { opacity: 1; }

        /* ── HOW IT WORKS ─────────────────── */
        .steps-section { padding: 120px 6vw; border-top: 1px solid var(--border); }
        .steps-inner {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: start; max-width: 1000px;
        }
        .steps-left {}
        .steps-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--cyan); margin-bottom: 16px;
        }
        .steps-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500; font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 16px;
        }
        .steps-sub { color: var(--muted); font-size: 0.9rem; line-height: 1.65; }
        .steps-list { display: flex; flex-direction: column; }
        .step-item {
          display: flex; gap: 20px; padding: 28px 0;
          border-bottom: 1px solid var(--border);
        }
        .step-item:last-child { border-bottom: none; }
        .step-num {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600; font-size: 0.72rem; letter-spacing: 0.06em;
          color: var(--cyan); min-width: 28px; padding-top: 2px;
        }
        .step-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 6px; }
        .step-desc { color: var(--muted); font-size: 0.85rem; line-height: 1.6; }

        /* ── CTA ──────────────────────────── */
        .cta-section {
          padding: 140px 6vw; text-align: center;
          border-top: 1px solid var(--border);
          position: relative; overflow: hidden;
        }
        .cta-glow {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse,
            rgba(0,180,216,0.08) 0%,
            rgba(199,125,255,0.06) 40%,
            transparent 70%);
          pointer-events: none;
        }
        .cta-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--purple); margin-bottom: 20px;
        }
        .cta-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500; font-size: clamp(2rem, 5vw, 3.6rem);
          letter-spacing: -0.02em; line-height: 1.08; max-width: 600px; margin: 0 auto;
        }
        .cta-title .cyan { color: var(--cyan); }
        .cta-sub {
          color: var(--muted); margin-top: 16px; font-size: 0.95rem; line-height: 1.65;
        }
        .cta-buttons { margin-top: 44px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ── FOOTER ───────────────────────── */
        .footer {
          padding: 36px 6vw; border-top: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .footer-logo { font-weight: 700; font-size: 0.95rem; }
        .footer-logo span { color: var(--cyan); }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem; color: var(--muted); text-decoration: none;
          letter-spacing: 0.06em; text-transform: uppercase; transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--text); }
        .footer-copy {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem; color: #444; letter-spacing: 0.04em;
        }

        /* ── UTILS ────────────────────────── */
        .fade-up { opacity:0; transform:translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── RESPONSIVE ───────────────────── */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .steps-inner { grid-template-columns: 1fr; gap: 48px; }
          .m-thead, .m-trow { grid-template-columns: 2fr 1fr 1fr; }
          .m-thead span:nth-child(3), .m-trow span:nth-child(3),
          .m-thead span:nth-child(5), .m-trow span:nth-child(5) { display: none; }
          .m-stats { grid-template-columns: 1fr 1fr; }
          .m-stats .m-stat:last-child { display: none; }
          .hero-stat-row { gap: 32px; }
        }
        @media (max-width: 480px) {
          .btn-ghost.nav-ghost { display: none; }
          .hero-headline { font-size: 2.4rem; }
        }
      `}</style>

            {/* ── NAV ── */}
            <nav className="nav">
                <div className="nav-logo">Stock<span>Ease</span></div>
                <ul className="nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#how">How it works</a></li>
                    <li><a href="#dashboard">Preview</a></li>
                </ul>
                <div className="nav-actions">
                    <Link to="/login" className="btn-ghost nav-ghost">Sign in</Link>
                    <Link to="/register" className="btn-primary">Get started free</Link>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero">
                <ThreeBackground />
                <div className="hero-vignette" />

                <div className="hero-content">
                    <p className="hero-eyebrow">
                        INVENTORY <span>✦</span> TRACKING <span>✦</span> FREE FOREVER
                    </p>

                    <div className="hero-headline-wrap">
                        <h1 className="hero-headline">
                            Built for Businesses<br />
                            That <span className="cyan">Mean</span> <span className="purple">Business</span>
                        </h1>
                    </div>

                    <p className="hero-sub">
                        StockEase gives small businesses a clean, fast way to track stock,
                        monitor value, and stay on top of inventory — completely free, forever.
                    </p>

                    <div className="hero-cta">
                        <Link to="/register" className="btn-primary btn-large">Start for free →</Link>
                        <Link to="/login" className="btn-ghost btn-large">Sign in</Link>
                    </div>

                    <div className="hero-stat-row">
                        <div className="hero-stat">
                            <div className="hero-stat-val c">100%</div>
                            <div className="hero-stat-label">Free forever</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-val p">30s</div>
                            <div className="hero-stat-label">To get started</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-val c">∞</div>
                            <div className="hero-stat-label">Items supported</div>
                        </div>
                    </div>
                </div>

                <div className="scroll-hint">
                    <span className="scroll-hint-label">scroll</span>
                    <div className="scroll-line" />
                </div>
            </section>

            {/* ── TICKER ── */}
            <Ticker />

            {/* ── DASHBOARD PREVIEW ── */}
            <section className="dash-section" id="dashboard">
                <Reveal><p className="dash-section-label">Live Preview</p></Reveal>
                <Reveal delay={100}><h2 className="dash-section-title">See exactly what you're getting</h2></Reveal>
                <Reveal delay={200}><p className="dash-section-sub">A clean, fast dashboard. No bloat, no confusion — just your inventory, always in view.</p></Reveal>
                <Reveal delay={300} className="fade-up" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <DashboardMockup />
                </Reveal>
            </section>

            {/* ── FEATURES ── */}
            <section className="feat-section" id="features">
                <Reveal className="feat-header">
                    <p className="feat-label">Features</p>
                    <h2 className="feat-title">Everything you need, nothing you don't</h2>
                </Reveal>
                <div className="feat-grid">
                    {features.map((f, i) => (
                        <FeatureCard key={i} {...f} delay={i * 70} />
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="steps-section" id="how">
                <div className="steps-inner">
                    <Reveal className="steps-left">
                        <p className="steps-label">How it works</p>
                        <h2 className="steps-title">Up and running in minutes</h2>
                        <p className="steps-sub">No setup headaches. No tutorials required. Just sign up and start tracking your inventory right away.</p>
                    </Reveal>
                    <div className="steps-list">
                        {steps.map((s, i) => (
                            <Reveal key={i} delay={i * 120}>
                                <div className="step-item">
                                    <span className="step-num">{s.num}</span>
                                    <div>
                                        <p className="step-title">{s.title}</p>
                                        <p className="step-desc">{s.desc}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="cta-glow" />
                <Reveal><p className="cta-label">Get started today</p></Reveal>
                <Reveal delay={100}>
                    <h2 className="cta-title">Your stock, <span className="cyan">under control</span></h2>
                </Reveal>
                <Reveal delay={200}><p className="cta-sub">Join businesses already using StockEase. Free forever, no card needed.</p></Reveal>
                <Reveal delay={300}>
                    <div className="cta-buttons">
                        <Link to="/register" className="btn-primary btn-large">Create free account →</Link>
                        <Link to="/login" className="btn-ghost btn-large">Sign in</Link>
                    </div>
                </Reveal>
            </section>

            {/* ── FOOTER ── */}
            <footer className="footer">
                <div className="footer-logo">Stock<span>Ease</span></div>
                <div className="footer-links">
                    <a href="#features">Features</a>
                    <a href="#how">How it works</a>
                    <Link to="/login">Sign in</Link>
                </div>
                <p className="footer-copy">Built by ProPlexity · Free forever</p>
            </footer>
        </>
    );
}
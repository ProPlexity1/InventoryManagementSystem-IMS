import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "https://inventorymanagementsystem-ims-production.up.railway.app";

const LOW_STOCK_THRESHOLD = 10;

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [form, setForm] = useState({ name: "", price: "", quantity: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/items`, authHeaders);
      setItems(res.data);
    } catch {
      setError("Failed to fetch items. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => {
    setForm({ name: "", price: "", quantity: "" });
    setEditingItem(null);
    setModal("add");
  };

  const openEdit = (item) => {
    setForm({ name: item.name, price: item.price, quantity: item.quantity });
    setEditingItem(item);
    setModal("edit");
  };

  const closeModal = () => { setModal(null); setEditingItem(null); setError(""); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.quantity) {
      setError("All fields are required."); return;
    }
    setSaving(true); setError("");
    try {
      if (modal === "add") {
        await axios.post(`${API}/api/items`, form, authHeaders);
      } else {
        await axios.put(`${API}/api/items/${editingItem.id}`, {
          id: editingItem.id,
          name: form.name,
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity),
          userId: editingItem.userId,
        }, authHeaders);
      }
      closeModal();
      fetchItems();
    } catch {
      setError(modal === "add" ? "Failed to add item." : "Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/api/items/${deleteTarget.id}`, authHeaders);
      setDeleteTarget(null);
      fetchItems();
    } catch {
      setError("Failed to delete item.");
      setDeleteTarget(null);
    }
  };

  const logout = () => { localStorage.removeItem("token"); navigate("/"); };

  const totalValue = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const lowStockCount = items.filter(i => i.quantity <= LOW_STOCK_THRESHOLD).length;
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        * { user-select: none; }

        :root {
          --bg:      #030303;
          --surface: #0A0A0A;
          --card:    #0F0F0F;
          --border:  #1E1E1E;
          --border2: #2A2A2A;
          --text:    #FFFFFF;
          --muted:   #A1A1AA;
          --dim:     #555;
          --cyan:    #00B4D8;
          --purple:  #C77DFF;
          --green:   #34D399;
          --amber:   #F59E0B;
          --red:     #FF6B6B;
          --radius:  8px;
        }

        body { background: var(--bg); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }

        /* ── NAV ── */
        .db-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(3,3,3,0.85); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 60px;
        }
        .db-nav-left { display: flex; align-items: center; gap: 32px; }
        .db-logo { font-weight: 700; font-size: 1rem; color: var(--text); text-decoration: none; }
        .db-logo span { color: var(--cyan); }
        .db-nav-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--dim);
        }
        .db-nav-right { display: flex; align-items: center; gap: 16px; }
        .db-logout-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--dim);
          background: none; border: none; cursor: pointer;
          transition: color 0.2s; padding: 6px 0;
        }
        .db-logout-btn:hover { color: var(--red); }

        /* ── LAYOUT ── */
        .db-body { max-width: 1100px; margin: 0 auto; padding: 40px 32px; }

        /* ── PAGE HEADER ── */
        .db-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .db-header-title { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; font-size: 1.5rem; letter-spacing: -0.02em; }
        .db-header-sub { color: var(--muted); font-size: 0.85rem; margin-top: 4px; }

        /* ── STATS ── */
        .db-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 32px; }
        .db-stat { background: var(--card); padding: 24px 20px; position: relative; }
        .db-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; }
        .db-stat:nth-child(1)::before { background: linear-gradient(90deg, transparent, var(--cyan), transparent); }
        .db-stat:nth-child(2)::before { background: linear-gradient(90deg, transparent, var(--purple), transparent); }
        .db-stat:nth-child(3)::before { background: linear-gradient(90deg, transparent, var(--amber), transparent); }
        .db-stat-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dim); margin-bottom: 10px; }
        .db-stat-val { font-weight: 700; font-size: 1.8rem; letter-spacing: -0.03em; }
        .db-stat-val.cyan   { color: var(--cyan); }
        .db-stat-val.purple { color: var(--purple); }
        .db-stat-val.amber  { color: var(--amber); }

        /* ── TOOLBAR ── */
        .db-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .db-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 320px; }
        .db-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--dim); font-size: 0.8rem; pointer-events: none; }
        .db-search {
          width: 100%; background: var(--card); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 9px 14px 9px 34px;
          font-size: 0.85rem; font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text); outline: none; transition: border-color 0.2s;
          user-select: text;
        }
        .db-search::placeholder { color: var(--dim); }
        .db-search:focus { border-color: var(--cyan); }
        .db-add-btn {
          background: var(--cyan); color: #000;
          border: none; border-radius: var(--radius);
          padding: 9px 20px; font-size: 0.85rem; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; white-space: nowrap;
          transition: opacity 0.2s, transform 0.15s;
          display: flex; align-items: center; gap: 6px;
        }
        .db-add-btn:hover { opacity: 0.85; transform: translateY(-1px); }

        /* ── TABLE ── */
        .db-table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
        .db-table { width: 100%; border-collapse: collapse; }
        .db-thead tr { border-bottom: 1px solid var(--border); }
        .db-thead th {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--dim); padding: 12px 16px; text-align: left; background: var(--surface);
        }
        .db-tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        .db-tbody tr:last-child { border-bottom: none; }
        .db-tbody tr:hover { background: rgba(255,255,255,0.02); }
        .db-tbody td { padding: 13px 16px; font-size: 0.85rem; vertical-align: middle; }
        .db-td-name { color: var(--text); font-weight: 500; }
        .db-td-mono { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: var(--muted); }
        .db-td-value { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: var(--green); font-weight: 600; }
        .db-td-actions { display: flex; gap: 8px; }
        .db-btn-edit {
          font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
          font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--cyan); background: rgba(0,180,216,0.08);
          border: 1px solid rgba(0,180,216,0.2); border-radius: 6px;
          padding: 5px 12px; cursor: pointer; transition: background 0.2s, border-color 0.2s;
        }
        .db-btn-edit:hover { background: rgba(0,180,216,0.15); border-color: rgba(0,180,216,0.4); }
        .db-btn-delete {
          font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
          font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--red); background: rgba(255,107,107,0.06);
          border: 1px solid rgba(255,107,107,0.15); border-radius: 6px;
          padding: 5px 12px; cursor: pointer; transition: background 0.2s, border-color 0.2s;
        }
        .db-btn-delete:hover { background: rgba(255,107,107,0.12); border-color: rgba(255,107,107,0.3); }
        .db-low-badge {
          font-family: 'JetBrains Mono', monospace; font-size: 0.55rem;
          font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--amber); background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2); border-radius: 4px;
          padding: 2px 6px; margin-left: 8px;
        }

        /* empty + loading states */
        .db-empty { text-align: center; padding: 64px 24px; }
        .db-empty-icon { font-size: 2rem; margin-bottom: 12px; opacity: 0.4; }
        .db-empty-text { color: var(--muted); font-size: 0.88rem; }
        .db-loading { text-align: center; padding: 64px 24px; }
        .db-spinner {
          width: 28px; height: 28px; border-radius: 50%;
          border: 2px solid var(--border);
          border-top-color: var(--cyan);
          animation: spin 0.7s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .db-loading-text { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dim); }

        /* error banner */
        .db-error { background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.2); border-radius: var(--radius); padding: 12px 16px; margin-bottom: 24px; font-size: 0.82rem; color: var(--red); font-family: 'JetBrains Mono', monospace; }

        /* mobile cards */
        .db-mobile-cards { display: none; }
        .db-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 8px; }
        .db-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .db-card-name { font-weight: 600; font-size: 0.92rem; }
        .db-card-meta { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--muted); margin-top: 3px; }
        .db-card-val { font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: var(--green); font-weight: 600; margin-top: 2px; }

        /* ── MODAL ── */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
          animation: backdropIn 0.2s ease;
        }
        @keyframes backdropIn { from{opacity:0;} to{opacity:1;} }
        .modal-box {
          width: 100%; max-width: 420px;
          background: #0F0F0F; border: 1px solid var(--border2);
          border-radius: 14px; padding: 32px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(10px);} to{opacity:1;transform:none;} }
        .modal-title { font-family:'Plus Jakarta Sans',sans-serif; font-weight:500; font-size:1.2rem; letter-spacing:-0.01em; margin-bottom:6px; }
        .modal-sub { font-size:0.82rem; color:var(--muted); margin-bottom:24px; }
        .modal-field { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
        .modal-label { font-family:'JetBrains Mono',monospace; font-size:0.6rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--dim); }
        .modal-input { background:rgba(255,255,255,0.04); border:1px solid var(--border2); border-radius:var(--radius); padding:10px 14px; font-size:0.88rem; font-family:'Plus Jakarta Sans',sans-serif; color:var(--text); outline:none; transition:border-color 0.2s,box-shadow 0.2s; user-select:text; }
        .modal-input::placeholder { color: #333; }
        .modal-input:focus { border-color:var(--cyan); box-shadow:0 0 0 3px rgba(0,180,216,0.08); }
        .modal-error { font-size:0.78rem; color:var(--red); background:rgba(255,107,107,0.08); border:1px solid rgba(255,107,107,0.2); border-radius:6px; padding:9px 12px; margin-bottom:16px; font-family:'JetBrains Mono',monospace; }
        .modal-actions { display:flex; gap:10px; margin-top:20px; }
        .modal-btn-primary { flex:1; padding:11px; background:var(--cyan); color:#000; border:none; border-radius:var(--radius); font-size:0.88rem; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:opacity 0.2s; }
        .modal-btn-primary:hover:not(:disabled) { opacity:0.85; }
        .modal-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
        .modal-btn-cancel { padding:11px 20px; background:transparent; color:var(--muted); border:1px solid var(--border2); border-radius:var(--radius); font-size:0.88rem; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:border-color 0.2s,color 0.2s; }
        .modal-btn-cancel:hover { border-color:var(--border2); color:var(--text); }

        /* delete confirm modal */
        .del-icon { font-size:1.8rem; margin-bottom:12px; }
        .del-title { font-family:'Plus Jakarta Sans',sans-serif; font-weight:500; font-size:1.1rem; margin-bottom:8px; }
        .del-msg { font-size:0.85rem; color:var(--muted); line-height:1.55; margin-bottom:24px; }
        .del-item-name { color:var(--text); font-weight:600; }
        .modal-btn-danger { flex:1; padding:11px; background:var(--red); color:#fff; border:none; border-radius:var(--radius); font-size:0.88rem; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:opacity 0.2s; }
        .modal-btn-danger:hover { opacity:0.85; }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .db-body { padding: 24px 16px; }
          .db-nav { padding: 0 16px; }
          .db-stats { grid-template-columns: 1fr 1fr; }
          .db-stats .db-stat:last-child { grid-column: span 2; }
          .db-table-desktop { display: none; }
          .db-mobile-cards { display: block; }
          .db-stat-val { font-size: 1.4rem; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="db-nav">
        <div className="db-nav-left">
          <Link to="/" className="db-logo">Stor<span>ix</span></Link>
          <span className="db-nav-label">Dashboard</span>
        </div>
        <div className="db-nav-right">
          <button className="db-logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div className="db-body">

        {/* Header */}
        <div className="db-header">
          <div>
            <h1 className="db-header-title">Inventory</h1>
            <p className="db-header-sub">Manage your stock, track value, stay in control.</p>
          </div>
        </div>

        {/* Error banner */}
        {error && !modal && <div className="db-error">{error}</div>}

        {/* Stats */}
        <div className="db-stats">
          <div className="db-stat">
            <div className="db-stat-label">Total Items</div>
            <div className="db-stat-val cyan">{loading ? "—" : items.length}</div>
          </div>
          <div className="db-stat">
            <div className="db-stat-label">Total Value</div>
            <div className="db-stat-val purple">{loading ? "—" : `Rs ${totalValue.toLocaleString()}`}</div>
          </div>
          <div className="db-stat">
            <div className="db-stat-label">Low Stock</div>
            <div className="db-stat-val amber">{loading ? "—" : lowStockCount}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="db-toolbar">
          <div className="db-search-wrap">
            <span className="db-search-icon">🔍</span>
            <input
              className="db-search"
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="db-add-btn" onClick={openAdd}>+ Add Item</button>
        </div>

        {/* Table */}
        <div className="db-table-wrap">
          {loading ? (
            <div className="db-loading">
              <div className="db-spinner" />
              <div className="db-loading-text">Loading inventory...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">📦</div>
              <div className="db-empty-text">No items yet. Add your first item to get started.</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">🔍</div>
              <div className="db-empty-text">No items match your search.</div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="db-table-desktop">
                <table className="db-table">
                  <thead className="db-thead">
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="db-tbody">
                    {filtered.map(item => (
                      <tr key={item.id}>
                        <td className="db-td-name">
                          {item.name}
                          {item.quantity <= LOW_STOCK_THRESHOLD && (
                            <span className="db-low-badge">low</span>
                          )}
                        </td>
                        <td className="db-td-mono">Rs {Number(item.price).toLocaleString()}</td>
                        <td className="db-td-mono">{item.quantity}</td>
                        <td className="db-td-value">Rs {(item.price * item.quantity).toLocaleString()}</td>
                        <td>
                          <div className="db-td-actions">
                            <button className="db-btn-edit" onClick={() => openEdit(item)}>Edit</button>
                            <button className="db-btn-delete" onClick={() => setDeleteTarget(item)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="db-mobile-cards" style={{ padding: 12 }}>
                {filtered.map(item => (
                  <div className="db-card" key={item.id}>
                    <div className="db-card-top">
                      <div>
                        <div className="db-card-name">
                          {item.name}
                          {item.quantity <= LOW_STOCK_THRESHOLD && (
                            <span className="db-low-badge">low</span>
                          )}
                        </div>
                        <div className="db-card-meta">Rs {Number(item.price).toLocaleString()} × {item.quantity}</div>
                        <div className="db-card-val">Rs {(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                      <div className="db-td-actions">
                        <button className="db-btn-edit" onClick={() => openEdit(item)}>Edit</button>
                        <button className="db-btn-delete" onClick={() => setDeleteTarget(item)}>Del</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {modal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-box">
            <div className="modal-title">{modal === "add" ? "Add new item" : "Edit item"}</div>
            <div className="modal-sub">{modal === "add" ? "Enter the details for your new inventory item." : "Update the details for this item."}</div>

            {error && <div className="modal-error">{error}</div>}

            <div className="modal-field">
              <label className="modal-label">Item Name</label>
              <input className="modal-input" type="text" placeholder="e.g. USB Cable"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Price (Rs)</label>
              <input className="modal-input" type="number" placeholder="e.g. 350"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Quantity</label>
              <input className="modal-input" type="number" placeholder="e.g. 50"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="modal-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : modal === "add" ? "Add item" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="modal-box">
            <div className="del-icon">🗑️</div>
            <div className="del-title">Delete item?</div>
            <div className="del-msg">
              This will permanently remove{" "}
              <span className="del-item-name">"{deleteTarget.name}"</span>{" "}
              from your inventory. This action cannot be undone.
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="modal-btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
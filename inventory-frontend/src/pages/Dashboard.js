import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://inventorymanagementsystem-ims-production.up.railway.app";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", quantity: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/items`, authHeaders);
      setItems(res.data);
    } catch (err) {
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async () => {
    if (!form.name || !form.price || !form.quantity) return;
    try {
      await axios.post(`${API}/api/items`, form, authHeaders);
      setForm({ name: "", price: "", quantity: "" });
      fetchItems();
    } catch (err) {
      setError("Failed to add item");
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, price: item.price, quantity: item.quantity });
  };

  const saveEdit = async () => {
    if (!form.name || !form.price || !form.quantity) return;
    try {
      await axios.put(`${API}/api/items/${editingItem.id}`, {
        id: editingItem.id,
        name: form.name,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        userId: editingItem.userId
      }, authHeaders);
      setEditingItem(null);
      setForm({ name: "", price: "", quantity: "" });
      fetchItems();
    } catch (err) {
      setError("Failed to update item");
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setForm({ name: "", price: "", quantity: "" });
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API}/api/items/${id}`, authHeaders);
      fetchItems();
    } catch (err) {
      setError("Failed to delete item");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow px-4 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-blue-600">📦 Inventory Manager</h1>
        <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-xs">Total Items</p>
            <p className="text-3xl font-bold text-blue-600">{items.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-xs">Total Value</p>
            <p className="text-2xl font-bold text-green-600">Rs {totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            {editingItem ? "✏️ Edit Item" : "Add New Item"}
          </h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Item name"
              value={form.name}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <div className="flex flex-col gap-2">
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              {editingItem ? (
                <>
                  <button
                    onClick={saveEdit}
                    className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold flex-1"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold flex-1"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={addItem}
                  className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold w-full"
                >
                  Add Item
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-4 border-b flex flex-col md:flex-row gap-2 md:items-center justify-between">
            <h2 className="text-base font-semibold text-gray-700">Inventory</h2>
            <input
              type="text"
              placeholder="🔍 Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-64"
            />
          </div>

          {loading ? (
            <p className="text-center py-6 text-gray-400">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-center py-6 text-gray-400">No items yet. Add your first item!</p>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredItems.map(item => (
                  <div key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Rs {item.price} × {item.quantity}</p>
                        <p className="text-sm font-medium text-green-600">Rs {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-3 ml-4">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <table className="w-full text-sm hidden md:table">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Quantity</th>
                    <th className="px-6 py-3 text-left">Total Value</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                      <td className="px-6 py-4 text-gray-600">Rs {item.price}</td>
                      <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">Rs {(item.price * item.quantity).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => startEdit(item)}
                            className="text-blue-500 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
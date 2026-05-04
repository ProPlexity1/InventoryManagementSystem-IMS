import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", quantity: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5235/api/items", authHeaders);
      setItems(res.data);
    } catch (err) {
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async () => {
    if (!form.name || !form.price || !form.quantity) return;
    try {
      await axios.post("http://localhost:5235/api/items", form, authHeaders);
      setForm({ name: "", price: "", quantity: "" });
      fetchItems();
    } catch (err) {
      setError("Failed to add item");
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5235/api/items/${id}`, authHeaders);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">📦 Inventory Manager</h1>
        <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Total Items</p>
            <p className="text-3xl font-bold text-blue-600">{items.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Total Value</p>
            <p className="text-3xl font-bold text-green-600">Rs {totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Item</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Item name"
              value={form.name}
              className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              className="border border-gray-300 rounded-lg px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              className="border border-gray-300 rounded-lg px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setForm({ ...form, quantity: e.target.value })}
            />
            <button
              onClick={addItem}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
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
              {loading ? (
                <tr><td colSpan="5" className="text-center py-6 text-gray-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-6 text-gray-400">No items yet. Add your first item!</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">Rs {item.price}</td>
                    <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-green-600 font-medium">Rs {(item.price * item.quantity).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
import React, { useState, useEffect } from "react";
import axios from "axios";

function ItemList() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", quantity: "" });

  useEffect(() => {
    axios.get("http://localhost:5235/api/items")  // changed https to http
      .then(res => setItems(res.data))
      .catch(err => console.error("Fetch error:", err));  // better error logging
  }, []);
  
  const addItem = () => {
    axios.post("http://localhost:5235/api/items", newItem)
      .then(res => setItems([...items, res.data]));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Inventory</h2>
      <input placeholder="Name" onChange={e => setNewItem({...newItem, name: e.target.value})}/>
      <input placeholder="Price" onChange={e => setNewItem({...newItem, price: e.target.value})}/>
      <input placeholder="Quantity" onChange={e => setNewItem({...newItem, quantity: e.target.value})}/>
      <button onClick={addItem}>Add Item</button>

      <ul>
        {items.map(i => (
          <li key={i.id}>{i.name} - {i.price} - {i.quantity}</li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;

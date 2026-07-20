import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const CartContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

// ✅ Helper - force all values to be primitive
const safeString = (val) => String(val || '');
const safeNumber = (val) => typeof val === 'number' ? val : parseFloat(val) || 0;
const safeInt = (val) => typeof val === 'number' ? val : parseInt(val) || 1;

// ✅ Sanitize cart item - remove ALL objects
const sanitizeItem = (item) => {
  if (!item || typeof item !== 'object') {
    return { productId: '', name: 'Product', price: 0, quantity: 1, image: '' };
  }
  
  // ✅ Only keep primitive values
  return {
    productId: safeString(item.productId || item._id),
    name: safeString(item.name || 'Product'),
    price: safeNumber(item.price),
    quantity: safeInt(item.quantity),
    image: Array.isArray(item.image) ? safeString(item.image[0]) : safeString(item.image),
  };
};

export const CartProvider = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState([]);

  const getGuestId = () => {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = uuidv4();
      localStorage.setItem("guestId", guestId);
    }
    return guestId;
  };

  const guestId = getGuestId();

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/cart/${guestId}`);
      const items = res.data.items || [];
      
      // ✅ Sanitize EVERY item
      const cleanItems = items.map(item => sanitizeItem(item));
      
      console.log("✅ Cart loaded:", cleanItems.length, "items");
      setCart(cleanItems);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setCart([]);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/cart/clear/${guestId}`);
      setCart([]);
      setShowCart(false);
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        fetchCart,
        clearCart,
        showCart,
        setShowCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
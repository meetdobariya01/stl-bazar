import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // ✅ ADD

const CartContext = createContext();
const API_URL = process.env.REACT_APP_API_URL;

export const CartProvider = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState([]);

  // ✅ CREATE GUEST ID ONCE
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
    const res = await axios.get(`${API_URL}/cart/${guestId}`);
    setCart(res.data.items || []);
  };

  const clearCart = async () => {
    await axios.delete(`${API_URL}/cart/clear/${guestId}`);
    setCart([]);
    setShowCart(false);
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

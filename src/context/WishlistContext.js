
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const getGuestId = useCallback(() => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const guestId = getGuestId();
      
      if (!guestId) {
        setWishlistItems([]);
        setWishlistCount(0);
        return;
      }

      const response = await axios.get(`${API_URL}/wishlist/${guestId}`);
      
      let items = [];
      if (response.data && response.data.items) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }

      setWishlistItems(items);
      setWishlistCount(items.length);
      
      return items;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
      setWishlistCount(0);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getGuestId]);


  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => {
      const itemId = item.productId?._id || item.productId || item._id;
      return itemId && itemId.toString() === productId.toString();
    });
  }, [wishlistItems]);

  const addToWishlist = useCallback(async (product) => {
    try {
      const guestId = getGuestId();
      
      const payload = {
        guestId: guestId,
        product: {
          productId: product.productId || product._id,
          name: product.name,
          price: product.price,
          image: Array.isArray(product.image) ? product.image[0] : product.image,
          company: product.company || "Native91",
        }
      };

      const response = await axios.post(`${API_URL}/wishlist/add`, payload);
      

      await fetchWishlist();
      

      window.dispatchEvent(new Event('wishlistUpdated'));
      
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }, [getGuestId, fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      const guestId = getGuestId();
      
      const response = await axios.delete(`${API_URL}/wishlist/remove`, {
        data: { guestId, productId }
      });
      
   
      await fetchWishlist();
     
      window.dispatchEvent(new Event('wishlistUpdated'));
      
      return response.data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }, [getGuestId, fetchWishlist]);


  const toggleWishlist = useCallback(async (product) => {
    try {
      const productId = product.productId || product._id;
      const exists = isInWishlist(productId);
      
      if (exists) {
        await removeFromWishlist(productId);
        return { action: 'removed', productId };
      } else {
        await addToWishlist(product);
        return { action: 'added', productId };
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  const clearWishlist = useCallback(async () => {
    try {
      const guestId = getGuestId();
      
      const response = await axios.delete(`${API_URL}/wishlist/clear/${guestId}`);
      
      setWishlistItems([]);
      setWishlistCount(0);
      
      window.dispatchEvent(new Event('wishlistUpdated'));
      
      return response.data;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  }, [getGuestId]);

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    fetchWishlist,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
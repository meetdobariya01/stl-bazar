import React, { useState } from "react";
import { Navbar, Container, Form, FormControl, Nav } from "react-bootstrap";
import {
  FaHeart,
  FaUser,
  FaShoppingBag,
  FaSearch,
  FaTimes,
  FaPlus,
  FaMinus,
  FaBars,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { NavLink } from "react-router-dom";

import "./header.css";

const Header = () => {
  const navigate = useNavigate();

  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState([
    { id: 1, name: "Organic Product", qty: 1 },
  ]);

  const totalQty = cart.reduce((a, b) => a + b.qty, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      alert(`Searching for: ${search}`);
      setShowMobileMenu(false);
    }
  };

  const increaseQty = (id) => {
    setCart(cart.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  };

  return (
    <>
      {/* HEADER */}
      <Navbar className="main-header">
        <Container fluid className="header-wrapper">
          {/* MOBILE TOGGLE */}
          <div
            className="mobile-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <FaBars />
          </div>

          {/* LOGO */}
          <div className="logo-box" onClick={() => navigate("/")}>
            <img src="/images/logo.png" alt="logo" />
          </div>

          {/* DESKTOP SEARCH */}
          <div className="search-wrapper desktop-only">
            <Form className="search-form" onSubmit={handleSearch}>
              <FormControl
                type="search"
                placeholder="Search"
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="search-btn" type="submit">
                <FaSearch />
              </button>
            </Form>
          </div>

          {/* ICONS */}
          <div className="icon-group">
            <FaSearch
              className="mobile-only"
              onClick={() => setShowMobileMenu(true)}
            />
            <FaHeart onClick={() => navigate("/wishlist")} />
            <FaUser onClick={() => navigate("/login")} />
            <div className="cart-icon" onClick={() => setShowCart(true)}>
              <FaShoppingBag />
              <span className="cart-count">{totalQty}</span>
            </div>
          </div>
        </Container>
      </Navbar>

      {/* MOBILE EXPAND MENU */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Form className="search-form mobile-search" onSubmit={handleSearch}>
              <FormControl
                type="search"
                placeholder="Search"
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="search-btn">
                <FaSearch />
              </button>
            </Form>

            <div className="mobile-links">
              <span onClick={() => navigate("/aboutus")}>About Us</span>
              <span onClick={() => navigate("/Product")}>Product</span>
              <span onClick={() => navigate("/contactus")}>Contact Us</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
          >
            <motion.div
              className="cart-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cart-header">
                <h5>Your Shopping Cart</h5>
                <FaTimes onClick={() => setShowCart(false)} />
              </div>

              {cart.length === 0 ? (
                <div className="cart-empty">
                  <p>Your shopping cart is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <span>{item.name}</span>
                    <div className="qty-box">
                      <FaMinus onClick={() => decreaseQty(item.id)} />
                      <span>{item.qty}</span>
                      <FaPlus onClick={() => increaseQty(item.id)} />
                    </div>
                  </div>
                ))
              )}

              <button className="checkout-btn">Checkout</button>
              <button className="outline-btn">View Cart</button>
              <button className="outline-btn">Continue Shopping</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;

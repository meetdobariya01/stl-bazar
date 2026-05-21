import React, { useState, useEffect } from "react";
import { Navbar, Container, Form, FormControl } from "react-bootstrap";
import {
  FaHeart,
  FaUser,
  FaShoppingBag,
  FaSearch,
  FaTimes,
  FaBars,
} from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";

import { useCart } from "../../context/CartContext";
import Mainnavbar from "../navbar/navbar";

import "./header.css";

const Header = () => {
  const navigate = useNavigate();
  const { showCart, setShowCart, cart } = useCart();

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  // ✅ TOTAL QTY FROM CONTEXT
  const totalQty = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // SEARCH API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (search.trim() === "") {
          setSearchResult([]);
          return;
        }

        const res = await axios.get(
          `http://localhost:9000/api/search?keyword=${search}`
        );

        setSearchResult(res.data.products);
      } catch (error) {
        console.log(error);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // SEARCH SUBMIT
  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim()) {
      navigate(`/product?search=${search}`);
      setShowMobileMenu(false);
      setSearchResult([]);
    }
  };

  return (
    <>
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
            <img src="/images/brandel.png" alt="logo" />
          </div>

          {/* SEARCH */}
          <div className="search-wrapper desktop-only">
            <Form className="search-form" onSubmit={handleSearch}>
              <FormControl
                type="search"
                placeholder="Search Product"
                className="search-input lexend"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button className="search-btn" type="submit">
                <FaSearch />
              </button>
            </Form>

            {/* SEARCH DROPDOWN */}
            {searchResult.length > 0 && (
              <div className="search-dropdown">
                {searchResult.map((item) => (
                  <div
                    key={item._id}
                    className="search-item"
                    onClick={() => {
                      navigate(`/product/${item._id}`);
                      setSearch("");
                      setSearchResult([]);
                    }}
                  >
                    <img src={item.image} alt={item.name} />

                    <div>
                      <h6>{item.name}</h6>
                      <p>₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ICONS */}
          <div className="icon-group">
            <FaHeart onClick={() => navigate("/wishlist")} />

            <FaUser onClick={() => navigate("/login")} />

            <div className="cart-icon" onClick={() => setShowCart(true)}>
              <FaShoppingBag />
              {totalQty > 0 && (
                <span className="cart-count">{totalQty}</span>
              )}
            </div>
          </div>
        </Container>
      </Navbar>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Form className="search-form mobile-search" onSubmit={handleSearch}>
              <FormControl
                type="search"
                placeholder="Search"
                className="search-input lexend"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="search-btn">
                <FaSearch />
              </button>
            </Form>

            <div className="mobile-links lexend">
                 <span onClick={() => navigate("/product")}>Product</span>
              <span onClick={() => navigate("/aboutus")}>About Us</span>
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
                <p className="text-center mt-4">Your cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="cart-item">
                    <span>{item.name}</span>
                    <span>x {item.quantity}</span>
                  </div>
                ))
              )}

              <NavLink to="/checkout" className="checkout-btn">
                Checkout
              </NavLink>

              <NavLink to="/cart" className="outline-btn">
                View Cart
              </NavLink>

              <NavLink to="/" className="outline-btn">
                Continue Shopping
              </NavLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Mainnavbar />
    </>
  );
};

export default Header;
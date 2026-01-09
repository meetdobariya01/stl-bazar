import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import Home from "./pages/home/home";
import Aboutus from "./pages/aboutus/aboutus";
import ContactUs from "./pages/contactus/contactus";
import Product from "./pages/product/product";
import Login from "./pages/login/login";
import Signup from "./pages/signup/signup";
import Checkout from "./pages/checkout/checkout";
import Cart from "./pages/cart/cart";
import Wishlist from "./pages/wishlist/wishlist";
import Grid from "./pages/grid/grid";
import Productdetails from "./pages/productdetails/productdetails";
import CategoryProducts from "./pages/Categorygrid/Categorygrid";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <CartProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aboutus" element={<Aboutus />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/product" element={<Product />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/company/:companyName" element={<Grid />} />
        <Route path="/product/:id" element={<Productdetails />} />
        <Route path="/category/:categoryName" element={<CategoryProducts />} />
      </Routes>
    </Router>
  </CartProvider>
);

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Dropdown } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { useCart } from "../../context/CartContext"; // ✅ ADD
import "./grid.css";

const API_URL = process.env.REACT_APP_API_URL;

const Grid = () => {
  const { companyName } = useParams();
  const decodedName = decodeURIComponent(companyName || "");
  const navigate = useNavigate();

  const { setShowCart, fetchCart } = useCart(); // ✅ ADD

  const [products, setProducts] = useState([]);
  const [qty, setQty] = useState({});
  const [sort, setSort] = useState("Sort By");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!decodedName) return;

    setLoading(true);
    axios
      .get(`${API_URL}/products`, { params: { company: decodedName } })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [decodedName]);

  const changeQty = (id, val) => {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + val),
    }));
  };

const handleAddToCart = async (e, item) => {
  e.stopPropagation();

  const guestId = localStorage.getItem("guestId");

  await axios.post(`${API_URL}/cart/add`, {
    guestId,
    product: {
      productId: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: qty[item._id] || 1,
    },
  });

  await fetchCart();
  setShowCart(true);
};

  return (
    <>
      <Header />

      <Container className="product-page">
        {/* TOP BAR */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Products ({products.length})</h5>

          <Dropdown>
            <Dropdown.Toggle className="sort-btn">{sort}</Dropdown.Toggle>
            <Dropdown.Menu>
              {[
                "Price (Low → High)",
                "Price (High → Low)",
                "Name (A → Z)",
                "Name (Z → A)",
              ].map((s) => (
                <Dropdown.Item key={s}>{s}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* PRODUCTS */}
        {loading ? (
          <p className="text-center mt-5">Loading products...</p>
        ) : (
          <Row className="g-4">
            {products.map((item) => (
              <Col key={item._id} xs={6} sm={6} md={4} lg={3}>
                <motion.div whileHover={{ y: -8 }}>
                  <Card
                    className="product-card"
                    onClick={() => navigate(`/product/${item._id}`)}
                  >
                    <Card.Img src={item.image || "/images/default-product.png"} />

                    <Card.Body>
                      <h6>{item.name}</h6>

                      <div className="rating">
                        {[...Array(Math.round(item.averageRating || 0))].map(
                          (_, i) => <FaStar key={i} />
                        )}
                      </div>

                      <div className="price">₹{item.price}</div>

                      <div className="qty-cart">
                        <div className="qty">
                          <button onClick={(e) => { e.stopPropagation(); changeQty(item._id, -1); }}>−</button>
                          <span>{qty[item._id] || 1}</span>
                          <button onClick={(e) => { e.stopPropagation(); changeQty(item._id, 1); }}>+</button>
                        </div>

                        <Button
                          className="cart-btn"
                          onClick={(e) => handleAddToCart(e, item)} // ✅ FIX
                        >
                          <FaShoppingCart />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <Footer />
    </>
  );
};

export default Grid;

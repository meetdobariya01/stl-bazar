import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Dropdown } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar, FaShoppingCart, FaTruck } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./grid.css";

const API_URL = process.env.REACT_APP_API_URL;

const Grid = () => {
  const { companyName } = useParams();
  const decodedName = decodeURIComponent(companyName);
  const navigate = useNavigate();

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
      .catch((err) => console.error("Product fetch error", err))
      .finally(() => setLoading(false));
  }, [decodedName]);

  const changeQty = (id, val) => {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + val),
    }));
  };

  const handleSort = (type) => {
    let sorted = [...products];
    setSort(type);

    if (type === "Price (Low < High)") sorted.sort((a, b) => a.ProductPrice - b.ProductPrice);
    if (type === "Price (High > Low)") sorted.sort((a, b) => b.ProductPrice - a.ProductPrice);
    if (type === "Name (A - Z)") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (type === "Name (Z - A)") sorted.sort((a, b) => b.name.localeCompare(a.name));
    if (type === "Date (Old < New)") sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (type === "Date (New > Old)") sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setProducts(sorted);
  };

  return (
    <>
      <Header />
      <Container className="product-page">
        <div className="sort-box">
          <Dropdown>
            <Dropdown.Toggle className="sort-btn">{sort}</Dropdown.Toggle>
            <Dropdown.Menu>
              {[
                "Price (Low < High)",
                "Price (High > Low)",
                "Name (A - Z)",
                "Name (Z - A)",
                "Date (Old < New)",
                "Date (New > Old)",
              ].map((s) => (
                <Dropdown.Item key={s} onClick={() => handleSort(s)}>
                  {s}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {loading ? (
          <p className="text-center mt-5">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center mt-5">No products found</p>
        ) : (
          <Row className="g-4 mt-3">
            {products.map((item) => (
              <Col key={item._id} xs={6} sm={6} md={3}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card
                    className="product-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/product/${item._id}`)}
                  >
                    <Card.Img
                      src={item.image || "/images/default-product.png"}
                    />
                    <Card.Body>
                      <h6>{item.name}</h6>

                      <div className="rating">
                        {[...Array(Math.round(item.averageRating || 0))].map(
                          (_, i) => <FaStar key={i} />
                        )}
                      </div>
                        <div className="size">
                        <span>{item.size}</span>
                        </div>
                      <div className="price">
                        <span className="new">₹{item.price}</span>
                      </div>

                      {/* <div className="ship">
                        <FaTruck /> Ships in 1 Day
                      </div> */}

                      <div className="qty-cart">
                        <div className="qty">
                          <button onClick={(e) => { e.stopPropagation(); changeQty(item._id, -1); }}>−</button>
                          <span>{qty[item._id] || 1}</span>
                          <button onClick={(e) => { e.stopPropagation(); changeQty(item._id, 1); }}>+</button>
                        </div>

                        <Button
                          className="cart-btn"
                          onClick={(e) => e.stopPropagation()}
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

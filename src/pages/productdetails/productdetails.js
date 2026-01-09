import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Image,
  Nav,
  Tab,
  Form,
  InputGroup,
  Badge,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaStar,
  FaHeart,
  FaShoppingCart,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./productdetails.css";

const API_URL = process.env.REACT_APP_API_URL;

const Productdetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/product/${id}`)
      .then((res) => {
        setProduct(res.data);
        setActiveImg(res.data.image || "/images/default-product.png");
      })
      .catch((err) => console.error("Product fetch error", err));
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem("token");

    await axios.post(
      `${API_URL}/api/add-to-cart`,
      { productId: product._id, quantity: qty },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Product added to cart");
  };

  if (!product) return <p className="text-center mt-5">Loading product...</p>;

  return (
    <>
      <Header />

      <Container className="product-page my-5">
        <Row>
          {/* LEFT COLUMN: MAIN IMAGE + THUMBNAILS */}
          <Col lg={6}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Image src={activeImg} fluid className="main-img" />
              {product.images && product.images.length > 1 && (
                <div className="thumbs mt-3 d-flex gap-2">
                  {product.images.map((img, i) => (
                    <Image
                      key={i}
                      src={img}
                      onClick={() => setActiveImg(img)}
                      className={`thumb ${activeImg === img ? "active" : ""}`}
                      style={{ width: 60, cursor: "pointer" }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </Col>

          {/* RIGHT COLUMN: DETAILS */}
          <Col lg={6}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="fw-bold">{product.name}</h3>
              {product.size && <p>Wt. {product.size}</p>}

              <div className="rating d-flex align-items-center mb-2">
                {[...Array(product.averageRating || 0)].map((_, i) => (
                  <FaStar key={i} color="#FFD700" />
                ))}
                <span className="ms-2">({product.reviewCount || 0} reviews)</span>
              </div>

              <div className="price mb-3">
                <span className="fs-4 fw-bold">₹{product.price}</span>
              </div>

              <div className="wishlist mb-3">
                <FaHeart /> Add to Wish List
              </div>

              <div className="pincode-check mb-3 d-flex justify-content-between align-items-center">
                <Form.Control
                  type="text"
                  placeholder="Enter Pincode"
                  maxLength={6}
                  // style={{ width: "70%" }}
                />
                <Button variant="link">CHECK</Button>
              </div>

              <InputGroup className="qty-box mb-3" style={{ width: 140 }}>
                <Button onClick={() => setQty(qty > 1 ? qty - 1 : 1)}>−</Button>
                <Form.Control value={qty} readOnly className="text-center" />
                <Button onClick={() => setQty(qty + 1)}>+</Button>
              </InputGroup>

              <div className="actions d-flex gap-2 mb-4">
                <Button className="add-cart w-100" onClick={addToCart}>
                  <FaShoppingCart /> Add to Cart
                </Button>
                
              </div>
              
            </motion.div>
          </Col>
        </Row>

        {/* TABS: PRODUCT DETAILS / REVIEWS */}
        <Tab.Container defaultActiveKey="details">
          <Nav variant="tabs" className="mt-4">
            <Nav.Item>
              <Nav.Link eventKey="details">Product Details</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="reviews">Reviews</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="p-4 border border-top-0">
            <Tab.Pane eventKey="details">
              <p>{product.description || "No description available."}</p>
            </Tab.Pane>

            <Tab.Pane eventKey="reviews">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((r, i) => (
                  <div key={i} className="review mb-3">
                    <strong>{r.name}</strong>
                    <div className="rating">
                      {[...Array(r.rating)].map((_, j) => (
                        <FaStar key={j} color="#FFD700" />
                      ))}
                    </div>
                    <p>{r.comment}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet</p>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>

      <Footer />
    </>
  );
};

export default Productdetails;

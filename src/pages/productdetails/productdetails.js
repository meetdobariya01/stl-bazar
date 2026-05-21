import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Button, Image, Nav, Tab, Form, InputGroup,
} from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar, FaHeart, FaShoppingCart } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import RelatedProducts from "../../components/relatedProducts/RelatedProducts";
import "./productdetails.css";
import Details from "../../components/details/details";

const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_URL = "http://localhost:9000";

const Productdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [userName, setUserName] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const guestId = localStorage.getItem("guestId");

  const formatImagePath = (path) => {
    if (!path) return "/images/default-product.png";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/uploads")) return `${BACKEND_URL}${path}`;
    if (path.startsWith("/images")) return path;
    return `${BACKEND_URL}${path}`;
  };

  const fetchProduct = async () => {
    const res = await axios.get(`${API_URL}/product/${id}`);
    setProduct(res.data);
    const mainImg = Array.isArray(res.data.image) ? res.data.image[0] : res.data.image;
    setActiveImg(formatImagePath(mainImg));
  };

  const fetchReviews = async () => {
    const res = await axios.get(`${API_URL}/products/${id}/reviews`);
    setReviews(res.data.reviews);
  };

  // Check if already wishlisted
  const checkWishlist = async () => {
    if (!guestId) return;
    try {
      const res = await axios.get(`${API_URL}/wishlist/${guestId}`);
      const items = res.data.items || [];
      setWishlisted(items.some((item) => item.productId === id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkWishlist();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/products/${id}/review`, {
      rating, review: reviewText, userName,
    });
    setReviewText(""); setUserName(""); setRating(5);
    fetchProduct(); fetchReviews();
  };

  const addToCart = async () => {
    let gId = guestId;
    if (!gId) {
      gId = Date.now().toString();
      localStorage.setItem("guestId", gId);
    }
    await axios.post(`${API_URL}/cart/add`, {
      guestId: gId,
      product: {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty,
      },
    });
    navigate("/cart");
  };

  // Toggle Wishlist
  const toggleWishlist = async () => {
    let gId = guestId;
    if (!gId) {
      gId = Date.now().toString();
      localStorage.setItem("guestId", gId);
    }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await axios.delete(`${API_URL}/wishlist/remove`, {
          data: { guestId: gId, productId: product._id },
        });
        setWishlisted(false);
      } else {
        await axios.post(`${API_URL}/wishlist/add`, {
          guestId: gId,
          product: {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: Array.isArray(product.image) ? product.image[0] : product.image,
          },
        });
        setWishlisted(true);
      }
    } catch (err) {
      console.error("Wishlist error", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (!product) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      <Header />

      <Container className="product-page my-5">
        <Row>
          {/* LEFT COLUMN */}
          <Col lg={6}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Image src={activeImg} fluid className="main-img mb-5" />
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

          {/* RIGHT COLUMN */}
          <Col lg={6}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="fw-bold">{product.name}</h3>
              {product.size && <p>Wt. {product.size}</p>}

              <div className="rating d-flex align-items-center mb-2">
                {[...Array(product.averageRating || 0)].map((_, i) => (
                  <FaStar key={i} color="#FFD700" />
                ))}
                <span className="ms-2">
                  ({product.reviewCount || 0} reviews)
                </span>
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
                />
                <Button variant="link text-dark">CHECK</Button>
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

        {/* TABS */}
        <Tab.Container defaultActiveKey="details">
          <Nav variant="tabs" className="mt-4">
            <Nav.Item>
              <Nav.Link eventKey="details" className="lexend text-dark">
                Product Details
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="reviews" className="lexend text-dark">
                Reviews
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="p-4 border border-top-0">
            <Tab.Pane eventKey="details">
              <p className="funnel-sans">
                {product.description || "No description available."}
              </p>
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

        {/* Details Section */}
        <Details />
        
      </Container>

      <Footer />
    </>
  );
};

export default Productdetails;
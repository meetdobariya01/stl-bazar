import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Button, Image, Nav, Tab, Form, InputGroup,
} from "react-bootstrap";
import { FaStar, FaShoppingCart, FaHeart } from "react-icons/fa";
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
          <Col lg={6}>
            <div className="main-img-container mb-3">
              <Image
                src={activeImg}
                fluid
                className="main-img"
                style={{ maxHeight: "500px", objectFit: "contain" }}
              />
            </div>

            {/* ✅ NEW: MULTIPLE IMAGES */}
            <div className="d-flex gap-2 flex-wrap">
              {(Array.isArray(product.image)
                ? product.image
                : [product.image]
              ).map((img, index) => {
                const formatted = formatImagePath(img);

                return (
                  <Image
                    key={index}
                    src={formatted}
                    onClick={() => setActiveImg(formatted)}
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "cover",
                      cursor: "pointer",
                      border:
                        activeImg === formatted
                          ? "2px solid #000"
                          : "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                  />
                );
              })}
            </div>
          </Col>

          <Col lg={6}>
            <div className="product-info">
              <h3 className="fw-bold mb-1">{product.name}</h3>

              <div className="d-flex align-items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} size={16}
                    color={i < Math.round(product.averageRating || 0) ? "#ffc107" : "#e4e5e9"}
                    className="me-1" />
                ))}
                <span className="ms-2 text-muted small">
                  {product.averageRating?.toFixed(1) || "0.0"} ({reviews.length} reviews)
                </span>
              </div>

              <div className="price mb-3">
                <span className="new">₹{product.price}</span>
              </div>

              {/* ❤ Wishlist Toggle */}
              <div
                className="mb-3 small d-flex align-items-center gap-1"
                style={{ cursor: wishlistLoading ? "not-allowed" : "pointer", userSelect: "none" }}
                onClick={!wishlistLoading ? toggleWishlist : undefined}
              >
                <FaHeart color={wishlisted ? "#e63946" : "#aaa"} size={16} />
                <span style={{ color: wishlisted ? "#e63946" : "#555" }}>
                  {wishlisted ? "Wishlisted" : "Add to Wish List"}
                </span>
              </div>

              <div className="mb-3 d-flex gap-2">
                <Form.Control placeholder="Enter Pincode" style={{ maxWidth: "260px" }} />
                <Button variant="link" className="p-0">CHECK</Button>
              </div>

              <InputGroup className="qty-box mb-3">
                <Button onClick={() => setQty(qty > 1 ? qty - 1 : 1)}>−</Button>
                <Form.Control value={qty} readOnly />
                <Button onClick={() => setQty(qty + 1)}>+</Button>
              </InputGroup>

              <Button className="add-cart w-100 py-2" onClick={addToCart}>
                <FaShoppingCart className="me-2" />
                Add to Cart
              </Button>
            </div>
          </Col>
        </Row>

        <Tab.Container defaultActiveKey="details">
          <Nav variant="tabs" className="mt-5">
            <Nav.Item><Nav.Link eventKey="details">Details</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="reviews">Reviews</Nav.Link></Nav.Item>
          </Nav>

          <Tab.Content className="p-4 border border-top-0">
            <Tab.Pane eventKey="details">
              <p>{product.description}</p>
            </Tab.Pane>

            <Tab.Pane eventKey="reviews">
              <div className="mb-4">
                <div className="d-flex align-items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={20}
                      color={i < Math.round(product.averageRating || 0) ? "#ffc107" : "#e4e5e9"} />
                  ))}
                  <span className="ms-2 fw-semibold fs-5">
                    {product.averageRating?.toFixed(1) || "0.0"} / 5
                  </span>
                </div>
                <small className="text-muted">{reviews.length} Customer Reviews</small>
              </div>

              <Form onSubmit={submitReview} className="mb-4">
                <Form.Control placeholder="Your Name" className="mb-2"
                  value={userName} onChange={(e) => setUserName(e.target.value)} />
                <Form.Select className="mb-2" value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>{num} Stars</option>
                  ))}
                </Form.Select>
                <Form.Control as="textarea" rows={3} placeholder="Write your review..."
                  className="mb-2" value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)} required />
                <Button type="submit" variant="dark">Submit Review</Button>
              </Form>

              {reviews.map((r, index) => (
                <div key={index} className="review-card p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{r.userName}</strong>
                    <div>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} size={15} color={i < r.rating ? "#ffc107" : "#e4e5e9"} />
                      ))}
                    </div>
                  </div>
                  <p className="mb-0 text-muted">{r.review}</p>
                </div>
              ))}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        <RelatedProducts currentProduct={product} />
        <Details />
      </Container>

      <Footer />
    </>
  );
};

export default Productdetails;
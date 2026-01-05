import React, { useState } from "react";
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
  Card,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaStar,
  FaHeart,
  FaTruck,
  FaShoppingCart,
} from "react-icons/fa";
import "./productdetails.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const images = [
  "/images/dosa-main.jpg",
  "/images/dosa-1.jpg",
  "/images/dosa-2.jpg",
  "/images/dosa-3.jpg",
];

const reviewsData = [
  { name: "Amit", rating: 5, comment: "Very tasty and healthy!" },
  { name: "Sneha", rating: 4, comment: "Easy to make, loved it." },
  { name: "Rahul", rating: 5, comment: "Best organic dosa mix." },
];

const Productdetails = () => {
  const [activeImg, setActiveImg] = useState(images[0]);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState(reviewsData);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const addToCart = () => alert("Product added to cart");
  const buyNow = () => alert("Redirecting to checkout");

  const submitReview = () => {
    if (!reviewText) return;
    setReviews([
      ...reviews,
      { name: "You", rating, comment: reviewText },
    ]);
    setReviewText("");
  };

  return (
    <>
      <Header />

      <Container className="product-page my-4">
        <Row className="g-4">
          {/* IMAGE SECTION */}
          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Image src={activeImg} fluid className="main-img" />
              <div className="thumbs mt-3">
                {images.map((img, i) => (
                  <Image
                    key={i}
                    src={img}
                    onClick={() => setActiveImg(img)}
                    className={`thumb ${
                      activeImg === img ? "active" : ""
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </Col>

          {/* DETAILS */}
          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h4 className="product-title">
                ORGANIC MULTIGRAIN DOSA READY MIX – 200 GM
              </h4>

              <div className="rating">
                {[...Array(4)].map((_, i) => (
                  <FaStar key={i} />
                ))}
                <span>(10 Reviews)</span>
              </div>

              <div className="price">
                <span className="old">₹60</span>
                <span className="new">₹54</span>
                <Badge bg="success">10% OFF</Badge>
              </div>

              <div className="ship">
                <FaTruck /> Ready to ship in 2 days
              </div>

              <InputGroup className="qty-box">
                <Button onClick={() => setQty(qty > 1 ? qty - 1 : 1)}>
                  −
                </Button>
                <Form.Control value={qty} readOnly />
                <Button onClick={() => setQty(qty + 1)}>+</Button>
              </InputGroup>

              <div className="actions">
                <Button className="add-cart" onClick={addToCart}>
                  <FaShoppingCart /> Add to Cart
                </Button>
                <Button variant="outline-dark" onClick={buyNow}>
                  Buy Now
                </Button>
                <Button variant="outline-danger">
                  <FaHeart />
                </Button>
              </div>
            </motion.div>
          </Col>
        </Row>

        {/* TABS */}
        <Tab.Container defaultActiveKey="about">
          <Nav variant="tabs" className="mt-5">
            <Nav.Item><Nav.Link eventKey="about">About</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="ingredients">Ingredients</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="reviews">Reviews</Nav.Link></Nav.Item>
          </Nav>

          <Tab.Content className="p-4 border border-top-0">
            <Tab.Pane eventKey="about">
              <ul>
                <li>Zero trans fat</li>
                <li>Easy to digest</li>
                <li>Ready in 3 steps</li>
              </ul>
            </Tab.Pane>

            <Tab.Pane eventKey="ingredients">
              <p>Rice, multigrain flour, natural enzymes.</p>
            </Tab.Pane>

            {/* ⭐ REVIEWS */}
            <Tab.Pane eventKey="reviews">
              <Row className="g-3">
                {reviews.map((r, i) => (
                  <Col md={6} key={i}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                    >
                      <Card className="review-card">
                        <Card.Body>
                          <h6>{r.name}</h6>
                          <div className="rating">
                            {[...Array(r.rating)].map((_, j) => (
                              <FaStar key={j} />
                            ))}
                          </div>
                          <p>{r.comment}</p>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>

              {/* ADD REVIEW */}
              <div className="add-review mt-4">
                <h6>Add Review</h6>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <Button className="mt-2 add-cart" onClick={submitReview}>
                  Submit Review
                </Button>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>

      <Footer />
    </>
  );
};

export default Productdetails;

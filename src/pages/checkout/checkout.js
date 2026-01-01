import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const Checkout = () => {
  const [payment, setPayment] = useState("card");

  const cartSummary = {
    subtotal: 998,
    shipping: 0,
    total: 998,
  };

  return (
    <div>
      {/* Header Section */}
      <Header />

      <Container className="py-5 funnel-sans">
        <motion.h2
          className="fw-bold text-center mb-5 lexend"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Checkout
        </motion.h2>

        <Row className="g-4">
          {/* LEFT – SHIPPING & PAYMENT */}
          <Col lg={8}>
            {/* SHIPPING */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 shadow rounded-4 mb-4 ">
                <Card.Body>
                  <h5 className="fw-bold mb-3 lexend fs-3">Shipping Details</h5>

                  <Row className="g-3 lexend p-2">
                    <Col md={6}>
                      <Form.Control className="underline-input" placeholder="Full Name" />
                    </Col>
                    <Col md={6}>
                      <Form.Control className="underline-input" placeholder="Phone Number" />
                    </Col>
                    <Col md={12}>
                      <Form.Control className="underline-input" placeholder="Email Address" />
                    </Col>
                    <Col md={12}>
                      <Form.Control className="underline-input" placeholder="Street Address" />
                    </Col>
                    <Col md={4}>
                      <Form.Control className="underline-input" placeholder="City" />
                    </Col>
                    <Col md={4}>
                      <Form.Control className="underline-input" placeholder="State" />
                    </Col>
                    <Col md={4}>
                      <Form.Control className="underline-input" placeholder="Zip Code" />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </motion.div>

            {/* PAYMENT */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow rounded-4">
                <Card.Body>
                  <h5 className="fw-bold mb-3 fs-3 ">Payment Method</h5>

                  <Form.Check
                    type="radio"
                    label={
                      <span>
                        <FaCreditCard className="me-2" />
                        Credit / Debit Card
                      </span>
                    }
                    name="payment"
                    checked={payment === "card"}
                    onChange={() => setPayment("card")}
                    className="mb-2"
                  />

                  <Form.Check
                    type="radio"
                    label={
                      <span>
                        <FaMoneyBillWave className="me-2" />
                        Cash on Delivery
                      </span>
                    }
                    name="payment"
                    checked={payment === "cod"}
                    onChange={() => setPayment("cod")}
                  />
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          {/* RIGHT – ORDER SUMMARY */}
          <Col lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 shadow rounded-4">
                <Card.Body>
                  <h5 className="fw-bold mb-3 fs-3 lexend">Order Summary</h5>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>₹{cartSummary.subtotal}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between fw-bold mb-4 fs-5">
                    <span>Total</span>
                    <span>₹{cartSummary.total}</span>
                  </div>

                  <Button variant="dark" className="w-100 rounded-pill">
                    Place Order
                  </Button>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Checkout;

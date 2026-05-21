import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import {
  FaStore,
  FaUsers,
  FaLeaf,
  FaShoppingBag,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./sell.css";

const Sell = () => {
  return (
    <div>
      <Header />

      <section className="seller-banner">
        <img
          src="./images/sell.png"
          alt="Sell Banner"
          className="banner-image"
        />
      </section>

      <section className="seller-register-section lexend">
        <Container>
          <div className="seller-wrapper">
            <Row className="g-0 align-items-center">
              {/* LEFT FORM */}
              <Col lg={7}>
                <div className="seller-form-box">
                  <h1>Create Your Seller Account</h1>
                  <p>Get started in just a few simple steps.</p>

                  <Form>
                    <Form.Group className="mb-4">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your full name"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email address"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Phone Number</Form.Label>

                      <div className="phone-input">
                        <Form.Select>
                          <option>+91</option>
                          <option>+1</option>
                          <option>+44</option>
                        </Form.Select>

                        <Form.Control
                          type="text"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Business / Brand Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your brand or business name"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>What do you sell?</Form.Label>

                      <Form.Select>
                        <option>Select your main product category</option>
                        <option>Fashion</option>
                        <option>Handmade</option>
                        <option>Beauty</option>
                        <option>Home Decor</option>
                      </Form.Select>
                    </Form.Group>

                    <div className="privacy-note">
                      <FaShieldAlt />
                      <span>
                        We respect your privacy. Your information is safe with
                        us.
                      </span>
                    </div>

                    <Button className="create-btn">Create My Account</Button>

                    <div className="signin-text">
                      Already have an account? <span>Sign in</span>
                    </div>
                  </Form>
                </div>
              </Col>

              {/* RIGHT INFO */}
              <Col lg={5}>
                <div className="seller-info-box">
                  <div className="top-icon">
                    <FaStore />
                  </div>

                  <h2>Why sell on Brandel?</h2>

                  <div className="info-item">
                    <div className="icon-box">
                      <FaUsers />
                    </div>

                    <div>
                      <h5>Quality Customers</h5>
                      <p>
                        Connect with people who appreciate handcrafted and
                        authentic products.
                      </p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="icon-box">
                      <FaLeaf />
                    </div>

                    <div>
                      <h5>Low Commission</h5>
                      <p>Competitive fees with no hidden charges.</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="icon-box">
                      <FaShoppingBag />
                    </div>

                    <div>
                      <h5>Easy to Get Started</h5>
                      <p>Simple onboarding and quick product listing.</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="icon-box">
                      <FaShieldAlt />
                    </div>

                    <div>
                      <h5>Dedicated Support</h5>
                      <p>We’re here to help you grow your business.</p>
                    </div>
                  </div>

                  <div className="support-card">
                    <FaHeadset />

                    <div>
                      <h5>Need help getting started?</h5>
                      <p>Our team is here for you.</p>
                      <a href="/contactus">Contact Support →</a>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default Sell;

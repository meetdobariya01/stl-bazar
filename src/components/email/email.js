import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./email.css";

const Email = () => {
  return (
    <div>
      <section className="subscribe-section lexend">
        <Container>
          <div className="subscribe-wrapper">
            <Row className="align-items-center">
              {/* Left Content */}
              <Col lg={4} md={12}>
                <div className="subscribe-content">
                  <h2>Stay Inspired</h2>

                  <p>
                    New arrivals, stories & offers
                    <br />
                    straight to your inbox.
                  </p>
                </div>
              </Col>

              {/* Right Form */}
              <Col lg={8} md={12}>
                <Form className="subscribe-form">
                  <Form.Control type="email" placeholder="Enter your email" />

                  <Button type="submit">Subscribe</Button>
                </Form>
              </Col>
            </Row>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Email;

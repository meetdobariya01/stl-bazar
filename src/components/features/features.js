import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaRegStar, FaLock, FaUndo, FaHeadset } from "react-icons/fa";
import "./features.css";

const features = [
  {
    icon: <FaRegStar />,
    title: "Curated Quality",
    subtitle: "Handpicked with care",
  },
  {
    icon: <FaLock />,
    title: "Secure Payments",
    subtitle: "Safe & trusted checkout",
  },
  {
    icon: <FaUndo />,
    title: "Easy Returns",
    subtitle: "Hassle-free returns",
  },
  {
    icon: <FaHeadset />,
    title: "Support That Cares",
    subtitle: "We’re here for you",
  },
];

const Features = () => {
  return (
    <div>
      <section className="feature-section py-4">
        <Container>
          <Row className="g-4">
            {features.map((item, index) => (
              <Col lg={3} md={6} sm={6} xs={6} key={index}>
                <div className="feature-card d-flex align-items-center">
                  <div className="feature-icon">{item.icon}</div>

                  <div className="ms-3">
                    <h6 className="mb-1 lexend">{item.title}</h6>
                    <p className="mb-0 funnel-sans">{item.subtitle}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Features;

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import "./boxes.css";

const bannerData = [
  {
    subtitle: "Seasonal Picks",
    title: "Spring Refresh",
    desc: "Bright & natural essentials for your home.",
    button: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1512428813834-c702c7702b78?q=80&w=1200",
  },
  {
    subtitle: "Gift Guide",
    title: "Thoughtful Gifts",
    desc: "For every occasion.",
    button: "Explore Gifts",
    image:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1200",
  },
  {
    subtitle: "Brand Spotlight",
    title: "New Makers, Great Stories",
    desc: "Support independent artisans & brands.",
    button: "Discover Brands",
    image:
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=1200",
  },
  {
    subtitle: "Limited Drops",
    title: "Exclusive Creations",
    desc: "Limited stock unique finds.",
    button: "Shop Now",
    image:
      "https://unsplash.com/photos/a-woman-is-wrapping-a-red-gift-with-a-brown-ribbon-yfqtFOw_l70",
  },
];

const Boxes = () => {
  return (
    <div>
      <section className="promo-section py-5 lexend">
        <Container fluid>
          <Row className="g-4">
            {bannerData.map((item, index) => (
              <Col lg={3} md={6} sm={6} xs={6} key={index}>
                <div
                  className="promo-card"
                  style={{
                    backgroundImage: `url(${item.image})`,
                  }}
                >
                  <div className="overlay"></div>

                  <div className="promo-content">
                    <span>{item.subtitle}</span>

                    <h3>{item.title}</h3>

                    <p>{item.desc}</p>

                    <a
                      href="/shop"
                      className="promo-btn d-flex align-items-center"
                    >
                      {item.button}
                      <FaArrowRight className="ms-2" />
                    </a>
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

export default Boxes;

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./boxes.css";

const bannerData = [
  {
    subtitle: "Seasonal Picks",
    title: "Spring Refresh",
    desc: "Bright & natural essentials for your home.",
    button: "Shop Now",
    image: "./images/box1.webp",
    link: "/category/Handmade%20Home%20Decor",
  },
  {
    subtitle: "Gift Guide",
    title: "Thoughtful Gifts",
    desc: "For every occasion.",
    button: "Explore Gifts",
    image: "./images/box2.webp",
    link: "/category/Gifts%20%26%20Hamper",
  },
  {
    subtitle: "Brand Spotlight",
    title: "New Makers, Great Stories",
    desc: "Support independent artisans & brands.",
    button: "Discover Brands",
    image: "./images/box3.webp",
    link: "/category/Sustainable%20Lifestyle",
  },
  {
    subtitle: "Limited Drops",
    title: "Exclusive Creations",
    desc: "Limited stock unique finds.",
    button: "Shop Now",
    image: "./images/box4.webp",
    link: "/category/Jewelry%20%26%20Accessories",
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
                  <Link to={item.link} className="text-decoration-none">
                    <div className="promo-content">
                      <span>{item.subtitle}</span>

                      <h3>{item.title}</h3>

                      <p>{item.desc}</p>
                    </div>
                  </Link>
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

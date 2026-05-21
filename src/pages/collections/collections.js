import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import "./collections.css";

const collections = [
  {
    title: "Organic Food",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e",
  },
  {
    title: "Organic Snacks",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
  },
  {
    title: "Jewellery",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638",
  },
  {
    title: "Gift Items",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383",
  },
  {
    title: "Skincare",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
  },
   {
    title: "Jewellery",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638",
  },
];

const Collections = () => {
  return (
    <div>
      <section className="collection-section py-5">
        <Container>
          {/* Heading */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap lexend">
            <h2 className="section-title ">Shop by Collection</h2>

            <a href="/" className="view-all-link d-flex align-items-center">
              View all collections <FaArrowRight className="ms-2" />
            </a>
          </div>

          {/* Collection Cards */}
          <Row className="g-4">
            {collections.map((item, index) => (
              <Col lg={2} md={4} sm={6} xs={6} key={index}>
                <div className="collection-card funnel-sans">
                  <div className="image-wrapper">
                    <img src={item.image} alt={item.title} />
                  </div>

                  <div className="card-content">
                    <h5>{item.title}</h5>
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

export default Collections;

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaStar } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL;
const BASE_URL = "http://localhost:5000"; // ✅ your backend

const RelatedProducts = ({ currentProduct }) => {
  const [companyProducts, setCompanyProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (!currentProduct) return;

    // ===== SAME COMPANY =====
    axios
      .get(`${API_URL}/products`, {
        params: { company: currentProduct.company },
      })
      .then((res) => {
        const filtered = res.data.filter(
          (p) => p._id !== currentProduct._id
        );
        setCompanyProducts(filtered.slice(0, 4));
      });

    // ===== RELATED CATEGORY =====
    axios
      .get(`${API_URL}/products`, {
        params: { category: currentProduct.category },
      })
      .then((res) => {
        const filtered = res.data.filter(
          (p) =>
            p._id !== currentProduct._id &&
            p.company !== currentProduct.company
        );
        setRelatedProducts(filtered.slice(0, 4));
      });
  }, [currentProduct]);

  // ✅ FIX: HANDLE ARRAY + STRING IMAGE
  const getImageUrl = (image) => {
    if (!image) return "/images/placeholder.png";

    let img = image;

    if (Array.isArray(image)) {
      img = image[0]; // first image
    }

    if (!img) return "/images/placeholder.png";

    if (typeof img === "string" && img.startsWith("http")) {
      return img;
    }

    if (typeof img === "string" && img.startsWith("/uploads")) {
      return `${BASE_URL}${img}`;
    }

    return img;
  };

  const renderProductCard = (item) => (
    <Col md={3} sm={6} xs={6} key={item._id} className="mb-4">
      <Card className="related-card h-100">
        <Link
          to={`/product/${item._id}`}
          className="text-decoration-none text-dark"
        >
          <Card.Img
            variant="top"
            src={getImageUrl(item.image)} // ✅ FIXED
            style={{ height: "200px", objectFit: "contain" }}
            onError={(e) => {
              e.target.src = "/images/placeholder.png";
            }}
          />

          <Card.Body>
            <h6 className="related-title">{item.name}</h6>

            <div className="d-flex align-items-center mb-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={14}
                  color={
                    i < Math.round(item.averageRating || 0)
                      ? "#ffc107"
                      : "#e4e5e9"
                  }
                />
              ))}
            </div>

            <div className="fw-bold">₹{item.price}</div>
          </Card.Body>
        </Link>
      </Card>
    </Col>
  );

  return (
    <Container className="my-5">
      {/* SAME COMPANY */}
      {companyProducts.length > 0 && (
        <>
          <h4 className="mb-4">
            More from {currentProduct.company}
          </h4>
          <Row>{companyProducts.map(renderProductCard)}</Row>
        </>
      )}

      {/* RELATED */}
      {relatedProducts.length > 0 && (
        <>
          <h4 className="mb-4 mt-5">
            Related Products
          </h4>
          <Row>{relatedProducts.map(renderProductCard)}</Row>
        </>
      )}
    </Container>
  );
};

export default RelatedProducts;
import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Dropdown } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar, FaShoppingCart, FaTruck } from "react-icons/fa";
import "./grid.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const initialProducts = [
  {
    id: 1,
    name: "Phool Natural Incense Cones Indian Rose - 40 U",
    image: "/images/p1.jpg",
    price: 138,
    oldPrice: 145,
    rating: 4,
    reviews: 3,
    date: "2024-01-01",
  },
  {
    id: 2,
    name: "Kalla Jasmine Agarbatti 40u - 70 Gm",
    image: "/images/p2.jpg",
    price: 133,
    oldPrice: 140,
    rating: 4,
    reviews: 6,
    date: "2024-01-05",
  },
  {
    id: 3,
    name: "Phool Natural Incense Cones Nagchampa - 40 U",
    image: "/images/p3.jpg",
    price: 138,
    oldPrice: 145,
    rating: 4,
    reviews: 6,
    date: "2024-01-03",
  },
  {
    id: 4,
    name: "Kalla Lavender Agarbatti 40u - 70 Gm",
    image: "/images/p4.jpg",
    price: 133,
    oldPrice: 140,
    rating: 4,
    reviews: 7,
    date: "2024-01-10",
  },
  {
    id: 5,
    name: "Kalla Lavender Agarbatti 40u - 70 Gm",
    image: "/images/p4.jpg",
    price: 133,
    oldPrice: 140,
    rating: 4,
    reviews: 7,
    date: "2024-01-10",
  },
  {
    id: 6,
    name: "Kalla Lavender Agarbatti 40u - 70 Gm",
    image: "/images/p4.jpg",
    price: 133,
    oldPrice: 140,
    rating: 4,
    reviews: 7,
    date: "2024-01-10",
  },
  {
    id: 7,
    name: "Kalla Lavender Agarbatti 40u - 70 Gm",
    image: "/images/p4.jpg",
    price: 133,
    oldPrice: 140,
    rating: 4,
    reviews: 7,
    date: "2024-01-10",
  },
  {
    id: 8,
    name: "Kalla Lavender Agarbatti 40u - 70 Gm",
    image: "/images/p4.jpg",
    price: 133,
    oldPrice: 140,
    rating: 4,
    reviews: 7,
    date: "2024-01-10",
  },
];

const Grid = () => {
  const [products, setProducts] = useState(initialProducts);
  const [qty, setQty] = useState({});
  const [sort, setSort] = useState("Sort By");

  const changeQty = (id, val) => {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + val),
    }));
  };

  const handleSort = (type) => {
    let sorted = [...products];
    setSort(type);

    if (type === "Price (Low < High)") sorted.sort((a, b) => a.price - b.price);
    if (type === "Price (High > Low)") sorted.sort((a, b) => b.price - a.price);
    if (type === "Name (A - Z)")
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (type === "Name (Z - A)")
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    if (type === "Date (Old < New)")
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (type === "Date (New > Old)")
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));

    setProducts(sorted);
  };

  return (
    <div>
      {/* header */}
      <Header />
      <Container className="product-page">
        {/* SORT */}
        <div className="sort-box">
          <Dropdown>
            <Dropdown.Toggle className="sort-btn">{sort}</Dropdown.Toggle>

            <Dropdown.Menu>
              {[
                "Price (Low < High)",
                "Price (High > Low)",
                "Name (A - Z)",
                "Name (Z - A)",
                "Date (Old < New)",
                "Date (New > Old)",
              ].map((s) => (
                <Dropdown.Item key={s} onClick={() => handleSort(s)}>
                  {s}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* PRODUCTS */}
        <Row className="g-4 mt-3">
          {products.map((item) => (
            <Col key={item.id} xs={6} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="product-card">
                  <Card.Img src={item.image} />

                  <Card.Body>
                    <h6>{item.name}</h6>

                    <div className="rating">
                      {[...Array(item.rating)].map((_, i) => (
                        <FaStar key={i} />
                      ))}
                      <span>({item.reviews})</span>
                    </div>

                    <div className="price">
                      {/* <span className="old">₹{item.oldPrice}.00</span> */}
                      <span className="new">₹{item.price}.00</span>
                      {/* <span className="off">5% Off</span>  */}
                    </div>

                    <div className="ship">
                      <FaTruck /> Ships in 1 Days
                    </div>

                    <div className="qty-cart">
                      <div className="qty">
                        <button onClick={() => changeQty(item.id, -1)}>
                          −
                        </button>
                        <span>{qty[item.id] || 1}</span>
                        <button onClick={() => changeQty(item.id, 1)}>+</button>
                      </div>

                      <Button className="cart-btn">
                        <FaShoppingCart />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
      {/* footer */}
      <Footer />
    </div>
  );
};

export default Grid;

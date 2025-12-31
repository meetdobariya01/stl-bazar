import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./product.css";

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

const data = [
  {
    title: "Poshi - Nutrition in every bite",
    text: "Poshi was born from a passion for healthy living and sustainability. Our brand focuses on providing ethically sourced fruits from Indian farms, ensuring quality and freshness with every bite. With a deep respect for nature and its processes, we’re committed to offering delicious, nutritious products that benefit both people and the planet.",
    img: "/images/poshi-logo.png",
    bg: "light",
  },
  {
    title: "MWH - Made With Hands",
    text: "The food that you eat can be either the safest and most powerful form of medicine or the slowest form of poison. So think smartly and choose what is best for you.",
    img: "/images/mwh.png",
    bg: "rose",
  },
  {
    title: "Dietary Inclusions",
    text: "Cater to all dietary needs and our goal is for everyone to be able to enjoy and relish our chocolates. It can be made vegan, dairy free, gluten free and nut free without sacrificing on quality and taste.",
    img: "/images/value-3.jpg",
    bg: "light",
  },
  {
    title: "Innovation",
    text: "Highly innovative spirit drives us to continue developing new ingredients and bold chocolate flavors. Value experience we create with our chocolates and creative process of taking risks and making it a reality for our valued guests.",
    img: "/images/value-4.jpg",
    bg: "dark",
  },
  {
    title: "Sustainability",
    text: "Values doing good in world and ethical practices. We make conscious efforts to minimize usage of plastics in packaging as well as in operations.",
    img: "/images/value-5.jpg",
    bg: "light",
  },
];
const Product = () => {
  return (
    <div>
      {/* Header Section */}
      <Header />

      {/* Values Section */}
      <div>
        <section className="values-section  ">
          <Container>
            {data.map((item, index) => (
              <Row
                key={index}
                className={`align-items-center value-row ${
                  index % 2 !== 0 ? "flex-row-reverse" : ""
                }`}
              >
                <Col md={4}>
                  <motion.img
                    src={item.img}
                    alt={item.title}
                    className="value-image"
                    variants={index % 2 === 0 ? fadeLeft : fadeRight}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  />
                </Col>

                <Col md={8}>
                  <motion.div
                    className={`value-content ${item.bg}`}
                    variants={index % 2 === 0 ? fadeRight : fadeLeft}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <h4 className="lexend">{item.title}</h4>
                    <p className="funnel-sans">{item.text}</p>

                    {/* BUY BUTTON */}
                    <motion.button
                      className="buy-btn lexend"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Buy Now
                    </motion.button>
                  </motion.div>
                </Col>
              </Row>
            ))}
          </Container>
        </section>
      </div>
      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Product;

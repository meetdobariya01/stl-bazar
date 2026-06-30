import React from "react";
import "./aboutus.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import {
  FaCrown,
  FaLeaf,
  FaGem,
  FaEye,
  FaUsers,
  FaShieldAlt,
  FaHandsHelping,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

const features = [
  {
    icon: <FaCrown />,
    title: "Curated, Never Crowded",
    text: "Every brand is carefully reviewed before being invited.",
  },
  {
    icon: <FaLeaf />,
    title: "Quality First",
    text: "We prioritize craftsmanship, authenticity and customer satisfaction.",
  },
  {
    icon: <FaGem />,
    title: "Luxury Meets Local",
    text: "Premium products crafted by passionate entrepreneurs.",
  },
  {
    icon: <FaEye />,
    title: "Designed for Discovery",
    text: "Thoughtfully presented collections for an elevated experience.",
  },
  {
    icon: <FaUsers />,
    title: "Community Growth",
    text: "Helping brands grow sustainably.",
  },
];

const values = [
  {
    icon: <FaHandsHelping />,
    title: "Craftsmanship",
    text: "We celebrate skill, attention to detail and timeless quality.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Authenticity",
    text: "We believe in real stories, transparent practices and genuine brands.",
  },
  {
    icon: <FaGem />,
    title: "Quality",
    text: "We are uncompromising about the products we showcase.",
  },
  {
    icon: <FaLeaf />,
    title: "Sustainability",
    text: "We support conscious choices that are better for people and planet.",
  },
  {
    icon: <FaUsers />,
    title: "Community",
    text: "We grow together by uplifting and supporting each other.",
  },
];

const Aboutus = () => {
  const navigate = useNavigate();
  return (
    <div className="lexend">
      {/* Header Component */}
      <Header />

      <section className="aboutBrand">
        <div className="container-fluid  p-0">
          <div className="row g-0 align-items-center">
            {/* LEFT */}

            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="col-lg-6 aboutContent"
            >
              <span className="smallTitle">ABOUT BRANDEL</span>

              <h1>
                Curating India's
                <br />
                Finest Homegrown
                <br />
                Brands
              </h1>

              <div className="goldLine"></div>

              <p>
                Brandel is an invite-only curated marketplace bringing together
                exceptional homegrown brands. We celebrate craftsmanship,
                authenticity and conscious living through thoughtfully curated
                shopping experiences.
              </p>
            </motion.div>

            {/* RIGHT */}

            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="col-lg-6"
            >
              <img
                src="./images/aboutus.png"
                className="img-fluid heroImg"
                alt=""
              />
            </motion.div>
          </div>

          {/* Bottom Features */}

          <div className="featureSection">
            <div className="row">
              {features.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.15,
                  }}
                  viewport={{ once: true }}
                  className="col-lg col-md-4 col-6"
                >
                  <div className="featureCard">
                    <div className="icon">{item.icon}</div>

                    <h5 className="funnel-sans">{item.title}</h5>

                    <p>{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="brand-section py-5">
        <div className="container">
          {/* Top */}

          <div className="row align-items-center text-center g-5">
            <motion.div
              className="col-lg-4"
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h6 className="small-title">OUR VISION</h6>

              <p>
                To become India's most trusted destination for discovering
                premium homegrown brands and build a future where craftsmanship,
                creativity and conscious entrepreneurship thrive together.
              </p>
            </motion.div>

            <motion.div
              className="col-lg-4"
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="brand-logo">
                <img src="./images/brandel.png" className="img-fluid" alt="" />
              </div>
            </motion.div>

            <motion.div
              className="col-lg-4"
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h6 className="small-title">OUR MISSION</h6>

              <p>
                To empower exceptional brands with meaningful visibility while
                creating an elevated shopping experience for customers who
                appreciate authenticity, design and quality.
              </p>
            </motion.div>
          </div>

          {/* Middle */}

          <div className="row mt-5 g-0 shadow-lg overflow-hidden rounded">
            <motion.div
              className="col-lg-6 dark-panel p-5 d-flex align-items-center"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <h3>FOR BRANDS</h3>

                <p className="mt-4">
                  Brandel is more than just a marketplace-it's a curated
                  ecosystem built for premium brands that want to stand out. We
                  connect exceptional businesses with the right audience through
                  powerful storytelling, thoughtfully curated collections, and
                  strategic brand visibility.
                </p>
                <p>
                  Instead of competing in a crowded marketplace, brands gain a
                  premium space where quality, trust, and craftsmanship take
                  center stage. Every listing is designed to inspire discovery,
                  build credibility, and create meaningful customer connections
                  that drive long-term growth.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="col-lg-6 image-box"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img src="./images/aboutus1.png" alt="" />
            </motion.div>
          </div>

          <div className="row mt-0 g-0 shadow-lg overflow-hidden rounded">
            <motion.div
              className="col-lg-6 image-box order-lg-1 order-2"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img src="./images/aboutus2.png" alt="" />
            </motion.div>

            <motion.div
              className="col-lg-6 light-panel p-5 d-flex align-items-center order-lg-2 order-1"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <h3>FOR CUSTOMERS</h3>

                <p className="mt-4">
                  Every purchase empowers independent creators, skilled
                  artisans, and passionate founders who are building something
                  meaningful. By choosing thoughtfully crafted products, you're
                  supporting creativity, ethical craftsmanship, and small
                  businesses while discovering unique stories behind every
                  brand.
                </p>

                <p>
                  Every purchase directly supports independent creators,
                  artisans, and founders dedicated to quality and innovation.
                  Explore carefully curated products that reflect authentic
                  craftsmanship, sustainable values, and inspiring
                  entrepreneurial journeys-where every item tells a meaningful
                  story.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Values */}

          <motion.div
            className="text-center mt-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <h2 className="value-heading">OUR VALUES</h2>
          </motion.div>

          <div className="row mt-4">
            {values.map((item, index) => (
              <motion.div
                key={index}
                className="col-lg col-md-4 col-6 mb-4"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="value-card">
                  <div className="icon">{item.icon}</div>

                  <h5 className=" text-uppercase">{item.title}</h5>

                  <p>{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}

        <motion.div
          className="cta-section mt-5 py-5 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <div className="container">
            <h2>Join the curated community</h2>

            <div className="mt-4">
              <button
                className="btn btn-gold me-3"
                onClick={() => navigate("/sell")}
              >
                Request Brand Invitation
              </button>

              <button
                className="btn btn-outline-light"
                onClick={() => navigate("/category/All")}
              >
                Explore Collections
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Aboutus;

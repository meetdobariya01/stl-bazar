import React from "react";
import "./pricing.css";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaRocket,
  FaChartLine,
  FaGem,
  FaCheckCircle,
  FaAward,
  FaBullhorn,
  FaCalendarAlt,
  FaBookOpen,
  FaMedal,
  FaGift,
  FaStore,
  FaArrowRight,
  FaArrowDown,
  FaCheck,
} from "react-icons/fa";

const benefits = [
  {
    icon: <FaAward />,
    title: "Permanent",
    subtitle: '"Founding Brand" Badge',
  },
  {
    icon: <FaRocket />,
    title: "Priority Access",
    subtitle: "to New Platform Features",
  },
  {
    icon: <FaBullhorn />,
    title: "Invitations",
    subtitle: "to Exclusive Campaigns & Events",
  },
  {
    icon: <FaCalendarAlt />,
    title: "Early Access",
    subtitle: "to Seasonal Promotions",
  },
  {
    icon: <FaBookOpen />,
    title: "Preferential",
    subtitle: "Editorial Stories & Brand Showcases",
  },
];

const plans = [
  {
    title: "STARTER",
    price: "₹499",
    monthly: "Setup + Monthly",
    commission: "12% Commission",
    text: "Offer Valid Until - First 3 Months OR First 10 Orders Completed (whichever comes first)",
    text2: "After offer period ➨ 10% Commission on sales applies",
    icon: <FaRocket />,
    featured: false,

    features: [
      // "Seller storefront & order management",/
      "Up to 25 product listings",
      "1 Homepage Feature/month",
      "2 Category Features/month",
      "1 Social Media Feature/month",
      "Seller Dashboard & Analytics",
      "Access to Seasonal Campaigns",
    ],
  },

  {
    title: "GROWTH ",
    price: "₹1,499",
    monthly: "/ month",
    commission: "9% Commission /",
    icon: <FaChartLine />,
    featured: true,

    features: [
      "Up to 100 product listings",
      "2 Homepage Feature/month",
      "4 Category Features/month",
      "2 Social Media Features/month",
      "Seller Dashboard & Analytics",
      "Order Management",
      "Access to Seasonal Campaigns",
    ],
  },

  {
    title: "PREMIUM",
    price: "₹3,999",
    monthly: "/ month",
    commission: "6% Commission",
    icon: <FaGem />,
    featured: false,

    features: [
      "Unlimited Listings",
      "4 Homepage Features/month",
      "8 Category Features/month",
      "4 Social Media Features/month",
      "Newsletter Inclusion",
      "Advanced Analytics",
      "Priority Support",
    ],
  },
];
const leftFeatures = [
  "Free onboarding",
  "No monthly subscription",
  "No commission",
  "Full access to the platform",
];
const Pricing = () => {
  return (
    <div>
      <section className="pricing-section py-5 lexend">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h1 className="pricing-title funnel-sans">Seller Pricing Plans</h1>

            <h3 className="pricing-subtitle">
              Launch Offer:{" "}
              <span className="highlight">
                <b>SEP & OCT 2026</b>
              </span>
            </h3>
            <h4 className="pricing-subtitle">
              Exclusive Founding Brand Offer: 100% Free in September &
              October
            </h4>

            {/* <p className="pricing-subtitle">Curated • Premium • Seller First</p> */}
          </motion.div>

          <div className="row g-4 mt-3">
            {plans.map((plan, index) => (
              <div className="col-lg-4" key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.2,
                  }}
                  whileHover={{
                    y: -12,
                    scale: 1.03,
                  }}
                  className={`pricing-card ${plan.featured && "featured-card-pricing"}`}
                >
                  <div className="icon-circle">{plan.icon}</div>

                  <h3>{plan.title}</h3>

                  <h2>
                    {plan.price}
                    <span>{plan.monthly}</span>
                  </h2>

                  <p className="commission">{plan.commission}</p>
                  {/* <p>{plan.text}</p> */}
                  {/* <p>{plan.text2}</p> */}
                  <ul>
                    {plan.features.map((item, i) => (
                      <li key={i}>
                        <FaCheckCircle />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* <button className="btn-plan">Get Started</button> */}
                </motion.div>
              </div>
            ))}
          </div>

          <motion.div
            className="bottom-note"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <FaCheckCircle />
            Only selected brands are accepted - ensuring your products never get
            lost among thousands of listings.
          </motion.div>
        </div>
      </section>

      <section className="benefits-section lexend">
        <Container>
          <motion.div
            className="benefits-wrapper"
            initial={{ opacity: 0, y: 70 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="benefits-heading">
              <div className="line"></div>

              <div className="heading-center-pricing">
                <div className="heading-icon">
                  <FaMedal />
                </div>

                <h2>FOUNDING BRAND BENEFITS</h2>

                <p>PERMANENT</p>
              </div>

              <div className="line"></div>
            </div>

            <Row className="g-0 mt-5">
              {benefits.map((item, index) => (
                <Col lg={true} md={4} sm={3} xs={true} key={index}>
                  <motion.div
                    className="benefit-card"
                    whileHover={{
                      y: -10,
                      scale: 1.05,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="benefit-icon">{item.icon}</div>

                    <h5>{item.title}</h5>

                    <p>{item.subtitle}</p>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      <section className="how-section lexend">
        <Container>
          {/* Heading */}

          <div className="how-title">
            <span className="line"></span>
            <h2>HOW IT WORKS</h2>
            <span className="line"></span>
          </div>

          <Row className="align-items-center mt-5">
            {/* Left Card */}

            <Col lg={5}>
              <motion.div
                className="work-card"
                initial={{ x: -80, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <div className="badge-top">SEP & OCT 2026</div>

                <div className="card-content-price">
                  <div className="card-icon">
                    <FaGift />
                  </div>

                  <ul>
                    {leftFeatures.map((item, index) => (
                      <li key={index}>
                        <FaCheck />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </Col>

            {/* Arrow */}

            <Col lg={2} className="text-center my-4 my-lg-0">
              <div className="arrow-circle d-none d-lg-flex">
                <FaArrowRight />
              </div>

              <div className="arrow-circle d-flex d-lg-none">
                <FaArrowDown />
              </div>
            </Col>

            {/* Right Card */}

            <Col lg={5}>
              <motion.div
                className="work-card"
                initial={{ x: 80, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <div className="badge-top">FROM 1 NOV 2026</div>

                <div className="card-content-price">
                  <div className="card-icon">
                    <FaStore />
                  </div>

                  <p>
                    Choose the plan that best fits your business and continue
                    enjoying your Founding Brand benefits.
                  </p>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Pricing;

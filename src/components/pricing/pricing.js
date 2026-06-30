import React from "react";
import "./pricing.css";
import { motion } from "framer-motion";
import { FaRocket, FaChartLine, FaGem, FaCheckCircle } from "react-icons/fa";

const plans = [
  {
    title: "Founding 100 Brands",
    price: "₹0",
    monthly: "Setup + Monthly",
    commission: "0% Commission",
    text: "Offer Valid Until - First 3 Months OR First 10 Orders Completed (whichever comes first)",
    text2: "After offer period ➨ 10% Commission on sales applies",
    icon: <FaRocket />,
    featured: false,

    features: [
      "Seller Storefront",
      "50 Product Listings",
      "Homepage Feature",
      "Category Features",
      "Social Media Feature",
      "Seller Dashboard",
      "Seasonal Campaign Access",
    ],
  },

  {
    title: "Growth Seller",
    price: "₹999",
    monthly: "/ month",
    commission: "8% Commission",
    icon: <FaChartLine />,
    featured: true,

    features: [
      "50 Product Listings",
      "2 Homepage Features",
      "4 Category Features",
      "2 Social Media Features",
      "Analytics Dashboard",
      "Order Management",
      "Campaign Access",
    ],
  },

  {
    title: "Premium Brand",
    price: "₹2,999",
    monthly: "/ month",
    commission: "3% Commission",
    icon: <FaGem />,
    featured: false,

    features: [
      "Unlimited Listings",
      "Homepage Promotions",
      "Newsletter Inclusion",
      "Advanced Analytics",
      "Priority Support",
      "Dedicated Manager",
      "Premium Badge",
    ],
  },
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

            <p className="pricing-subtitle">Curated • Premium • Seller First</p>
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
                  <p>{plan.text}</p>
                  <p>{plan.text2}</p>
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
    </div>
  );
};

export default Pricing;

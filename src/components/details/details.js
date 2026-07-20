// import React from "react";
// import { Container, Row, Col } from "react-bootstrap";
// import { motion } from "framer-motion";
// import {
//   FaLeaf,
//   FaCheckCircle,
//   FaFlask,
//   FaSeedling,
//   FaGlobeAsia,
//   FaPagelines,
// } from "react-icons/fa";
// import "./details.css";

// const promises = [
//   {
//     title: "100% Natural",
//     icon: <FaLeaf />,
//   },
//   {
//     title: "Certified Organic",
//     icon: <FaCheckCircle />,
//   },
//   {
//     title: "Chemical Pesticides Free",
//     icon: <FaFlask />,
//   },
//   {
//     title: "Preservatives Free",
//     icon: <FaSeedling />,
//   },
//   {
//     title: "Sustainably Farmed",
//     icon: <FaGlobeAsia />,
//   },
//   {
//     title: "Non-GMO Produce",
//     icon: <FaPagelines />,
//   },
// ];
// const Details = () => {
//   return (
//     <div>
//       <section className="our-promise-section lexend">
//         <Container>
//           <h2 className="promise-title funnel-sans mb-5">
//             Our Commitment to Excellence
//           </h2>

//           <Row className="justify-content-center">
//             {promises.map((item, index) => (
//               <Col
//                 key={index}
//                 xs={4}
//                 sm={4}
//                 md={3}
//                 lg={2}
//                 className="mb-4 d-flex justify-content-center"
//               >
//                 <motion.div
//                   className="promise-card"
//                   initial={{ opacity: 0, y: 40 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: index * 0.1 }}
//                   whileHover={{ scale: 1.08 }}
//                   viewport={{ once: true }}
//                 >
//                   <div className="promise-circle">
//                     <span className="promise-icon">{item.icon}</span>
//                   </div>
//                   <p className="promise-text">{item.title}</p>
//                 </motion.div>
//               </Col>
//             ))}
//           </Row>
//         </Container>
//       </section>
//     </div>
//   );
// };

// export default Details;

import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaGem, FaMapMarkedAlt, FaHandsHelping, FaUsers } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "./details.css";

const stats = [
  {
    icon: <FaGem />,
    number: "150+",
    title: "Curated Brands",
  },
  {
    icon: <FaMapMarkedAlt />,
    number: "20+",
    title: "Indian States",
    subtitle: "Represented",
  },
  {
    icon: <FaHandsHelping />,
    number: "1000+",
    title: "Products with",
    subtitle: "Purpose",
  },
  {
    icon: <FaUsers />,
    number: "∞",
    title: "Stories",
    subtitle: "and Counting",
  },
];

const StatsSection = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <section className="brand-stats-section py-5 lexend">
      <Container>
        <Row className="g-4">
          {stats.map((item, index) => (
            <Col
              lg={3}
              md={6}
              xs={6}
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 150}
            >
              <div
                className={`brand-stat-card ${
                  index !== stats.length - 1 ? "stat-border" : ""
                }`}
              >
                <div className="brand-stat-icon">{item.icon}</div>

                <h2>{item.number}</h2>

                <p>
                  {item.title}
                  {item.subtitle && (
                    <>
                      <br />
                      {item.subtitle}
                    </>
                  )}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default StatsSection;

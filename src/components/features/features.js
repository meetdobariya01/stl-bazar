// import React from "react";
// import { Container, Row, Col } from "react-bootstrap";
// import { FaRegStar, FaLock, FaUndo, FaHeadset } from "react-icons/fa";
// import "./features.css";

// const features = [
//   {
//     icon: <FaRegStar />,
//     title: "Curated Quality",
//     subtitle: "Handpicked with care",
//   },
//   {
//     icon: <FaLock />,
//     title: "Secure Payments",
//     subtitle: "Safe & trusted checkout",
//   },
//   {
//     icon: <FaUndo />,
//     title: "Easy Returns",
//     subtitle: "Hassle-free returns",
//   },
//   {
//     icon: <FaHeadset />,
//     title: "Support That Cares",
//     subtitle: "We’re here for you",
//   },
// ];

// const Features = () => {
//   return (
//     <div>
//       <section className="feature-section py-4">
//         <Container>
//           <Row className="g-4">
//             {features.map((item, index) => (
//               <Col lg={3} md={6} sm={6} xs={6} key={index}>
//                 <div className="feature-card d-flex align-items-center">
//                   <div className="feature-icon">{item.icon}</div>

//                   <div className="ms-3">
//                     <h6 className="mb-1 lexend">{item.title}</h6>
//                     <p className="mb-0 funnel-sans">{item.subtitle}</p>
//                   </div>
//                 </div>
//               </Col>
//             ))}
//           </Row>
//         </Container>
//       </section>
//     </div>
//   );
// };

// export default Features;

import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./features.css";

const StorySection = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <section className="story-section py-5">
      {/* <Container fluid> */}
        <Row className="g-0 align-items-stretch">
          {/* Left Image */}

          <Col lg={5} className="d-none d-lg-block" data-aos="fade-right">
            <div className="story-left-image">
              <img src="./images/storycontent.webp" alt="" />
            </div>
          </Col>

          {/* Right Content */}

          <Col lg={7} xs={12} data-aos="fade-left">
            <div className="story-content-wrapper">
              <div className="story-content">
                <span className="story-subtitle">
                  STORIES WORTH BRINGING HOME
                </span>

                <div className="story-line"></div>

                <h2>
                  Every product
                  <br />
                  has a past.
                  <br />
                  Yours is its
                  <br />
                  next chapter.
                </h2>

                <NavLink to="/aboutus" className="story-btn text-decoration-none text-dark">
                  READ THE JOURNAL
                  <FaArrowRight />
                </NavLink>
              </div>
            </div>
          </Col>
        </Row>
      {/* </Container> */}
    </section>
  );
};

export default StorySection;

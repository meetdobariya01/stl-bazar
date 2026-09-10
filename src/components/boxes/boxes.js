import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./boxes.css";

const bannerData = [
  {
    subtitle: "Seasonal Picks",
    title: "Navratri Edit",
    desc: "Statement pieces for your Garba nights & festive looks.",
    button: "Shop Now",
    image: "./images/navaratri-edits.webp",
    link: "/company/The%20Humming%20Threads",
    company: "The Humming Threads",
  },
  {
    subtitle: "Gift Guide",
    title: "Gifts They’ll Treasure",
    desc: "Handmade with love, made for little moments.",
    button: "Explore Gifts",
    image: "./images/gifting.webp",
    link: "/company/ECOPLUSHIE%2FNEELADRI%20FAB",
    company: "Ecoplushie/Neeladri Fab",
  },
  {
    subtitle: "Brand Spotlight",
    title: "New Makers, Great Stories",
    desc: "From everyday essentials to luxury items, find the perfect match for your needs",
    button: "Discover Brands",
    image: "./images/brand-spotlight.webp",
    link: "/company/Koraluxury",
    company: "Koraluxury",
  },
  {
    subtitle: "Wellness Picks",
    title: "Goodness, Made Simple",
    desc: "Thoughtfully crafted fruit & veggie blends for delicious everyday nourishment.",
    button: "Shop Now",
    image: "./images/wellness-picks.webp",
    link: "/company/Nuravia",
    company: "Nuravia",
  },
];

const Boxes = () => {
  return (
    <div>
      <section className="promo-section py-5 lexend">
        <Container fluid>
          {/* Desktop */}

          <div className="d-none d-lg-block">
            <Row className="g-4">
              {bannerData.map((item, index) => (
                <Col lg={3} key={index}>
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
                        <p className="m-0 fw-bold">{item.company}</p>

                        <p>{item.desc}</p>
                      </div>
                    </Link>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Mobile */}

          <div className="d-lg-none">
            <Swiper
              modules={[Autoplay]}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              loop={true}
              spaceBetween={15}
              breakpoints={{
                0: {
                  slidesPerView: 2.1,
                },
                576: {
                  slidesPerView: 2.3,
                },
                768: {
                  slidesPerView: 3,
                },
              }}
            >
              {bannerData.map((item, index) => (
                <SwiperSlide key={index}>
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
                        <p className="m-0 fw-bold">{item.company}</p>

                        <p>{item.desc}</p>
                      </div>
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Boxes;

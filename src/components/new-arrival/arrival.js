import React from "react";
import { Container, Carousel, Button } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./arrival.css";

const slides = [
  {
    products: [
      {
        title: "Handcrafted Wooden Vase",
        price: "₹450",
        image:
          "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800",
      },
      {
        title: "Ceramic Coffee Mug",
        price: "₹650",
        image:
          "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?q=80&w=800",
      },
      {
        title: "Herbal Face Cleanser",
        price: "₹750",
        image:
          "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=800",
      },
      {
        title: "Gold Plated Pendant Set",
        price: "₹1250",
        image:
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800",
      },
    ],
  },
  {
    products: [
      {
        title: "Luxury Candle",
        price: "₹550",
        image:
          "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800",
      },
      {
        title: "Natural Soap",
        price: "₹350",
        image:
          "https://images.unsplash.com/photo-1607006483225-4d1f31f2e8b7?q=80&w=800",
      },
      {
        title: "Wooden Decor",
        price: "₹950",
        image:
          "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800",
      },
      {
        title: "Elegant Necklace",
        price: "₹1550",
        image:
          "https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=800",
      },
    ],
  },
];

const Arrival = () => {
  return (
    <div>
      <section className="arrival-section lexend ">
        <Container fluid className="px-lg-5">
          <Carousel
            indicators={true}
            controls={true}
            interval={7000}
            pause={false}
            prevIcon={
              <div className="custom-arrow left-arrow">
                <FaChevronLeft />
              </div>
            }
            nextIcon={
              <div className="custom-arrow right-arrow">
                <FaChevronRight />
              </div>
            }
          >
            {slides.map((slide, idx) => (
              <Carousel.Item key={idx}>
                <div className="arrival-wrapper">
                  {/* Left Content */}
                  <div className="left-content">
                    <span>New Arrivals</span>

                    <h2>
                      Fresh Finds,
                      <br />
                      <span>Handpicked</span>
                      {/* <br /> */}
                      For You
                    </h2>

                    <Button className="explore-btn">Explore New In</Button>
                  </div>

                  {/* Right Products */}
                  <div className="container-fluid">
                    <div className="row g-3">
                      {slide.products.map((item, index) => (
                        <div className="col-6 col-md-4 col-lg-3" key={index}>
                          <div className="product-card h-100">
                            <div className="product-img">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="img-fluid w-100"
                              />
                            </div>

                            <div className="product-info text-center mt-2">
                              <h5>{item.title}</h5>
                              <p className="funnel-sans">{item.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>
    </div>
  );
};

export default Arrival;

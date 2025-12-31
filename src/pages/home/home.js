import React from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { Carousel } from "react-bootstrap";
import "./home.css";

const Home = () => {
  return (
    <div>
      {/* header */}
      <Header />
    

      {/* hero section */}
      <Carousel
        fade
        interval={4000} // AUTO SWIPE
        pause={false}
        indicators={false}
        controls={true}
        touch={true} // MOBILE SWIPE
        className="image-carousel"
      >
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-img"
            src="./images/carousel-1.webp"
            alt="Slide 1"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100 carousel-img"
            src="./images/carousel-2.webp"
            alt="Slide 2"
          />
        </Carousel.Item>
      </Carousel>

      {/* footer */}
      <Footer />
    </div>
  );
};

export default Home;

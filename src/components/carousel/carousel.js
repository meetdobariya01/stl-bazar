import React from "react";
import "./carousel.css";

const Carousel = () => {
  return (
    <div>
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
    </div>
  );
};

export default Carousel;

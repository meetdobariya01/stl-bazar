import React from "react";
import Carousel from "react-bootstrap/Carousel";
import "./carousel.css";

const Carouselhero = () => {
  return (
    <div>
      <Carousel
        controls={false}
        indicators={true}
        interval={3000}
        pause={false}
        touch={true}
        fade
      >
        {/* Slide 1 */}
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-img"
            src="/images/carousel-1.webp"
            alt="Banner 1"
          />
        </Carousel.Item>

        {/* Slide 2 */}
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-img"
            src="/images/carousel-2.webp"
            alt="Banner 2"
          />
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default Carouselhero;

import React from "react";
import Carousel from "react-bootstrap/Carousel";
import { NavLink } from "react-router-dom";
import "./carousel.css";

const slides = [
  {
    image: "/images/carousel-1.webp",
    title: "Thoughtful Gifts. \nMade to Delight.",
    desc: "Handpicked treasures for every occasion and every celebration.",
    btn: "Shop Collections",
    link: "/category/gifting",
  },
  {
    image: "/images/carousel-2.webp",
    title: "Clean Beauty.\nNaturally You.",
    desc: "Gentle, effective skincare made with nature's finest ingredients.",
    btn: "Shop Collections",
    link: "/category/personal-care",
  },
  {
    image: "/images/carousel-3.webp",
    title: "Pure. Natural.\nOrganic Food.",
    desc: "Wholesome ingredients, ethically sourced for a healthier you and a better planet.",
    btn: "Shop Collections",
    link: "/category/vegetable",
  },
  { 
    image: "/images/carousel-4.webp",
    title: "Snack Smart.\nStay Organic.",
    desc: "Delicious, nutritious & responsibly made for your everyday cravings.",
    btn: "Shop Collections",
    link: "/category/snacks",
  },
];

const Carouselhero = () => {
  return (
    <div className="hero-carousel lexend container mt-4">
      <Carousel
        controls={false}
        indicators={true}
        interval={3000}
        pause={false}
        touch={true}
        fade
      >
        {slides.map((slide, index) => (
          <Carousel.Item key={index}>
            <div className="carousel-wrapper">
              <img
                className="d-block w-100 carousel-img"
                src={slide.image}
                alt={`Banner ${index + 1}`}
              />

              {/* Content Box */}
              <div className="carousel-content">
                <h1>
                  {slide.title.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h1>

                <p>{slide.desc}</p>

                <NavLink to={slide.link}>
                  <button className="shop-btn-carousel">{slide.btn}</button>
                </NavLink>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default Carouselhero;

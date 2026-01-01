import React from "react";
import { Container, Carousel } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import "./testimonial.css";

const testimonials = [
  {
    name: "Srushti Parate",
    rating: 5,
    text: "Tried Soulliqo for the first time and I’m hooked. Super smooth, and literally melts in your mouth",
    image: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "Yashaswani Agarwal",
    rating: 5,
    text: "From Ahmedabad to my heart (and tummy) 🍫, half the box gone in a day – that says it all! 💗",
    image: "https://i.pravatar.cc/100?img=12",
  },
   {
    name: "Srushti Parate",
    rating: 5,
    text: "Tried Soulliqo for the first time and I’m hooked. Super smooth, and literally melts in your mouth",
    image: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "Maps & Mimosas",
    rating: 4,
    text: "Loving this colour and flavour bombs!!",
    image: "https://i.pravatar.cc/100?img=32",
  },
   {
    name: "Srushti Parate",
    rating: 5,
    text: "Tried Soulliqo for the first time and I’m hooked. Super smooth, and literally melts in your mouth",
    image: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "Aditi Shah",
    rating: 5,
    text: "Premium packaging and taste is top notch. Will order again!",
    image: "https://i.pravatar.cc/100?img=22",
  },
];

const chunk = (arr, size) =>
  arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);

const Testimonil = () => {
     const slides = chunk(testimonials, 3);
  return (
    <div>
          <section className="testimonial-section">
      <Container>
        <Carousel
          interval={3500}
          pause="hover"
          indicators={false}
          controls={false}
          touch
        >
          {slides.map((group, index) => (
            <Carousel.Item key={index}>
              <div className="testimonial-row">
                {group.map((item, i) => (
                  <motion.div
                    className="testimonial-card"
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  >
                    <div className="testimonial-header">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <h6>{item.name}</h6>
                        <div className="stars">
                          {[...Array(5)].map((_, j) => (
                            <FaStar
                              key={j}
                              color={j < item.rating ? "#f7b500" : "#ddd"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="testimonial-text">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </section> 
    </div>
  )
}

export default Testimonil;
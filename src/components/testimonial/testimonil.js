import React, { useEffect, useState } from "react";
import { Container, Carousel } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import "./testimonial.css";

const testimonials = [
  {
    name: "Srushti Parate",
    rating: 1,
    text: "Absolutely loved the taste! You can truly feel the homemade touch in every bite. Just like ghar ka khana.",
    image: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "Yashaswani Agarwal",
    rating: 2,
    text: "Fresh, crispy and perfectly balanced flavors. Much better than factory-made snacks.",
    image: "https://i.pravatar.cc/100?img=12",
  },
  {
    name: "Ramesh Patel",
    rating: 3,
    text: "The sweets reminded me of my childhood. Pure ingredients and authentic taste",
    image: "https://i.pravatar.cc/100?img=32",
  },
  {
    name: "Aditi Shah",
    rating: 4,
    text: "Every product feels handcrafted with love. The quality, taste, and freshness are outstanding.",
    image: "https://i.pravatar.cc/100?img=22",
  },
  {
    name: "Paresh Parikh",
    rating: 5,
    text: "Finally found a brand that delivers traditional taste with modern hygiene standards. Highly recommended!",
    image: "https://i.pravatar.cc/100?img=22",
  },
  {
    name: "Komal Maheta",
    rating: 6,
    text: "From namkeen to sweets, everything tastes rich and authentic. Perfect for festivals and gifting.",
    image: "https://i.pravatar.cc/100?img=22",
  },
];

const chunk = (arr, size) =>
  arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);

const Testimonil = () => {
  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerSlide(1); // ✅ Mobile: 1 card per slide
      } else {
        setItemsPerSlide(3); // ✅ Desktop: 3 cards per slide
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const slides = chunk(testimonials, itemsPerSlide);

  return (
    <section className="testimonial-section">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="section-header lexend"
        >
          <h2>Testimonials</h2>
        </motion.div>

        <Carousel
          interval={3000}
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
                    transition={{ duration: 0.6 }}
                  >
                    <div className="testimonial-header">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <h6 className="lexend">{item.name}</h6>
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

                    <p className="testimonial-text funnel-sans">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </section>
  );
};

export default Testimonil;

import React, { useEffect, useState } from "react";
import { Container, Carousel } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import "./testimonial.css";

const testimonials = [
  {
    name: "Srushti Parate",
    rating: 4,
    text: "Every single bite felt like a warm hug from my grandmother's kitchen. The spices are perfectly balanced - not overpowering, yet unmistakably desi. I've already ordered three times this month and I don't plan on stopping!",
    image: "./images/t-1.webp",
  },
  {
    name: "Yashaswani Agarwal",
    rating: 5,
    text: "I was a little skeptical ordering snacks online, but these completely changed my mind. They arrived fresh, the packaging was neat, and the crunch was just right. The only reason I'm giving 5 stars is because I ate everything too fast!",
    image: "./images/t-2.webp",
  },
  {
    name: "Mehul Patel",
    rating: 3,
    text: "As someone who reads every ingredient label, I'm genuinely impressed - no preservatives, no artificial colors, just real food. My kids love them and I feel good about what they're snacking on. This is the gold standard for homemade treats.",
    image: "./images/t-3.webp",
  },
  {
    name: "Aditi Shah",
    rating: 4,
    text: "Ordered these as a Diwali gift hamper for my colleagues and got rave reviews all around. The presentation was beautiful and the variety was spot on. Several people asked where I bought them - I happily shared the link!",
    image: "./images/t-4.webp",
  },
  {
    name: "Paresh Parikh",
    rating: 5,
    text: "Good flavors and definitely homemade quality - you can taste the effort. Delivery was a day late, but customer support sorted it out quickly. The mathri and chakli were my favourites. Will order again once they sort out the shipping timelines.",
    image: "./images/t-5.webp",
  },
  {
    name: "Komal Maheta",
    rating: 6,
    text: "Living abroad, I'm always craving authentic Indian snacks. This is the closest I've found to the real thing. The besan ladoos melt in your mouth exactly like the ones back home. Finally, something that fills that little homesick gap in my heart!",
    image: "./images/t-6.webp",
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
          className="section-header funnel-sans"
        >
          <h2 className="testimonial-title">Stories From Our Customers</h2>
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

                    <p className="testimonial-text lexend ">{item.text}</p>
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

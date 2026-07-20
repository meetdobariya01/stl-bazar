import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Accordion } from "react-bootstrap";
import AOS from "aos";
import "./faqs.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const faqData = [
  {
    question: "How do I place an order?",
    answer:
      "Simply browse our products, add your desired items to the cart, proceed to checkout, enter your shipping details, choose your preferred payment method, and confirm your order.",
  },
  {
    question: "Do I need to create an account to shop?",
    answer:
      "No. You can place an order as a guest. However, creating an account allows you to track orders, save addresses, and enjoy a faster checkout experience.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Credit Cards, Debit Cards, UPI, Net Banking, Wallets, and Cash on Delivery (available in selected locations).",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, you will receive an email and SMS containing your tracking number and courier details.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Most orders are delivered within 3–7 business days depending on your location.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Yes. Orders can be canceled before they are shipped. Once shipped, cancellation may not be possible.",
  },
  {
    question: "Can I return a product?",
    answer:
      "Yes. Eligible products can be returned within our return window if they are unused, undamaged, and in their original packaging.",
  },
  {
    question: "When will I receive my refund?",
    answer:
      "Refunds are generally processed within 5–10 business days after the returned product has been inspected and approved.",
  },
  {
    question: "What should I do if I receive a damaged or incorrect product?",
    answer:
      "Please contact our customer support within 48 hours of delivery with photos of the product and packaging. We will arrange a replacement or refund.",
  },
  {
    question: "Is Cash on Delivery (COD) available?",
    answer: "Yes, Cash on Delivery is available for selected PIN codes.",
  },
  {
    question: "Can I change my shipping address after placing an order?",
    answer:
      "Yes, you can request an address change before your order has been shipped.",
  },
  {
    question: "Are my online payments secure?",
    answer:
      "Absolutely. We use secure SSL encryption and trusted payment gateways to keep your payment information safe.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can reach us through Email, Phone, Live Chat, or our Contact Us page.",
  },
  {
    question: "Do you offer free shipping?",
    answer:
      "Yes. Free shipping may be available on orders above a specified minimum purchase value.",
  },
  {
    question: "Can I use multiple discount coupons?",
    answer:
      "No. Only one promotional coupon can typically be applied per order.",
  },
  {
    question: "What happens if my order is delayed?",
    answer:
      "If your order is delayed beyond the expected delivery date, our support team will provide an update and assist you.",
  },
  {
    question: "Will I receive an invoice?",
    answer:
      "Yes. A digital invoice will be sent to your registered email after your order is confirmed.",
  },
  {
    question: "Do you ship across India?",
    answer: "Yes. We deliver to most cities and towns across India.",
  },
  {
    question: "How do I know if a product is in stock?",
    answer:
      "Product availability is displayed on each product page. You can also subscribe for restock notifications.",
  },
  {
    question: "How can I contact you for bulk or business orders?",
    answer:
      "For wholesale or bulk purchase inquiries, please contact our sales team through the Contact Us page.",
  },
];

const Faqs = () => {
  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
    });
  }, []);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth"
    });
  }, [pathname]);
  return (
    <div>
      {/* Header */}
      <Header />

      <section className="faq-section lexend">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div data-aos="fade-down">
                <span className="faq-subtitle">Need Help?</span>

                <h2 className="faq-title funnel-sans">
                  Frequently Asked Questions
                </h2>

                <p className="faq-description">
                  Find answers to the most common questions about ordering,
                  payments, shipping, returns, refunds, and more.
                </p>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center mt-5">
            <Col lg={10}>
              <Accordion defaultActiveKey="0">
                {faqData.map((faq, index) => (
                  <Accordion.Item
                    eventKey={index.toString()}
                    key={index}
                    className="faq-card"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <Accordion.Header className="text-dark">
                      {faq.question}
                    </Accordion.Header>

                    <Accordion.Body>{faq.answer}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Faqs;

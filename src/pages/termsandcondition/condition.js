import React, { useEffect, useState } from "react";
import AOS from "aos";
import "./condition.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import "aos/dist/aos.css";

const sections = [
  {
    title: "About Brandel",
    icon: "bi-shop",
    content:
      "Brandel is an invite-only marketplace connecting customers with independent brands, creators, artisans, and businesses while supporting small businesses.",
  },
  {
    title: "Eligibility",
    icon: "bi-person-check",
    list: [
      "You are at least 18 years old or have parental consent.",
      "You can legally enter into binding agreements.",
      "Your information is accurate and up to date.",
    ],
  },
  {
    title: "Account Registration",
    icon: "bi-person-circle",
    list: [
      "Provide accurate information.",
      "Keep your login credentials secure.",
      "Notify unauthorized access immediately.",
      "Accept responsibility for all activities under your account.",
    ],
  },
  {
    title: "Products & Marketplace",
    icon: "bi-box-seam",
    list: [
      "Product descriptions may contain occasional errors.",
      "Images may differ slightly from actual products.",
      "Colors may vary depending on your device.",
      "Products may be updated or discontinued without notice.",
    ],
  },
  {
    title: "Pricing",
    icon: "bi-currency-rupee",
    content:
      "All prices are displayed in INR. Taxes, shipping charges and convenience fees are calculated during checkout.",
  },
  {
    title: "Orders",
    icon: "bi-bag-check",
    list: [
      "Orders depend on availability.",
      "Incorrect pricing.",
      "Fraud detection.",
      "Payment failure.",
      "Product unavailability.",
    ],
  },
  {
    title: "Payments",
    icon: "bi-credit-card",
    content:
      "Payments are securely processed through authorized payment gateways. We never store complete card details.",
  },
  {
    title: "Shipping & Delivery",
    icon: "bi-truck",
    list: [
      "Delivery timelines are estimates.",
      "Weather delays.",
      "Courier delays.",
      "Public holidays.",
      "Force majeure events.",
    ],
  },
  {
    title: "Returns & Refunds",
    icon: "bi-arrow-counterclockwise",
    content:
      "Returns and refunds are governed by our Return Policy. Eligibility depends on product condition, timeframe, seller policies and applicable law.",
  },
  {
    title: "Cancellations",
    icon: "bi-x-circle",
    content:
      "Orders may only be cancelled before shipment. Once dispatched cancellation may not be possible.",
  },
  {
    title: "Seller Responsibilities",
    icon: "bi-building",
    list: [
      "Provide accurate information.",
      "Deliver genuine products.",
      "Maintain product quality.",
      "Comply with laws.",
      "Handle customer issues professionally.",
    ],
  },
  {
    title: "Intellectual Property",
    icon: "bi-shield-lock",
    content:
      "All logos, branding, graphics, software, images, text and design are owned by Brandel and protected under intellectual property laws.",
  },
  {
    title: "User Conduct",
    icon: "bi-person-x",
    list: [
      "No illegal activity.",
      "No malware.",
      "No unauthorized access.",
      "No false information.",
      "No interference with website functionality.",
    ],
  },
  {
    title: "Reviews & User Content",
    icon: "bi-chat-left-text",
    content:
      "By submitting reviews, ratings or comments you grant Brandel a royalty-free license to display and use the content.",
  },
  {
    title: "Privacy",
    icon: "bi-lock",
    content: "Your use of Brandel is governed by our Privacy Policy.",
  },
  {
    title: "Third-Party Links",
    icon: "bi-link-45deg",
    content:
      "We are not responsible for third-party websites, products or services.",
  },
  {
    title: "Limitation of Liability",
    icon: "bi-exclamation-triangle",
    content:
      "Our liability shall not exceed the amount paid for the relevant order.",
  },
  {
    title: "Disclaimer",
    icon: "bi-info-circle",
    content:
      'Services are provided "AS IS" and "AS AVAILABLE" without warranties.',
  },
  {
    title: "Force Majeure",
    icon: "bi-cloud-lightning",
    content:
      "We are not responsible for delays caused by natural disasters, pandemics, internet outages, labor disputes or war.",
  },
  {
    title: "Termination",
    icon: "bi-door-open",
    content:
      "Accounts violating these Terms may be suspended or terminated without notice.",
  },
  {
    title: "Governing Law",
    icon: "bi-bank",
    content:
      "These Terms are governed by the laws of India. Jurisdiction shall remain with Ahmedabad, Gujarat.",
  },
  {
    title: "Changes to Terms",
    icon: "bi-arrow-repeat",
    content:
      "We may update these Terms at any time. Continued use indicates acceptance.",
  },
];

const Condition = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });

    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;

      const current = window.scrollY;

      setProgress((current / total) * 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div>
      {/* Header */}
      <Header />

      <div className="terms-page lexend">
        <div className="progressBar" style={{ width: `${progress}%` }}></div>

        <section className="hero">
          <div className="container">
            <h1 data-aos="fade-down">Terms & Conditions</h1>

            <p data-aos="fade-up">Last Updated : July 2, 2026</p>
          </div>
        </section>

        <div className="container py-5">
          <div className="row">
            <div className="col-lg-3 mb-4">
              <div className="toc sticky-top">
                <h5>Contents</h5>

                <ul>
                  {sections.map((item, index) => (
                    <li key={index}>
                      <a href={`#section${index}`}>
                        {index + 1}. {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-9">
              <div className="glass mb-4" data-aos="fade-up">
                <h2>Welcome to Brandel</h2>

                <p>
                  These Terms govern your use of our website, marketplace,
                  products and services. By accessing our platform you agree to
                  these Terms.
                </p>
              </div>

              {sections.map((item, index) => (
                <div
                  className="glass mb-4"
                  id={`section${index}`}
                  key={index}
                  data-aos="fade-up"
                >
                  <h3>
                    <i className={`bi ${item.icon}`}></i> {index + 1}.{" "}
                    {item.title}
                  </h3>

                  {item.content && <p>{item.content}</p>}

                  {item.list && (
                    <ul>
                      {item.list.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <div className="glass" data-aos="zoom-in">
                <h3>
                  <i className="bi bi-envelope"></i>
                  Contact Us
                </h3>

                <p>
                  <strong>Brandel</strong>
                </p>

                <p>Email : care@brandel.com</p>

                <p>Website : www.brandel.shop</p>

                <p>
                  Business Hours : Monday – Saturday 10:00 AM – 6:00 PM (IST)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Condition;

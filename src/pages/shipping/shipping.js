import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import "aos/dist/aos.css";
import "./shipping.css";

const sections = [
  {
    title: "Order Processing",
    icon: "bi-box2-heart",
    list: [
      "Orders are processed within 1–3 business days after payment confirmation.",
      "Orders placed on weekends or public holidays are processed on the next business day.",
      "Processing may take longer during sales or promotional events.",
    ],
  },
  {
    title: "Shipping Locations",
    icon: "bi-geo-alt",
    content:
      "We currently deliver across India. International shipping is not available at this time.",
  },
  {
    title: "Estimated Delivery Time",
    icon: "bi-truck",
    table: [
      ["Metro Cities", "2–5 Business Days"],
      ["Other Cities", "3–7 Business Days"],
      ["Remote Areas", "5–10 Business Days"],
    ],
    note: "Delivery times are estimates and may vary due to weather, courier delays, public holidays, festivals, or other unforeseen circumstances.",
  },
  {
    title: "Shipping Charges",
    icon: "bi-currency-rupee",
    list: [
      "Calculated during checkout based on location and order value.",
      "Free shipping on eligible orders.",
      "Promotional shipping offers during campaigns.",
      "Flat-rate shipping for selected products.",
    ],
  },
  {
    title: "Order Tracking",
    icon: "bi-search",
    list: [
      "Shipping confirmation email",
      "Tracking number",
      "Courier partner details",
    ],
  },
  {
    title: "Delivery Attempts",
    icon: "bi-arrow-repeat",
    list: [
      "Delivery partners generally make 2–3 delivery attempts.",
      "Packages may be returned due to incorrect address, unavailable customer, unreachable phone, or refusal to accept delivery.",
      "Additional shipping charges may apply for re-shipping.",
    ],
  },
  {
    title: "Incorrect Shipping Address",
    icon: "bi-house-exclamation",
    content:
      "Customers are responsible for providing accurate shipping information. Address changes cannot be guaranteed after dispatch.",
  },
  {
    title: "Delayed Deliveries",
    icon: "bi-clock-history",
    list: [
      "Weather conditions",
      "Natural disasters",
      "Government restrictions",
      "Public holidays",
      "Courier operational delays",
      "High order volumes",
    ],
  },
  {
    title: "Damaged or Missing Packages",
    icon: "bi-exclamation-octagon",
    list: [
      "Contact customer support within 48 hours.",
      "Provide your order number.",
      "Share clear photos of the package and damaged items.",
    ],
  },
  {
    title: "Partial Shipments",
    icon: "bi-box-seam",
    content:
      "Orders containing multiple products may arrive separately depending on stock availability or warehouse locations.",
  },
  {
    title: "Order Cancellation",
    icon: "bi-x-circle",
    content:
      "Orders may only be cancelled before shipment. Once dispatched, cancellations are no longer possible.",
  },
  {
    title: "Delivery Acceptance",
    icon: "bi-check2-circle",
    content:
      "Inspect your package upon delivery. If it appears damaged or tampered with, refuse delivery and contact our support team immediately.",
  },
];
const Shipping = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth"
    });
  }, [pathname]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });

    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress((window.scrollY / total) * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {/* Header */}
      <Header />

      <div className="shipping-page lexend">
        <div
          className="progress-bar-top"
          style={{ width: `${progress}%` }}
        ></div>

        <section className="shipping-hero">
          <div className="container text-center">
            <span className="badge bg-light text-success mb-3">
              Shipping Policy
            </span>

            <h1 data-aos="fade-down">Safe & Reliable Shipping</h1>

            <p data-aos="fade-up">Last Updated : July 2, 2026</p>
          </div>
        </section>

        <div className="container py-5">
          <div className="row">
            <div className="col-lg-3 mb-4">
              <div className="policy-menu sticky-top">
                <h5>Contents</h5>

                <ul>
                  {sections.map((item, i) => (
                    <li key={i}>
                      <a href={`#section${i}`}>
                        {i + 1}. {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-9">
              <div className="policy-card mb-4" data-aos="fade-up">
                <h2>Welcome to Native91</h2>

                <p>
                  We are committed to delivering your orders safely, securely,
                  and on time. Please read our Shipping Policy carefully to
                  understand how we process and deliver your orders.
                </p>
              </div>

              {sections.map((item, i) => (
                <div
                  className="policy-card mb-4"
                  id={`section${i}`}
                  key={i}
                  data-aos="fade-up"
                >
                  <h3>
                    <i className={`bi ${item.icon}`}></i>
                    {i + 1}. {item.title}
                  </h3>

                  {item.content && <p>{item.content}</p>}

                  {item.list && (
                    <ul>
                      {item.list.map((x, index) => (
                        <li key={index}>{x}</li>
                      ))}
                    </ul>
                  )}

                  {item.table && (
                    <div className="table-responsive mt-3">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Location</th>
                            <th>Estimated Delivery</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.table.map((row, index) => (
                            <tr key={index}>
                              <td>{row[0]}</td>
                              <td>{row[1]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {item.note && (
                    <div className="alert alert-warning mt-3">{item.note}</div>
                  )}
                </div>
              ))}

              <div className="policy-card" data-aos="zoom-in">
                <h3>
                  <i className="bi bi-envelope-paper"></i>
                  Contact Us
                </h3>

                <p>
                  If you have any questions regarding shipping, please contact
                  us.
                </p>

                <p>
                  <strong>Email:</strong>
                  <br />
                  support@native91.com
                </p>

                <p>
                  <strong>Business Hours:</strong>
                  <br />
                  Monday – Saturday
                  <br />
                  10:00 AM – 6:00 PM (IST)
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

export default Shipping;

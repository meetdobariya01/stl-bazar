import React, { useEffect, useState } from "react";
import AOS from "aos";
import "./return.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const sections = [
  {
    title: "Order Cancellation",
    icon: "bi-x-circle",
    eligible: [
      "Order has not been packed or shipped.",
      "Cancellation request is made within the allowed cancellation period.",
    ],
    notEligible: [
      "Order has already been shipped.",
      "Customized or made-to-order products.",
      "Digital or downloadable products.",
    ],
  },
  {
    title: "Return Policy",
    icon: "bi-arrow-counterclockwise",
    list: [
      "Returns accepted within 7 days of delivery.",
      "Product must be unused and in original condition.",
      "Original packaging, tags and accessories are required.",
      "Proof of purchase is required.",
      "Product should not be damaged due to misuse.",
    ],
  },
  {
    title: "Non-Returnable Items",
    icon: "bi-slash-circle",
    list: [
      "Customized products",
      "Gift cards",
      "Digital products",
      "Perishable goods",
      "Opened hygiene products",
      "Final Sale / Non-Returnable products",
    ],
  },
  {
    title: "Damaged / Incorrect Products",
    icon: "bi-exclamation-triangle",
    list: [
      "Damaged product",
      "Defective product",
      "Wrong product",
      "Missing items",
    ],
    note: "Contact customer support within 48 hours and provide your Order Number, product photos, packaging photos and issue description.",
  },
  {
    title: "Refund Policy",
    icon: "bi-wallet2",
    list: [
      "Refund approval after inspection.",
      "Processed within 5–7 business days.",
      "Refund credited to original payment method.",
    ],
  },
  {
    title: "Late or Missing Refunds",
    icon: "bi-clock-history",
    list: [
      "Check your bank account.",
      "Contact your card provider.",
      "Contact your bank.",
      "Reach out to customer support.",
    ],
  },
  {
    title: "Exchange Policy",
    icon: "bi-arrow-left-right",
    list: [
      "Defective products",
      "Damaged products",
      "Incorrectly delivered products",
      "Request within 7 days.",
    ],
  },
  {
    title: "Return Shipping",
    icon: "bi-truck",
    ourError: ["Wrong item shipped", "Damaged item", "Manufacturing defect"],
    customer: [
      "Customer pays shipping charges for change-of-mind returns unless otherwise stated.",
    ],
  },
  {
    title: "Replacement Timeline",
    icon: "bi-box-seam",
    content:
      "Approved replacement orders are generally dispatched within 3–5 business days, subject to stock availability.",
  },
  {
    title: "Refund Methods",
    icon: "bi-credit-card",
    list: [
      "Credit Card",
      "Debit Card",
      "UPI",
      "Net Banking",
      "Wallet",
      "Other supported payment methods",
    ],
  },
  {
    title: "Failed Deliveries",
    icon: "bi-house-x",
    list: [
      "Incorrect shipping address",
      "Customer unavailable",
      "Delivery refused",
    ],
    note: "Applicable shipping charges may be deducted before issuing the refund.",
  },
];

const steps = [
  "Contact Customer Support",
  "Share Order ID & Reason",
  "Wait for Approval",
  "Pack Item Securely",
  "Ship Product",
  "Receive Refund / Replacement",
];

const Return = () => {
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

      <div className="refund-page lexend">
        <div
          className="scroll-progress"
          style={{ width: `${progress}%` }}
        ></div>

        <section className="refund-hero">
          <div className="container text-center">
            <span className="badge bg-light text-danger mb-3">
              Return • Refund • Cancellation
            </span>

            <h1 data-aos="fade-down">Return, Refund & Cancellation Policy</h1>

            <p data-aos="fade-up">Last Updated : July 2, 2026</p>
          </div>
        </section>

        <div className="container py-5">
          <div className="row">
            <div className="col-lg-3">
              <div className="sidebar sticky-top">
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
                <h2>Customer Satisfaction Comes First</h2>

                <p>
                  At <strong>Your Store Name</strong>, customer satisfaction is
                  our priority. This policy explains the conditions under which
                  returns, refunds and cancellations are accepted.
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

                  {item.eligible && (
                    <>
                      <h5 className="text-success mt-3">Eligible</h5>

                      <ul>
                        {item.eligible.map((x, index) => (
                          <li key={index}>{x}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {item.notEligible && (
                    <>
                      <h5 className="text-danger mt-3">Not Eligible</h5>

                      <ul>
                        {item.notEligible.map((x, index) => (
                          <li key={index}>{x}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {item.ourError && (
                    <>
                      <h5 className="text-success mt-3">Our Error</h5>

                      <ul>
                        {item.ourError.map((x, index) => (
                          <li key={index}>{x}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {item.customer && (
                    <>
                      <h5 className="text-primary mt-3">Customer Initiated</h5>

                      <ul>
                        {item.customer.map((x, index) => (
                          <li key={index}>{x}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {item.note && (
                    <div className="alert alert-warning mt-3">{item.note}</div>
                  )}
                </div>
              ))}

              <div className="policy-card mb-4" data-aos="zoom-in">
                <h3>
                  <i className="bi bi-diagram-3"></i>
                  Return Process
                </h3>

                <div className="timeline">
                  {steps.map((step, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-number">{index + 1}</div>
                      <div>{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="policy-card" data-aos="fade-up">
                <h3>
                  <i className="bi bi-envelope-paper"></i>
                  Contact Us
                </h3>

                <p>
                  <strong>Customer Support</strong>
                </p>

                <p>Email : care@brandel.shop</p>

                <p>
                  Monday – Saturday
                  <br />
                  10:00 AM – 6:00 PM
                </p>

                <p>
                  We aim to respond within
                  <strong> 24–48 business hours.</strong>
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

export default Return;

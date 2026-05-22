import React, { useState } from "react";
import "./form.css";
import { motion } from "framer-motion";
import axios from "axios";

const Form = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  // HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:9000/api/contact/TouchwithUs",
        formData
      );

      alert(res.data.message);

      // RESET FORM
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });
    } catch (error) {
      console.log(error);

      alert("Failed to send mail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="">
        <section className="contact-form-wrapper container">
          {/* LEFT FORM */}
          <motion.div
            className="contact-form"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="title lexend">Get In Touch with Us</h1>

            <form className="form funnel-sans" onSubmit={handleSubmit}>
              <div className="row-form">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="firstName"
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />

                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="lastName"
                  placeholder="Last Name *"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="tel"
                name="phone"
                placeholder="Phone *"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                name="company"
                placeholder="Company Name *"
                value={formData.company}
                onChange={handleChange}
                required
              />

              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                name="message"
                placeholder="Product Information *"
                rows="3"
                value={formData.message}
                onChange={handleChange}
                required
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="button"
              >
                {loading ? "Sending..." : "Submit"}
              </motion.button>
            </form>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            className="contact-image"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img src="./images/contact.jpg" alt="Contact" />
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Form;
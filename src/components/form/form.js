import React from "react";
import "./form.css";
import { motion } from "framer-motion";

const Form = () => {
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
            {/* <p className="subtitle">
              Interested in working together? Fill out some info and Delnaz
              Medora will be in touch shortly.
            </p> */}

            <form className="funnel-sans">
              <div className="row-form">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="First Name *"
                  required
                />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Last Name *"
                  required
                />
              </div>

              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                placeholder="Email *"
                required
              />

              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="tel"
                placeholder="Phone *"
                required
              />
               <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Company Name *"
                  required
                />

              {/* DROPDOWN */}
              {/* <motion.select whileFocus={{ scale: 1.02 }} required>
                <option value="">Select Service *</option>
                <option>Anxiety Therapy</option>
                <option>Depression Therapy</option>
                <option>Couple Therapy</option>
                <option>Child Therapy</option>
                <option>Stress Management</option>
                <option>Trauma Therapy</option>
              </motion.select> */}

              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                placeholder="Product Information *"
                rows="3"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
              >
                Submit
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
            <img src="./images/contact.jpg" alt="Doctor Illustration" />
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Form;

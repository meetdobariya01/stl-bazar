import { useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  Offcanvas,
  Form,
  Button,
  Dropdown,
} from "react-bootstrap";
import {
  HiOutlineHeart,
  HiOutlineMenuAlt3,
  HiOutlineSearch,
  HiOutlineUser,
} from "react-icons/hi";
import { FiHeart, FiShoppingBag, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import "./header.css";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const menu = [
    {
      title: "Brands",
      link: "/product",
    },
    {
      title: "Category",
      dropdown: [
        {
          title: "All Category",
          link: "/category/men",
        },
        {
          title: "Orgenic Food & Healthy Snacks",
          link: "/category/women",
        },
        {
          title: "Natural Skin Care & Wellness",
          link: "/category/accessories",
        },
        {
          title: "Gifts & Hamper",
          link: "/category/shoes",
        },
        {
          title: "Handmade Home Decor",
          link: "/category/shoes",
        },
        {
          title: "Sustainable Lifestyle",
          link: "/category/shoes",
        },
        {
          title: "Jewelry & Accessories",
          link: "/category/shoes",
        },
      ],
    },
    {
      title: "Sell With Us",
      link: "/sell",
    },
    {
      title: "About Us",
      link: "/aboutus",
    },
  ];

  return (
    <>
      <div className="lexend">
        {/* SEARCH OVERLAY */}

        <AnimatePresence>
          {showSearch && (
            <motion.div
              className="search-overlay"
              initial={{ y: -120 }}
              animate={{ y: 0 }}
              exit={{ y: -120 }}
              transition={{ duration: 0.35 }}
            >
              <Container>
                <div className="search-box">
                  <Form.Control placeholder="Search products..." />

                  <button
                    className="close-search"
                    onClick={() => setShowSearch(false)}
                  >
                    <FiX />
                  </button>
                </div>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}

        <Navbar expand="lg" className="premium-navbar" sticky="top">
          <Container>
            {/* Logo */}

            <Navbar.Brand as={NavLink} to="/">
              <img src="/images/native.jpg" alt="" className="logo" />
            </Navbar.Brand>

            {/* Desktop Menu */}

            <Nav className="mx-auto desktop-menu">
              {menu.map((item, index) => (
                <motion.div key={index} whileHover={{ y: -3 }}>
                  {item.dropdown ? (
                    <Dropdown className="premium-dropdown">
                      <Dropdown.Toggle
                        as="div"
                        className="premium-link dropdown-toggle-custom"
                      >
                        {item.title}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {item.dropdown.map((sub, i) => (
                          <Dropdown.Item
                            as={NavLink}
                            to={sub.link}
                            key={i}
                            className="dropdown-item-custom"
                          >
                            {sub.title}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <NavLink to={item.link} className="nav-link premium-link">
                      {item.title}
                    </NavLink>
                  )}
                </motion.div>
              ))}
            </Nav>

            {/* Desktop Icons */}

            <div className="desktop-icons">
              <button onClick={() => setShowSearch(true)}>
                <HiOutlineSearch />
              </button>

              <NavLink to="/login" className="icon-link">
                <button type="button">
                  <HiOutlineUser />
                </button>
              </NavLink>

                <NavLink to="/wishlist" className="icon-link">
                <button type="button">
                  <HiOutlineHeart/>
                </button>
              </NavLink>

              <NavLink to="/cart" className="icon-link">
                <button type="button">
                  <FiShoppingBag />
                </button>
              </NavLink>
            </div>

            {/* Mobile Right */}

            <div className="mobile-right">
              <button onClick={() => setShowSearch(true)}>
                <HiOutlineSearch />
              </button>

              <NavLink to="/login" className="icon-link">
                <button type="button">
                  <HiOutlineUser />
                </button>
              </NavLink>

              <button onClick={() => setShowMenu(true)}>
                <HiOutlineMenuAlt3 />
              </button>
            </div>
          </Container>
        </Navbar>

        {/* MOBILE MENU */}

        <Offcanvas
          show={showMenu}
          placement="end"
          onHide={() => setShowMenu(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <img src="./images/native.jpg" className="mobile-logo" alt="" />
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="flex-column lexend">
              {menu.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                    <>
                      <div className="mobile-link ">{item.title}</div>

                      {item.dropdown.map((sub, i) => (
                        <NavLink
                          key={i}
                          to={sub.link}
                          className="mobile-sublink"
                          onClick={() => setShowMenu(false)}
                        >
                          {sub.title}
                        </NavLink>
                      ))}
                    </>
                  ) : (
                    <NavLink
                      to={item.link}
                      className="mobile-link"
                      onClick={() => setShowMenu(false)}
                    >
                      {item.title}
                    </NavLink>
                  )}
                </div>
              ))}
            </Nav>

            <hr />

            <div className="mobile-bottom-icons lexend">
              <NavLink
                to="/wishlist"
                className="mobile-icon-btn"
                onClick={() => setShowMenu(false)}
              >
                <FiHeart />
                <span>Wishlist</span>
              </NavLink>

              <NavLink
                to="/cart"
                className="mobile-icon-btn"
                onClick={() => setShowMenu(false)}
              >
                <FiShoppingBag />
                <span>Cart</span>
              </NavLink>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </>
  );
};

export default Header;

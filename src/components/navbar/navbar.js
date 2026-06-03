import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./navbar.css";

const Mainnavbar = () => {
  return (
    <div>
      <Navbar className="desktop-navbar lexend" expand="lg">
        <Container fluid>
          <Nav className="mx-auto nav-links">
            <Nav.Link as={NavLink} to="/category/All" className="nav-link">
              Shop by Category
            </Nav.Link>

            <Nav.Link as={NavLink} to="#" className="nav-link">
              New In
            </Nav.Link>

            <Nav.Link as={NavLink} to="/product" className="nav-link">
              Brands
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/category/gifting"
              className="nav-link-main"
            >
              Gifting Guides
            </Nav.Link>

            <Nav.Link as={NavLink} to="#" className="nav-link">
              Editorial
            </Nav.Link>

            <Nav.Link as={NavLink} to="#" className="nav-link">
              Sale
            </Nav.Link>

            <Nav.Link as={NavLink} to="/sell" className="nav-link">
              Sell With Us
            </Nav.Link>

            <Nav.Link as={NavLink} to="/aboutus" className="nav-link">
              About Us
            </Nav.Link>

            <Nav.Link as={NavLink} to="/contactus" className="nav-link">
              Contact Us
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
};

export default Mainnavbar;

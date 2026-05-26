import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import "./navbar.css";

const Mainnavbar = () => {
  return (
    <div>
      <Navbar className="desktop-navbar lexend" expand="lg">
        <Container fluid>
          <Nav className="mx-auto nav-links">
            {/* Added Pages */}
            <Nav.Link href="#" className="nav-link">
              Shop by Category
            </Nav.Link>
            <Nav.Link href="#" className="nav-link">
              New In
            </Nav.Link>
            <Nav.Link href="/product" className="nav-link">
              Brands
            </Nav.Link>
            <Nav.Link href="#" className="nav-link">
              Gifting Guides
            </Nav.Link>
            <Nav.Link href="#" className="nav-link">
              Editorial
            </Nav.Link>
            <Nav.Link href="#" className="nav-link">
              Sale
            </Nav.Link>
            {/* <Nav.Link href="/products" className="nav-link">
              Products
            </Nav.Link> */}
            <Nav.Link href="/sell" className="nav-link">
              Sell With Us
            </Nav.Link>
            <Nav.Link href="/aboutus" className="nav-link">
              About Us
            </Nav.Link>
            <Nav.Link href="/contactus" className="nav-link">
              Contact Us
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
};

export default Mainnavbar;

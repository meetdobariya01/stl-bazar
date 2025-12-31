import React from 'react'
import { Navbar, Nav, Container } from "react-bootstrap";
import "./navbar.css";

const Mainnavbar = () => {
  return (
    <div>
         <Navbar className="desktop-navbar" expand="lg">
      <Container fluid>
        <Nav className="mx-auto nav-links">
         

          {/* Added Pages */}
          <Nav.Link href="/about" className="nav-link">
            About Us
          </Nav.Link>
          <Nav.Link href="/products" className="nav-link">
            Products
          </Nav.Link>
          <Nav.Link href="/contact" className="nav-link">
            Contact Us
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
    </div>
  )
}

export default Mainnavbar
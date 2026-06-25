import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./navbar.css";

const Mainnavbar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("https://api.gourmetbazar.starlighttechlabsindia.com/api/categories");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Categories loaded:", data); // Debug log
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar className="desktop-navbar lexend" expand="lg">
        <Container fluid>
          <Nav className="mx-auto nav-links">
            {/* Category Dropdown */}
            <NavDropdown
              title="Category"
              id="category-dropdown"
              className="nav-link-dropdown"
              as={Nav.Link}
            >
              {loading ? (
                <NavDropdown.Item disabled className="dropdown-item-custom">
                  <span className="dropdown-loading">Loading categories...</span>
                </NavDropdown.Item>
              ) : error ? (
                <NavDropdown.Item disabled className="dropdown-item-custom">
                  <span className="dropdown-error">Failed to load categories</span>
                </NavDropdown.Item>
              ) : categories.length > 0 ? (
                <>
                  <NavDropdown.Item
                    as={NavLink}
                    to="/category/All"
                    className="dropdown-item-custom"
                  >
                    All Categories
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  {categories.map((category) => (
                    <NavDropdown.Item
                      key={category._id}
                      as={NavLink}
                      to={`/category/${encodeURIComponent(category.name)}`}
                      className="dropdown-item-custom"
                      onClick={() => {
                        // Close dropdown on mobile
                        document.body.click();
                      }}
                    >
                      {category.name}
                      {category.productCount !== undefined && category.productCount > 0 && (
                        <span className="product-count">({category.productCount})</span>
                      )}
                    </NavDropdown.Item>
                  ))}
                </>
              ) : (
                <NavDropdown.Item disabled className="dropdown-item-custom">
                  No categories available
                </NavDropdown.Item>
              )}
            </NavDropdown>

            <Nav.Link
              as={NavLink}
              to="/product"
              className="nav-link"
            >
              Brands
            </Nav.Link>

            <Nav.Link as={NavLink} to="#" className="nav-link">
              Editorial
            </Nav.Link>

            <Nav.Link as={NavLink} to="/sell" className="nav-link">
              Sell With Us
            </Nav.Link>

            <Nav.Link as={NavLink} to="/aboutus" className="nav-link">
              About Us
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
};

export default Mainnavbar;
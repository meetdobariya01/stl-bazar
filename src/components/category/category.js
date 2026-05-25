import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./category.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
const BACKEND_URL = "http://localhost:9000";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch categories from backend
      const response = await axios.get(`${API_URL}/all-categories`);
      console.log("Fetched categories:", response.data);
      
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
      } else {
        // Fallback to default categories if none in database
        setCategories(defaultCategories);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
      // Use default categories if API fails
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  // Default categories (fallback if no data in database)
  const defaultCategories = [
    { name: "Dairy Products", image: "/images/Category/dairy-product.png", icon: "FaCheese", productCount: 0 },
    { name: "Cold Drinks", image: "/images/Category/cold-drinks.png", icon: "FaBeer", productCount: 0 },
    { name: "Breakfast", image: "/images/Category/breakfast.png", icon: "FaBreadSlice", productCount: 0 },
    { name: "Bakery & Biscuits", image: "/images/Category/biscuits.png", icon: "FaCookie", productCount: 0 },
    { name: "Snacks", image: "/images/Category/snacks.png", icon: "FaCandyCane", productCount: 0 },
    { name: "Sweets", image: "/images/Category/sweets.png", icon: "FaIceCream", productCount: 0 },
    { name: "Personal Care", image: "/images/Category/personal-care.png", icon: "FaHandSparkles", productCount: 0 },
    { name: "Vegetables", image: "/images/Category/vegetable.png", icon: "FaCarrot", productCount: 0 },
  ];

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return "/images/placeholder-category.jpg";
    
    // If it's a full URL
    if (image.startsWith("http")) {
      return image;
    }
    
    // If it starts with /images (local public folder)
    if (image.startsWith("/images")) {
      return image;
    }
    
    // If it starts with /uploads (backend uploads)
    if (image.startsWith("/uploads")) {
      return `${BACKEND_URL}${image}`;
    }
    
    // Default for local images
    return image;
  };

  // Handle category click
  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <section className="categories-section lexend">
        <Container>
          <div className="section-heading text-start mb-5">
            <span>Popular Categories</span>
            <h2 className="funnel-sans">Shop By Category</h2>
            <p>Explore premium collections for your modern lifestyle.</p>
          </div>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading categories...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="categories-section lexend">
        <Container>
          <div className="section-heading text-start mb-5">
            <span>Popular Categories</span>
            <h2 className="funnel-sans">Shop By Category</h2>
            <p>Explore premium collections for your modern lifestyle.</p>
          </div>
          <div className="text-center py-5 text-danger">
            <p>{error}</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="categories-section lexend">
      <Container>
        {/* Heading */}
        <div className="section-heading text-start mb-5">
          <span>Popular Categories</span>
          <h2 className="funnel-sans">Shop By Category</h2>
          <p>Explore premium collections for your modern lifestyle.</p>
        </div>

        {/* Categories Grid */}
        <Row className="g-4 justify-content-center">
          {categories.map((category, index) => (
            <Col lg={2} md={4} sm={4} xs={3} key={category._id || index} className="d-flex">
              <motion.div
                className="w-100"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card 
                  className="category-card-collection border-0"
                  onClick={() => handleCategoryClick(category.name)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="category-img">
                    <img 
                      src={getImageUrl(category.image)} 
                      alt={category.name} 
                      onError={(e) => {
                        e.target.src = "/images/placeholder-category.jpg";
                      }}
                    />
                    {category.productCount > 0 && (
                      <span className="product-count-badge">
                        {category.productCount} items
                      </span>
                    )}
                  </div>
                </Card>

                {/* Title Outside Image */}
                <div className="category-title text-center">
                  <h4>{category.name}</h4>
                  {category.description && (
                    <p className="category-description">{category.description}</p>
                  )}
                </div>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default CategoriesSection;




// import React, { useEffect, useState } from "react";
// import { Container, Row, Col, Card, Spinner, Button } from "react-bootstrap"; // Add Button here
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./category.css";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";
// const BACKEND_URL = "http://localhost:9000";

// const CategoriesSection = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_URL}/all-categories`);
//       console.log("Fetched categories from database:", response.data);
      
//       setCategories(response.data || []);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching categories:", err);
//       setError("Failed to load categories from database");
//       setCategories([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getImageUrl = (image) => {
//     if (!image) return null;
    
//     if (image.startsWith("http")) {
//       return image;
//     }
    
//     if (image.startsWith("/images")) {
//       return image;
//     }
    
//     if (image.startsWith("/uploads")) {
//       return `${BACKEND_URL}${image}`;
//     }
    
//     return image;
//   };

//   const handleCategoryClick = (categoryName) => {
//     navigate(`/products?category=${encodeURIComponent(categoryName)}`);
//   };

//   if (loading) {
//     return (
//       <section className="categories-section lexend">
//         <Container>
//           <div className="section-heading text-start mb-5">
//             <span>Popular Categories</span>
//             <h2 className="funnel-sans">Shop By Category</h2>
//             <p>Explore premium collections for your modern lifestyle.</p>
//           </div>
//           <div className="text-center py-5">
//             <Spinner animation="border" variant="primary" />
//             <p className="mt-3">Loading categories...</p>
//           </div>
//         </Container>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section className="categories-section lexend">
//         <Container>
//           <div className="section-heading text-start mb-5">
//             <span>Popular Categories</span>
//             <h2 className="funnel-sans">Shop By Category</h2>
//             <p>Explore premium collections for your modern lifestyle.</p>
//           </div>
//           <div className="text-center py-5 text-danger">
//             <p>{error}</p>
//             <Button variant="primary" onClick={fetchCategories} className="mt-3">
//               Try Again
//             </Button>
//           </div>
//         </Container>
//       </section>
//     );
//   }

//   if (categories.length === 0) {
//     return (
//       <section className="categories-section lexend">
//         <Container>
//           <div className="section-heading text-start mb-5">
//             <span>Popular Categories</span>
//             <h2 className="funnel-sans">Shop By Category</h2>
//             <p>Explore premium collections for your modern lifestyle.</p>
//           </div>
//           <div className="text-center py-5">
//             <p>No categories available. Please add categories in the admin panel.</p>
//           </div>
//         </Container>
//       </section>
//     );
//   }

//   return (
//     <section className="categories-section lexend">
//       <Container>
//         <div className="section-heading text-start mb-5">
//           <span>Popular Categories</span>
//           <h2 className="funnel-sans">Shop By Category</h2>
//           <p>Explore premium collections for your modern lifestyle.</p>
//         </div>

//         <Row className="g-4 justify-content-center">
//           {categories.map((category, index) => (
//             <Col lg={2} md={4} sm={4} xs={3} key={category._id || index} className="d-flex">
//               <motion.div
//                 className="w-100"
//                 initial={{ opacity: 0, y: 60 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 viewport={{ once: true }}
//                 whileHover={{ y: -10 }}
//               >
//                 <Card 
//                   className="category-card-collection border-0"
//                   onClick={() => handleCategoryClick(category.name)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <div className="category-img">
//                     {category.image ? (
//                       <img 
//                         src={getImageUrl(category.image)} 
//                         alt={category.name} 
//                         onError={(e) => {
//                           e.target.src = "/images/placeholder-category.jpg";
//                         }}
//                       />
//                     ) : (
//                       <div className="no-image-placeholder">
//                         <span>No Image</span>
//                       </div>
//                     )}
//                     {category.productCount > 0 && (
//                       <span className="product-count-badge">
//                         {category.productCount} items
//                       </span>
//                     )}
//                   </div>
//                 </Card>

//                 <div className="category-title text-center">
//                   <h4>{category.name}</h4>
//                   {category.description && (
//                     <p className="category-description">{category.description.substring(0, 30)}</p>
//                   )}
//                 </div>
//               </motion.div>
//             </Col>
//           ))}
//         </Row>
//       </Container>
//     </section>
//   );
// };

// export default CategoriesSection;
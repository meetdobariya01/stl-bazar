import React from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./home.css";
import Carouselhero from "../../components/carousel/carousel";
import Bestseller from "../../components/bestseller/bestseller";
import Ourbrand from "../../components/ourbrand/ourbrand";
import Shopus from "../../components/shopus/shopus";
import Newlunch from "../../components/newlunch/newlunch";
import Testimonil from "../../components/testimonial/testimonil";
import Category from "../../components/category/category";
import Details from "../../components/details/details";

const Home = () => {
  return (
    <div>
      {/* header */}
      <Header />

      {/* carousel */}
      <Carouselhero />

      {/* best seller */}
      <Bestseller />

      {/* category */}
      <Category />

      {/* Details */}
      <Details />

      {/* our brand */}
      <Ourbrand />

      {/* new lunch */}
      <Newlunch />

      {/* shop with us */}
      <Shopus />
      
      {/* testimonial */}
      <Testimonil />

      {/* footer */}
      <Footer />
    </div>
  );
};

export default Home;

import React from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./home.css";
import Carouselhero from "../../components/carousel/carousel";
import Ourbrand from "../../components/ourbrand/ourbrand";
import Shopus from "../../components/shopus/shopus";
import Testimonil from "../../components/testimonial/testimonil";
import Category from "../../components/category/category";
import Details from "../../components/details/details";
import Explore from "../../components/explore/explore";
import Features from "../../components/features/features";
import Collections from "../collections/collections";
import Arrival from "../../components/new-arrival/arrival";
import Boxes from "../../components/boxes/boxes";
import Bestseller from "../../components/bestseller/bestseller";
import Email from "../../components/email/email";

const Home = () => {
  return (
    <div>
      {/* header */}
      <Header />

      {/* carousel */}
      <Carouselhero />

      {/* features */}
      <Features />

      {/* category */}
      <Category />

      {/* collection */}
      <Collections />

      {/* New Arrivals */}
      <Arrival />

      {/* boxes */}
      <Boxes />

      {/* explore */}
      {/* <Explore /> */}

      {/* Details */}
      <Details />

      {/* best seller */}
      <Bestseller />

      {/* shop with us */}
      <Shopus />

      {/* testimonial */}
      <Testimonil />

      {/* Email subscription */}
      <Email />

      {/* footer */}
      <Footer />
    </div>
  );
};

export default Home;

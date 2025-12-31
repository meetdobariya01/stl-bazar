import React from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./home.css";
import Carouselhero from "../../components/carousel/carousel";
import Mainnavbar from "../../components/navbar/navbar";
import Bestseller from "../../components/bestseller/bestseller";
import Ourbrand from "../../components/ourbrand/ourbrand";
import Shopus from "../../components/shopus/shopus";
import Newlunch from "../../components/newlunch/newlunch";

const Home = () => {
  return (
    <div>
      {/* header */}
      <Header />

      {/* carousel */}
      <Carouselhero />

      {/* best seller */}
      <Bestseller/>

      {/* our brand */}
      <Ourbrand/>

      {/* shop with us */}
      <Shopus/>

      {/* new lunch */}
      <Newlunch/>

      {/* footer */}
      <Footer />
    </div>
  );
};

export default Home;

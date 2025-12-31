import React from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./home.css";
import Carousel from "../../components/carousel/carousel";

const Home = () => {
  return (
    <div>
      {/* header */}
      <Header />

      {/* hero section */}
      <Carousel />      

      {/* footer */}
      <Footer />
    </div>
  );
};

export default Home;

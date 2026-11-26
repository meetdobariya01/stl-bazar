import React from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./home.css";
import NativeHero from "../../components/banner/banner";
import Category from "../../components/category/category";
import CuratedCollections from "../../components/curatedCollections/CuratedCollections";
import Bestseller from "../../components/bestseller/bestseller";
import Features from "../../components/features/features";
import Explore from "../../components/explore/explore";
import Arrival from "../../components/new-arrival/arrival";

const Home = () => {
  return (
    <div>
      {/* header */}
      <Header />

      {/* hero */}
      <NativeHero />

      {/* category */}
      <Category />

      {/* curated collections */}
      <CuratedCollections />

      {/* best seller */}
      <Bestseller />

      {/* New Arrivals */}
      <Arrival />

      {/* explore / trust bar */}
      <Explore />

      {/* story / features */}
      <Features />

      {/* footer */}
      <Footer />
    </div>
  );
};

export default Home;

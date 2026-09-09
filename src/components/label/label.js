import React from "react";
import "./label.css";

const OfferMarquee = () => {
  const offerText = "Final technical testing in progress • Minor glitches may occur • Native91 is going live soon";

  return (
    <div className="offer-marquee">
      <div className="offer-marquee-track">
        <span>{offerText}</span>
        <span>{offerText}</span>
        <span>{offerText}</span>
        <span>{offerText}</span>
      </div>
    </div>
  );
};

export default OfferMarquee;

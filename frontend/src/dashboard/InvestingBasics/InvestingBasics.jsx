import React from "react";
import { FaPiggyBank, FaWallet } from "react-icons/fa";
import "./investingbasics.css";

function InvestingBasics() {
  return (
    <div className="investing-wrapper">
      <h3 className="investing-header">Investing Basics: Get Started</h3>
      
      <div className="investing-cards-container">
        {/* start first card */}
        <div className="investing-card">
          <div className="card-image-placeholder piggy-bg">
            <FaPiggyBank className="placeholder-icon" />
          </div>
          <div className="card-content">
            <h4 className="card-title">Save on Monthly Bills</h4>
            <p className="card-desc">
              Tge liryal oer sios lent anor isaleroj ons inot sot o nuw oy eot aosrlons.
            </p>
          </div>
        </div>

        {/* statrt second card */}
        <div className="investing-card">
          <div className="card-image-placeholder wallet-bg">
            <FaWallet className="placeholder-icon" />
          </div>
          <div className="card-content">
            <h4 className="card-title">Investing Basics</h4>
            <p className="card-desc">
              Ptaer liryal oer sios lent anor isaleroj osha inot sot o nuw oy eot aosrlons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvestingBasics;
import { FaLightbulb } from "react-icons/fa";
import "./saveonbills.css";

function SaveOnBills() {
  return (
    <div className="save-bills-wrapper">
      <div className="save-bills-content">
        <h3 className="save-bills-title">Save on Monthly Bills</h3>
        <p className="save-bills-desc">
          Toge tiate with apen oy roupleaos. Intees tortes ofamses is cost maihed ror gp to 1800 in slenerd.
        </p>
        <button className="save-bills-btn">View Tips</button>
      </div>
      
      <div className="save-bills-icon-container">
        <div className="icon-bubble">
          <FaLightbulb className="glow-icon" />
        </div>
      </div>
    </div>
  );
}

export default SaveOnBills;
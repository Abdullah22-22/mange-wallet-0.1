import {
  FaHome,
  FaListAlt,
  FaUserCircle,
  FaCreditCard,
  FaUniversity,
  FaBullseye,
  FaRobot,
  FaSignOutAlt
} from "react-icons/fa";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import logo from "../../assets/wallet-1.png";
import TrueLayer from "../../pages/ConnectBank/TrueLayer";
import "./sidebar.css";



function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [showBankModal, setShowBankModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <div className="sidebar">
        <div className="logo">
          <img src={logo} alt="logo" width="60" />
        </div>

        <NavLink to="/dashboard" end className="menu-item">
          <FaHome className="icon" />
          <span className="text">Dashboard</span>
        </NavLink>

        <NavLink to="./transactions" className="menu-item">
          <FaListAlt className="icon" />
          <span className="text">Transactions</span>
        </NavLink>

        <NavLink to="./Profile" className="menu-item">
          <FaUserCircle className="icon" />
          <span className="text">Profile</span>
        </NavLink>

        <NavLink to="./card" className="menu-item">
          <FaCreditCard className="icon" />
          <span className="text">Add Card</span>
        </NavLink>

        <div
          className="menu-item"
          onClick={() => setShowBankModal(true)}
          style={{ cursor: "pointer" }}
        >
          <FaUniversity className="icon" />
          <span className="text">Connect Bank</span>
        </div>

        <NavLink to="./USergoals" className="menu-item">
          <FaBullseye className="icon" />
          <span className="text">User Goals</span>
        </NavLink>

        <NavLink to="./ai" className="menu-item">
          <FaRobot className="icon" />
          <span className="text">Chat with AI</span>
        </NavLink>

        <div className="menu-item" onClick={handleLogout} style={{ cursor: "pointer" }}>
          <FaSignOutAlt className="icon" />
          <span className="text">Logout</span>
        </div>
      </div>

      {/* TrueLayer Modal */}
      {showBankModal && (
        <TrueLayer
          autoOpen={true}
          onClose={() => setShowBankModal(false)}
        />
      )}
    </>
  );
}

export default Sidebar;

import logo from "../../assets/profile.png";
import "./topbar.css";

function Topbar({ source, setSource }) {
  return (
    <div className="topbar">
      {/* <input className="search" placeholder="Search..." /> */}

      <div className="toggle-wrapper">
        <span className={source === "local" ? "active" : ""}>
          Local
        </span>

        <label className="switch">
          <input
            type="checkbox"
            checked={source === "truelayer"}
            onChange={() =>
              setSource(prev =>
                prev === "local" ? "truelayer" : "local"
              )
            }
          />
          <span className="slider"></span>
        </label>

        <span className={source === "truelayer" ? "active" : ""}>
          TrueLayer
        </span>
      </div>

      <div className="top-icons">
        {/*         /<FaBell />
        <FaCog /> */}
        <img
          src={logo}
          alt="profile"
          className="avatar"
        />
      </div>
    </div>
  );
}

export default Topbar;

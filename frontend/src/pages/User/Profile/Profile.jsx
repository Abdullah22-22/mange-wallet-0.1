import { useState, useEffect } from "react";
import "./Profile.css";
import EditProfileTab from "./EditProfileTab";
import SecurityTab from "./SecurityTab";
import useAuth from "../../../hooks/useAuth";

function Profile() {
  const { user, getMe, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    getMe().catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="setting-wrapper">
      <div className="settings-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Edit Profile
          </button>

          <button
            className={`tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
        </div>

        {activeTab === "profile" && (
          <EditProfileTab user={user} loading={loading} />
        )}

        {activeTab === "security" && (
          <SecurityTab />
        )}
      </div>
    </div>
  );
}

export default Profile
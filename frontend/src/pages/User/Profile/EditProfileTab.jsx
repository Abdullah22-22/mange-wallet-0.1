import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";

 function EditProfileTab({ user }) {

  const { updateUserByid, loading } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name || "",
      email: user.email || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {

    setError("");
    setMessage("");

    try {
      const data = await updateUserByid(profile);

      setMessage("Profile updated successfully");
    } catch (e) {
      setError(e.message || "Failed to update profile");
    }
  };

  return (
    <div className="profile-section">

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form className="settings-form" onSubmit={(e) => e.preventDefault()}>

        <div className="form-row">
          <div className="input-group">
            <label>Your Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="save-btn-container">
          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            Save Profile
          </button>
        </div>

      </form>
    </div>
  );
}

export default EditProfileTab
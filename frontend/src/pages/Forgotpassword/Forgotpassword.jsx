import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaHome } from "react-icons/fa";
import { resetPassword } from "../../api/api";
import logo from "@/assets/wallet-1.png";
import "../Auth/login-register.css";

function Forgotpassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) return setError("Reset token is missing. Please use the link from your email.");
    if (!newPassword) return setError("Please enter a new password");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    try {
      setLoading(true);
      const res = await resetPassword({ token, newPassword });
      setSuccess(res?.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (e) {
      setError(
        e?.response?.data?.message 
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left mobile-top">
        <Link to="/" className="home-icon">
          <FaHome size={32} />
        </Link>
        <div className="logo-box">
          <Link to="/">
            <img src={logo} alt="logo" />
          </Link>
          <h1>Manage Wallet</h1>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form">
          <div className="mobile-logo">
            <img src={logo} alt="logo" width="120" />
          </div>

          <h2>Reset Password</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="button"
            className="main-login-btn"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p className="signup-text">
            Remember your password? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Forgotpassword;

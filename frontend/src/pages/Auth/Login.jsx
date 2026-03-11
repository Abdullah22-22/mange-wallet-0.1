import "./login-register.css";
import { useNavigate, Link } from "react-router-dom";
import { FaHome, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "@/assets/wallet-1.png";
import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import ForgotPasswordModal from "./ForgotPasswordModal";

function Login() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Please enter your email");
    if (!password) return setError("Please enter your password");

    try {
      await login({
        email: email.trim(),
        password,
      });

      navigate("/dashboard");
    } catch (e) {
      setError(
        e?.response?.data?.message ||
        e?.message ||
        "Login failed"
      );
    }
  };

  return (
    <div className="auth-container">
      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
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

          <h2>Login</h2>

           {(error || authError) && (
            <div className="error-message">
              {error || authError?.response?.data?.message || authError?.message}
            </div>
          )}


          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="button"
            className="main-login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button className="google-btn main-login-btn">
            Continue with Google
          </button>

          <p className="signup-text">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
          <div className="forgot-password">
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
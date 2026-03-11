import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaHome } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import logo from "@/assets/wallet-1.png";
import "./login-register.css";

const Register = () => {
  const { register, login, loading, error: authError } = useAuthContext();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");


    if (!fullName.trim()) return setError("Please enter your full name");
    if (!email.trim()) return setError("Please enter your email");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Invalid email format");
    if (!password) return setError("Please enter a password");
    if (!confirmPassword) return setError("Please confirm your password");
    if (password !== confirmPassword) return setError("Passwords do not match!");

    const payload = {
      name: fullName.trim(),
      email: email.trim(),
      password,
    };

    try {
      await register(payload);
      await login({ email: payload.email, password });
      navigate("/dashboard");
    } catch (e) {
      setError(
        e?.response?.data?.message ||
        e?.message ||
        "Registration failed"
      );
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="logo-box">
          <img src={logo} alt="logo" />
          <h1>Manage Wallet</h1>
        </div>
      </div>

      <div className="auth-right">
        <Link to="/" className="home-icon">
          <FaHome size={28} />
        </Link>

        <div className="auth-form">
          <div className="mobile-logo">
            <img src={logo} alt="logo" />
          </div>

          <h2>Sign Up</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleRegister}>
            {(error || authError) && (
              <div className="error-message">
                {error || authError?.response?.data?.message || authError?.message}
              </div>
            )}

            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
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

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              className="main-login-btn"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p style={{ marginTop: "12px", textAlign: "center" }}>
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
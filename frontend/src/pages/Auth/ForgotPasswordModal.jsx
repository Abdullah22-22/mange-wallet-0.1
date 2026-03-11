import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext"; 

function ForgotPasswordModal({ onClose }) {
  const { forgotPasswordById, resetPasswordById, loading } = useAuthContext();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendEmail = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    try {
      const res = await forgotPasswordById({ email: email.trim() });
      setMessage(res?.message || "Check your email for reset token");

      if (res?.resetToken) setToken(res.resetToken);

      setStep("reset");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to send reset email");
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setMessage("");

    if (!token.trim() || !newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPasswordById({ token: token.trim(), newPassword });
      setMessage("Password reset successfully. Please login.");
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to reset password");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Reset Password</h3>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {step === "email" ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="modal-actions">
              <button
                type="button"
                className="main-login-btn"
                onClick={handleSendEmail}
                disabled={loading}
              >
                Send
              </button>

              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Reset Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="modal-actions">
              <button
                type="button"
                className="main-login-btn"
                onClick={handleResetPassword}
                disabled={loading}
              >
                Reset
              </button>

              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
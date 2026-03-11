import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";


function SecurityTab() {

    const navigate = useNavigate();

    const {
        changePasswordById,
        deleteAccountById,
        logout,
        loading
    } = useAuth();

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleChange = (e) => {

        const { name, value } = e.target;

        setPasswords((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSavePassword = async () => {

        setError("");
        setMessage("");

        const { currentPassword, newPassword, confirmPassword } = passwords;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please fill all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const confirmChange = window.confirm(
            "If you change your password, you will be logged out and must log in again. Continue?"
        );

        if (!confirmChange) return;

        try {

            await changePasswordById({
                currentPassword,
                newPassword,
            });

            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            alert("Password changed successfully. Please login again.");

            await logout();

            navigate("/");

        } catch (e) {
            setError(e.message || "Failed to update password");
        }
    };

    const handleDeleteAccount = async () => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete your account?"
        );

        if (!confirmDelete) return;

        try {

            await deleteAccountById();

            navigate("/");

        } catch (e) {
            setError(e.message || "Failed to delete account");
        }
    };

    return (
        <div className="security-section">

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form className="settings-form" onSubmit={(e) => e.preventDefault()}>

                <div className="form-row">
                    <div className="input-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwords.currentPassword}
                            onChange={handleChange}
                            placeholder="Current Password"
                        />
                    </div>
                </div>

                <div className="form-row">

                    <div className="input-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handleChange}
                            placeholder="New Password"
                        />
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                        />
                    </div>

                </div>

                <div className="save-btn-container">

                    <button
                        type="button"
                        className="save-btn"
                        onClick={handleSavePassword}
                        disabled={loading}
                    >
                        Save Password
                    </button>

                    <button
                        type="button"
                        className="delete-btn"
                        onClick={handleDeleteAccount}
                    >
                        Delete Account
                    </button>

                </div>

            </form>
        </div>
    );
}

export default SecurityTab;
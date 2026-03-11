// this is the controller for user related operations like registration, login, etc.
import User from "../../modules/Auth/userModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AccessToken, RefreshToken } from "../../utils/cookies.js";
import { CreateJsonWebToken } from "../../utils/Jsonwebtoken.js";
import { sendEmail, sendHTMLEmail } from "../../utils/emai.js";


// login user
const login = async (req, res, next) => {
	try {
		const { email, password } = req.body; // if we can change from email and password to username and password and to do that just replace the email to username
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			return res.status(400).json({ message: "Invalid email or password" });
		}
		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		const token = CreateJsonWebToken(
			{ sub: user._id.toString(), authType: "local" },
			process.env.jwt,
			"15m"
		);
		AccessToken(res, token);

		// creating refresh token for user verification
		const refreshToken = CreateJsonWebToken(
			{ sub: user._id.toString(), authType: "local", },
			process.env.jwt,
			"1d"
		);
		RefreshToken(res, refreshToken);

		const userObj = user.toObject();
		delete userObj.password;
		res.status(200).json({ message: "Login successful", user: userObj, token, refreshToken });
	} catch (error) {
		next(error);
	}
};

// register user

const register = async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		const userchecker = await User.findOne({ email });
		if (userchecker) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email, password });

		const userObj = user.toObject();
		delete userObj.password;

		res.status(201).json({ message: "User registered successfully", user: userObj });
	} catch (error) {
		console.log("REGISTER ERROR:", error);

		if (error.name === "ValidationError") {
			const firstError = Object.values(error.errors)[0]?.message;

			return res.status(400).json({
				message: firstError || "Validation failed",
			});
		}
		next(error);

	}
};

// renew access token using refresh token
const renew = async (req, res, next) => {

	try {
		const oldrefreshToken = req.cookies.RefreshToken;
		if (!oldrefreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}
		const decoded = jwt.verify(oldrefreshToken, process.env.jwt);
		// Check if the user still exists
		const user = await User.findById(decoded.sub);
		if (!decoded) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}
		const token = CreateJsonWebToken(
			{ sub: decoded.sub, authType: decoded.authType },
			process.env.jwt,
			"15m"
		);

		AccessToken(res, token);

		const userObj = user.toObject();
		delete userObj.password;

		res.status(200).json({ message: "Access token renewed successfully", token, user: userObj });
	} catch (error) {
		next(error);
	}
};

// Delete own account
const deleteUser = async (req, res) => {

	const user_id = req.userId || req.user?._id || req.user?.id;
	try {
		const user = await User.findById(user_id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		await user.deleteOne();
		res.status(200).json({
			message: "Account deleted"
		});
	} catch (e) {
		res.status(500).json({ message: "Server error" });
	}
};

const editUserAccount = async (req, res) => {

	const { name, email } = req.body;
	const user_id = req.userId || req.user?._id || req.user?.id;

	try {
		if (!user_id) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const user = await User.findById(user_id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (name !== undefined) {
			user.name = name.trim();
		}

		if (email !== undefined) {
			const normalizedEmail = email.toLowerCase().trim();

			const userExists = await User.findOne({ email, normalizedEmail });
			if (userExists && userExists._id.toString() !== user_id.toString()) {
				return res.status(400).json({ message: "Email already in use" });
			}
			user.email = normalizedEmail;
		}
		await user.save();
		return res.status(200).json({
			message: "Account updated",
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (e) {
		console.error("Error in updateUser():", e);
		return res.status(500).json({ message: "Internal server error" });
	}
};

const getUser = async (req, res) => {
	const user_id = req.userId

	if (!user_id) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	try {
		const user = await User.findById(user_id).select("-password");
		return res.status(200).json({
			message: "User info fetched",
			user
		});
	} catch (e) {
		console.error("Something went wrong in getUser():", e);
		return res.status(500).json({ error: e });
	}
};


const changePassword = async (req, res, next) => {
	try {
		const user_id = req.userId || req.user?._id || req.user?.id;
		const { currentPassword, newPassword } = req.body;

		const user = await User.findById(user_id).select("+password");
		if (!user) return res.status(404).json({ message: "User not found" });

		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

		user.password = newPassword;
		await user.save();

		return res.status(200).json({ message: "Password changed successfully" });
	} catch (err) {
		next(err);
	}
};

const forgotPassword = async (req, res, next) => {
	try{
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: "User not found" });
		const resetToken = crypto.randomBytes(20).toString("hex");
		const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
		user.resetPasswordToken = hashedToken;
		user.resetPasswordExpires = Date.now() + 3600000;
		await user.save();

		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
		await sendHTMLEmail(user.email, "Reset Your Password - Mange Wallet", `
			<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
				<h2 style="color: #111827; margin-bottom: 8px;">Password Reset</h2>
				<p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
					Hi ${user.name},<br><br>
					We received a request to reset your password. Click the button below to choose a new one.
				</p>
				<a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
					Reset Password
				</a>
				<p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
					This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
				</p>
				<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
				<p style="color: #9ca3af; font-size: 12px;">
					If the button doesn't work, copy and paste this link:<br>
					<a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
				</p>
			</div>
		`);
		return res.status(200).json({ message: "Password reset email sent" });
	}
	catch (err) {
		next(err);
	}


};



const resetPassword = async (req, res, next) => {
	try {
		const { token, newPassword } = req.body;

		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		const user = await User.findOne({
			resetPasswordToken: hashedToken,
			resetPasswordExpires: { $gt: new Date() },
		}).select("+resetPasswordToken +resetPasswordExpires");

		if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

		user.password = newPassword;
		user.resetPasswordToken = null;
		user.resetPasswordExpires = null;

		await user.save();

		return res.status(200).json({ message: "Password reset successfully" });
	} catch (err) {
		next(err);
	}
};


const logout = async (req, res, next) => {
	try {
		res.clearCookie("AccessToken", {
			httpOnly: true,
			sameSite: "lax"
		});

		res.clearCookie("RefreshToken", {
			httpOnly: true,
			sameSite: "lax"
		});

		return res.status(200).json({
			message: "Logged out successfully"
		});
	} catch (err) {
		next(err);
	}
};

export {
	login,
	register,
	renew,
	deleteUser,
	editUserAccount,
	getUser,
	resetPassword,
	changePassword,
	forgotPassword,
	logout
}
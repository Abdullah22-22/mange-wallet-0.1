// this is the user router and it shall handle everything related to the user like login and register and so on

import { Router } from 'express';
import { UserLogin, UserReg } from '../../utils/valid.js';
import {
	login,
	register,
	renew,
	editUserAccount,
	deleteUser,
	getUser,
  changePassword,
  forgotPassword,
  resetPassword,
  logout 
} from '../../controllers/Auth/UserController.js';
import {
	ChangePasswordValid,
	ForgotPasswordValid,
	ResetPasswordValid
} from "../../utils/valid.js"
import { validate } from "../../Middleware/validate.js";
import { protect } from "../../Middleware/authe.js";

const userRouter = Router();


userRouter.post('/login', UserLogin, validate, login);
userRouter.post('/register', UserReg, validate, register);
userRouter.get('/renew', renew);
// Delete own account
userRouter.delete("/delete", protect, deleteUser);
// Update username or email
userRouter.put("/update", protect, editUserAccount);
// Get user info
userRouter.get("/me", protect, getUser);

userRouter.put("/change-password", protect, ChangePasswordValid, validate, changePassword);
userRouter.post("/forgot-password", ForgotPasswordValid, validate, forgotPassword);
userRouter.post("/reset-password", ResetPasswordValid, validate, resetPassword);

userRouter.post("/logout", protect, logout);


export default userRouter;

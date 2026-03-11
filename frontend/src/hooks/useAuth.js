import { useState } from "react";
import {
  registerUser,
  loginUser,
  renewToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getUser,
  updateUser,
  deleteAccount,
  logoutUser
} from "../api/api";


export default function useAuth() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  /*
    ======================================
    Register User
    ======================================
  */
  async function register(payload) {
    try {
      setLoading(true);
      setError(null);

      const data = await registerUser(payload);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  /*
    ======================================
    Login User
    ======================================
  */
  async function login(payload) {
    try {
      setLoading(true);
      setError(null);

      const data = await loginUser(payload);

      setUser(data.user || null);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  /*
    ======================================
    Renew Access Token
    ======================================
  */
  async function renew() {
    try {
      setLoading(true);
      setError(null);

      const data = await renewToken();
      setUser(data.user || null);

      return data;
    } catch (e) {
      setUser(null);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

    /*
    ======================================
    logout User
    ======================================
  */
 async function logout() {
  try {
    setLoading(true);
    setError(null);

    const data = await logoutUser();
    setUser(null);
    return data;
  } catch (e) {
    setError(e);
    throw e;
  } finally {
    setLoading(false);
  }
}

  /*
   ======================================
   Get Current User
   ======================================
 */
  async function getMe() {
    try {
      setLoading(true);
      setError(null);
      const data = await getUser();
      setUser(data.user || null);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  /*
    ======================================
    Update User
    ======================================
  */
  async function updateUserByid(payload) {
    try {
      setLoading(true);
      setError(null);
      const data = await updateUser(payload);
      setUser((prev) => ({
        ...prev,
        ...data.user,
      }));
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false)
    }
  }
  /*
   ======================================
   Delete Account
   ======================================
 */
  async function deleteAccountById() {
    try {
      setLoading(true);
      setError(null);
      const data = await deleteAccount();
      setUser(null);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }
  /*
    ======================================
    Change Password (Logged In)
    ======================================
  */
  async function changePasswordById(payload) {
    try {
      setLoading(true);
      setError(null);
      const data = await changePassword(payload);
      return data
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  /*
  ======================================
  Forgot Password
  ======================================
*/
  async function forgotPasswordById(payload) {
    try {
      setLoading(true);
      setError(null);

      const data = await forgotPassword(payload);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  /*
  ======================================
  Reset Password
  ======================================
*/
  async function resetPasswordById(payload) {
    try {
      setLoading(true);
      setError(null);

      const data = await resetPassword(payload);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    loading,
    error,
    register,
    login,
    renew,
    getMe,
    updateUserByid,
    deleteAccountById,
    changePasswordById,
    forgotPasswordById,
    resetPasswordById,
    logout
  };
}

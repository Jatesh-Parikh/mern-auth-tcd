import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";

const UserContext = React.createContext();

// setting axios to include credentials (cookies and HTTP authentication information) with every request
axios.defaults.withCredentials = true;

export const UserContextProvider = ({ children }) => {
  const serverUrl = "http://localhost:8000";

  const router = useRouter();

  const [user, setUser] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [userState, setUserState] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const registerUser = async (e) => {
    e.preventDefault();

    if (
      !userState.email.includes("@") ||
      !userState.password ||
      userState.password.length < 6
    ) {
      toast.error("Please enter a valid email and password (min 6 characters)");
      return;
    }

    try {
      const res = await axios.post(`${serverUrl}/api/v1/register`, userState);
      console.log("User registered successfully", res.data);
      toast.success("User registered successfully");

      setUserState({
        name: "",
        email: "",
        password: "",
      });

      router.push("/");
    } catch (error) {
      console.log("Error registering user", error);
      toast.error(error.response.data.message);
    }
  };

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/login`,
        {
          email: userState.email,
          password: userState.password,
        },
        {
          withCredentials: true, // this is to send the cookies to the server
        }
      );

      toast.success("User logged in successfully!");

      setUserState({
        email: "",
        password: "",
      });

      await getUser(); // refreshing the user details before redirecting
      router.push("/");
    } catch (error) {
      console.log("Error logging in user", error);
      toast.error(error.response.data.message);
    }
  };

  const userLoginStatus = async () => {
    setLoading(true);
    let loggedIn = false;

    try {
      const res = await axios.get(`${serverUrl}/api/v1/login-status`, {
        withCredentials: true,
      });

      loggedIn = !!res.data; // coerce string to boolean
      setLoading(false);

      if (!loggedIn) {
        router.push("/login");
      }
    } catch (error) {
      console.log("Error getting user login status", error);
      setLoading(false);
    }

    return loggedIn;
  };

  const logoutUser = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/logout`, {
        withCredentials: true,
      });

      toast.success("User logged out successfully!");
      router.push("/login");
    } catch (error) {
      console.log("Error logging out user", error);
      toast.error(error.response.data.message);
    }
  };

  const getUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/v1/user`, {
        withCredentials: true,
      });

      setUser((prevState) => {
        return {
          ...prevState,
          ...res.data,
        };
      });

      setLoading(false);
    } catch (error) {
      console.log("Error getting user details", error);
      setLoading(false);
      toast.error(error.response.data.message);
    }
  };

  const updateUser = async (e, data) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.patch(`${serverUrl}/api/v1/user`, data, {
        withCredentials: true,
      });

      setUserState((prevState) => {
        return {
          ...prevState,
          ...res.data,
        };
      });

      toast.success("User updated successfully!");
      setLoading(false);
    } catch (error) {
      console.log("Error updating user details", error);
      setLoading(false);
      toast.error(error.response.data.message);
    }
  };

  const emailVerification = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/v1/verify-email`, {
        withCredentials: true,
      });

      toast.success("Email verification sent successfully!");
      setLoading(false);
    } catch (error) {
      console.log("Error sending email verification", error);
      setLoading(false);
      toast.error(error.response.data.message);
    }
  };

  const verifyUser = async (token) => {
    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/v1/verify-user/${token}`, {
        withCredentials: true,
      });

      toast.success("User verified successfully!");

      await getUser(); // refresh the user details

      setLoading(false);

      router.push("/");
    } catch (error) {
      console.log("Error verifying user", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  const forgotPasswordEmail = async (email) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/forgot-password`,
        {
          email,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Forgot password email sent successfully!");
      setLoading(false);
    } catch (error) {
      console.log("Error sending forgot password email", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/reset-password/${token}`,
        { password },
        { withCredentials: true }
      );

      toast.success("Password reset successfully!");
      setLoading(false);

      router.push("/login");
    } catch (error) {
      console.log("Error resetting password", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `${serverUrl}/api/v1/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );

      toast.success("Password changed successfully!");
      setLoading(false);
    } catch (error) {
      console.log("Error changing password", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  // admin routes
  const getAllUsers = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${serverUrl}/api/v1/admin/users`, {
        withCredentials: true,
      });

      setAllUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.log("Error getting all users", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);

    try {
      const res = await axios.delete(`${serverUrl}/api/v1/admin/users/${id}`, {
        withCredentials: true,
      });

      toast.success("User deleted successfully!");
      setLoading(false);

      await getAllUsers();
    } catch (error) {
      console.log("Error deleting user", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  // dynamic form handler
  const handleUserInput = (name) => (e) => {
    const value = e.target.value;

    setUserState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    const loginStatusGetUser = async () => {
      const isLoggedIn = await userLoginStatus();

      if (isLoggedIn) {
        await getUser();
      }
    };
    loginStatusGetUser();
  }, []);

  useEffect(() => {
    const isUserAdmin = async () => {
      if (user.role === "admin") {
        await getAllUsers();
      }
    };

    isUserAdmin();
  }, [user.role]);

  return (
    <UserContext.Provider
      value={{
        registerUser,
        userState,
        handleUserInput,
        loginUser,
        logoutUser,
        userLoginStatus,
        user,
        updateUser,
        emailVerification,
        verifyUser,
        forgotPasswordEmail,
        resetPassword,
        changePassword,
        allUsers,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};

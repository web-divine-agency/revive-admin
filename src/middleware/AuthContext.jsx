import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { getCookie } from "@/middleware/getCookie";

import axiosInstance from "@/services/axiosInstance.js";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie("accessToken");

    if (token) {
      axiosInstance
        .get("/users")
        .then((response) => {
          setUser(response.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setIsAuthenticated(false);
          showSessionExpiredPopup();
        });
    }
  }, []);

  const showSessionExpiredPopup = () => {
    Swal.fire({
      title: "Session Expired",
      text: "Your session token has expired. Please login again.",
      icon: "warning",
      timer: 5000, // Wait for 5 seconds before redirecting
      showConfirmButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      logout(); // Redirect to login after the popup
    });
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function

  const logout = async () => {
    try {
      document.cookie = "accessToken=; Max-Age=0; Path=/;";
      document.cookie = "refreshToken=; Max-Age=0; Path=/;";
      document.cookie = "role_name=; Max-Age=0; Path=/;";

      setUser(null);
      setIsAuthenticated(false);
      console.log("Logged Out");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

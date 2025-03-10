import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null); // Named export

const AuthProvider = ({ children }) => {
  // This is the provider component
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  // Function to refresh token
  const refreshAccessToken = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to refresh token");

      setToken(data.accessToken);
      localStorage.setItem("token", data.accessToken);
    } catch (error) {
      logout();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (token) refreshAccessToken();
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(interval);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider }; // ✅ Named export
export default AuthProvider; // ✅ Default export

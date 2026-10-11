import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCustomer = async () => {
    try {
      const response = await api.get("/customers/me");
      setCustomer(response.data);
    } catch (error) {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, []);

  const logout = async () => {
    try {
      await api.post("/customers/logout");
    } finally {
      setCustomer(null);
    }
  };

  return (
    <AuthContext.Provider value={{ customer, setCustomer, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

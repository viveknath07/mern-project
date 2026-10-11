import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { customer, loading } = useAuth();

  if (loading) {
    return <div className="page center">Loading...</div>;
  }

  if (!customer) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

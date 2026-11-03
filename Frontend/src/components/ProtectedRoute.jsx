import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole, loginPath = '/login' }) => {
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
  }

  // User is not logged in
  if (!token) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/account" replace />;
  }

  // User is logged in
  return children;
};

export default ProtectedRoute;
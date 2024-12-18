import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ element }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/signin" />;
  }

  return element;
};

export default ProtectedRoutes;

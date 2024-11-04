import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, user, allowedRoles, ...rest }) => {
  return allowedRoles.includes(user.role) ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/not-authorized" />
  );
};

export default ProtectedRoute;

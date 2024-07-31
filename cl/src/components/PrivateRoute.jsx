// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { UseAuth } from '../store/auth';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = UseAuth();

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;

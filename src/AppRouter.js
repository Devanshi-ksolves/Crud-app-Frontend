import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginForm from "./Components/Login";
import SignupForm from "./Components/signUp";
import ForgotPasswordForm from "./Components/ForgotPasswordForm";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;

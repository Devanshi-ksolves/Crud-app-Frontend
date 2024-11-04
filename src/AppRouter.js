import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./Components/Login";
import ForgetPassword from "./Components/ForgotPasswordForm";
import SignUp from "./Components/signUp";
import AdminDashboard from "./Components/AdminDashboard";
import UserDashboard from "./Components/UserDashboard";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;

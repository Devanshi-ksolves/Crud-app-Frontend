import React, { useState } from "react";
import LoginForm from "./Login";
import SignupForm from "./signUp";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>
          {isLogin ? "Login to perform CRUD operations" : "Create an account"}
        </h2>
        {isLogin ? <LoginForm /> : <SignupForm />}
        <button className="switch-button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;

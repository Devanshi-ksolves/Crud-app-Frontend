import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Messages } from "../utils/Messages";
import { login } from "../api/api";

const LoginForm = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(Messages.login.invalidCredentials)
        .required(Messages.login.required),
      password: Yup.string().required(Messages.login.required),
    }),
    onSubmit: async (values) => {
      try {
        const response = await login(values);

        localStorage.setItem("token", response.token);

        if (response.role === "admin") {
          navigate("/admin-dashboard");
        } else if (response.role === "super_admin") {
          navigate("/super-admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }

        alert("Login successful!");
      } catch (error) {
        console.error("Login error", error);
        alert("Login failed: " + error.message);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="auth-form">
      <h2 className="auth-title">Login</h2>
      <input
        type="email"
        placeholder="Email"
        {...formik.getFieldProps("email")}
        className="auth-input"
      />
      {formik.touched.email && formik.errors.email ? (
        <div className="error">{formik.errors.email}</div>
      ) : null}

      <input
        type="password"
        placeholder="Password"
        {...formik.getFieldProps("password")}
        className="auth-input"
      />
      {formik.touched.password && formik.errors.password ? (
        <div className="error">{formik.errors.password}</div>
      ) : null}

      <button type="submit" className="auth-button">
        Login
      </button>

      <button
        type="button"
        className="switch-button"
        onClick={() => navigate("/forget-password")}
      >
        Forgot Password?
      </button>

      <button
        type="button"
        className="switch-button"
        onClick={() => navigate("/sign-up")}
      >
        Don't have an account? Sign Up
      </button>
    </form>
  );
};

export default LoginForm;

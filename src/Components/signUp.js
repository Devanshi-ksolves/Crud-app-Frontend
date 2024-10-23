import React from "react";
import { useFormik } from "formik";
import { signup } from "../api/api";
import { signupValidationSchema } from "../utils/ValidationSchema";

const SignupForm = () => {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupValidationSchema,

    onSubmit: async (values) => {
      try {
        const response = await signup(values);
        localStorage.setItem("token", response.token);
        alert("Signup successful!");
      } catch (error) {
        console.error("Signup error", error);
        alert("Signup failed: " + error.message);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="auth-form">
      <h2 className="auth-title">Sign Up</h2>
      <input
        type="text"
        placeholder="Name"
        {...formik.getFieldProps("name")}
        className="auth-input"
      />
      {formik.touched.name && formik.errors.name ? (
        <div className="error">{formik.errors.name}</div>
      ) : null}

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

      <input
        type="password"
        placeholder="Confirm Password"
        {...formik.getFieldProps("confirmPassword")}
        className="auth-input"
      />
      {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
        <div className="error">{formik.errors.confirmPassword}</div>
      ) : null}

      <button type="submit" className="auth-button">
        Sign Up
      </button>
      <button
        className="switch-button"
        onClick={() => alert("Switch to Login")}
      >
        Already have an account? Login
      </button>
    </form>
  );
};

export default SignupForm;

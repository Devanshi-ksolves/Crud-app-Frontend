import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Messages } from "../utils/Messages";
import { login } from "../api/api";

const LoginForm = () => {
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
        localStorage.setItem("token", response.token); // Store token
        // Handle successful login (e.g., redirect to dashboard)
        alert("Login successful!");
      } catch (error) {
        console.error("Login error", error);
        alert("Login failed: " + error.message);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        {...formik.getFieldProps("email")}
      />
      {formik.touched.email && formik.errors.email ? (
        <div>{formik.errors.email}</div>
      ) : null}

      <input
        type="password"
        placeholder="Password"
        {...formik.getFieldProps("password")}
      />
      {formik.touched.password && formik.errors.password ? (
        <div>{formik.errors.password}</div>
      ) : null}

      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;

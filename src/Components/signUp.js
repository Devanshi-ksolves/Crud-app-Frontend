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
    <form onSubmit={formik.handleSubmit}>
      <input type="text" placeholder="Name" {...formik.getFieldProps("name")} />
      {formik.touched.name && formik.errors.name ? (
        <div className="error">{formik.errors.name}</div>
      ) : null}

      <input
        type="email"
        placeholder="Email"
        {...formik.getFieldProps("email")}
      />
      {formik.touched.email && formik.errors.email ? (
        <div className="error">{formik.errors.email}</div>
      ) : null}

      <input
        type="password"
        placeholder="Password"
        {...formik.getFieldProps("password")}
      />
      {formik.touched.password && formik.errors.password ? (
        <div className="error">{formik.errors.password}</div>
      ) : null}

      <input
        type="password"
        placeholder="Confirm Password"
        {...formik.getFieldProps("confirmPassword")}
      />
      {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
        <div className="error">{formik.errors.confirmPassword}</div>
      ) : null}

      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignupForm;

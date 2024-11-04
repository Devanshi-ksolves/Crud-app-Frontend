import React, { useState } from "react";
import { requestOtp, validateOtp, resetPassword } from "../api/api";
import { Messages } from "../utils/Messages";
import * as Yup from "yup";
import { useFormik } from "formik";

const passwordValidationSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, Messages.signup.password.tooShort)
    .matches(/[A-Z]/, Messages.signup.password.uppercase)
    .matches(/[0-9]/, Messages.signup.password.digit)
    .matches(/[!@#$%^&*]/, Messages.signup.password.special)
    .required(Messages.signup.required),
  confirmPassword: Yup.string()
    .required(Messages.signup.confirmPassword.required)
    .oneOf(
      [Yup.ref("newPassword"), null],
      Messages.signup.confirmPassword.mismatch
    ),
});

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValidated, setOtpValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await requestOtp(email);
      setToken(response.token);
      setOtpSent(true);
      setSuccessMessage("OTP sent to your email!");
    } catch (error) {
      setErrorMessage("Failed to send OTP: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await validateOtp(email, otp, token);

      console.log("Response from OTP validation:", response);

      if (response.message && response.message.includes("Successful")) {
        setOtpValidated(true);
        setSuccessMessage("OTP validated! Now enter your new password.");
      } else {
        setErrorMessage(
          "Invalid OTP: " + (response.message || "No message received")
        );
      }
    } catch (error) {
      setErrorMessage("Error validating OTP: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        await resetPassword(email, token, values.newPassword);
        setSuccessMessage(Messages.reset.success);
      } catch (error) {
        setErrorMessage(Messages.reset.error + error.message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="reset-password-container">
      <h2>Forget Password</h2>

      {!otpSent ? (
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
          {errorMessage && <div className="error">{errorMessage}</div>}
          {successMessage && <div className="success">{successMessage}</div>}
        </form>
      ) : !otpValidated ? (
        <form onSubmit={handleValidateOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="otp-button" disabled={isLoading}>
            {isLoading ? "Validating..." : "Validate OTP"}
          </button>
          <button
            type="button"
            className="resend-button"
            onClick={handleSendOtp}
            disabled={isLoading}
          >
            Resend OTP
          </button>
          {errorMessage && <div className="error">{errorMessage}</div>}
          {successMessage && <div className="success">{successMessage}</div>}
        </form>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <input
            type="email"
            placeholder="Re-enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            {...formik.getFieldProps("newPassword")}
            required
          />
          {formik.touched.newPassword && formik.errors.newPassword ? (
            <div className="error">{formik.errors.newPassword}</div>
          ) : null}

          <input
            type="password"
            placeholder="Confirm new password"
            {...formik.getFieldProps("confirmPassword")}
            required
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <div className="error">{formik.errors.confirmPassword}</div>
          ) : null}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
          {errorMessage && <div className="error">{errorMessage}</div>}
          {successMessage && <div className="success">{successMessage}</div>}
        </form>
      )}
    </div>
  );
};

export default ForgetPassword;

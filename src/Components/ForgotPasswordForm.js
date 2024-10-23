import React, { useState } from "react";
import { requestOtp, resetPassword } from "../api/api"; 
import { Messages } from "../utils/Messages";


const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await requestOtp(email);
      setOtpSent(true);
      setSuccessMessage("OTP sent to your email!");
    } catch (error) {
      setErrorMessage("Failed to send OTP: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await resetPassword(email, otp, newPassword);
      setSuccessMessage(Messages.reset.success); 
    } catch (error) {
      setErrorMessage(Messages.reset.error + error.message); 
    } finally {
      setIsLoading(false);
    }
  };

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
      ) : (
        <form onSubmit={handleResetPassword}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
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

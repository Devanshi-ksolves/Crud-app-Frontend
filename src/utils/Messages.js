export const Messages = {
  signup: {
    required: "This field is required.",
    invalidEmail: "Please enter a valid email address.",
    password: {
      required: "Password is required.",
      tooShort: "Password must be at least 8 characters.",
      uppercase: "Password must contain at least one capital letter.",
      digit: "Password must contain at least one digit.",
      special: "Password must contain one special character (e.g., !@#$%^&*).",
    },
    confirmPassword: {
      required: "Confirm password is required.",
      mismatch: "Passwords must match.",
    },
  },
  login: {
    required: "Email and password are required.",
    invalidCredentials: "Invalid email or password.",
  },
  reset: {
    success: "Password reset successful!",
    error: "Error Reseting Password !",
  },
  update: {
    success: "Updated Succcessfully",
  },
};

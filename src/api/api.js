const API_BASE_URL = "http://localhost:3000/api/users"; // Update to include the base path

export const fetchAPI = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.message || "Network response was not ok");
  }

  return response.json();
};

export const signup = async (userData) => {
  return fetchAPI("/register", "POST", userData);
};

export const login = async (credentials) => {
  return fetchAPI("/login", "POST", credentials);
};

// Fetch user details
export const getUser = async (id) => {
  return fetchAPI(`/${id}`, "GET");
};

// Update user details
export const updateUser = async (id, userData) => {
  return fetchAPI(`/${id}`, "PUT", userData);
};

// Delete user
export const deleteUser = async (id) => {
  return fetchAPI(`/${id}`, "DELETE");
};

// Request OTP for forgot password
export const requestOtp = async (email) => {
  return fetchAPI("/forgot-password", "POST", { email });
};

// Validate OTP and reset password
export const resetPassword = async (email, otp, newPassword) => {
  return fetchAPI("/validate-otp", "POST", {
    email,
    otp,
    newPassword,
  });
};

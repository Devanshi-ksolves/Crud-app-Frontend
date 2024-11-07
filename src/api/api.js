const API_BASE_URL = "http://localhost:3000/api/users";

export const fetchAPI = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Only include body if method is not GET
    body: method !== "GET" ? JSON.stringify(body) : null,
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

export const getUsers = async ({ page = 1, pageSize = 10, search = "" }) => {
  return fetchAPI(
    `/?page=${page}&pageSize=${pageSize}&search=${search}`,
    "GET"
  );
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
export const validateOtp = async (email, otp, token) => {
  const response = await fetchAPI("/validate-otp", "POST", {
    email,
    otp,
    token,
  });
  return response;
};

export const resetPassword = async (email, newPassword) => {
  const response = fetchAPI("/reset-password", "POST", {
    email,
    newPassword,
  });
  return response;
};

export const getUserIdByEmail = async (email, authToken) => {
  return fetchAPI(`/users?email=${email}`, "GET", {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

export const getUser = async (userId) => {
  const user = await fetchAPI(`/${userId}`, "GET");
  return user; // Ensure this returns the entire user object including new fields
};

export const impersonateUser = async (userId) => {
  return fetchAPI(`/impersonate/${userId}`, "POST", { userId });
};

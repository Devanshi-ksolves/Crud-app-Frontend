import { jwtDecode } from "jwt-decode";

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
  const response = await fetchAPI("/login", "POST", credentials);

  const { token } = response;

  if (token) {
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id;

    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
  }

  return response;
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

// Updated uploadFiles function
export const uploadFiles = async (userId, filesData) => {
  const formData = new FormData();
  if (filesData.profilePicture) {
    formData.append("profilePicture", filesData.profilePicture);
  }
  if (filesData.document) {
    formData.append("document", filesData.document);
  }

  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/upload-files`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.message || "Network response was not ok");
  }

  return response.json();
};

export const requestDocuments = async (userId, documentTypes) => {
  return fetchAPI("/request-document", "POST", { userId, documentTypes });
};

export const viewDocuments = async (userId) => {
  return fetchAPI(`/view-documents/${userId}`, "GET");
};

export const acceptRejectDocument = async (documentId, status, reason) => {
  return fetchAPI("/accept-reject-document", "POST", {
    documentId,
    status,
    reason,
  });
};

export const uploadDocumentImages = async (formData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authorization token is missing.");
  }

  const response = await fetch(`${API_BASE_URL}/upload-document`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.message || "Error uploading documents");
  }

  return response.json();
};

export const getUsersList = async (page = 1, pageSize = 10) => {
  return fetchAPI(`/users?page=${page}&pageSize=${pageSize}`, "GET");
};
export const getRequestedDocuments = async (userId) => {
  return fetchAPI(`/requested-documents/${userId}`, "GET");
};

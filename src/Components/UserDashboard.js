import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getUser, updateUser } from "../api/api";
import { Messages } from "../utils/Messages";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", password: "" });

  useEffect(() => {
    const fetchUserInfo = async () => {
      const params = new URLSearchParams(window.location.search);
      const impersonateId = params.get("impersonate");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrorMessage("No token found, please log in.");
          return navigate("/login");
        }

        const decodedToken = jwtDecode(token);
        const userId = impersonateId || decodedToken.id;

        const userInfo = await getUser(userId); 
        setFormData({ name: userInfo.name, password: "" });
      } catch (error) {
        setErrorMessage(
          error.response
            ? error.response.data
            : "Failed to fetch user info: " + error.message
        );
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setIsResetPassword(false);
    setFormData({ name: user.name, password: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleResetPasswordClick = () => {
    setIsResetPassword(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const updateData = { name: formData.name };
    if (isResetPassword && formData.password) {
      updateData.password = formData.password;
    }

    try {
      await updateUser(user.id, updateData);
      setSuccessMessage("User details updated successfully!");
      setUser({ ...user, name: formData.name });
      setIsEditing(false);
      setIsResetPassword(false);
    } catch (error) {
      setErrorMessage("Failed to update user details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="content">
      <div className="user-dashboard">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
        <h2>User Dashboard</h2>
        <div className="user-info">
          <p>
            <strong>Name:</strong>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            ) : (
              <span>{user.name}</span>
            )}
          </p>
          <p>
            <strong>Email:</strong>
            <input type="text" value={user.email} disabled />
          </p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            {isResetPassword ? (
              <input
                type="password"
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
              />
            ) : (
              <button type="button" onClick={handleResetPasswordClick}>
                Reset Password
              </button>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
            <button type="button" onClick={handleCancelClick}>
              Cancel
            </button>
          </form>
        ) : (
          <button onClick={handleEditClick}>Edit Profile</button>
        )}

        {errorMessage && (
          <div className="message error">
            {Messages.login.invalidCredentials}
          </div>
        )}
        {successMessage && (
          <div className="message success">{Messages.update.success}</div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

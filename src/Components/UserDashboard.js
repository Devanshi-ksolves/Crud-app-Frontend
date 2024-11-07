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
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    profilePicture: null,
    document: null,
  });

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
        setUser(userInfo);
        setFormData({
          name: userInfo.name,
          password: "",
          profilePicture: null,
          document: null,
        });
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
    setFormData({
      name: user.name,
      password: "",
      profilePicture: null,
      document: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
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

    const updateData = new FormData();
    updateData.append("name", formData.name);
    if (isResetPassword && formData.password) {
      updateData.append("password", formData.password);
    }
    if (formData.profilePicture) {
      updateData.append("profilePicture", formData.profilePicture);
    }
    if (formData.document) {
      updateData.append("document", formData.document);
    }

    try {
      await updateUser(user.id, updateData);
      setSuccessMessage("User details updated successfully!");
      setUser((prevUser) => ({ ...prevUser, name: formData.name }));
      setIsEditing(false);
      setIsResetPassword(false);
      setFormData({
        name: formData.name,
        password: "",
        profilePicture: null,
        document: null,
      });
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
          <p>
            <strong>Profile Picture:</strong>
            {user.profilePicture && !isEditing ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                style={{ width: 100, height: 100 }}
              />
            ) : (
              isEditing && (
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleChange}
                />
              )
            )}
          </p>
          <p>
            <strong>Document:</strong>
            {user.document && !isEditing ? (
              <a href={user.document} target="_blank" rel="noopener noreferrer">
                View Document
              </a>
            ) : (
              isEditing && (
                <input
                  type="file"
                  name="document"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleChange}
                />
              )
            )}
          </p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {isResetPassword ? (
              <input
                type="password"
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                required
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

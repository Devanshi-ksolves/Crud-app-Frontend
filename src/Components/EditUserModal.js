import React, { useState, useEffect } from "react";
import { getUser } from "../api/api";

const PRIVILEGES_OPTIONS = ["Delete User", "Impersonate User", "Assign Roles"];

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    privileges: [],
  });

  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const ensureArray = (privileges) => {
    if (typeof privileges === "string") {
      return privileges.split(",").map((privilege) => privilege.trim());
    }
    return Array.isArray(privileges) ? privileges : [];
  };

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const userData = await getUser(userId);
          setLoggedInUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch logged-in user:", error);
      }
    };

    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        privileges: ensureArray(user.privileges),
      });
      setConfirmationMessage("");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "role" && value !== user.role) {
      setConfirmationMessage(
        `Are you sure you want to change the role to ${value}?`
      );
    } else {
      setConfirmationMessage("");
    }
  };

  const handlePrivilegesChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Select All") {
      if (checked) {
        setFormData((prevData) => ({
          ...prevData,
          privileges: PRIVILEGES_OPTIONS,
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          privileges: [],
        }));
      }
    } else {
      setFormData((prevData) => {
        const newPrivileges = checked
          ? [...prevData.privileges, value]
          : prevData.privileges.filter((privilege) => privilege !== value);
        return { ...prevData, privileges: newPrivileges };
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (confirmationMessage) {
      const confirmed = window.confirm(confirmationMessage);
      if (!confirmed) {
        setFormData((prevData) => ({ ...prevData, role: user.role }));
        return;
      }
    }

    const updatedPrivileges = ensureArray(formData.privileges);

    const updatedFormData = {
      ...formData,
      privileges: formData.role === "admin" ? updatedPrivileges.join(",") : "",
    };

    onSave(updatedFormData);
  };

  const canEditRole =
    loggedInUser &&
    (loggedInUser.role === "super_admin" ||
      (loggedInUser.role === "admin" &&
        loggedInUser.privileges?.includes("Assign Roles")));

  return (
    <div className="edit-user-modal-overlay">
      <div className="edit-user-modal-content">
        <h3 className="edit-user-modal-title">Edit User</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="edit-user-modal-input"
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="edit-user-modal-input"
            />
          </label>

          {canEditRole && (
            <>
              <label>
                Role:
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="edit-user-modal-input"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </label>

              {formData.role === "admin" && (
                <>
                  <label>Privileges:</label>
                  <div className="privileges-checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        value="Select All"
                        checked={
                          formData.privileges.length ===
                          PRIVILEGES_OPTIONS.length
                        }
                        onChange={handlePrivilegesChange}
                      />
                      Select All
                    </label>
                    {PRIVILEGES_OPTIONS.map((privilege) => (
                      <label key={privilege}>
                        <input
                          type="checkbox"
                          value={privilege}
                          checked={formData.privileges.includes(privilege)}
                          onChange={handlePrivilegesChange}
                        />
                        {privilege}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <div className="edit-user-modal-buttons">
            <button type="submit" className="edit-user-modal-button">
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="edit-user-modal-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;

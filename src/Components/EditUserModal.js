import React, { useState, useEffect } from "react";

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, role: user.role });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (confirmationMessage) {
      const confirmed = window.confirm(confirmationMessage);
      if (!confirmed) {
        setFormData((prevData) => ({ ...prevData, role: user.role })); 
        return; 
      }
    }
    onSave(formData);
  };

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

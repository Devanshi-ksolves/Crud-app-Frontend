import React, { useState, useEffect } from "react";

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, role: user.role });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="edit-user-modal-input"
            />
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

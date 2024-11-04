import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { getUsers, deleteUser, updateUser, impersonateUser } from "../api/api"; // Updated to include getUsers
import EditUserModal from "./EditUserModal";

const AdminDashboard = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSave = async (updatedUser) => {
    try {
      await updateUser(selectedUser.id, updatedUser);
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, ...updatedUser } : user
        )
      );
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user.");
    }
  };

  const handleImpersonate = async (userId) => {
    try {
      const userInfo = await impersonateUser(userId);
      console.log("Impersonate Response:", userInfo);

      if (userInfo && userInfo.token && userInfo.role) {
        window.open(`/user-dashboard?impersonate=${userId}`, "_blank");
      } else {
        console.error("User ID is undefined or missing token:", userInfo);
        alert("User not found or impersonation failed.");
      }
    } catch (error) {
      console.error("Failed to impersonate user:", error);
      alert("Failed to impersonate user.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    navigate("/"); 
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Admin Dashboard</h2>
        <button className="alogout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {showModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {users.length > 0 ? (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleEdit(user)}>Edit</button>
                  <button
                    className="delete"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                  <button onClick={() => handleImpersonate(user.id)}>
                    Impersonate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;

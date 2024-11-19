import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsers,
  deleteUser,
  updateUser,
  impersonateUser,
  getUser,
} from "../api/api";
import EditUserModal from "./EditUserModal";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loggedInUser, setLoggedInUser] = useState(null);

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
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers({ page, pageSize, search: searchTerm });
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to load users:", error);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, pageSize, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      const originalUserId = loggedInUser?.id;

      const userInfo = await impersonateUser(userId);
      console.log("Impersonate Response:", userInfo);

      if (userInfo && userInfo.token && userInfo.role) {
        if (userInfo.role === "admin" || userInfo.role === "super_admin") {
          if (loggedInUser.role === "super_admin") {
            localStorage.setItem("originalUserId", originalUserId);
            localStorage.setItem("userId", userId);
            window.open(`/admin-dashboard?impersonate=${userId}`, "_blank");
          } else {
            const isAdminImpersonatable =
              userInfo.privileges?.includes("Impersonate User");
            if (isAdminImpersonatable) {
              localStorage.setItem("userId", userId);
              window.open("/admin-dashboard", "_blank");
            } else {
              alert("This admin does not have impersonation privileges.");
            }
          }
        } else {
          localStorage.setItem("userId", userId);
          window.open(`/user-dashboard?impersonate=${userId}`, "_blank");
        }
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
    const originalUserId = localStorage.getItem("originalUserId");
    if (originalUserId) {
      localStorage.setItem("userId", originalUserId);
      localStorage.removeItem("originalUserId");
    }

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const canImpersonate =
    loggedInUser &&
    (loggedInUser.role === "super_admin" ||
      (loggedInUser.role === "admin" &&
        loggedInUser.privileges?.includes("Impersonate User")));

  const canDelete =
    loggedInUser &&
    (loggedInUser.role === "super_admin" ||
      (loggedInUser.role === "admin" &&
        loggedInUser.privileges?.includes("Delete User")));

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Admin Dashboard</h2>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
        <button
          className="user-document-button"
          onClick={() => navigate("/request-document")}
        >
          User Document
        </button>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name..."
          className="search-input"
        />
      </div>

      {showModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

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
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {canImpersonate && (
                  <button
                    className="impersonate-button"
                    onClick={() => handleImpersonate(user.id)}
                  >
                    Impersonate
                  </button>
                )}
                {canDelete && (
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                )}
                <button
                  className="edit-button"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>{`${page} / ${totalPages}`}</span>
        <button
          className="pagination-button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

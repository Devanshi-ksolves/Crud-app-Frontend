import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsers,
  deleteUser,
  updateUser,
  impersonateUser,
  getUser,
  getNotifications,
  markNotificationsAsRead,
} from "../api/api";
import EditUserModal from "./EditUserModal";
import io from "socket.io-client";
import { Link } from "react-router-dom";

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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");
    socketRef.current.on("newNotification", (notification) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
      setUnreadCount((prevCount) => prevCount + 1);
    });

    return () => {
      socketRef.current.off("newNotification");
    };
  }, []);

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const adminId = localStorage.getItem("userId");
        if (adminId) {
          const notificationsData = await getNotifications(adminId);
          setNotifications(notificationsData);
          setUnreadCount(
            notificationsData.filter((notification) => !notification.seen)
              .length
          );
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, [loggedInUser]);

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

  const toggleNotificationsDropdown = async () => {
    setShowNotificationsDropdown((prevState) => {
      if (prevState) {
        handleMarkNotificationsAsRead(); 
      }
      return !prevState;
    });

    if (notifications.length === 0) {
      try {
        const adminId = localStorage.getItem("userId");
        if (adminId) {
          const notificationsData = await getNotifications(adminId);
          setNotifications(notificationsData);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }
  };

  const handleMarkNotificationsAsRead = async () => {
    try {
      const adminId = localStorage.getItem("userId");
      if (!adminId) {
        throw new Error("Admin ID is missing");
      }

      const response = await markNotificationsAsRead(adminId);
      console.log("Response from API:", response);

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          seen: true,
        }))
      );

      setUnreadCount(0);
      setShowNotificationsDropdown(false);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error.message);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
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
        <div className="notifications-container">
          <div
            className="notification-bell"
            onClick={toggleNotificationsDropdown}
          >
            🔔{" "}
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
          </div>
          {showNotificationsDropdown && (
            <div className="notifications-dropdown">
              {notifications.length === 0 ? (
                <p>No new notifications at the moment.</p>
              ) : (
                <>
                  <button onClick={handleMarkNotificationsAsRead}>
                    Mark all as read
                  </button>
                  <ul>
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`notification-item ${
                          notification.isRead ? "read" : "unread"
                        }`}
                      >
                        <Link to={notification.link}>
                          {notification.message}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
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

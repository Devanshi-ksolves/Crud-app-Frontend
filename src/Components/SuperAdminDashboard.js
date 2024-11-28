import React, { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import EditUserModal from "./EditUserModal";

import { getUsers, updateUser } from "../api/api";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers({ page: 1, pageSize: 10 });
        setUsers(data.users);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);

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

  return (
    <div className="super-admin-dashboard">
      <AdminDashboard users={users} onEdit={handleEdit} />

      {showModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;

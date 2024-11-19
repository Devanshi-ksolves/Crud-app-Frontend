import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { getUsersList, requestDocuments, getUser } from "..//api/api";
import { useNavigate } from "react-router-dom";

const UserDocumentRequest = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  const documents = [
    "Aadhaar Card",
    "Pan Card",
    "Driving License",
    "Passport",
    "Voter ID",
    "Birth Certificate",
    "Address Proof",
    "Income Proof",
    "Employment Letter",
    "Bank Statement",
    "Utility Bill",
    "Other",
  ];

  const navigate = useNavigate();

  useEffect(() => {
    Modal.setAppElement("#root");
    fetchUsers(currentPage);

    const userRole = localStorage.getItem("userRole");
    if (userRole) {
      const dashboardUrl =
        userRole === "admin" ? "/admin-dashboard" : "/superadmin-dashboard";
      navigate(dashboardUrl);
    }
  }, [currentPage, navigate]);

  const fetchUsers = async (page) => {
    try {
      const response = await getUsersList(page, usersPerPage);
      if (response && response.users) {
        setUsers(response.users);
        setTotalUsers(response.totalUsers);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleRequestDocs = (userId) => {
    setSelectedUser(userId);
    setSelectedDocs([]);
    setModalOpen(true);
  };

  const handleDocSelection = (doc) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const sendEmailRequest = async () => {
    if (selectedDocs.length === 0) {
      alert("Please select at least one document.");
      return;
    }
    try {
      await requestDocuments(selectedUser, selectedDocs);
      alert("Email sent successfully!");
      setModalOpen(false);
      setSelectedDocs([]);
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Failed to send email.");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const selectedUserInfo = users.find((user) => user.id === selectedUser);

  const handleBackToDashboard = async () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      try {
        const userData = await getUser(userId);

        if (userData && userData.role) {
          const userRole = userData.role;
          console.log("User Role:", userRole);

          const dashboardUrl =
            userRole === "admin"
              ? "/admin-dashboard"
              : "/super-admin-dashboard";
          navigate(dashboardUrl);
        } else {
          console.error("User role not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      console.error("User ID not found in localStorage.");
    }
  };

  return (
    <div className="document-list-container">
      <button
        className="back-to-dashboard-button"
        onClick={handleBackToDashboard}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Back to Dashboard
      </button>

      <h2 className="document-list-title">User Document Request</h2>

      <table className="document-table">
        <thead>
          <tr>
            <th style={{ width: "15%" }}>ID</th>
            <th style={{ width: "35%", paddingLeft: "150px" }}>Name</th>
            <th style={{ width: "35%" }}>Email</th>
            <th style={{ width: "30%" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users && users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td style={{ paddingLeft: "150px" }}>{user.name}</td>
                <td className="email">{user.email}</td>{" "}
                <td>
                  <button
                    onClick={() => handleRequestDocs(user.id)}
                    className="request-doc-button"
                  >
                    Request Document
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="no-data">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        {currentPage > 1 && (
          <button onClick={() => handlePageChange(currentPage - 1)}>
            Previous
          </button>
        )}
        <span>
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <button onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </button>
        )}
      </div>

      {modalOpen && selectedUserInfo && (
        <Modal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          className="modal"
          overlayClassName="modal-overlay"
        >
          <button
            onClick={() => setModalOpen(false)}
            className="modal-close-button"
          >
            &times;
          </button>
          <h3>Request Documents from {selectedUserInfo.name}</h3>
          {documents.map((doc) => (
            <label key={doc} className="document-item">
              <input
                type="checkbox"
                checked={selectedDocs.includes(doc)}
                onChange={() => handleDocSelection(doc)}
              />
              {doc}
            </label>
          ))}
          <button onClick={sendEmailRequest} className="send-email-button">
            Send Email to {selectedUserInfo.email}
          </button>
        </Modal>
      )}
    </div>
  );
};

export default UserDocumentRequest;

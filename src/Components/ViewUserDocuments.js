import React, { useEffect, useState } from "react";
import { getUsersList, viewDocuments, acceptRejectDocument } from "../api/api";

const ViewUserDocuments = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserDocs, setSelectedUserDocs] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsersList(); 
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserDocuments = async (userId) => {
    try {
      setSelectedUserId(userId);
      const response = await viewDocuments(userId);
      setSelectedUserDocs(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleDocumentStatus = async (documentId, status) => {
    try {
      await acceptRejectDocument(
        documentId,
        status,
        status === "Rejected" ? "Document not clear" : ""
      );
      fetchUserDocuments(selectedUserId);
    } catch (error) {
      console.error("Error updating document status:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Review Documents</h2>

      <div>
        <h3>Users</h3>
        {users.map((user) => (
          <div key={user.id} style={{ marginBottom: "15px" }}>
            <span style={{ fontWeight: "bold" }}>{user.name}</span>
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => fetchUserDocuments(user.id)}
            >
              View Documents
            </button>
          </div>
        ))}
      </div>

      {selectedUserDocs.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Documents for User {selectedUserId}</h3>
          {selectedUserDocs.map((doc) => (
            <div key={doc.id} style={{ marginBottom: "20px" }}>
              <div>
                <img
                  src={doc.frontImageUrl}
                  alt="Front"
                  style={{ width: "200px", marginRight: "10px" }}
                />
                <img
                  src={doc.backImageUrl}
                  alt="Back"
                  style={{ width: "200px" }}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <span>Status: {doc.status}</span>
                <button
                  style={{
                    marginLeft: "10px",
                    backgroundColor: "green",
                    color: "white",
                  }}
                  onClick={() => handleDocumentStatus(doc.id, "Accepted")}
                >
                  Accept
                </button>
                <button
                  style={{
                    marginLeft: "10px",
                    backgroundColor: "red",
                    color: "white",
                  }}
                  onClick={() => handleDocumentStatus(doc.id, "Rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewUserDocuments;

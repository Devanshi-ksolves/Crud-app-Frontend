import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import {
  getUsersWithDocuments,
  getUserDocument,
  acceptRejectDocument,
} from "../api/api";

const ViewDocuments = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [zoomedInImage, setZoomedInImage] = useState(null);

  useEffect(() => {
    Modal.setAppElement("#root");
    fetchUsersWithDocuments();
  }, []);

  const fetchUsersWithDocuments = async () => {
    try {
      const response = await getUsersWithDocuments();
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users with documents:", error);
    }
  };

  const fetchUserDocuments = async (userId) => {
    try {
      const response = await getUserDocument(userId);
      const baseUrl = "http://localhost:3000";

      const updatedDocuments = response.map((doc) => ({
        ...doc,
        frontImage: new URL(doc.frontImage, baseUrl).toString(),
        backImage: new URL(doc.backImage, baseUrl).toString(),
      }));

      setDocuments(updatedDocuments);
      const user = users.find((user) => user.id === userId);
      setSelectedUser(user);
    } catch (error) {
      console.error("Error fetching user documents:", error);
    }
  };

  const handleViewDocument = (document) => {
    setCurrentDocument(document);
    setModalOpen(true);
  };

  const handleAcceptDocument = async (documentId) => {
    try {
      await acceptRejectDocument(documentId, "accepted");
      alert("Document accepted.");
      fetchUserDocuments(selectedUser.id);
      setModalOpen(false);
    } catch (error) {
      console.error("Error accepting document:", error);
    }
  };

  const handleRejectDocument = async (documentId) => {
    try {
      await acceptRejectDocument(documentId, "rejected");
      alert("Document rejected. User notified.");
      fetchUserDocuments(selectedUser.id);
      setModalOpen(false);
    } catch (error) {
      console.error("Error rejecting document:", error);
    }
  };

  const handleImageClick = (imageUrl) => {
    setZoomedInImage(imageUrl);
  };

  const handleCloseZoom = () => {
    setZoomedInImage(null);
  };

  const handleCloseDocumentsList = () => {
    setSelectedUser(null);
    setDocuments([]);
  };

  return (
    <div className="view-documents-container">
      <h2>View User Documents</h2>
      <div className="user-list">
        <h3>Users</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id} onClick={() => fetchUserDocuments(user.id)}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      </div>
      {selectedUser && (
        <div className="documents-list">
          <h3>
            Documents for {selectedUser.name} - {selectedUser.email}
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "center", 
                  }}
                >
                  Document
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "center", 
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    {doc.documentType}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "center", 
                      color: "white",
                      backgroundColor:
                        doc.status.toLowerCase() === "uploaded"
                          ? "purple"
                          : doc.status.toLowerCase() === "pending"
                          ? "yellow"
                          : doc.status.toLowerCase() === "accepted"
                          ? "#4CAF50"
                          : doc.status.toLowerCase() === "rejected"
                          ? "red"
                          : "gray",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100px",
                      height: "15px",
                      margin: "5px",
                    }}
                  >
                    {doc.status}
                  </td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    {doc.status &&
                      doc.status.trim().toLowerCase() === "uploaded" && (
                        <button
                          className="view-button"
                          onClick={() => handleViewDocument(doc)}
                          style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "12px",
                            cursor: "pointer",
                          }}
                        >
                          View
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="close-documents-button"
            onClick={handleCloseDocumentsList}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "10px 20px",
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            Close Documents
          </button>
        </div>
      )}

      {modalOpen && currentDocument && (
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
          <h3>Document: {currentDocument.documentType}</h3>
          <p>
            Uploaded by: {selectedUser.name} - {selectedUser.email}
          </p>
          <div className="document-images">
            <img
              src={currentDocument.frontImage}
              alt={`${currentDocument.documentType} Front`}
              className="document-image"
              onClick={() => handleImageClick(currentDocument.frontImage)}
            />
            <img
              src={currentDocument.backImage}
              alt={`${currentDocument.documentType} Back`}
              className="document-image"
              onClick={() => handleImageClick(currentDocument.backImage)}
            />
          </div>
          <div className="modal-actions">
            <button
              onClick={() => handleAcceptDocument(currentDocument.id)}
              className="accept-button"
            >
              Accept
            </button>
            <button
              onClick={() => handleRejectDocument(currentDocument.id)}
              className="reject-button"
            >
              Reject
            </button>
          </div>
        </Modal>
      )}

      {zoomedInImage && (
        <div className="zoomed-image-container">
          <div className="zoomed-image-overlay" onClick={handleCloseZoom}></div>
          <div className="zoomed-image-content">
            <img src={zoomedInImage} alt="Zoomed-in" className="zoomed-image" />
            <button className="zoom-close-button" onClick={handleCloseZoom}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDocuments;

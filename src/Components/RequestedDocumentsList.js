import React, { useState } from "react";
import DocumentUploadModal from "./DocumentUpload";

const RequestedDocumentsList = ({ documents, setDocuments, userId }) => {
  const [isListVisible, setIsListVisible] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleClose = () => {
    const remainingDocs = documents.filter((doc) => !doc.uploaded).length;

    if (remainingDocs > 0) {
      setShowConfirmation(true);
    } else {
      setIsListVisible(false);
    }
  };

  const handleConfirmClose = () => {
    setIsListVisible(false);
    setShowConfirmation(false);
  };

  const handleCancelClose = () => {
    setShowConfirmation(false);
  };

  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
    setIsListVisible(true);
  };

  const handleUploadSuccess = (documentId) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === documentId ? { ...doc, uploaded: true } : doc
      )
    );

    setSelectedDocument(null);
  };

  if (!isListVisible) return null;

  const remainingDocsCount = documents.filter((doc) => !doc.uploaded).length;

  return (
    <div className="documents-list">
      <button className="closes-button" onClick={handleClose}>
        &times;
      </button>
      <h3>Requested Documents</h3>

      {documents.length ? (
        documents.map((doc) => (
          <div
            key={doc.id}
            className="documents-item"
            onClick={() => handleDocumentClick(doc)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <span>{doc.documentType}</span>

            {doc.uploaded && (
              <span
                style={{
                  color: "white",
                  backgroundColor: "#4CAF50",
                  padding: "5px 10px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginLeft: "auto",
                }}
              >
                Uploaded
              </span>
            )}
          </div>
        ))
      ) : (
        <p>No documents requested</p>
      )}

      {showConfirmation && (
        <div className="confirmation-modal">
          <p>
            {remainingDocsCount > 0
              ? `You have ${remainingDocsCount} document(s) left to upload. Would you like to continue?`
              : "All documents uploaded successfully!"}
          </p>
          {remainingDocsCount > 0 && (
            <>
              <button
                className="continue-uploading"
                onClick={handleCancelClose}
              >
                Continue Uploading
              </button>
              <button className="close-anyway" onClick={handleConfirmClose}>
                Close Anyway
              </button>
            </>
          )}
        </div>
      )}

      {selectedDocument && (
        <DocumentUploadModal
          documentId={selectedDocument.id}
          documentType={selectedDocument.documentType}
          userId={userId}
          onClose={() => setSelectedDocument(null)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default RequestedDocumentsList;

import React, { useState } from "react";
import { uploadDocumentImages } from "../api/api";

const DocumentUploadModal = ({
  userId,
  documentId,
  documentType,
  onClose,
  onUploadSuccess,
}) => {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "front") {
      setFrontFile(file);
      const reader = new FileReader();
      reader.onload = () => setFrontPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (type === "back") {
      setBackFile(file);
      const reader = new FileReader();
      reader.onload = () => setBackPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!frontFile && !backFile) {
      setErrorMessage("Please select at least one file to upload.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    if (frontFile) formData.append("frontImage", frontFile);
    if (backFile) formData.append("backImage", backFile);

    console.log(userId);
    console.log(documentId);

    if (!documentId || !userId) {
      setErrorMessage("Document ID and User ID are required.");
      setLoading(false);
      return;
    }

    formData.append("documentId", documentId);
    formData.append("userId", userId);

    try {
      await uploadDocumentImages(formData);
      alert("Documents uploaded successfully!");
      onUploadSuccess(documentId);
      onUploadSuccess(userId);
      onClose();
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to upload documents. Please try again."
      );
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Upload Document: {documentType}</h3>

        <div className="file-upload-section">
          <div className="upload-box">
            <h4>Front of the Document</h4>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "front")}
              disabled={loading}
            />
            {frontPreview && (
              <img
                src={frontPreview}
                alt="Front Preview"
                className="file-preview"
              />
            )}
          </div>

          <div className="upload-box">
            <h4>Back of the Document</h4>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "back")}
              disabled={loading}
            />
            {backPreview && (
              <img
                src={backPreview}
                alt="Back Preview"
                className="file-preview"
              />
            )}
          </div>
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="modal-action">
          <button
            onClick={handleUpload}
            className="upload-buttons"
            disabled={loading}
          >
            Upload
          </button>
          <button
            onClick={handleCancel}
            className="cancel-buttons"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;

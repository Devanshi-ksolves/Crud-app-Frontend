import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUser,
  updateUser,
  getRequestedDocuments,
  uploadFiles,
} from "../api/api";
import DocumentUploadModal from "./DocumentUpload";
import RequestedDocumentsList from "./RequestedDocumentsList";
import { jwtDecode } from "jwt-decode";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    profilePicture: null,
    document: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [requestedDocuments, setRequestedDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentList, setShowDocumentList] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const params = new URLSearchParams(window.location.search);
      const impersonateId = params.get("impersonate");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrorMessage("No token found, please log in.");
          return navigate("/login");
        }

        const decodedToken = jwtDecode(token);
        const userId = impersonateId || decodedToken.id;

        const userInfo = await getUser(userId);
        setUser(userInfo);

        const documents = await getRequestedDocuments(userInfo.id);
        if (Array.isArray(documents)) {
          setRequestedDocuments(documents); 
        } else {
          console.error("Expected an array, but got:", documents);
        }

        setFormData({
          name: userInfo.name,
          password: "",
          profilePicture: null,
          document: null,
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleEditClick = () => setIsEditing(true);
  const handleUploadClick = (document) => {
    if (document) {
      setSelectedDocument(document);
    } else {
      setSelectedDocument(null);
    }
    setShowDocumentList(!showDocumentList);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setIsResetPassword(false);
    setFormData({
      name: user.name,
      password: "",
      profilePicture: null,
      document: null,
    });
    setPreviewImage(null);
    setPreviewDocument(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const file = files ? files[0] : null;

    setFormData((prevData) => ({
      ...prevData,
      [name]: file ? file : value,
    }));

    if (file && name === "profilePicture") {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } else if (file && name === "document") {
      setPreviewDocument(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = (fileType) => {
    setFormData((prevData) => ({
      ...prevData,
      [fileType]: null,
    }));

    if (fileType === "profilePicture") {
      setPreviewImage(null);
    } else if (fileType === "document") {
      setPreviewDocument(null);
    }

    const fileInput = document.querySelector(`input[name=${fileType}]`);
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const updateJsonData = {
      name: formData.name,
    };

    if (isResetPassword && formData.password) {
      updateJsonData.password = formData.password;
    }

    const updateData = new FormData();
    if (formData.profilePicture) {
      updateData.append("profilePicture", formData.profilePicture);
    }
    if (formData.document) {
      updateData.append("document", formData.document);
    }

    try {
      await updateUser(user.id, updateJsonData, updateData);

      setSuccessMessage("User details updated successfully!");
      setUser((prevUser) => ({ ...prevUser, name: formData.name }));
      setIsEditing(false);
      setIsResetPassword(false);
    } catch (error) {
      setErrorMessage("Failed to update user details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!formData.profilePicture && !formData.document) {
      setErrorMessage("Please select a file to upload.");
      return;
    }
    setLoading(true);
    try {
      await uploadFiles(user.id, formData);
      setSuccessMessage("Files uploaded successfully!");
    } catch (error) {
      setErrorMessage("Failed to upload files: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="content">
      <div className="user-dashboard">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
        <h2>Welcome, {user.name}</h2>

        {!isEditing && (
          <>
            <button className="edit-button" onClick={handleEditClick}>
              Edit Profile
            </button>
            {requestedDocuments.length > 0 && (
              <button
                className="edit-button"
                onClick={() => handleUploadClick(null)}
              >
                Upload Documents
              </button>
            )}
          </>
        )}

        {showDocumentList && requestedDocuments.length > 0 && (
          <RequestedDocumentsList
            documents={requestedDocuments}
            onDocumentClick={handleUploadClick}
            setDocuments={setRequestedDocuments}
            userId={user.id}
          />
        )}
        {selectedDocument && (
          <DocumentUploadModal
            documentId={selectedDocument.id}
            documentType={selectedDocument.name}
            userId={user.id}
            onClose={() => setSelectedDocument(null)}
          />
        )}
        {isEditing && (
          <form onSubmit={handleSubmit} className="edit-form">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email:</label>
            <input type="text" value={user.email} disabled />

            <div className="password-toggle">
              <label>Reset Password</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isResetPassword}
                  onChange={() => setIsResetPassword(!isResetPassword)}
                />
                <span className="slider round"></span>
              </label>
            </div>

            {isResetPassword && (
              <>
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            <div className="file-upload">
              <label>Profile Picture:</label>
              <input
                type="file"
                name="profilePicture"
                accept="image/*"
                onChange={handleChange}
                disabled={loading}
              />
              {formData.profilePicture && (
                <div className="file-info">
                  <span>{formData.profilePicture.name}</span>
                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => handleRemoveFile("profilePicture")}
                  >
                    ✕
                  </button>
                  {previewImage && (
                    <div className="preview-container">
                      <img
                        src={previewImage}
                        alt="Profile Preview"
                        className="file-preview"
                      />
                    </div>
                  )}
                </div>
              )}

              <label>Document:</label>
              <input
                type="file"
                name="document"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
                disabled={loading}
              />
              {formData.document && (
                <div className="file-info">
                  <span>{formData.document.name}</span>
                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => handleRemoveFile("document")}
                  >
                    ✕
                  </button>
                  {previewDocument && (
                    <div className="preview-container">
                      <iframe
                        src={previewDocument}
                        title="Document Preview"
                        className="file-preview"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                className="upload-button"
                onClick={handleFileUpload}
                disabled={loading}
              >
                Upload
              </button>
            </div>

            <button type="submit" className="save-button" disabled={loading}>
              Save Changes
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancelClick}
            >
              Cancel
            </button>
          </form>
        )}

        {errorMessage && <div className="error">{errorMessage}</div>}
        {successMessage && <div className="success">{successMessage}</div>}
      </div>
    </div>
  );
};

export default UserDashboard;

// Upload.js
import React, { useState } from 'react';
import './Upload.css';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [clothingCategory, setClothingCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewSrc(URL.createObjectURL(file));
      setMessage('');
      setIsError(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage('Please select a photo to upload!');
      setIsError(true);
      return;
    }

    if (!clothingCategory) {
      setMessage('Please choose a category before submitting');
      setIsError(true);
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', clothingCategory);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Successfully uploaded');
        setIsError(false);
        // Don't clear selectedFile or previewSrc to allow re-uploading
        setClothingCategory(''); // Reset category for the next upload
      } else {
        setMessage('Failed to upload: ' + (result.error || 'Unknown error'));
        setIsError(true);
      }
    } catch (error) {
      setMessage('Failed to upload: ' + error.message);
      setIsError(true);
    }

    setIsLoading(false);
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <div className="upload-controls">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <select
            className="dropdown"
            value={clothingCategory}
            onChange={(e) => {
              setClothingCategory(e.target.value);
              setMessage('');
              setIsError(false);
            }}
          >
            <option value="" disabled>Select Category</option>
            <option value="top">Hats</option>
            <option value="upper_body">Tops</option>
            <option value="lower_body">Bottoms</option>
            <option value="bottom">Shoes</option>
          </select>
          <button onClick={handleSubmit} className="upload-button">Upload</button>
        </div>
        {isLoading ? (
          <div className="loading-spinner-parent">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          message && <div className={`message ${isError ? 'error' : 'success'}`}>{message}</div>
        )}
        <div className="upload-display">
          {previewSrc ? (
            <img src={previewSrc} alt="Preview" />
          ) : (
            <div className="placeholder">No image selected</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;

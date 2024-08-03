import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './Camera.css';

const Camera = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [file, setFile] = useState(null);
  const canvasRef = useRef(null);
  const [clothingCategory, setClothingCategory] = useState('');
  const [message, setMessage] = useState('');
  const [flash, setFlash] = useState(false);

  const capturePhoto = () => {
    // Trigger flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 100);

    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);

    // Draw the captured image to a canvas
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured_image.png', { type: 'image/png' });
        setFile(file);
      }, 'image/png');
    };
    img.src = imageSrc;
  };

  const resetPhoto = () => {
    setCapturedImage(null);
    setFile(null);
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please capture a photo first!');
      return;
    }

    if (!clothingCategory) {
      setMessage('Please choose a category before submitting');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', clothingCategory);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Successfully uploaded');
      } else {
        setMessage('Failed to upload: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      setMessage('Failed to upload: ' + error.message);
    }
  };

  return (
    <div className="camera-container">
      <div className="camera-content">
        <div className={`flash ${flash ? 'active' : ''}`}></div>
        <div className="camera-controls">
          {!capturedImage && <button onClick={capturePhoto}>+</button>}
          {capturedImage && (
            <>
              <button onClick={resetPhoto}>✖</button>
              <button onClick={handleSubmit}>📄</button>
            </>
          )}
          <select
            className="dropdown"
            value={clothingCategory}
            onChange={(e) => {
              setClothingCategory(e.target.value);
              setMessage('');
            }}
          >
            <option value="" disabled>Select Category</option>
            <option value="hat">Hat</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="shoes">Shoes</option>
          </select>
        </div>
        {message && <div className="message">{message}</div>}
        <div className="camera-display">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" />
          ) : (
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default Camera;

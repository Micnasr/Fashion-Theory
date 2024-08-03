import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './Camera.css';

const Camera = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [file, setFile] = useState(null);
  const canvasRef = useRef(null);

  const capturePhoto = () => {
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please capture a photo first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      alert('Failed to upload image');
      return;
    }

    const result = await response.json();
    alert(result.message);
  };

  return (
    <div className="camera-container">
      <div className="camera-content">
        <div className="camera-display">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" />
          ) : (
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          )}
        </div>
        <div className="camera-controls">
          <button onClick={capturePhoto}>+</button>
          <button onClick={resetPhoto}>✖</button>
          <button onClick={handleSubmit}>📄</button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default Camera;

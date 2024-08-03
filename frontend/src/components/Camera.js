import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './Camera.css';

const Camera = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const resetPhoto = () => {
    setCapturedImage(null);
  };

  const savePhoto = () => {
    if (capturedImage) {
      // Logic to save the image to local storage or backend
      console.log('Photo saved:', capturedImage);
    }
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
          <button onClick={savePhoto}>📄</button>
        </div>
      </div>
    </div>
  );
};

export default Camera;

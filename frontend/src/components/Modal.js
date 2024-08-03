import React from 'react';
import './Modal.css';

const Modal = ({ isVisible, onClose, children }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✖</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
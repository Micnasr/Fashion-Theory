import React, { useState, useEffect } from 'react';
import './WardrobeItem.css';
import Modal from './Modal';

const WardrobeItem = ({ uuid, index, onRemove }) => {
  const [imageSrc, setImageSrc] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false); 
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch('/get_image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uuid }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        setImageSrc(`data:image/png;base64,${result.image}`); 
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [uuid]);

  const handleRemove = async () => {
    try {
      const response = await fetch('/remove_clothing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      onRemove(uuid); // Notify parent component to update state
    } catch (error) {
      console.error('Error removing clothing:', error);
    }
  };

  const handleImageClick = () => {
    setIsModalVisible(true); // Show modal on image click
  };

  return (
    <>
      <div className="wardrobe-item">
        <button className="remove-button" onClick={handleRemove}>✖</button>
        {imageSrc ? (
          <img src={imageSrc} alt={`Item ${index + 1}`} onClick={handleImageClick} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <img src={imageSrc} alt={`Item ${index + 1}`} className="full-size-image" />
      </Modal>
    </>
  );
};

export default WardrobeItem;

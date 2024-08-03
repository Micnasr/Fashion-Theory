import React, { useState, useEffect } from 'react';
import './WardrobeItem.css';

const WardrobeItem = ({ uuid, index, onRemove }) => {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    // Fetch the image data for each item
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
        setImageSrc(`data:image/png;base64,${result.image}`); // Using base64 encoded image string
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

  return (
    <div className="wardrobe-item">
      <button className="remove-button" onClick={handleRemove}>✖</button>
      {imageSrc ? <img src={imageSrc} alt={`Item ${index + 1}`} /> : <p>Loading...</p>}
    </div>
  );
};

export default WardrobeItem;

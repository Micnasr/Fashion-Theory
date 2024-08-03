import React, { useState, useEffect } from 'react';
import './Wardrobe.css';

const Wardrobe = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tops');
  const [clothes, setClothes] = useState({});
  const categories = ['Hats', 'Tops', 'Bottoms', 'Shoes'];

  useEffect(() => {
    // Fetch available clothes on component mount
    const fetchClothes = async () => {
      try {
        const response = await fetch('/get_available_clothes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        const clothesByCategory = {
          Hats: [],
          Tops: [],
          Bottoms: [],
          Shoes: []
        };

        // Populate the clothesByCategory dictionary
        data.forEach(item => {
          switch (item.clothes_part) {
            case 'top':
              clothesByCategory.Hats.push(item);
              break;
            case 'upper_body':
              clothesByCategory.Tops.push(item);
              break;
            case 'lower_body':
              clothesByCategory.Bottoms.push(item);
              break;
            case 'bottom':
              clothesByCategory.Shoes.push(item);
              break;
            default:
              break;
          }
        });

        setClothes(clothesByCategory);
      } catch (error) {
        console.error('Error fetching clothes:', error);
      }
    };

    fetchClothes();
  }, []);

  return (
    <div className="wardrobe-container">
      <div className="wardrobe-sidebar">
        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="wardrobe-display">
        <div className="wardrobe-items">
          {clothes[selectedCategory]?.map((item, index) => (
            <WardrobeItem key={item.uuid} uuid={item.uuid} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

const WardrobeItem = ({ uuid, index }) => {
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

  return (
    <div className="wardrobe-item">
      {imageSrc ? <img src={imageSrc} alt={`Item ${index + 1}`} /> : <p>Loading...</p>}
    </div>
  );
};

export default Wardrobe;

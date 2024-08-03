import React, { useState, useEffect } from 'react';
import './Wardrobe.css';
import WardrobeItem from './WardrobeItem';

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
              clothesByCategory.Tops.push(item);
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

  const handleRemove = (uuid) => {
    setClothes((prevClothes) => {
      const updatedClothes = { ...prevClothes };
      Object.keys(updatedClothes).forEach(category => {
        updatedClothes[category] = updatedClothes[category].filter(item => item.uuid !== uuid);
      });
      return updatedClothes;
    });
  };

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
            <WardrobeItem key={item.uuid} uuid={item.uuid} index={index} onRemove={handleRemove} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wardrobe;

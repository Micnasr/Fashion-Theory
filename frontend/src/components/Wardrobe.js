import React, { useState } from 'react';
import './Wardrobe.css';

const Wardrobe = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tops');

  const categories = ['Hats', 'Tops', 'Bottoms', 'Shoes'];

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
        {/* Placeholder: Replace with actual category items */}
        <div className="wardrobe-items">
          {Array(8).fill(null).map((_, index) => (
            <div className="wardrobe-item" key={index}>
              <p>{`${selectedCategory} Item ${index + 1}`}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wardrobe;

import React, { useEffect, useState } from 'react';
import './Favourites.css';

const Favourites = () => {
  const [savedOutfits, setSavedOutfits] = useState([]);

  useEffect(() => {
    // Logic to fetch saved outfits (from local storage or backend)
    setSavedOutfits(['outfit1.png', 'outfit2.png']); // Placeholder data
  }, []);

  return (
    <div className="favourites-container">
      <div className="favourites-grid">
        {savedOutfits.map((outfit, index) => (
          <div className="favourites-item" key={index}>
            <img src={outfit} alt={`Favourite ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favourites;

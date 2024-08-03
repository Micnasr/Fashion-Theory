import React, { useEffect, useState } from 'react';
import './Favourites.css';

const DisplayClothing = ({ uuid }) => {
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
    <div className="display-clothing">
      {imageSrc ? <img src={imageSrc} alt={`Clothing item`} /> : <p>Loading...</p>}
    </div>
  );
};

const Favourites = () => {
  const [savedOutfits, setSavedOutfits] = useState([]);

  useEffect(() => {

    fetch('/get_favourite_fits')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok - could not get saved outfits');
        }
        return response.json();
      })
      .then(data => {
        setSavedOutfits(data);
      })
      .catch(error => {
        console.error('Error fetching saved outfits:', error);
      });
  }, []);

  console.log("savedOutfits", savedOutfits);
  const onRemove = (uuid) => {
    setSavedOutfits((prevFits) => {
      const updatedFits = { ...prevFits };
      Object.keys(updatedFits).forEach(category => {
        updatedFits[category] = updatedFits[category].filter(item => item.uuid !== uuid);
      });
      return updatedFits;
    });
  };
  const handleRemove = async (uuid) => {
    try {
      const response = await fetch('/remove_fav_fit', {
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
    <div className="favourites-container">
      <div className="favourites-grid">
        {savedOutfits.map((outfit, index) => (
          //Display four pieces of clothing as a cohesive outfit
          <div className="favourites-item" key={index}>
            <button className="remove-button" onClick={() => (handleRemove(outfit.uuid))}>✖</button>
            {outfit.clothes.map((clothing, index2) => (
              <DisplayClothing uuid={clothing.uuid} />
            ))}
          </div>
          // <div className="favourites-item" key={index}>
          //   <img src={outfit} alt={`Favourite ${index + 1}`} />
          // </div>
        ))}
      </div>
    </div>
  );
};

export default Favourites;

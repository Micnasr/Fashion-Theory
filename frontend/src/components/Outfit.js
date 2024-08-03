import React, { useState, useEffect } from 'react';
import './Outfit.css';

const Outfit = () => {
  const [outfitIndex, setOutfitIndex] = useState({
    Hats: 0,
    Tops: 0,
    Bottoms: 0,
    Shoes: 0,
  });
  const [clothes, setClothes] = useState({
    Hats: [],
    Tops: [],
    Bottoms: [],
    Shoes: [],
  });

  useEffect(() => {
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

        // Populate the clothesByCategory dictionary with default images
        data.forEach(item => {
          const defaultItem = { ...item, image: '/images/default-image.png' };
          switch (item.clothes_part) {
            case 'top':
              clothesByCategory.Hats.push(defaultItem);
              break;
            case 'upper_body':
              clothesByCategory.Tops.push(defaultItem);
              break;
            case 'lower_body':
              clothesByCategory.Bottoms.push(defaultItem);
              break;
            case 'bottom':
              clothesByCategory.Shoes.push(defaultItem);
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

  const fetchImage = async (uuid, category, newIndex) => {
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
      const imageUrl = `data:image/png;base64,${result.image}`;

      setClothes((prevClothes) => ({
        ...prevClothes,
        [category]: prevClothes[category].map((item, idx) => 
          idx === newIndex ? { ...item, image: imageUrl } : item
        ),
      }));
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  const handleArrowClick = async (category, direction) => {
    const items = clothes[category];

    if (items && items.length > 0) {
      setOutfitIndex((prevIndex) => {
        const currentIndex = prevIndex[category];
        const newIndex = (currentIndex + direction + items.length) % items.length;
        return { ...prevIndex, [category]: newIndex };
      });

      const newIndex = (outfitIndex[category] + direction + items.length) % items.length;
      const currentItem = items[newIndex];

      if (currentItem && currentItem.image === '/images/default-image.png') {
        await fetchImage(currentItem.uuid, category, newIndex);
      }
    }
  };

  const randomizeOutfit = () => {
    console.log("Randomize outfit function triggered");
  };

  const generateOutfitOfTheDay = () => {
    console.log("Generate outfit of the day function triggered");
  };

  const favouriteOutfit = () => {
    console.log("Save outfit function triggered");
  };

  return (
    <div className="outfit-container">
      <div className="outfit-pane">
        <div className="outfit-carousel">
          {['Hats', 'Tops', 'Bottoms', 'Shoes'].map((category) => {
            const items = clothes[category] || [];
            const currentIndex = outfitIndex[category];

            const sizeClass = {
              Hats: 'hat-size',
              Tops: 'top-size',
              Bottoms: 'bottom-size',
              Shoes: 'shoe-size'
            }[category];

            return (
              <div className={`carousel-item ${sizeClass}`} key={category}>
                {items.length > 0 ? (
                  <>
                    <button className="arrow-btn left-arrow" onClick={() => handleArrowClick(category, -1)}>
                      <img src="/images/left-arrow.png" alt="Previous" />
                    </button>
                    <img 
                      src={items[currentIndex].image} 
                      alt={`${category} ${currentIndex + 1}`}
                      className="clothing-image"
                    />
                    <button className="arrow-btn right-arrow" onClick={() => handleArrowClick(category, 1)}>
                      <img src="/images/right-arrow.png" alt="Next" />
                    </button>
                  </>
                ) : (
                  <p>No items available for {category}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="controls-pane">
        <div className="outfit-controls">
          <button onClick={randomizeOutfit}>
            <img src="/images/randomize.png" alt="Randomize" className="outfit-icon" />
          </button>
          <button onClick={generateOutfitOfTheDay}>
            <img src="/images/outfit-of-the-day.png" alt="Outfit of the Day" className="outfit-icon" />
          </button>
          <button onClick={favouriteOutfit}>
            <img src="/images/favourites.png" alt="Favourite Outfit" className="outfit-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Outfit;

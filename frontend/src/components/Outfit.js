import React, { useState, useEffect } from 'react';
import ReactSpeedometer from "react-d3-speedometer"
import './Outfit.css';

const Outfit = () => {
  const [outfitIndex, setOutfitIndex] = useState({
    Hats: 0,
    Tops: 0,
    Bottoms: 0,
    Shoes: 0,
  });
  const [clothes, setClothes] = useState({
    Hats: [{ image: '/images/default-image.png' }],
    Tops: [{ image: '/images/default-image.png' }],
    Bottoms: [{ image: '/images/default-image.png' }],
    Shoes: [{ image: '/images/default-image.png' }],
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
          Hats: [{ image: '/images/default-image.png' }],
          Tops: [{ image: '/images/default-image.png' }],
          Bottoms: [{ image: '/images/default-image.png' }],
          Shoes: [{ image: '/images/default-image.png' }],
        };

        data.forEach(item => {
          const clothingItem = { ...item, image: '/images/default-image.png' };
          switch (item.clothes_part) {
            case 'top':
              clothesByCategory.Hats.push(clothingItem);
              break;
            case 'upper_body':
              clothesByCategory.Tops.push(clothingItem);
              break;
            case 'lower_body':
              clothesByCategory.Bottoms.push(clothingItem);
              break;
            case 'bottom':
              clothesByCategory.Shoes.push(clothingItem);
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

    if (items && items.length > 1) { // Ensure there is more than the default image
      const currentIndex = outfitIndex[category];
      const newIndex = (currentIndex + direction + items.length) % items.length;

      setOutfitIndex((prevIndex) => ({
        ...prevIndex,
        [category]: newIndex,
      }));

      const currentItem = items[newIndex];

      if (currentItem && currentItem.image === '/images/default-image.png') {
        await fetchImage(currentItem.uuid, category, newIndex);
      }
    }
  };

  const randomizeOutfit = () => {
    const newOutfitIndex = {
      Hats: Math.floor(Math.random() * clothes.Hats.length),
      Tops: Math.floor(Math.random() * clothes.Tops.length),
      Bottoms: Math.floor(Math.random() * clothes.Bottoms.length),
      Shoes: Math.floor(Math.random() * clothes.Shoes.length),
    };

    setOutfitIndex(newOutfitIndex);

    // Fetch images if the random item hasn't been loaded yet
    Object.keys(newOutfitIndex).forEach(async (category) => {
      const newIndex = newOutfitIndex[category];
      const currentItem = clothes[category][newIndex];

      if (currentItem && currentItem.image === '/images/default-image.png') {
        await fetchImage(currentItem.uuid, category, newIndex);
      }
    });
  };

  const generateOutfitOfTheDay = () => {
    console.log("Generate outfit of the day function triggered");
  };

  const favouriteOutfit = () => {
    console.log("Save outfit function triggered");
  };

  const resetOutfit = () => {
    setOutfitIndex({
      Hats: 0,
      Tops: 0,
      Bottoms: 0,
      Shoes: 0,
    });
  };

  const fit_check_value = 0.5;

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
                <button className="arrow-btn left-arrow" onClick={() => handleArrowClick(category, -1)}>
                  <img src="/images/left-arrow.png" alt="Previous" />
                </button>
                <img
                  src={items[currentIndex]?.image || '/images/default-image.png'}
                  alt={`${category} ${currentIndex + 1}`}
                  className="clothing-image"
                />
                <button className="arrow-btn right-arrow" onClick={() => handleArrowClick(category, 1)}>
                  <img src="/images/right-arrow.png" alt="Next" />
                </button>
              </div>
            );
          })}
        </div>
      </div>


      <div className="controls-pane">
        <div className="fit-check">
          <ReactSpeedometer minValue={0.0} maxValue={1.0} value={fit_check_value} segments={3} paddingVertical={0} width={400} segmentColors={["#FEC0C0", "#E0BBE4", "#9B5DE5"]} currentValueText='' />
          <div className="fit-check-text-container">
            <p className="fit-check-text">Fit Check: {fit_check_value > 0.66 ? "Fantastic Fashion!" : (fit_check_value > 0.33 ? "Superb Style!" : "Maybe try another outfit")}</p>
          </div>
        </div>
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
          <button onClick={resetOutfit}>
            <img src="/images/reset.png" alt="Reset Outfit" className="outfit-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Outfit;

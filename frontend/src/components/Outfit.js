import React, { useState, useEffect } from 'react';
import ReactSpeedometer from "react-d3-speedometer";
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
  const [fitCheckValue, setFitCheckValue] = useState(0);
  const [hasRandomized, setHasRandomized] = useState(false); // Track if randomization has occurred

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

  useEffect(() => {
    if (!hasRandomized && (clothes.Hats.length > 1 || clothes.Tops.length > 1 || clothes.Bottoms.length > 1 || clothes.Shoes.length > 1)) {
      randomizeOutfit(clothes); // Randomize outfit on load if there are available clothes
      setHasRandomized(true); // Set flag to true after randomization
    }
  }, [clothes, hasRandomized]);

  const fetchImage = async (uuid, category, newIndex) => {
    if (!uuid) return; // Prevent fetching if UUID is invalid

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

  const fetchRating = async (currentUuids) => {
    const filteredUuids = Object.values(currentUuids).filter(uuid => uuid);

    if (filteredUuids.length > 0) {
      try {
        const response = await fetch('/get_rating', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uuids: filteredUuids }),
        });
        const result = await response.json();
        console.log(`Rating: ${result.rating}%`);
        setFitCheckValue(result.rating / 100); // Convert percentage to a value between 0 and 1
      } catch (error) {
        console.error('Error fetching rating:', error);
      }
    }
  };

  const handleArrowClick = async (category, direction) => {
    const currentIndex = outfitIndex[category];
    const items = clothes[category];
    const newIndex = (currentIndex + direction + items.length) % items.length;

    const newOutfitIndex = { ...outfitIndex, [category]: newIndex };

    setOutfitIndex(newOutfitIndex);

    const currentUuids = {
      Hats: clothes.Hats[newOutfitIndex.Hats]?.uuid,
      Tops: clothes.Tops[newOutfitIndex.Tops]?.uuid,
      Bottoms: clothes.Bottoms[newOutfitIndex.Bottoms]?.uuid,
      Shoes: clothes.Shoes[newOutfitIndex.Shoes]?.uuid,
    };

    const currentItem = items[newIndex];

    if (currentItem && currentItem.image === '/images/default-image.png') {
      await fetchImage(currentItem.uuid, category, newIndex);
    }

    await fetchRating(currentUuids);
  };

  const randomizeOutfit = async (clothesByCategory = clothes) => {
    if (!clothesByCategory || !Object.keys(clothesByCategory).length) return;

    const newOutfitIndex = {
      Hats: clothesByCategory.Hats.length > 1 ? Math.floor(Math.random() * clothesByCategory.Hats.length) : 0,
      Tops: clothesByCategory.Tops.length > 1 ? Math.floor(Math.random() * (clothesByCategory.Tops.length - 1)) + 1 : 0,
      Bottoms: clothesByCategory.Bottoms.length > 1 ? Math.floor(Math.random() * (clothesByCategory.Bottoms.length - 1)) + 1 : 0,
      Shoes: clothesByCategory.Shoes.length > 1 ? Math.floor(Math.random() * (clothesByCategory.Shoes.length - 1)) + 1 : 0,
    };

    setOutfitIndex(newOutfitIndex);

    // Fetch images if the random item hasn't been loaded yet
    Object.keys(newOutfitIndex).forEach(async (category) => {
      const newIndex = newOutfitIndex[category];
      const currentItem = clothesByCategory[category][newIndex];

      if (currentItem && currentItem.image === '/images/default-image.png') {
        await fetchImage(currentItem.uuid, category, newIndex);
      }
    });

    const currentUuids = {
      Hats: clothesByCategory.Hats[newOutfitIndex.Hats]?.uuid,
      Tops: clothesByCategory.Tops[newOutfitIndex.Tops]?.uuid,
      Bottoms: clothesByCategory.Bottoms[newOutfitIndex.Bottoms]?.uuid,
      Shoes: clothesByCategory.Shoes[newOutfitIndex.Shoes]?.uuid,
    };

    await fetchRating(currentUuids);
  };

  const generateOutfitOfTheDay = () => {
    console.log("Generate outfit of the day function triggered");
  };

  const favouriteOutfit = async () => {
    const currentUuids = {
      Hats: clothes.Hats[outfitIndex.Hats]?.uuid,
      Tops: clothes.Tops[outfitIndex.Tops]?.uuid,
      Bottoms: clothes.Bottoms[outfitIndex.Bottoms]?.uuid,
      Shoes: clothes.Shoes[outfitIndex.Shoes]?.uuid,
    };
  
    const filteredUuids = Object.values(currentUuids).filter(uuid => uuid);
  
    if (filteredUuids.length > 0) {
      try {
        const response = await fetch('/save_fav_fit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uuids: filteredUuids }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.text(); // Parse the response as text
        console.log('Favourite outfit saved:', result);
      } catch (error) {
        console.error('Error saving favourite outfit:', error);
      }
    }
  };

  const resetOutfit = () => {
    setOutfitIndex({
      Hats: 0,
      Tops: 0,
      Bottoms: 0,
      Shoes: 0,
    });
    setFitCheckValue(0); // Reset the fit check value
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
          <ReactSpeedometer minValue={0.0} maxValue={1.0} value={fitCheckValue} segments={3} paddingVertical={0} width={400} segmentColors={["#FEC0C0", "#E0BBE4", "#9B5DE5"]} currentValueText='' />
          <div className="fit-check-text-container">
            <p className="fit-check-text">Fit Check: {fitCheckValue > 0.66 ? "Fantastic Fashion!" : (fitCheckValue > 0.33 ? "Superb Style!" : "Maybe try another outfit")}</p>
          </div>
        </div>
        <div className="outfit-controls">
          <button onClick={() => randomizeOutfit(clothes)}>
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

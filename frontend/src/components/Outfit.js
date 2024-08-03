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
            case 'hat':
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

    const filteredUuids = Object.values(currentUuids).filter(uuid => uuid);

    console.log(filteredUuids);

    const currentItem = items[newIndex];

    if (currentItem && currentItem.image === '/images/default-image.png') {
      await fetchImage(currentItem.uuid, category, newIndex);
    }

    if (filteredUuids.length > 0) {
      fetch('/get_rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuids: filteredUuids }),
      })
        .then(response => response.json())
        .then(result => {
          console.log(`Rating: ${result.rating}%`);
          setFitCheckValue(result.rating / 100); // Convert percentage to a value between 0 and 1
        })
        .catch(error => {
          console.error('Error fetching rating:', error);
        });
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

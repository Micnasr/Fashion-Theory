import os
import io
import numpy as np
from uuid import uuid4
from PIL import Image
from rembg import remove  # type: ignore
from sklearn.cluster import KMeans  # type: ignore
from image_classes import RGBWithPercent


def remove_background(file_binary: bytes) -> bytes:
    # Remove the background
    output_image = remove(file_binary)
    
    # Open the output image as an Image object
    try:
        img = Image.open(io.BytesIO(output_image)).convert("RGBA")
        img.verify() 
        img = Image.open(io.BytesIO(output_image)).convert("RGBA")
    except Exception as e:
        raise ValueError(f"Failed to open and verify processed image: {e}")

    # Calculate the bounding box of the non-transparent part of the image
    bbox = img.getbbox()

    if bbox:
        # Crop the image to the bounding box
        img = img.crop(bbox)

    # Determine the size of the new canvas
    canvas_size = (max(img.width, img.height), max(img.width, img.height))
    
    # Create a new blank canvas
    canvas = Image.new("RGBA", canvas_size, (255, 255, 255, 0))
    
    # Center the image on the canvas
    x = (canvas_size[0] - img.width) // 2
    y = (canvas_size[1] - img.height) // 2
    canvas.paste(img, (x, y), img)

    # Save the centered image to a bytes buffer
    centered_output = io.BytesIO()
    canvas.save(centered_output, format="PNG")
    centered_output.seek(0)
    
    return centered_output.getvalue()


# def get_average_rgb(image_path: str) -> tuple[int, int, int]:
#     image = Image.open(image_path).convert("RGBA")
#     np_image = np.array(image)

#     # Mask to only select non-transparent pixels
#     mask = np_image[:, :, 3] > 0

#     # Extract the RGB values of non-transparent pixels
#     rgb_values = np_image[mask][:, :3]

#     # Calculate the average RGB values
#     avg_rgb = rgb_values.mean(axis=0)

#     return tuple(map(int, avg_rgb))


def get_dominant_colors_with_percentage(image_path: str, k: int = 3) -> list[RGBWithPercent]:
    image = Image.open(image_path).convert("RGBA")
    np_image = np.array(image)
    mask = np_image[:, :, 3] > 0
    rgb_values = np_image[mask][:, :3]

    kmeans = KMeans(n_clusters=k)
    kmeans.fit(rgb_values)
    colors = kmeans.cluster_centers_
    labels = kmeans.labels_

    label_counts = np.bincount(labels)
    total_count = len(labels)

    percentages = label_counts / total_count

    return [(tuple(map(int, colors[i])), percentages[i]) for i in range(k)]  # type: ignore

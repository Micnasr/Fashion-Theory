import os
import io
import numpy as np
from uuid import uuid4
from PIL import Image
from rembg import remove
from sklearn.cluster import KMeans

def generate_random_path() -> str:
    clothing_path = os.path.join(os.getcwd(), "clothes", str(uuid4()))
    os.makedirs(os.path.basename(clothing_path), exist_ok=True)
    return clothing_path

def remove_background(input_path: str, output_path: str) -> None:
    # Open the input image
    with open(input_path, "rb") as input_file:
        input_image = input_file.read()

    # Remove the background
    output_image = remove(input_image)

    # Save the result to the output path
    with open(output_path, "wb") as output_file:
        output_file.write(output_image)

def get_average_rgb(image_path: str) -> tuple[int, int, int]:
    image = Image.open(image_path).convert("RGBA")
    np_image = np.array(image)

    # Mask to only select non-transparent pixels
    mask = np_image[:, :, 3] > 0

    # Extract the RGB values of non-transparent pixels
    rgb_values = np_image[mask][:, :3]

    # Calculate the average RGB values
    avg_rgb = rgb_values.mean(axis=0)

    return tuple(map(int, avg_rgb))

def get_dominant_colors_with_percentage(image_path: str, k: int = 3) -> list[tuple[tuple[int, int, int], float]]:
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

    return [(tuple(map(int, colors[i])), percentages[i]) for i in range(k)]

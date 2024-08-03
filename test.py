import io
import numpy as np
from PIL import Image
from rembg import remove
from sklearn.cluster import KMeans

def remove_background(input_path, output_path):
    # Open the input image
    with open(input_path, "rb") as input_file:
        input_image = input_file.read()

    # Remove the background
    output_image = remove(input_image)

    # Save the result to the output path
    with open(output_path, "wb") as output_file:
        output_file.write(output_image)


def get_average_rgb(image_path):
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


def main():
    input_path = r"C:\Users\micna\Downloads\shirt.jpg"
    output_path = r"C:\Users\micna\Downloads\shirt_post.jpg"
    remove_background(input_path, output_path)
    avg_rgb = get_average_rgb(output_path)

    print(f"Background removed and saved to {output_path}") 
    print(f"Average RGB value of the clothing: {avg_rgb}")

    dominant_colors_with_percentages = get_dominant_colors_with_percentage(output_path, k=3)
    
    print(f"Background removed and saved to {output_path}")

    for color, percentage in dominant_colors_with_percentages:
        print(f"Dominant color: {color}, Percentage: {percentage:.2%}")


if __name__ == "__main__":
    main()
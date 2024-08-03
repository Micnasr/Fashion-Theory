from flask import Flask, request, jsonify
import os
import io
from consts import CLOTHING_STORAGE_DIR, CLOTHING_METADATA_PATH, generate_random_path
from image_classes import Wardrobe, ClothingInfo, ClothesPart
from image_processing import remove_background, get_dominant_colors_with_percentage

from PIL import Image


app = Flask(__name__)
# app.config["UPLOAD_FOLDER"] = CLOTHING_STORAGE_DIR

if not os.path.exists(CLOTHING_STORAGE_DIR):
    os.makedirs(CLOTHING_STORAGE_DIR)


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not file:
        return jsonify({"error": f"File appears as None: {file}"}), 400


    file_binary = file.read()
    output_image_bytes = remove_background(file_binary)

    # Create an image object from the byte data
    output_image = Image.open(io.BytesIO(output_image_bytes))

    # Save the result to a file path
    file_path = generate_random_path()
    output_image.save(file_path)

    rgbs_with_percent = get_dominant_colors_with_percentage(file_path)

    # TODO get clothes part from drop down menu
    clothing = ClothingInfo(path=file_path, rgbs=rgbs_with_percent, clothes_part=ClothesPart.top)

    wardrobe = Wardrobe.load_clothes()
    wardrobe.available_clothes.append(clothing)
    wardrobe.save_clothes()

    return jsonify({"message": "File successfully uploaded"}), 200


@app.route("/available_clothes")
def get_available_clothes():
    wardrobe = Wardrobe.load_clothes()
    return list(map(lambda clothing: clothing.model_dump(), wardrobe.available_clothes)), 200


@app.route("/fit")
def get_fit():
    wardrobe = Wardrobe.load_clothes()
    # TODO fit algo here
    # TODO take in colour here
    # return wardrobe


# TODO api for:
# - getting all available clothes (metadata)
# - getting a fit (metadata)
# - getting an image of clothing (take in metadata, return image)
# - removing a piece of clothing (via metadata/friendly name)
# - saving/removing a fav fit
# - clearing all available clothes
# - get rating (from fit metadata)


@app.route("/test")
def test():
    return {"test": "test"}


if __name__ == "__main__":
    app.run(port=5353, debug=True)

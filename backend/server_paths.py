import os
import io

from flask import Flask, request, jsonify
from pydantic import BaseModel

from consts import CLOTHING_STORAGE_DIR, CLOTHING_METADATA_PATH, generate_random_path
from image_classes import Wardrobe, ClothingInfo, ClothesPart, Fit
from image_processing import remove_background, get_dominant_colors_with_percentage

from PIL import Image


app = Flask(__name__)
# app.config["UPLOAD_FOLDER"] = CLOTHING_STORAGE_DIR

if not os.path.exists(CLOTHING_STORAGE_DIR):
    os.makedirs(CLOTHING_STORAGE_DIR)


def pydantic_list_to_json(pydantic_objects: list[BaseModel]) -> list[dict]:
    return list(map(lambda clothing: clothing.model_dump(), pydantic_objects))


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


@app.route("/get_available_clothes")
def get_available_clothes():
    wardrobe = Wardrobe.load_clothes()
    return pydantic_list_to_json(wardrobe.available_clothes), 200


@app.route("/get_favourite_fits")
def get_favourite_fits():
    wardrobe = Wardrobe.load_clothes()
    return pydantic_list_to_json(wardrobe.favourite_fits), 200


@app.route("/get_fit")
def get_fit():
    wardrobe = Wardrobe.load_clothes()
    # TODO fit algo here
    # TODO take in colour here maybe
    return pydantic_list_to_json(wardrobe.available_clothes[:4]), 200


@app.route("/clear_wardrobe")
def clear_wardrobe():
    Wardrobe(available_clothes=[]).save_clothes()
    return "Successfully cleared wardrobe", 200


@app.route("/remove_clothing", mode=["POST"])
def remove_clothing():
    if "friendly_name" not in request.form:
        return jsonify({"error": "friendly_name identifier not found (required to remove clothing)"}), 400

    wardrobe = Wardrobe.load_clothes()
    wardrobe.remove_clothing_from_wardrobe(request.form["friendly_name"])
    wardrobe.save_clothes()

    return f"Successfully removed {request.form['friendly_name']} from wardrobe", 200


@app.route("/save_fav_fit", mode=["POST"])
def save_fav_fit():
    if "fit" not in request.form:
        return jsonify({"error": "fit identifier not found (required to save fit)"}), 400

    fit = Fit(**request.form)
    wardrobe = Wardrobe.load_clothes()
    wardrobe.favourite_fits.append(fit)
    wardrobe.save_clothes()
    return f"Successfully added fit {fit} to the list of favourite fits", 200


@app.route("/remove_fav_fit", mode=["POST"])
def remove_fav_fit():
    if "friendly_name" not in request.form:
        return jsonify({"error": "friendly_name identifier not found (required to remove favourite fit)"}), 400

    wardrobe = Wardrobe.load_clothes()
    wardrobe.remove_fit_from_favourites(request.form["friendly_name"])
    wardrobe.save_clothes()
    return f"Successfully removed favourite fit {request.form['friendly_name']} from wardrobe", 200


@app.route("/get_rating", mode=["POST"])
def get_rating():
    if "friendly_names" not in request.form:
        return jsonify({"error": "friendly_names identifier not found (required to get clothes for rating)"}), 400

    wardrobe = Wardrobe.load_clothes()

    fit_clothing = []
    for name in request.form["friendly_names"]:
        fit_clothing.append(wardrobe.get_clothing_by_name(name))

    if len(fit_clothing) != 4:
        return jsonify({"error": f"Did not find exactly 4 pieces of clothing to rate (got {len(fit_clothing)}. {fit_clothing})"}), 400

    # TODO rating algo here
    return "Rating: 5", 200


@app.route("/get_image", mode=["POST"])
def get_image():
    if "friendly_name" not in request.form:
        return jsonify({"error": "friendly_name identifier not found (required to get image)"})

    wardrobe = Wardrobe.load_clothes()
    clothing = wardrobe.get_clothing_by_name(request.form["friendly_name"])[0]

    # TODO see if this can load the image, if not, can always try base64 encoding
    with open(clothing.path, "rb") as f:
        return f.read(), 200


# TODO api for:
# -/ getting all available clothes (metadata)
# -- getting a fit (metadata)
# -- getting an image of clothing (take in metadata, return image)
# -/ removing a piece of clothing (via metadata/friendly name)
# -/ saving/removing a fav fit
# -/ clearing all available clothes
# -/ get rating (from fit metadata)


@app.route("/test")
def test():
    return {"test": "test"}


if __name__ == "__main__":
    app.run(port=5353, debug=True)

from flask import Flask, request, jsonify
import os
from pydantic import BaseModel

from consts import CLOTHING_STORAGE_DIR, CLOTHING_METADATA_PATH, generate_random_path
from image_classes import Wardrobe, ClothingInfo, ClothesPart

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

    # TODO remove background of file
    # TODO get colour info for BG

    file_path = generate_random_path()
    file.save(file_path)

    # TODO take in clothing type, rgb info, friendly name, and any additional labels
    clothing = ClothingInfo(path=file_path)

    wardrobe = Wardrobe.load_clothes()
    wardrobe.available_clothes.append(clothing)
    wardrobe.save_clothes()

    return jsonify({"message": "File successfully uploaded"}), 200


@app.route("/available_clothes")
def get_available_clothes():
    wardrobe = Wardrobe.load_clothes()
    return pydantic_list_to_json(wardrobe.available_clothes), 200


@app.route("/fit")
def get_fit():
    wardrobe = Wardrobe.load_clothes()
    # TODO fit algo here
    # TODO take in colour here maybe
    return pydantic_list_to_json(wardrobe.available_clothes[:4]), 200


@app.route("/clear_wardrobe")
def clear_wardrobe():
    Wardrobe(available_clothes=[]).save_clothes()
    return "Successfully cleared wardrobe", 200


@app.route("/remove_clothing")
def remove_clothing():
    clothing_metadata = request.form


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

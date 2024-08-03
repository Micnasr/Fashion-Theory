import os
import io
import shutil
import base64
import itertools

from flask import Flask, request, jsonify
from pydantic import BaseModel

from consts import CLOTHING_STORAGE_DIR, CLOTHING_METADATA_PATH, generate_random_path
from image_classes import Wardrobe, ClothingInfo, ClothesPart, Fit
from image_processing import remove_background, get_dominant_colors_with_percentage, calculate_complementarity_score

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

    if "category" not in request.form:
        return jsonify({"error": "No category part"}), 400

    category = request.form["category"]

    file_binary = file.read()
    output_image_bytes = remove_background(file_binary)

    # Create an image object from the byte data
    output_image = Image.open(io.BytesIO(output_image_bytes))

    # Save the result to a file path
    file_path = generate_random_path()
    output_image.save(file_path)

    rgbs_with_percent = get_dominant_colors_with_percentage(file_path)

    # TODO get clothes part from drop down menu
    clothing = ClothingInfo(path=file_path, rgbs=rgbs_with_percent, clothes_part=category)

    with Wardrobe.metadata_lock:
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


# @app.route("/get_fit")
# def get_fit():
#     wardrobe = Wardrobe.load_clothes()
#     # TODO fit algo here
#     # TODO take in colour here maybe
#     return pydantic_list_to_json(wardrobe.available_clothes[:4]), 200


@app.route("/clear_wardrobe")
def clear_wardrobe():
    with Wardrobe.metadata_lock:
        Wardrobe(available_clothes=[]).save_clothes()
        shutil.rmtree(CLOTHING_STORAGE_DIR)
    return "Successfully cleared wardrobe", 200


@app.route("/remove_clothing", methods=["POST"])
def remove_clothing():
    request_data = request.get_json()
    if "uuid" not in request_data:
        return jsonify({"error": "uuid identifier not found (required to remove clothing)"}), 400

    with Wardrobe.metadata_lock:
        wardrobe = Wardrobe.load_clothes()
        clothing_to_remove = wardrobe.get_clothing_by_uuid(request_data["uuid"])
        wardrobe.remove_clothing_from_wardrobe(clothing_to_remove.uuid)
        wardrobe.save_clothes()

        # Delete the file from the filesystem
        if os.path.exists(clothing_to_remove.path):
            os.remove(clothing_to_remove.path)

    return f"Successfully removed {request_data['uuid']} from wardrobe", 200


@app.route("/save_fav_fit", methods=["POST"])
def save_fav_fit():
    request_data = request.get_json()
    if "uuids" not in request_data:
        return jsonify({"error": "list of uuids not found (param required to save fit)"}), 400

    print(f"uuids: {request_data['uuids']}")

    with Wardrobe.metadata_lock:
        wardrobe = Wardrobe.load_clothes()
        print(f"wardrobe: {wardrobe}")
        print(f"available_clothes: {wardrobe.available_clothes}")
        clothes = list(map(lambda uuid: wardrobe.get_clothing_by_uuid(uuid), request_data["uuids"]))
        fit = Fit(clothes=clothes)
        wardrobe.favourite_fits.append(fit)
        wardrobe.save_clothes()
    return f"Successfully added fit {fit} to the list of favourite fits", 200


@app.route("/remove_fav_fit", methods=["POST"])
def remove_fav_fit():
    request_data = request.get_json()
    if "uuid" not in request_data:
        return jsonify({"error": "uuid identifier not found (required to remove favourite fit)"}), 400

    with Wardrobe.metadata_lock:
        wardrobe = Wardrobe.load_clothes()
        wardrobe.remove_fit_from_favourites(request_data["uuid"])
        wardrobe.save_clothes()
    return f"Successfully removed favourite fit {request_data['uuid']} from wardrobe", 200


@app.route("/get_rating", methods=["POST"])
def get_rating():
    request_data = request.get_json()
    if "uuids" not in request_data:
        return jsonify({"error": "uuids identifier not found (required to get clothes for rating)"}), 400

    if len(request_data["uuids"]) == 0:
        return

    wardrobe = Wardrobe.load_clothes()

    print(request_data["uuids"])

    fit_clothing = []
    for name in request_data["uuids"]:
        fit_clothing.append(wardrobe.get_clothing_by_uuid(name))

    percent = calculate_complementarity_score(Fit(clothes=fit_clothing))

    return jsonify({"rating": percent}), 200


@app.route("/get_image", methods=["POST"])
def get_image():
    request_data = request.get_json()
    if "uuid" not in request_data:
        return jsonify({"error": f"uuid identifier not found (required to get image - got {request_data})"}), 400

    wardrobe = Wardrobe.load_clothes()
    try:
        clothing = wardrobe.get_clothing_by_uuid(request_data["uuid"])
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    # Load the image and return it as a base64 encoded string
    with open(clothing.path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    return jsonify({"image": image_data}), 200


@app.route("/get_optimal_fit")
def get_optimal_fit():
    wardrobe = Wardrobe.load_clothes()

    optimal_fits: list[tuple[Fit, float]] = []

    # Get a list of all possible permutations of 3 or 4 clothes where no two clothes can be for the same body part
    tops = wardrobe.get_gear(ClothesPart.top)
    bottoms = wardrobe.get_gear(ClothesPart.bottom)
    upper_bodies = wardrobe.get_gear(ClothesPart.upper_body)
    lower_bodies = wardrobe.get_gear(ClothesPart.lower_body)

    clothing_combos4 = itertools.product(tops, bottoms, upper_bodies, lower_bodies)
    clothing_combos3 = itertools.product(bottoms, upper_bodies, lower_bodies)
    for combo in itertools.chain(clothing_combos4, clothing_combos3):
        fit = Fit(clothes=list(combo))
        score = calculate_complementarity_score(fit)
        if score > 0.5:
            optimal_fits.append((fit, score))

    optimal_fits.sort(key=lambda x: x[1], reverse=True)
    optimal_fits_ = list(map(lambda x: x[0], optimal_fits))
    optimal_clothes = optimal_fits_[0]
    uuids = list(map(lambda clothing: clothing.uuid, optimal_clothes.clothes))

    indices = [None] * 4
    if len(optimal_clothes.clothes) != 4:
        indices[0] = 0

    for clothing in optimal_clothes.clothes:
        if clothing.clothes_part == ClothesPart.top:
            indices[0] = tops.index(clothing)
        if clothing.clothes_part == ClothesPart.upper_body:
            indices[1] = upper_bodies.index(clothing)
        if clothing.clothes_part == ClothesPart.lower_body:
            indices[2] = lower_bodies.index(clothing)
        if clothing.clothes_part == ClothesPart.bottom:
            indices[3] = bottoms.index(clothing)

    return jsonify({"optimal_index_groups": indices, "uuids": uuids}), 200


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

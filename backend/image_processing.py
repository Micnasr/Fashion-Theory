import os
from uuid import uuid4


def generate_random_path() -> str:
    clothing_path = os.path.join(os.getcwd(), "clothes", str(uuid4()))
    os.makedirs(os.path.basename(clothing_path), exist_ok=True)
    return clothing_path

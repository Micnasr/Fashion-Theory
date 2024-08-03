from typing import Any, ClassVar
from enum import StrEnum
import json
import os

from pydantic import BaseModel, Field

from consts import CLOTHING_METADATA_PATH


class ClothesPart(StrEnum):
    top = "top"
    upper_body = "upper_body"
    lower_body = "lower_body"
    bottom = "bottom"


class ClothingInfo(BaseModel):
    clothes_part: ClothesPart
    avg_rgb: str
    path: str
    friendly_name: str = ""
    labels: list[str] = Field(default_factory=lambda: [])


class Wardrobe(BaseModel):
    available_clothes: list[ClothingInfo]

    def get_gear(self, clothes_part: ClothesPart) -> list[ClothingInfo]:
        return list(filter(lambda clothing: clothing.clothes_part == clothes_part, self.available_clothes))

    def get_clothing_by_name(self, friendly_name: str) -> list[ClothingInfo]:
        return list(filter(lambda clothing: clothing.friendly_name == friendly_name, self.available_clothes))

    def remove_clothing_from_wardrobe(self, friendly_name: str) -> None:
        """Remove clothes matching friendly_name from wardrobe object. Does not affect the metadata (call save_clothes to make changes permanent)"""
        self.available_clothes = list(filter(lambda clothing: clothing.friendly_name != friendly_name, self.available_clothes))

    def save_clothes(self) -> None:
        """Overwrite metadata json with clothes stored in the current object"""
        with open(CLOTHING_METADATA_PATH, "w") as f:
            f.write(self.model_dump_json())

    @staticmethod
    def load_clothes() -> "Wardrobe":
        """Get the wardrobe data from the metadata path, or create a blank wardrobe if the path does not exist"""
        if not os.path.exists(CLOTHING_METADATA_PATH):
            return Wardrobe(available_clothes=[])

        with open(CLOTHING_METADATA_PATH, "a") as f:
            clothing_metadata = json.load(f)

        return Wardrobe(**clothing_metadata)

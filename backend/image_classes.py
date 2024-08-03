from typing import Any, ClassVar, TypeAlias
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

RGB: TypeAlias = tuple[int, int, int]
RGBWithPercent: TypeAlias = tuple[RGB, float]

class ClothingInfo(BaseModel):
    clothes_part: ClothesPart
    rgbs: list[RGBWithPercent]
    path: str
    friendly_name: str = ""
    labels: list[str] = Field(default_factory=lambda: [])



class Fit(BaseModel):
    top: ClothingInfo
    upper_body: ClothingInfo
    lower_body: ClothingInfo
    bottom: ClothingInfo
    friendly_name: str

    def get_clothing(self) -> tuple[ClothingInfo, ClothingInfo, ClothingInfo, ClothingInfo]:
        return (self.top, self.upper_body, self.lower_body, self.bottom)


class Wardrobe(BaseModel):
    available_clothes: list[ClothingInfo]
    current_fit: Fit | None = None
    favourite_fits: list[Fit] = Field(default_factory=lambda: [])

    def get_gear(self, clothes_part: ClothesPart) -> list[ClothingInfo]:
        return list(filter(lambda clothing: clothing.clothes_part == clothes_part, self.available_clothes))

    def get_clothing_by_name(self, friendly_name: str) -> list[ClothingInfo]:
        return list(filter(lambda clothing: clothing.friendly_name == friendly_name, self.available_clothes))

    def remove_clothing_from_wardrobe(self, friendly_name: str) -> None:
        """Remove clothes matching friendly_name from wardrobe object. Does not affect the metadata (call save_clothes to make changes permanent)"""
        self.available_clothes = list(filter(lambda clothing: clothing.friendly_name != friendly_name, self.available_clothes))

        for fit in self.favourite_fits:
            for clothing in fit.get_clothing():
                if clothing.friendly_name == friendly_name:
                    self.favourite_fits.remove(fit)
                    break

    def save_clothes(self) -> None:
        """Overwrite metadata json with clothes stored in the current object"""
        with open(CLOTHING_METADATA_PATH, "w") as f:
            f.write(self.model_dump_json())

    @staticmethod
    def load_clothes() -> "Wardrobe":
        """Get the wardrobe data from the metadata path, or create a blank wardrobe if the path does not exist"""
        if not os.path.exists(CLOTHING_METADATA_PATH):
            return Wardrobe(available_clothes=[])

        # For when file exists but doesnt contain anything - json.load throws an exception if the file is empty
        with open(CLOTHING_METADATA_PATH, "r") as f:
            temp = f.read()
            if not temp:
                return Wardrobe(available_clothes=[])

        with open(CLOTHING_METADATA_PATH, "r") as f:
            clothing_metadata = json.load(f)

        return Wardrobe(**clothing_metadata)

from typing import Any, ClassVar, TypeAlias
from enum import StrEnum
import json
import os
from uuid import uuid4
from threading import Lock

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
    uuid: str = Field(default_factory=lambda: str(uuid4()))
    labels: list[str] = Field(default_factory=lambda: [])


class Fit(BaseModel):
    clothes: list[ClothingInfo]
    uuid: str = Field(default_factory=lambda: str(uuid4()))


class Wardrobe(BaseModel):
    metadata_lock: ClassVar[Lock] = Lock()
    available_clothes: list[ClothingInfo]
    # current_fit: Fit | None = None # shouldnt need to record this - frontend should get all info needed for current fit on the fly
    favourite_fits: list[Fit] = Field(default_factory=lambda: [])

    def get_gear(self, clothes_part: ClothesPart) -> list[ClothingInfo]:
        return list(filter(lambda clothing: clothing.clothes_part == clothes_part, self.available_clothes))

    def get_clothing_by_uuid(self, uuid: str) -> ClothingInfo:
        for clothing in self.available_clothes:
            if clothing.uuid == uuid:
                return clothing
        raise ValueError(f"Could not find clothing with uuid {uuid}")

    def remove_clothing_from_wardrobe(self, uuid: str) -> None:
        """Remove clothes matching uuid from wardrobe object. Does not affect the metadata json (call save_clothes to make changes permanent)"""
        self.available_clothes = list(filter(lambda clothing: clothing.uuid != uuid, self.available_clothes))

        for fit in self.favourite_fits:
            for clothing in fit.clothes:
                if clothing.uuid == uuid:
                    self.favourite_fits.remove(fit)
                    break

    def remove_fit_from_favourites(self, uuid: str) -> None:
        """Remove fit matching uuid from wardrobe object. Does not affect the metadata json (call save_clothes to make changes permanent)"""
        self.favourite_fits = list(filter(lambda fit: fit.uuid != uuid, self.favourite_fits))

    def save_clothes(self) -> None:
        """Overwrite metadata json with clothes stored in the current object"""
        with open(CLOTHING_METADATA_PATH, "w") as f:
            f.write(self.model_dump_json(indent=2))

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

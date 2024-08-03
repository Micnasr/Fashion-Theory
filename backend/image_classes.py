from typing import Any
from enum import StrEnum

from pydantic import BaseModel, Field


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

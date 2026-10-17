import json
from pathlib import Path

from pydantic import BaseModel, Field, TypeAdapter

DATA_FILE = Path(__file__).parent / "data" / "cuisines.json"


class Cuisine(BaseModel):
    country_code: str = Field(pattern=r"^[A-Z]{2}$")
    name_ja: str
    search_keyword: str


with DATA_FILE.open(encoding="utf-8") as source:
    cuisines = TypeAdapter(list[Cuisine]).validate_python(json.load(source))

CUISINES_BY_COUNTRY = {cuisine.country_code: cuisine for cuisine in cuisines}
if len(CUISINES_BY_COUNTRY) != len(cuisines):
    raise ValueError("Cuisine country codes must be unique")

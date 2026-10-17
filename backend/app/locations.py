import json
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, HTTPException, Path as ApiPath
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api", tags=["locations"])
DATA_DIR = Path(__file__).parent / "data"


class Country(BaseModel):
    code: str = Field(pattern=r"^[A-Z]{2}$")
    name_ja: str
    name_en: str
    flag: str
    supported: bool
    has_regions: bool


class CountryListResponse(BaseModel):
    default_country: str = Field(pattern=r"^[A-Z]{2}$")
    countries: list[Country]


class Region(BaseModel):
    code: str = Field(pattern=r"^[A-Z]{2}-[A-Z0-9]{1,3}$")
    name_ja: str
    name_en: str


class RegionListResponse(BaseModel):
    country_code: str = Field(pattern=r"^[A-Z]{2}$")
    region_type: str
    regions: list[Region]


def _load_json(filename: str) -> object:
    with (DATA_DIR / filename).open(encoding="utf-8") as source:
        return json.load(source)


country_catalog = CountryListResponse.model_validate(_load_json("countries.json"))
region_catalogs = {
    "JP": RegionListResponse.model_validate(_load_json("jp_prefectures.json")),
}
countries_by_code = {country.code: country for country in country_catalog.countries}


@router.get("/countries", response_model=CountryListResponse)
def list_countries() -> CountryListResponse:
    """選択可能な国と、現在の対応状況を返します。"""
    return country_catalog


@router.get("/countries/{country_code}/regions", response_model=RegionListResponse)
def list_regions(
    country_code: Annotated[str, ApiPath(min_length=2, max_length=2)],
) -> RegionListResponse:
    """国の地域一覧を返します。日本の場合は47都道府県です。"""
    normalized_code = country_code.upper()
    country = countries_by_code.get(normalized_code)
    if country is None:
        raise HTTPException(status_code=404, detail="指定された国は見つかりません。")

    regions = region_catalogs.get(normalized_code)
    if not country.has_regions or regions is None:
        raise HTTPException(status_code=404, detail="この国の地域情報はまだありません。")
    return regions

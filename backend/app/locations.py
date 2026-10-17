import gettext
import json
from pathlib import Path
from typing import Annotated

import pycountry
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


def _flag_emoji(country_code: str) -> str:
    return "".join(chr(ord(character) + 127397) for character in country_code)


def _build_country_catalog() -> CountryListResponse:
    settings = _load_json("countries.json")
    if not isinstance(settings, dict):
        raise ValueError("countries.json must contain an object")

    member_codes_source = _load_json("un_member_country_codes.json")
    if not isinstance(member_codes_source, list) or not all(
        isinstance(code, str) for code in member_codes_source
    ):
        raise ValueError("un_member_country_codes.json must contain a string array")
    member_codes = set(member_codes_source)
    if len(member_codes) != 193:
        raise ValueError("UN member country codes must contain 193 unique entries")

    default_country = settings.get("default_country")
    country_settings = settings.get("settings", {})
    if not isinstance(country_settings, dict):
        raise ValueError("countries.json settings must contain an object")

    japanese = gettext.translation(
        "iso3166-1",
        pycountry.LOCALES_DIR,
        languages=["ja"],
        fallback=True,
    )
    countries = []
    for source in pycountry.countries:
        code = source.alpha_2
        if code not in member_codes:
            continue
        overrides = country_settings.get(code, {})
        countries.append(
            Country(
                code=code,
                name_ja=japanese.gettext(source.name),
                name_en=source.name,
                flag=getattr(source, "flag", _flag_emoji(code)),
                supported=bool(overrides.get("supported", False)),
                has_regions=bool(overrides.get("has_regions", False)),
            )
        )

    countries.sort(key=lambda country: (country.code != default_country, country.name_ja))
    if len(countries) != len(member_codes):
        raise ValueError("Some UN member country codes are missing from ISO 3166 data")
    return CountryListResponse(
        default_country=default_country,
        countries=countries,
    )


country_catalog = _build_country_catalog()
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

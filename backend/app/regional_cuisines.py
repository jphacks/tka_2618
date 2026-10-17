import json
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"


def _load_json(filename: str) -> object:
    with (DATA_DIR / filename).open(encoding="utf-8") as source:
        return json.load(source)


def _prefecture_codes() -> set[str]:
    source = _load_json("jp_prefectures.json")
    if not isinstance(source, dict) or not isinstance(source.get("regions"), list):
        raise ValueError("jp_prefectures.json must contain a regions array")

    codes = {
        region["code"]
        for region in source["regions"]
        if isinstance(region, dict) and isinstance(region.get("code"), str)
    }
    if len(codes) != 47:
        raise ValueError("jp_prefectures.json must contain 47 unique prefecture codes")
    return codes


def _build_regional_cuisines() -> dict[str, tuple[str, ...]]:
    source = _load_json("jp_regional_cuisines.json")
    if not isinstance(source, dict):
        raise ValueError("jp_regional_cuisines.json must contain an object")

    expected_codes = _prefecture_codes()
    if set(source) != expected_codes:
        raise ValueError("Regional cuisine codes must exactly match Japanese prefecture codes")

    catalog: dict[str, tuple[str, ...]] = {}
    for code, keywords in source.items():
        if (
            not isinstance(keywords, list)
            or not 2 <= len(keywords) <= 3
            or not all(isinstance(keyword, str) and keyword.strip() for keyword in keywords)
        ):
            raise ValueError(f"{code} must define two or three non-empty cuisine keywords")
        normalized = tuple(keyword.strip() for keyword in keywords)
        if len(set(normalized)) != len(normalized):
            raise ValueError(f"{code} cuisine keywords must be unique")
        catalog[code] = normalized
    return catalog


REGIONAL_CUISINES = _build_regional_cuisines()

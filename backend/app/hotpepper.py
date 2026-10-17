import math
import os
from typing import Annotated

import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.cuisines import CUISINES_BY_COUNTRY
from app.locations import region_catalogs

router = APIRouter(prefix="/api", tags=["restaurants"])
HOTPEPPER_URL = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/"
NEARBY_RADIUS_METERS = 3000


class NearbyRestaurant(BaseModel):
    id: str
    name: str
    distance_m: int
    address: str | None
    lat: float
    lng: float
    genre: str | None
    image_url: str | None
    detail_url: str | None


class NearbyRestaurantResponse(BaseModel):
    country_code: str
    cuisine_name: str
    region_code: str | None = None
    search_keyword: str
    radius_m: int
    restaurants: list[NearbyRestaurant]


async def _request_hotpepper(params: dict[str, object]) -> dict:
    api_key = os.environ.get("HOTPEPPER_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="HOTPEPPER_API_KEY が設定されていません。")

    request_params = {"key": api_key, **params, "format": "json"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(HOTPEPPER_URL, params=request_params)
            response.raise_for_status()
            payload = response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="店舗検索がタイムアウトしました。") from None
    except (httpx.HTTPError, ValueError):
        raise HTTPException(status_code=502, detail="店舗検索サービスに接続できませんでした。") from None

    results = payload.get("results") if isinstance(payload, dict) else None
    if not isinstance(results, dict) or "error" in results or not isinstance(results.get("shop"), list):
        # 上流のエラー本文やリクエストURLにはキーが含まれる可能性があるため返さない。
        raise HTTPException(status_code=502, detail="店舗検索サービスでエラーが発生しました。APIキーの設定を確認してください。")
    return results


def _distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> int:
    earth_radius_m = 6_371_000
    lat1_rad, lat2_rad = math.radians(lat1), math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    haversine = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
    )
    return round(earth_radius_m * 2 * math.atan2(math.sqrt(haversine), math.sqrt(1 - haversine)))


def _nested_text(value: object, *keys: str) -> str | None:
    for key in keys:
        if not isinstance(value, dict):
            return None
        value = value.get(key)
    return value if isinstance(value, str) and value else None


@router.get("/restaurants")
async def search_restaurants(
    keyword: Annotated[str, Query(min_length=1, max_length=100)],
    count: Annotated[int, Query(ge=1, le=100)] = 10,
    start: Annotated[int, Query(ge=1)] = 1,
) -> dict:
    """ホットペッパーグルメをキーワードで検索します。APIキーはサーバーで管理します。"""
    keyword = keyword.strip()
    if not keyword:
        raise HTTPException(status_code=422, detail="検索キーワードを入力してください。")
    results = await _request_hotpepper(
        {"keyword": keyword, "count": count, "start": start}
    )
    return {
        "results_available": results.get("results_available", 0),
        "results_start": results.get("results_start", start),
        "shops": results["shop"],
    }


@router.get("/restaurants/nearby", response_model=NearbyRestaurantResponse)
async def search_nearby_restaurants(
    country_code: Annotated[str, Query(min_length=2, max_length=2)],
    lat: Annotated[float, Query(ge=-90, le=90)],
    lng: Annotated[float, Query(ge=-180, le=180)],
    count: Annotated[int, Query(ge=1, le=100)] = 30,
    region_code: Annotated[str | None, Query(pattern=r"^[Jj][Pp]-[0-9]{2}$")] = None,
) -> NearbyRestaurantResponse:
    """選択した国の料理を、現在地から3km以内で検索します。"""
    normalized_code = country_code.upper()
    cuisine = CUISINES_BY_COUNTRY.get(normalized_code)
    if cuisine is None:
        raise HTTPException(status_code=422, detail="この国の料理検索にはまだ対応していません。")

    keyword = cuisine.search_keyword
    cuisine_name = cuisine.name_ja
    normalized_region = region_code.upper() if region_code else None
    if normalized_region:
        region = next((item for item in region_catalogs["JP"].regions if item.code == normalized_region), None)
        if normalized_code != "JP" or region is None:
            raise HTTPException(status_code=422, detail="日本の都道府県を指定してください。")
        # 店舗の所在地ではなく料理のキーワードを変える。検索中心は常に現在地。
        area_name = region.name_ja if region.name_ja == "北海道" else region.name_ja[:-1]
        keyword = "京料理" if normalized_region == "JP-26" else f"{area_name}料理"
        cuisine_name = f"{region.name_ja}の郷土料理"

    results = await _request_hotpepper(
        {
            "keyword": keyword,
            "lat": lat,
            "lng": lng,
            "range": 5,
            "order": 4,
            "count": count,
            "start": 1,
        }
    )
    restaurants = []
    for shop in results["shop"]:
        if not isinstance(shop, dict):
            continue
        try:
            shop_lat = float(shop["lat"])
            shop_lng = float(shop["lng"])
        except (KeyError, TypeError, ValueError):
            continue

        distance_m = _distance_meters(lat, lng, shop_lat, shop_lng)
        if distance_m > NEARBY_RADIUS_METERS:
            continue
        shop_id = shop.get("id")
        name = shop.get("name")
        if not isinstance(shop_id, str) or not isinstance(name, str):
            continue
        restaurants.append(
            NearbyRestaurant(
                id=shop_id,
                name=name,
                distance_m=distance_m,
                address=shop.get("address") if isinstance(shop.get("address"), str) else None,
                lat=shop_lat,
                lng=shop_lng,
                genre=_nested_text(shop.get("genre"), "name"),
                image_url=_nested_text(shop.get("photo"), "mobile", "l"),
                detail_url=_nested_text(shop.get("urls"), "pc"),
            )
        )

    restaurants.sort(key=lambda restaurant: restaurant.distance_m)
    return NearbyRestaurantResponse(
        country_code=normalized_code,
        cuisine_name=cuisine_name,
        region_code=normalized_region,
        search_keyword=keyword,
        radius_m=NEARBY_RADIUS_METERS,
        restaurants=restaurants,
    )

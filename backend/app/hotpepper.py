import os
from typing import Annotated

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api", tags=["restaurants"])
HOTPEPPER_URL = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/"


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
    api_key = os.environ.get("HOTPEPPER_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="HOTPEPPER_API_KEY が設定されていません。")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                HOTPEPPER_URL,
                params={"key": api_key, "keyword": keyword, "count": count, "start": start, "format": "json"},
            )
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
    return {
        "results_available": results.get("results_available", 0),
        "results_start": results.get("results_start", start),
        "shops": results["shop"],
    }

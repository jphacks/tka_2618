import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_missing_key(monkeypatch):
    monkeypatch.delenv("HOTPEPPER_API_KEY", raising=False)
    assert client.get("/api/restaurants", params={"keyword": "新宿"}).status_code == 503


@pytest.mark.parametrize("params", [{}, {"keyword": " "}, {"keyword": "新宿", "count": 101}, {"keyword": "新宿", "start": 0}])
def test_invalid_query(params):
    assert client.get("/api/restaurants", params=params).status_code == 422


def test_search(monkeypatch):
    monkeypatch.setenv("HOTPEPPER_API_KEY", "test-secret")

    async def fake_get(self, url, *, params):
        assert url.startswith("https://")
        assert params == {"key": "test-secret", "keyword": "新宿", "count": 10, "start": 1, "format": "json"}
        return httpx.Response(200, request=httpx.Request("GET", url), json={
            "results": {"results_available": 1, "results_start": 1, "shop": [{"id": "J001", "name": "テスト店舗"}]}
        })

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    response = client.get("/api/restaurants", params={"keyword": "新宿"})
    assert response.status_code == 200
    assert response.json()["shops"][0]["name"] == "テスト店舗"
    assert "test-secret" not in response.text


def test_nearby_restaurants(monkeypatch):
    monkeypatch.setenv("HOTPEPPER_API_KEY", "test-secret")

    async def fake_get(self, url, *, params):
        assert url.startswith("https://")
        assert params == {
            "key": "test-secret",
            "keyword": "イタリアン",
            "lat": 35.6812,
            "lng": 139.7671,
            "range": 5,
            "order": 4,
            "count": 30,
            "start": 1,
            "format": "json",
        }
        return httpx.Response(200, request=httpx.Request("GET", url), json={
            "results": {
                "results_available": 2,
                "results_start": 1,
                "shop": [
                    {
                        "id": "J001",
                        "name": "近くのイタリアン",
                        "address": "東京都千代田区",
                        "lat": 35.682,
                        "lng": 139.768,
                        "genre": {"name": "イタリアン・フレンチ"},
                        "photo": {"mobile": {"l": "https://example.com/photo.jpg"}},
                        "urls": {"pc": "https://example.com/shop"},
                    },
                    {
                        "id": "J002",
                        "name": "範囲外の店舗",
                        "lat": 35.7212,
                        "lng": 139.7671,
                    },
                ],
            }
        })

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    response = client.get(
        "/api/restaurants/nearby",
        params={"country_code": "it", "lat": 35.6812, "lng": 139.7671},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["country_code"] == "IT"
    assert payload["cuisine_name"] == "イタリア料理"
    assert payload["radius_m"] == 3000
    assert len(payload["restaurants"]) == 1
    assert payload["restaurants"][0]["id"] == "J001"
    assert payload["restaurants"][0]["distance_m"] < 200


def test_nearby_restaurants_rejects_unsupported_cuisine(monkeypatch):
    monkeypatch.setenv("HOTPEPPER_API_KEY", "test-secret")

    response = client.get(
        "/api/restaurants/nearby",
        params={"country_code": "DE", "lat": 35.6812, "lng": 139.7671},
    )

    assert response.status_code == 422
    assert response.json() == {"detail": "この国の料理検索にはまだ対応していません。"}


@pytest.mark.parametrize(
    "params",
    [
        {"country_code": "IT", "lat": 91, "lng": 139},
        {"country_code": "IT", "lat": 35, "lng": 181},
        {"country_code": "ITA", "lat": 35, "lng": 139},
    ],
)
def test_nearby_restaurants_validates_location(params):
    assert client.get("/api/restaurants/nearby", params=params).status_code == 422


@pytest.mark.parametrize("failure, status", [("timeout", 504), ("http", 502), ("api", 502), ("json", 502)])
def test_upstream_failure(monkeypatch, failure, status):
    monkeypatch.setenv("HOTPEPPER_API_KEY", "test-secret")

    async def fake_get(self, url, *, params):
        if failure == "timeout":
            raise httpx.ReadTimeout("test-secret")
        request = httpx.Request("GET", url)
        if failure == "http":
            return httpx.Response(500, request=request)
        if failure == "json":
            return httpx.Response(200, request=request, text="invalid")
        return httpx.Response(200, request=request, json={"results": {"error": [{"message": "test-secret"}]}})

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    response = client.get("/api/restaurants", params={"keyword": "新宿"})
    assert response.status_code == status
    assert "test-secret" not in response.text

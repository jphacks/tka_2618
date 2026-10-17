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

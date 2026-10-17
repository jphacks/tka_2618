from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_countries():
    response = client.get("/api/countries")

    assert response.status_code == 200
    payload = response.json()
    assert payload["default_country"] == "JP"
    assert len(payload["countries"]) == 193
    assert len({country["code"] for country in payload["countries"]}) == 193
    assert payload["countries"][0] == {
        "code": "JP",
        "name_ja": "日本",
        "name_en": "Japan",
        "flag": "🇯🇵",
        "supported": True,
        "has_regions": True,
    }
    assert {"KR", "US", "FR", "BR", "AU"}.issubset(
        {country["code"] for country in payload["countries"]}
    )
    assert {"VA", "PS", "HK", "AQ"}.isdisjoint(
        {country["code"] for country in payload["countries"]}
    )
    assert [country["code"] for country in payload["countries"] if country["supported"]] == ["JP"]


def test_list_japanese_prefectures():
    response = client.get("/api/countries/JP/regions")

    assert response.status_code == 200
    payload = response.json()
    assert payload["country_code"] == "JP"
    assert payload["region_type"] == "prefecture"
    assert len(payload["regions"]) == 47
    assert len({region["code"] for region in payload["regions"]}) == 47
    assert payload["regions"][0]["name_ja"] == "北海道"
    assert payload["regions"][12] == {
        "code": "JP-13",
        "name_ja": "東京都",
        "name_en": "Tokyo",
    }
    assert payload["regions"][-1]["name_ja"] == "沖縄県"


def test_country_code_is_case_insensitive():
    response = client.get("/api/countries/jp/regions")

    assert response.status_code == 200
    assert response.json()["country_code"] == "JP"


def test_country_without_region_data():
    response = client.get("/api/countries/US/regions")

    assert response.status_code == 404
    assert response.json() == {"detail": "この国の地域情報はまだありません。"}


def test_unknown_country():
    response = client.get("/api/countries/ZZ/regions")

    assert response.status_code == 404
    assert response.json() == {"detail": "指定された国は見つかりません。"}


def test_invalid_country_code_length():
    assert client.get("/api/countries/JPN/regions").status_code == 422

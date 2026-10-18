# Prefecture Cuisine Search Specification

## Purpose

The existing prefecture search derives one keyword from the prefecture name, such as `青森料理`. Restaurant listings often use the name of a local dish instead, so a valid nearby restaurant can be missed. This change assigns ordered cuisine keywords to every Japanese prefecture and combines nearby results from those keywords.

The feature searches for the selected prefecture's food around the user's current location. It must never move the geographic search center to the selected prefecture.

## Scope

- Add curated cuisine keywords for all 47 prefectures.
- Use those keywords when `GET /api/restaurants/nearby` receives `country_code=JP` and a valid `region_code`.
- Preserve the existing behavior for searches without `region_code` and for countries other than Japan.
- Preserve the existing mobile response contract. No screen or navigation changes are required.

## Data Contract

Create `backend/app/data/jp_regional_cuisines.json` with this structure:

```json
{
  "JP-01": ["北海道料理", "ジンギスカン", "スープカレー"]
}
```

Requirements:

- The object contains exactly the 47 codes present in `jp_prefectures.json`.
- Each code has two or three ordered, non-empty, unique keywords.
- The first keyword is a broad regional cuisine term where practical.
- Later keywords are representative dishes used as fallbacks.
- Invalid or incomplete data prevents application startup with a descriptive `ValueError`.

## Search Behavior

For a valid Japanese `region_code`:

1. Resolve the prefecture and its ordered keyword list before calling the upstream API.
2. Call the Hot Pepper Gourmet Search API once per keyword, in order.
3. Send the original `lat`, `lng`, radius, ordering, and count parameters with every call.
4. Convert only shops with valid identifiers, names, latitude, and longitude.
5. Exclude shops farther than 3,000 meters from the original current location.
6. Deduplicate shops by Hot Pepper shop ID across keyword responses.
7. Stop before the next keyword when the requested number of unique nearby shops has been collected.
8. Sort the combined shops by distance and return at most the requested `count`.

For a search without `region_code`, make exactly one upstream request with the existing country cuisine keyword.

## Response Contract

The existing response fields remain available:

- `country_code`: normalized uppercase country code.
- `region_code`: normalized uppercase prefecture code or `null`.
- `cuisine_name`: `<都道府県名>の郷土料理` for prefecture searches.
- `search_keyword`: attempted keywords joined with `、`, in request order. Country searches return the existing single keyword.
- `radius_m`: `3000`.
- `restaurants`: deduplicated distance-ordered results, limited to `count`.

## Error Handling

- Reject a prefecture code when `country_code` is not `JP`.
- Reject a Japanese prefecture code that is absent from the prefecture catalog.
- Do not call the upstream API for invalid selections.
- Preserve the existing `503`, `504`, and `502` handling for missing credentials and upstream failures.
- If any required upstream keyword request fails, return that failure rather than returning an incomplete successful response.

## Verification

Automated tests must verify:

- All 47 prefectures have valid keyword definitions.
- The current coordinates remain unchanged for every keyword request.
- Multiple keyword results are combined, deduplicated, sorted, and limited.
- Additional keyword requests stop once `count` unique nearby results exist.
- Non-prefecture searches still make one request and keep their response behavior.
- Invalid prefecture selections never reach the upstream API.

## Implementation Rationale

Separate upstream requests are used because combining cuisine names into one free-text keyword can narrow the query as an AND search and hide valid restaurants. Ordered fallback requests keep each query understandable, allow early stopping, and avoid an unbounded number of upstream calls. A separate data file keeps regional knowledge out of endpoint logic and makes keyword changes reviewable without changing search code.

## Self-Review

Score: **96/100**

- The endpoint inputs, output fields, ordering, limit, deduplication key, radius, fallback sequence, and failures are deterministic.
- The data completeness and validation requirements cover all 47 prefectures.
- The specification explicitly preserves current-location semantics and existing non-prefecture behavior.
- The remaining uncertainty is the quality of individual Hot Pepper listing text; this is external data and is addressed with ordered fallback keywords rather than an implementation ambiguity.

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Prefecture, SearchCountry } from '../data/searchApi';

const CACHE_VERSION = 1;
const COUNTRY_CACHE_KEY = '@jphack/location-catalog/countries/v1';
const PREFECTURE_CACHE_KEY = '@jphack/location-catalog/prefectures/v1';

type CatalogPayload<Item> = {
  version: number;
  updatedAt: string;
  items: Item[];
};

function isCountry(item: SearchCountry) {
  return typeof item?.code === 'string'
    && item.code.length > 0
    && typeof item.name_ja === 'string'
    && item.name_ja.length > 0
    && typeof item.flag === 'string'
    && typeof item.cuisine_supported === 'boolean';
}

function isPrefecture(item: Prefecture) {
  return typeof item?.code === 'string'
    && item.code.length > 0
    && typeof item.name_ja === 'string'
    && item.name_ja.length > 0;
}

async function readCatalog<Item>(
  key: string,
  validateItem: (item: Item) => boolean,
): Promise<Item[] | null> {
  const stored = await AsyncStorage.getItem(key);
  if (!stored) return null;
  try {
    const payload = JSON.parse(stored) as CatalogPayload<Item>;
    if (payload.version !== CACHE_VERSION
      || typeof payload.updatedAt !== 'string'
      || !Array.isArray(payload.items)
      || !payload.items.every(validateItem)) return null;
    return payload.items;
  } catch {
    return null;
  }
}

async function writeCatalog<Item>(key: string, items: Item[]) {
  const payload: CatalogPayload<Item> = {
    version: CACHE_VERSION,
    updatedAt: new Date().toISOString(),
    items,
  };
  await AsyncStorage.setItem(key, JSON.stringify(payload));
}

export function getCachedCountries() {
  return readCatalog(COUNTRY_CACHE_KEY, isCountry);
}

export function saveCountries(items: SearchCountry[]) {
  return writeCatalog(COUNTRY_CACHE_KEY, items);
}

export function getCachedPrefectures() {
  return readCatalog(PREFECTURE_CACHE_KEY, isPrefecture);
}

export function savePrefectures(items: Prefecture[]) {
  return writeCatalog(PREFECTURE_CACHE_KEY, items);
}

// Web 版のローカル保存先です。
// 撮影写真は data URI（base64）で保存されるため、約5MBで上限に達する localStorage（AsyncStorage）ではなく、
// 容量の大きい IndexedDB に文字列として保存します。IndexedDB が使えないブラウザでは AsyncStorage に戻します。

import AsyncStorage from '@react-native-async-storage/async-storage';

const DATABASE_NAME = 'jphack-local-storage';
const DATABASE_VERSION = 1;
const STORE_NAME = 'key_value';

let databasePromise: Promise<IDBDatabase | null> | null = null;

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise(resolve => {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });
  }
  return databasePromise;
}

function runRequest<T>(database: IDBDatabase, mode: IDBTransactionMode, start: (store: IDBObjectStore) => IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = start(transaction.objectStore(STORE_NAME));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error ?? request.error);
    transaction.onabort = () => reject(transaction.error ?? request.error);
  });
}

export async function getWebItem(key: string): Promise<string | null> {
  const database = await openDatabase();
  if (!database) return AsyncStorage.getItem(key);

  const stored = await runRequest<string | undefined>(database, 'readonly', store => store.get(key));
  if (typeof stored === 'string') return stored;

  // 以前 localStorage に保存したデータは初回読み込み時に移し、localStorage の容量を空ける。
  const legacy = await AsyncStorage.getItem(key);
  if (legacy === null) return null;
  await runRequest(database, 'readwrite', store => store.put(legacy, key));
  await AsyncStorage.removeItem(key);
  return legacy;
}

export async function setWebItem(key: string, value: string) {
  const database = await openDatabase();
  if (!database) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await runRequest(database, 'readwrite', store => store.put(value, key));
}

export async function removeWebItem(key: string) {
  const database = await openDatabase();
  if (database) await runRequest(database, 'readwrite', store => store.delete(key));
  await AsyncStorage.removeItem(key);
}

// IndexedDB Audio Caching Utility for Afghan Bandi
// Allows offline playback of any audio chapters that have been played or downloaded

const DB_NAME = 'AfghanBandiAudioCache';
const DB_VERSION = 1;
const STORE_NAME = 'audio_blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export interface CachedAudioEntry {
  id: string; // post ID
  blob: Blob;
  size: number;
  mimeType: string;
  cachedAt: string;
}

/**
 * Checks if a specific audio post is cached in IndexedDB
 */
export async function isAudioCached(postId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(postId);
      req.onsuccess = () => {
        resolve(!!(req.result && req.result.blob));
      };
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Retrieves a Blob Object URL for a cached audio post
 */
export async function getCachedAudioUrl(postId: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(postId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          const blobUrl = URL.createObjectURL(req.result.blob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('Error retrieving cached audio:', e);
    return null;
  }
}

/**
 * Fetches an audio file from URL and saves it into IndexedDB for offline playback
 */
export async function saveAudioToCache(postId: string, audioUrl: string): Promise<boolean> {
  try {
    if (!audioUrl || audioUrl.startsWith('blob:')) return true;

    // Check if already cached first
    const alreadyCached = await isAudioCached(postId);
    if (alreadyCached) return true;

    const response = await fetch(audioUrl, { mode: 'cors' });
    if (!response.ok) return false;
    const blob = await response.blob();

    // Verify blob is valid
    if (blob.size < 1000) return false; // Ignore empty or invalid tiny responses

    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const entry: CachedAudioEntry = {
        id: postId,
        blob: blob,
        size: blob.size,
        mimeType: blob.type || 'audio/mpeg',
        cachedAt: new Date().toISOString(),
      };
      const req = store.put(entry);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (e) {
    console.warn('Failed to cache audio file for offline usage:', e);
    return false;
  }
}

/**
 * Returns a list of all post IDs that are cached locally for offline playback
 */
export async function getAllCachedAudioIds(): Promise<string[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAllKeys();
      req.onsuccess = () => resolve((req.result as string[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Deletes a cached audio entry
 */
export async function removeAudioFromCache(postId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(postId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

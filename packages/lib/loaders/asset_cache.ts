const CACHE_NAME = 'dspbr-pt-assets-v1';
const pendingFetches = new Map<string, Promise<Response>>();

function isCacheAvailable(): boolean {
  return typeof globalThis.caches !== 'undefined' && typeof globalThis.Request !== 'undefined';
}

function getCacheKey(url: string): string | null {
  try {
    const base = typeof globalThis.location !== 'undefined' ? globalThis.location.href : undefined;
    const parsed = new URL(url, base);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function canCacheRequest(init?: RequestInit): boolean {
  return !init?.method || init.method.toUpperCase() === 'GET';
}

export async function fetchCachedAsset(url: string, init?: RequestInit): Promise<Response> {
  const cacheKey = getCacheKey(url);
  if (!cacheKey || !canCacheRequest(init) || !isCacheAvailable()) {
    return fetch(url, init);
  }

  let cache: Cache;
  let request: Request;
  try {
    cache = await caches.open(CACHE_NAME);
    request = new Request(cacheKey);
    const cached = await cache.match(request);
    if (cached) return cached;
  } catch (error) {
    console.warn('Asset cache unavailable; falling back to network fetch.', error);
    return fetch(url, init);
  }

  const pending = pendingFetches.get(cacheKey);
  if (pending) return (await pending).clone();

  const networkFetch = fetch(url, init)
    .then(async response => {
      try {
        if (response.ok) {
          await cache.put(request, response.clone());
        }
      } catch (error) {
        console.warn('Asset cache write failed; using network response.', error);
      }
      return response;
    })
    .finally(() => {
      pendingFetches.delete(cacheKey);
    });

  pendingFetches.set(cacheKey, networkFetch);
  return (await networkFetch).clone();
}

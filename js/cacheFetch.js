/**
 * @file cacheFetch.js
 * @description An enhanced fetch utility with built-in caching, data compression,
 * namespace support, and automatic fallback from localStorage to sessionStorage.
 */

// Note: This module assumes the LZ-String library (lz-string.js) is loaded globally.
// It is used for compressing cached data to save space in web storage.

/**
 * Retrieves an item from localStorage, falling back to sessionStorage if localStorage fails or is unavailable.
 * @param {string} key - The key of the item to retrieve.
 * @returns {string|null} The stored item, or null if not found.
 */
const getStorageItem = key => {
  try {
    // Prefer localStorage for persistence across sessions.
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch (e) {
    // If localStorage is blocked (e.g., private browsing), use sessionStorage.
    return sessionStorage.getItem(key);
  }
};

/**
 * Sets an item in localStorage, falling back to sessionStorage if localStorage fails.
 * @param {string} key - The key of the item to set.
 * @param {string} value - The value to store.
 */
const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(
      `[cacheFetch] localStorage failed, falling back to sessionStorage:`,
      e
    );
    sessionStorage.setItem(key, value);
  }
};

/**
 * Fetches a resource from a URL and caches the response in web storage.
 * Returns the cached data if it's valid and not expired.
 *
 * @param {object} options - The configuration object for the fetch operation.
 * @param {string} options.url - The URL to fetch.
 * @param {string} options.cacheKey - A unique key to identify the cached data.
 * @param {string} [options.namespace=''] - A namespace to prevent key collisions.
 * @param {number} [options.cacheDuration=3600000] - Cache duration in milliseconds (default: 1 hour).
 * @param {boolean} [options.forceRefresh=false] - If true, bypasses the cache and forces a new fetch.
 * @param {function(any): boolean} [options.validate=null] - A function to validate the cached or fetched data.
 * @returns {Promise<any>} A promise that resolves with the JSON data.
 * @throws Will throw an error if the fetch fails or if validation fails on new data.
 */
export async function cacheFetch ({
  url,
  cacheKey,
  namespace = '',
  cacheDuration = 3600000,
  forceRefresh = false,
  validate = null
}) {
  // Ensure required parameters are provided.
  if (!url || !cacheKey) {
    throw new Error('[cacheFetch] `url` and `cacheKey` are required parameters.');
  }

  const now = Date.now()
  // Create namespaced keys for the data and its expiry timestamp.
  const fullKey = `${namespace}_${cacheKey}`
  const expiryKey = `${fullKey}_expiry`

  // 1. Try to retrieve from cache unless a refresh is forced.
  if (!forceRefresh) {
    const cached = getStorageItem(fullKey)
    const expiry = getStorageItem(expiryKey)

    // Check if cached data exists and has not expired.
    if (cached && expiry && now < parseInt(expiry)) {
      try {
        let data
        // Decompress the data if it was stored with LZ-String.
        if (cached.startsWith('lz:')) {
          const decompressed = LZString.decompressFromUTF16(cached.slice(3))
          data = JSON.parse(decompressed)
        } else {
          data = JSON.parse(cached)
        }
        // If a validation function is provided, run it on the cached data.
        if (validate && !validate(data)) throw new Error('Validation failed')
        return data
      } catch (err) {
        console.warn('[cacheFetch] Invalid cached data, refetching:', err)
      }
    }
  }

  // 2. If cache is invalid, expired, or bypassed, fetch new data.
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
    const data = await response.json()

    // Validate the newly fetched data before caching.
    if (validate && !validate(data)) throw new Error('Validation failed')

    // Compress the JSON data to save space in web storage.
    const compressed = LZString.compressToUTF16(JSON.stringify(data))
    const sizeInKB = (compressed.length * 2) / 1024
    console.log(
      `[cacheFetch] Compressed size for ${fullKey}: ${sizeInKB.toFixed(2)} KB`
    )

    // Store the compressed data with a prefix and set its expiry time.
    setStorageItem(fullKey, 'lz:' + compressed)
    setStorageItem(expiryKey, now + cacheDuration)

    return data
  } catch (error) {
    console.error('[cacheFetch] Fetch error:', error)
    throw error
  }
}

/**
 * Checks if a specific cache key is still valid (i.e., has not expired).
 * @param {object} options - The configuration object.
 * @param {string} options.cacheKey - The unique key to check.
 * @param {string} [options.namespace=''] - The namespace for the key.
 * @returns {boolean} True if the cache is still valid, false otherwise.
 */
export function isCacheValid ({ cacheKey, namespace = '' }) {
  const fullKey = `${namespace}_${cacheKey}`
  const expiry = getStorageItem(`${fullKey}_expiry`)
  return expiry && Date.now() < parseInt(expiry)
}
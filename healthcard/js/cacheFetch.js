// js/cacheFetch.js

export async function cacheFetch ({
  url,
  cacheKey,
  cacheDuration = 3600000, // default: 1 hour
  forceRefresh = false
}) {
  const now = Date.now()
  const expiryKey = `${cacheKey}_expiry`

  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey)
    const expiry = localStorage.getItem(expiryKey)

    if (cached && expiry && now < parseInt(expiry)) {
      return JSON.parse(cached)
    }
  }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
    const data = await response.json()

    localStorage.setItem(cacheKey, JSON.stringify(data))
    localStorage.setItem(expiryKey, now + cacheDuration)

    return data
  } catch (error) {
    console.error('cacheFetch error:', error)
    throw error
  }
}
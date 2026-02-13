interface CacheItem<T> {
  data: T
  expiry: number
}

class ClientCache {
  private cache: Map<string, CacheItem<unknown>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttlMs?: number): void {
    const expiry = Date.now() + (ttlMs || this.defaultTTL)
    this.cache.set(key, { data, expiry })
  }

  get<T = any>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined

    if (!item) {
      return null
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    this.cache.forEach((item, key) => {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    })
  }

  // Get or set pattern
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    this.set(key, data, ttlMs)
    return data
  }
}

// Singleton instance
export const clientCache = new ClientCache()

// Leads-specific cache instance
export const leadsCache = new ClientCache()

// Industries-specific cache instance
export const industriesCache = new ClientCache()

// Generate a cache key from an object
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sorted = Object.keys(params).sort().reduce((acc, key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      acc[key] = params[key]
    }
    return acc
  }, {} as Record<string, unknown>)
  return `${prefix}:${JSON.stringify(sorted)}`
}

// Cache keys
export const cacheKeys = {
  industries: 'industries',
  countries: 'countries',
  userProfile: 'user_profile',
  leadsSearch: (params: string) => `leads_search_${params}`,
  leadDetail: (id: string | number) => `lead_${id}`,
  savedSearches: 'saved_searches',
  exports: 'exports',
  apiKeys: 'api_keys',
  usageStats: 'usage_stats',
}

// Cache durations
export const cacheDurations = {
  short: 1 * 60 * 1000,      // 1 minute
  medium: 5 * 60 * 1000,     // 5 minutes
  long: 15 * 60 * 1000,      // 15 minutes
  veryLong: 60 * 60 * 1000,  // 1 hour
}

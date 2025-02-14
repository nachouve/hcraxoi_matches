export class CacheService {
  static CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  static async getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        return data;
      }
    }
    return null;
  }

  static cacheData(key, data) {
    localStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  }
}
